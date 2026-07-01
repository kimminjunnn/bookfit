# BookFit

**RAG 기반 AI 도서 상담 서비스** — 교보문고 클론 위에서, 사용자가 자신의 상황이나 고민을 자연어로 입력하면 AI가 보유 도서 데이터에 근거해 맞춤 도서 3권과 추천 이유, 읽는 순서를 제안합니다.

> SeSAC 양천 2기 미니프로젝트1 · 7일 스프린트 MVP 

---

## 문제의식

온라인 서점은 방대한 도서 데이터를 제공하지만, 사용자가 자신의 상황을 자연어로 설명했을 때 이를 이해하고 근거 있게 추천해주는 경험은 제한적입니다. "정보처리기사 필기 준비 중인데 기초가 부족해요" 같은 수험서 고민부터 "요즘 무기력한데 마음을 잡을 책이 필요해요" 같은 일반 도서 고민까지, 사용자는 정확한 검색어보다 자신의 상황을 먼저 떠올립니다. 기존 탐색 구조에서는 사용자가 직접 키워드를 검색하고 여러 책을 비교하며 스스로 판단해야 해 선택 피로가 발생하고 구매가 미뤄집니다.

**BookFit**은 RAG 기반 AI 도서 상담(독서 큐레이터)을 통해 이 탐색 피로를 줄이고, 추천 결과를 도서 상세·바로드림 확인까지 자연스럽게 연결하는 것을 목표로 합니다.

## 핵심 사용자 플로우

```
Home
 └─ AI 도서 상담 버튼(플로팅) 클릭
     └─ 상황/고민 자유 입력 (또는 목적·선호 분야·기간 등 추가 입력)
         └─ RAG 검색 → LLM 추천 생성
             └─ 추천 도서 3권 + 추천 이유 + 읽는 순서 확인
                 └─ 도서 상세 페이지 이동
                     └─ 바로드림 가능 여부 확인 → 구매 흐름 연결
```

## 핵심 기능

| ID | 기능 | 설명 | 우선순위 |
|---|---|---|---|
| F-01 | AI 도서 상담 진입점 | 메인 화면 우하단 플로팅 버튼으로 상담 모달을 어디서든 열람 | P0 |
| F-02 | AI 도서 상담 입력 UI | 상황/고민, 선호 분야, 목적, (수험서인 경우) 학습 기간, 희망 매장, 자유 입력 지원. 자유 입력만으로도 상담 가능 | P0 |
| F-03 | RAG 기반 도서 검색 | 사용자 입력 임베딩 → 샘플 도서 데이터 중 유사도 Top-K 검색 (전 분야 포함) | P0 |
| F-04 | AI 추천 결과 생성 | 검색 결과만 근거로 상황 요약, 책 분야 판단, 추천 3권, 추천 이유, 읽는 순서 생성 | P0 |
| F-05 | 추천 결과 UI | 추천 도서 카드(표지·제목·저자·가격·추천 이유·바로드림 여부) + 읽는 순서 + 상황 요약 표시 | P0 |
| F-06 | 도서 상세 페이지 연동 | 추천 카드 클릭 시 상세 페이지(소개·목차·리뷰 요약·난이도·바로드림 매장) 이동 | P0 |
| F-07 | 추가 대화(재질문) | 같은 모달에서 후속 입력으로 추천 갱신 | P1 |
| F-08 | 도서 목록/필터 페이지 | 카테고리·세부 분야·수험서 유형·난이도 필터 탐색 | P1 |
| F-09 | 바로드림 표시 | 바로드림 가능 여부 + 구매 흐름 버튼(실제 주문 아님) | P1 |
| F-10 | Fallback 처리 | 로딩 지연·무관 질문·정보 부족·검색 결과 없음·AI 응답 실패 시 안내 | P0 |

## Non-Goals (MVP 범위 제외)

실제 결제, 실제 로그인/회원가입/마이페이지, 실제 교보문고 API·재고 연동, 실제 도서 크롤링, 바로드림 실주문 처리, 장바구니·리뷰 작성·도서 본문 제공, 도서 추천 범위를 벗어난 법률/의료/금융 등 민감 상담.

## 기술 스택

| 영역 | 선택 |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| API 프록시 | Next.js API Routes (클라이언트 → FastAPI 경량 중계) |
| AI 서버 | Python FastAPI (Railway) |
| AI 파이프라인 | Python LangChain (pip) |
| LLM | OpenAI GPT-5.4 Mini (구조화 JSON 출력) |
| 임베딩 | OpenAI text-embedding-3-small |
| 벡터 검색 | Chroma (FastAPI 프로세스 내 임베디드 실행) |
| 데이터 | JSON 샘플 도서 데이터 (전 분야 약 40~60권) |
| 배포 | Vercel (Next.js) + Railway (FastAPI + Chroma) |

