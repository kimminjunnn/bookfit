---
name: bookfit-rag-consult
description: >
  BookFit의 RAG 기반 AI 도서 상담 파이프라인을 구현·수정할 때 사용한다.
  사용자의 자연어 상황 입력을 받아 Chroma 벡터 검색으로 후보 도서를 뽑고,
  GPT-5.4 Mini가 검색된 도서만 근거로 AiRecommendationResult JSON을 생성하도록
  FastAPI /recommend 엔드포인트, LangChain 파이프라인, 프롬프트, 사후 검증, Fallback을
  다룬다. RAG·추천·상담·임베딩·Chroma·FastAPI·프롬프트·할루시네이션 방지 관련
  작업이면 항상 이 스킬을 참고한다.
---

# BookFit RAG 도서 상담 스킬

BookFit의 핵심 기능인 **AI 도서 상담(독서 큐레이터)** 파이프라인을 구현·수정하기 위한 지침이다.
데모데이 MVP이며, "상담 입력 → 추천 3권 → 도서 상세 이동" 흐름이 발표 중 깨지지 않는 것이 최우선이다.
(기준 문서: `BookFit_PRD_v1.4.md`)

## 전체 파이프라인

```
UserBookConsultInput
  → (FastAPI /recommend)
  → 입력 텍스트 구성(situation + goal + preferredCategory + freeText …)
  → OpenAI text-embedding-3-small 임베딩 1회
  → Chroma 벡터 검색(임베디드, Top-K=6~8)
  → 검색된 Book 목록을 RAG 문서 텍스트로 컨텍스트화
  → GPT-5.4 Mini 생성(JSON 스키마 강제)
  → 서버 측 사후 검증(id 대조)
  → AiRecommendationResult 반환
```

런타임 호출은 **임베딩 1회 + Chroma 검색 1회 + LLM 생성 1회**로 고정한다(성능 목표 5초/300ms).

## 핵심 규칙 (반드시 지킨다)

1. **검색된 도서에 없는 책은 절대 추천하지 않는다.** LLM 컨텍스트에는 RAG로 검색된 도서만 넣는다.
2. **출력은 `AiRecommendationResult` JSON 스키마로 강제**한다(자유 텍스트 금지). OpenAI structured output / JSON schema 사용.
3. **사후 검증 필수**: `recommendedBooks[].id`가 이번 검색 결과 ID 집합에 없으면 그 항목을 제거하거나 재요청한다.
4. 도서 추천과 무관한 질문(법률·의료·진로·잡담·민감 상담)은 추천을 만들지 말고 **범위 안내 문구만** 반환한다.
5. 도서 임베딩은 **FastAPI 서버 기동 시점에 Chroma에 사전 적재**한다. 런타임에 전량 재임베딩 금지.

## 데이터 계약

입력 `UserBookConsultInput`, 출력 `AiRecommendationResult`, 도서 `Book` 타입은 `CLAUDE.md` / PRD 9장 스키마를 그대로 따른다. 임의로 필드를 추가/변경하지 않는다.

- **도서 데이터는 교보문고 공개 API로 수집해 `Book` 스키마로 정규화한 것을 사용하며, 화면에 표시되는 도서 데이터와 동일한 소스여야 한다(화면↔RAG 불일치 금지).**
- `Book.studyBookType`은 `category`가 `"자격증/수험서"` 또는 `"전공서"`일 때만 존재.
- `studyBookType`이 없는 일반 도서는 `readingFlow`에 "개념서→문제집→기출문제집" 같은 학습 순서를 강제하지 않는다("순서 무관" 또는 추천 읽기 순서).
- `freeText` 하나만으로도 상담이 되어야 한다(F-02).

### RAG 문서 변환 (Chroma 적재)

```
도서명: {title}
분야: {category}
주제: {subject}            ← subject 있을 때만
책 유형: {studyBookType}    ← 수험서/전공서일 때만
난이도: {level}
책 소개: {description}
목차: {toc를 ", "로 연결}
리뷰 요약: {reviewSummary}
추천 대상: {targetReader}
바로드림 가능 여부: {pickupAvailable ? "가능" : "불가"}
```

