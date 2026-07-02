# CLAUDE.md — BookFit

RAG 기반 AI 도서 상담 서비스. 교보문고 클론 위에 "상황을 자연어로 입력하면 도서 데이터 근거로 책을 추천"하는 기능을 얹은 **7일 스프린트 데모데이 MVP**다. (PRD: `BookFit_PRD_v1.4.md`)

## 최우선 목표 (이 흐름을 항상 지킨다)

```
AI 도서 상담 입력 → RAG 추천 결과(3권 + 이유 + 읽는 순서) → 도서 상세 이동 → 바로드림 가능 여부 확인
```

모든 기능을 완성하기보다 **이 데모 흐름이 끊김 없이 작동**하는 것이 우선. 10분 발표 중 파싱 오류·타임아웃으로 데모가 깨지지 않게 하는 것이 핵심 리스크 관리 기준이다.

> **v1.4 핵심 원칙**: 화면에 표시하는 도서와 RAG가 추천하는 도서는 **동일한 데이터 소스**(교보문고 공개 API로 수집해 `Book` 스키마로 정규화한 데이터)를 사용한다. "화면에 보이는 책 ≠ AI가 추천하는 책" 불일치를 만들지 않는다.

## 기술 스택

| 영역 | 선택 |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| API 프록시 | Next.js API Routes (FastAPI URL·교보 API 호출은 서버 측에서만 수행, 클라이언트 미노출) |
| AI 서버 | Python FastAPI (Railway) |
| AI 파이프라인 | Python LangChain (pip) |
| LLM (생성) | OpenAI GPT-5.4 Mini — 모델명은 **환경변수로 분리**해 코드 변경 없이 Nano 전환 가능 |
| 임베딩 | OpenAI text-embedding-3-small |
| 벡터 검색 | Chroma — **FastAPI 프로세스 내 임베디드** 실행 (별도 서버 없음) |
| 데이터 | 교보문고 공개 API로 수집한 도서 데이터를 `Book` 스키마로 정규화 (화면 표시·RAG 추천 공용) |
| 배포 | Vercel(Next.js) + Railway(FastAPI+Chroma) |

### 아키텍처

```
브라우저 → Next.js(Vercel, UI + API Route 프록시) → FastAPI(Railway)
   └ 교보 API 수집 데이터 → Book 정규화 → (화면 표시 + Chroma 임베딩) 동일 소스
   └ LangChain RAG: 입력 임베딩 → Chroma 검색(임베디드) → GPT-5.4 Mini 생성(JSON 스키마 강제)
   └ POST /recommend → AiRecommendationResult JSON / GET /health
                                      → OpenAI API(외부)
```

## 데이터 스키마 (타입 정의는 이 스키마를 따른다)

```ts
export type BookCategory =
  | "소설" | "에세이" | "인문학" | "자기계발" | "경제경영"
  | "시/희곡" | "역사" | "과학" | "예술"
  | "자격증/수험서" | "전공서" | "기타";

export type StudyBookType = "개념서" | "문제집" | "기출문제집" | "요약집";
export type BookLevel = "입문" | "초급" | "중급" | "고급";

export type Book = {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  studyBookType?: StudyBookType;   // category가 "자격증/수험서" | "전공서"일 때만
  subject?: string;                // 시험명/전공명/주제. 일반 도서는 생략 가능
  level: BookLevel;
  price: number;
  description: string;
  toc: string[];
  reviewSummary: string;
  targetReader: string;
  pickupAvailable: boolean;
  coverImage: string;
};

export type UserBookConsultInput = {
  situation: string;           // 현재 상황/고민/관심사
  goal?: string;
  preferredCategory?: string;
  level?: string;
  studyPeriod?: string;        // 시험 준비 등 기간이 있을 때만
  pickupStore?: string;
  freeText?: string;           // 이 필드만으로도 상담 가능해야 함 (F-02)
};

export type RecommendedBook = {
  id: string;
  title: string;
  reason: string;
  order: number;               // 순서가 중요하지 않으면 1로 고정
  pickupAvailable: boolean;
};

export type AiRecommendationResult = {
  summary: string;
  neededCategory: string;
  recommendedBooks: RecommendedBook[];
  readingFlow: string;         // 수험서: "개념서→문제집→기출문제집", 일반: 추천 순서 or "순서 무관"
};
```

`studyBookType`이 없으면 일반 도서 → "개념서→문제집→기출문제집" 학습 순서를 강제하지 않는다.

교보 API 응답은 위 `Book` 스키마로 정규화해서 사용한다. 스키마 자체(필드 구성)는 v1.3과 동일하며, 임의로 필드를 추가/변경하지 않는다.

### RAG 문서 형태 (Chroma 적재용 텍스트)

```
도서명: {title}
분야: {category}
주제: {subject}            ← 있을 때만
책 유형: {studyBookType}    ← 수험서/전공서일 때만
난이도: {level}
책 소개: {description}
목차: {toc를 쉼표로 연결}
리뷰 요약: {reviewSummary}
추천 대상: {targetReader}
바로드림 가능 여부: {가능/불가}
```