### 시스템 아키텍처

```
[사용자 브라우저]
       │ HTTPS
       ▼
[Next.js — Vercel]
  프론트엔드 / UI
  Next.js API Route (경량 프록시)
       │ REST API (HTTPS)
       ▼
[Python FastAPI — Railway]
  ├── LangChain RAG 파이프라인
  │     ├── 사용자 입력 임베딩 (text-embedding-3-small)
  │     ├── Chroma 벡터 검색 (임베디드, FastAPI 프로세스 내 실행)
  │     └── 추천 결과 생성 (GPT-5.4 Mini, JSON 스키마 강제)
  └── POST /recommend → AiRecommendationResult JSON 반환
                         │
                         ▼
               [OpenAI API] (외부 호출)
```

Chroma를 별도 서버로 두지 않고 FastAPI 프로세스 안에서 임베디드로 실행해, Railway 인스턴스를 하나로 줄이고 벡터 검색 네트워크 왕복을 없앴습니다. (자세한 선정 근거는 `docs/BookFit_PRD_v1.3.md` 2장 참고)

## 데이터 스키마 (요약)

```ts
export type BookCategory =
  | "소설" | "에세이" | "인문학" | "자기계발" | "경제경영"
  | "시/희곡" | "역사" | "과학" | "예술" | "자격증/수험서" | "전공서" | "기타";

export type StudyBookType = "개념서" | "문제집" | "기출문제집" | "요약집";
export type BookLevel = "입문" | "초급" | "중급" | "고급";

export type Book = {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  studyBookType?: StudyBookType; // "자격증/수험서" | "전공서"일 때만 사용
  subject?: string;
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
  situation: string;
  goal?: string;
  preferredCategory?: string;
  level?: string;
  studyPeriod?: string;
  pickupStore?: string;
  freeText?: string; // 이 필드만으로도 상담 가능 (F-02)
};

export type AiRecommendationResult = {
  summary: string;
  neededCategory: string;
  recommendedBooks: {
    id: string;
    title: string;
    reason: string;
    order: number;
    pickupAvailable: boolean;
  }[];
  readingFlow: string;
};
```

전체 스키마·예시 데이터는 `docs/BookFit_PRD_v1.3.md` 9장 참고.

## Fallback 전략 (요약)

| 상황 | 대응 |
|---|---|
| 로딩 10초 이상 | 재시도 버튼 + 안내 메시지 |
| 도서와 무관한 질문 | "도서 관련 질문만 입력해주세요" 안내 |
| 입력 정보 부족 | 상황/목적/선호 분야 추가 입력 요청 |
| 관련 도서 없음 | 조건 변경 유도 |
| 추천 3권 미만 | 검색 조건 완화 후 유사 도서 포함 |
| AI 응답 실패 / FastAPI 무응답 | 베스트셀러 기본 추천으로 대체 |
| 민감한 상담 요청 | 도서 추천 서비스이며 전문 상담이 아님을 안내 |
| 바로드림 불가 | 온라인 구매 또는 다른 매장 안내 |

## 폴더 구조 (제안)

```
bookfit/
├── apps/
│   ├── web/                 # Next.js 14 + TypeScript + Tailwind
│   │   ├── app/
│   │   ├── components/      # Header, BookCard, AiConsultModal 등
│   │   ├── lib/              # 타입, API 클라이언트
│   │   └── ...
│   └── api/                  # Python FastAPI + LangChain + Chroma(임베디드)
│       ├── main.py
│       ├── rag/               # 임베딩, 검색, 프롬프트
│       ├── data/               # 샘플 도서 JSON (40~60권)
│       └── requirements.txt
├── docs/
│   └── BookFit_PRD_v1.3.md
└── README.md
```

## 시작하기

### 환경 변수

**apps/api (.env, Railway)**
```
OPENAI_API_KEY=
LLM_MODEL=gpt-5.4-mini   # 필요 시 gpt-5.4-nano로 전환
```

**apps/web (.env.local, Vercel)**
```
FASTAPI_BASE_URL=
```

### 로컬 실행

```bash
# Frontend
cd apps/web
npm install
npm run dev

# AI 서버
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload
```

## 문서

- [BookFit PRD v1.3](docs/BookFit_PRD_v1.3.md) — 전체 요구사항, 데이터 스키마, Fallback 전략, 비용 산정