`id`, `price`, `pickupAvailable`, `coverImage`, `category`, `studyBookType`은 Chroma **메타데이터**로도 저장해 사후 검증·필터·카드 렌더에 사용한다.

## 프롬프트

**System**

```
당신은 교보문고의 AI 도서 상담사입니다.
사용자의 상황·현재 수준·목적을 분석하고, 제공된 도서 데이터만을 근거로
적합한 책을 추천하세요. 응답에는 다음을 포함합니다.
1) 사용자 상황 요약  2) 필요한 책 분야 판단  3) 추천 도서 3권
4) 각 도서 추천 이유  5) 읽는 순서  6) 바로드림 연결 안내
검색된 도서 데이터에 없는 책은 임의로 추천하지 마세요.
도서와 무관한 질문에는 도서 관련 질문만 입력해달라고 안내하세요.
출력은 지정된 JSON 스키마를 반드시 따르세요.
```

**User**

```
사용자 입력:
{user_query}

검색된 도서 데이터:
{retrieved_books_as_rag_docs}

위 정보를 바탕으로 적합한 책을 추천해주세요.
```

## FastAPI 엔드포인트

- `POST /recommend` — body: `UserBookConsultInput`, response: `AiRecommendationResult`.
- `GET /health` — 발표 전 상태 확인 및 Railway 콜드스타트 방지 웜업용.
- OpenAI API 키는 **Railway 환경변수에서만** 읽는다. 클라이언트는 Next.js API Route를 거쳐서만 호출(FastAPI URL은 Vercel 환경변수). 교보 API 호출도 서버 측에서만 수행한다.
- LLM 모델명은 환경변수(`OPENAI_MODEL` 등)로 분리 — 코드 변경 없이 Mini↔Nano 전환.

## Fallback (구현 시 함께 처리)

| 상황 | 대응 |
|---|---|
| 로딩 10초 초과 | 재시도 안내 + 버튼 |
| 무관한 질문 | "도서 관련 질문만 입력해주세요." (추천 미생성) |
| 입력 부족 | 상황·목적·선호 분야 추가 입력 유도 |
| 관련 도서 없음 | 조건 완화 후 재입력 유도 |
| 추천 3권 미만 | Top-K 늘리거나 조건 완화해 유사 도서 보충 |
| AI/FastAPI 실패·3초 지연 | 베스트셀러 Top3 기본 추천으로 즉시 대체 |
| 민감 상담 | 전문 상담 대체 아님 안내 |

## 구현 체크리스트

- [ ] 입력 텍스트 구성 함수: `UserBookConsultInput` → 검색 쿼리 문자열
- [ ] 교보 API 수집 데이터 → `Book` 정규화 (화면·RAG 동일 소스)
- [ ] Chroma 컬렉션 사전 적재(서버 기동 시 1회) + 메타데이터 저장
- [ ] Top-K 검색 → RAG 문서 컨텍스트 조립
- [ ] LangChain + GPT-5.4 Mini, JSON 스키마 강제 출력
- [ ] `recommendedBooks[].id` 검색 결과 대조(사후 검증)
- [ ] 무관 질문/입력 부족 분기 → 범위 안내
- [ ] LLM/서버 실패 시 베스트셀러 Fallback
- [ ] `/health` + 웜업

## 하지 말 것

- 검색 결과에 없는 책 창작 추천, JSON 스키마 벗어난 자유 텍스트 반환.
- 화면 표시 데이터와 RAG 추천 데이터를 서로 다른 소스로 분리(불일치 유발).
- 도서 본문·표지 원본 재배포 및 무분별한 대량 크롤링(교보 공개 API 서지정보 수집은 허용), 실제 결제/주문, API 키 프론트 노출.
- 런타임 전량 재임베딩, 별도 Chroma 서버 구성(임베디드로 통합).