## AI 규칙 (할루시네이션 방지 — 반드시 준수)

- **검색된 도서 데이터에 없는 책은 절대 추천하지 않는다.** RAG로 검색된 도서만 컨텍스트로 제공.
- LLM 출력은 자유 텍스트가 아니라 `AiRecommendationResult` **JSON 스키마로 강제**한다.
- **서버 측 사후 검증**: LLM이 반환한 `recommendedBooks[].id`를 RAG 검색 결과 ID 목록과 대조하고, 없는 ID는 제거하거나 재요청한다.
- 도서 추천과 무관한 질문(법률·의료·진로·잡담)에는 추천을 생성하지 않고 범위 안내 문구만 반환한다.

### 시스템 프롬프트 골자

당신은 교보문고의 AI 도서 상담사다. 사용자의 상황·수준·목적을 분석하고 **제공된 도서 데이터만** 근거로 추천한다. 응답: (1) 상황 요약 (2) 필요한 책 분야 판단 (3) 추천 도서 3권 (4) 추천 이유 (5) 읽는 순서 (6) 바로드림 안내. 검색 데이터에 없는 책은 임의 추천 금지. 무관한 질문은 도서 관련 질문만 받도록 안내.

## Fallback (F-10 / PRD 8.2)

| 상황 | 대응 |
|---|---|
| 로딩 10초 초과 | "요청 처리 시간이 길어지고 있습니다. 다시 시도해주세요." + 재시도 버튼 |
| 무관한 질문 | "도서 관련 질문만 입력해주세요." |
| 입력 부족 | 상황·목적·선호 분야 추가 입력 유도 |
| 관련 도서 없음 | 조건 완화 후 재입력 유도 |
| 추천 3권 미만 | 검색 조건 완화해 유사 도서 함께 추천 |
| AI/FastAPI 응답 실패·3초 지연 | 베스트셀러 기반 기본 추천으로 즉시 대체 |
| 민감 상담 요청 | 전문 상담 대체 아님을 안내 |
| 바로드림 불가 | 온라인 구매 또는 다른 매장 안내 |

## 성능 목표

- AI 추천 응답: 평균 5초 이내 (10초 초과 시 Fallback)
- 벡터 검색: 300ms 이내 (도서 임베딩은 서버 기동 시 사전 적재)
- 첫 화면 로딩: 3초 이내
- 런타임 호출 = 질문 임베딩 1회 + Chroma 검색 1회 + LLM 생성 1회

## 구현 순서

1. 라우팅 구성 → 2. 교보 API 도서 수집·`Book` 정규화 → 3. Home → 4. 도서 목록/필터 → 5. 도서 상세 → 6. AI 상담 입력 UI → 7. 추천 결과 UI → 8. Next.js API Route ↔ FastAPI 연결 → 9. LangChain+Chroma RAG → 10. Fallback → 11. 배포

우선순위: F-01~F-06, F-10이 **P0**. F-07~F-09는 P1.

## 컴포넌트

`Header`, `SearchBar`, `BookCard`, `BookList`, `BookDetail`, `CategoryFilter`, `AiConsultModal`(플로팅 버튼 진입), `AiConsultForm`, `RecommendationResult`, `RecommendationBookCard`, `LoadingState`, `ErrorState` — 재사용 가능하게 분리.

## UI 스타일

흰색 배경 중심, 초록색 계열 포인트 컬러, 도서 카드 중심, 여백 충분히. AI 상담 영역은 일반 검색보다 눈에 띄게. 교보문고 느낌을 참고하되 완전 복제는 하지 않는다.

## Non-Goals / 하지 말 것

- 실제 결제·로그인/회원가입/마이페이지 구현 금지
- 실시간 재고 조회·재고/가격의 실시간 정합성 보장 금지 (도서 서지정보 수집용 교보 공개 API 호출은 허용, 표시 값은 수집 시점 기준)
- **도서 본문·표지 원본 재배포 및 무분별한 대량 크롤링 금지** (교보 공개 API에서 서지정보·리뷰 요약 수준만 수집)
- 바로드림은 "가능 여부 표시 + 구매 흐름 버튼"까지만 (실제 주문 X)
- 장바구니·리뷰 작성·본문 제공 등 부가 기능 먼저 만들지 않기
- OpenAI API 키를 프론트엔드에 노출 금지 (FastAPI/Railway 환경변수에서만)
- UI 과하게 복잡하게 만들지 않기, 데모 시연 흐름 해치는 확장 금지

## 코드 원칙

- 주요 데이터에 타입 정의, `any` 지양. Book / UserBookConsultInput / AiRecommendationResult 타입 분리.
- 코드 응답 순서: (1) 수정/생성할 파일 설명 (2) 코드 (3) 타입·구조 설명 (4) 실행 방법 (5) 다음 단계 제안. 단, "코드만 줘"라고 하면 코드 중심으로.
