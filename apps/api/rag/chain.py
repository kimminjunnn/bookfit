from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from rag import config
from rag.data_loader import get_vector_store

# =====================================================================
# 1. Pydantic을 활용한 AI 추천 결과 JSON 스키마 강제 정의
# =====================================================================
class RecommendedBookSchema(BaseModel):
    id: str = Field(description="추천하는 도서의 고유 ID (예: book_001). 반드시 제공된 RAG 데이터에 존재하는 ID여야 합니다.")
    title: str = Field(description="도서명")
    reason: str = Field(description="사용자의 상황을 분석하여 이 책을 추천하는 2~3문장의 구체적인 이유")
    order: int = Field(description="읽는 순서 (수험서는 1, 2, 3 순서 지정, 일반 도서는 순서가 중요하지 않으면 1로 고정)")
    pickupAvailable: bool = Field(description="제공된 데이터의 pickupAvailable 필드 값 그대로 사용 (가능 여부)")
    coverImage: Optional[str] = Field(default=None, description="도서의 coverImage URL")
    author: Optional[str] = Field(default=None, description="저자 정보")
    price: Optional[int] = Field(default=None, description="가격")
    category: Optional[str] = Field(default=None, description="도서 카테고리")

class AiRecommendationResultSchema(BaseModel):
    summary: str = Field(description="사용자의 현재 고민/상황을 깊이 공감하고 추천 방향성을 설명하는 요약문 (3~4문장)")
    neededCategory: str = Field(description="현재 사용자에게 가장 필요한 핵심 도서 카테고리 판단 (소설, 에세이, 인문학, 자기계발, 경제경영, 자격증/수험서, 전공서 등)")
    recommendedBooks: List[RecommendedBookSchema] = Field(description="추천할 도서 목록 (반드시 제공된 RAG 데이터에서 골라야 하며, 딱 3권이어야 함)")
    readingFlow: str = Field(description="자격증/수험서/전공서는 '개념서→문제집→기출문제집' 등 유형별 순서 안내, 일반 도서는 '추천도서1(기초)→추천도서2(심화)' 형태 혹은 '순서 무관'")

# =====================================================================
# 2. RAG 도서 추천 수행 함수
# =====================================================================
def get_ai_recommendation(
    situation: str,
    goal: Optional[str] = None,
    preferred_category: Optional[str] = None,
    level: Optional[str] = None,
    study_period: Optional[str] = None,
    pickup_store: Optional[str] = None,
    free_text: Optional[str] = None
) -> dict:
    """
    RAG 검색을 수행하고 OpenAI LLM을 호출하여 검증된 추천 결과를 JSON 형태로 반환합니다.
    """
    # 1. 벡터 검색 쿼리 텍스트 빌드
    query_parts = []
    if situation:
        query_parts.append(f"상황/고민: {situation}")
    if goal:
        query_parts.append(f"목표: {goal}")
    if level:
        query_parts.append(f"난이도: {level}")
    if study_period:
        query_parts.append(f"학습 기간: {study_period}")
    if free_text:
        query_parts.append(f"자유 내용: {free_text}")
    
    search_query = " ".join(query_parts)
    if not search_query.strip():
        search_query = "도서 추천"

    # 2. Chroma DB에서 유사 도서 검색 (RAG)
    vector_store = get_vector_store()
    
    # 카테고리 선호 필터가 있을 경우
    docs = []
    if preferred_category and preferred_category != "전체":
        # 카테고리 매칭 필터 적용 (Chroma 메타데이터 필터 사용)
        try:
            docs = vector_store.similarity_search(search_query, k=5, filter={"category": preferred_category})
        except Exception as e:
            print(f"[RAG] 카테고리 필터링 검색 중 오류 발생: {e}")
            docs = []
    
    # 카테고리 필터링 검색 결과가 3권 미만이거나 선호 카테고리가 없는 경우 전체 검색 수행 (Fallback 조건 완화)
    if len(docs) < 3:
        print(f"[RAG] 카테고리 필터링 결과가 부족하여 ({len(docs)}권), 전체 도서 중 검색을 실행합니다.")
        docs_all = vector_store.similarity_search(search_query, k=6)
        # 중복 방지하며 결합
        existing_ids = {d.metadata.get("id") for d in docs}
        for d in docs_all:
            if d.metadata.get("id") not in existing_ids:
                docs.append(d)
                
    # 최종 RAG 검색 도서 목록 및 ID/정보 매핑 보관
    rag_books_map = {}
    rag_context_lines = []
    for idx, d in enumerate(docs):
        book_id = d.metadata.get("id")
        title = d.metadata.get("title")
        pickup = d.metadata.get("pickupAvailable")
        category = d.metadata.get("category")
        
        rag_books_map[book_id] = {
            "id": book_id,
            "title": title,
            "pickupAvailable": pickup,
            "category": category,
            "coverImage": d.metadata.get("coverImage") or "",
            "author": d.metadata.get("author") or "저자 미상",
            "price": int(d.metadata.get("price") or 0),
            "content": d.page_content
        }
        
        rag_context_lines.append(f"--- 도서 ID: {book_id} ---\n{d.page_content}\n")
    
    rag_context = "\n".join(rag_context_lines)

    # 3. LLM 시스템 프롬프트 및 메시지 생성
    system_prompt = (
        "당신은 교보문고의 전문 AI 도서 상담사입니다.\n"
        "제공된 [RAG 도서 데이터 컨텍스트]에 기재된 도서만을 바탕으로 사용자의 상황에 맞는 추천을 작성해야 합니다.\n"
        "컨텍스트에 없는 책은 절대로 가상으로 지어내거나 추천해서는 안 되며, 추천한 책의 ID는 컨텍스트에 표시된 ID와 정확히 일치해야 합니다.\n\n"
        "사용자가 도서와 전혀 관련 없는 질문(예: 주식 투자 종목 추천, 컴퓨터 코딩 오류 수정, 연애 상담, 일상 잡담 등)을 할 경우,\n"
        "추천 도서 목록(recommendedBooks)을 빈 배열([])로 반환하고, summary 필드에 '죄송합니다. 저는 도서 관련 질문만 안내해 드리는 도서 상담사입니다.'와 같이 친절히 안내하십시오.\n\n"
        "모든 응답은 반드시 제시된 JSON 스키마를 완벽히 준수해야 합니다."
    )

    user_message = (
        f"[사용자 입력 정보]\n"
        f"- 상황/고민: {situation}\n"
        f"- 목표/목적: {goal if goal else '미지정'}\n"
        f"- 선호 카테고리: {preferred_category if preferred_category else '미지정'}\n"
        f"- 희망 난이도: {level if level else '미지정'}\n"
        f"- 학습 기간: {study_period if study_period else '미지정'}\n"
        f"- 희망 매장: {pickup_store if pickup_store else '미지정'}\n"
        f"- 자유 추가 질문: {free_text if free_text else '없음'}\n\n"
        f"[RAG 도서 데이터 컨텍스트]\n"
        f"{rag_context}\n\n"
        f"위 도서 데이터 중에서 사용자의 상황에 가장 잘 맞는 3권을 선정해 주세요. 수험서(자격증/수험서/전공서)의 경우 학습 순서 흐름을 제공하십시오."
    )

    # 4. Structured Output을 사용하는 ChatOpenAI 설정
    llm = ChatOpenAI(
        model=config.LLM_MODEL,
        temperature=0.1,
        openai_api_key=config.OPENAI_API_KEY
    )
    
    structured_llm = llm.with_structured_output(AiRecommendationResultSchema)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", user_message)
    ])
    
    chain = prompt | structured_llm

    # LLM 호출 실행
    print(f"[RAG] RAG 기반 LLM({config.LLM_MODEL}) 호출을 시작합니다...")
    try:
        response_model: AiRecommendationResultSchema = chain.invoke({})
        result_dict = response_model.model_dump()
    except Exception as e:
        print(f"[RAG] LLM 호출 중 에러 발생: {e}")
        return {
            "error": "LLM_INFERENCE_FAILED",
            "message": str(e)
        }

    # =====================================================================
    # 5. 사후 검증 (Post-Validation) - 할루시네이션 방지 규칙 적용
    # =====================================================================
    if not result_dict.get("recommendedBooks"):
        return result_dict

    validated_books = []
    valid_ids = list(rag_books_map.keys())

    for idx, r_book in enumerate(result_dict["recommendedBooks"]):
        r_id = r_book["id"]
        
        if r_id in rag_books_map:
            actual_info = rag_books_map[r_id]
            r_book["title"] = actual_info["title"]
            r_book["pickupAvailable"] = actual_info["pickupAvailable"]
            r_book["coverImage"] = actual_info["coverImage"]
            r_book["author"] = actual_info["author"]
            r_book["price"] = actual_info["price"]
            r_book["category"] = actual_info["category"]
            validated_books.append(r_book)
        else:
            print(f"[RAG-Validation] 경고: RAG 컨텍스트에 없는 ID '{r_id}'가 추천에 포함되었습니다. 교체를 진행합니다.")
            
            backup_id = None
            used_ids = {b["id"] for b in validated_books}
            for b_id in valid_ids:
                if b_id not in used_ids:
                    backup_id = b_id
                    break
            
            if backup_id:
                backup_info = rag_books_map[backup_id]
                new_reason = f"고민하신 '{situation[:15]}...' 상황에 맞추어, 유사한 깊이의 인사이트를 담은 '{backup_info['title']}' 도서를 추천해 드립니다."
                validated_books.append({
                    "id": backup_id,
                    "title": backup_info["title"],
                    "reason": new_reason,
                    "order": idx + 1,
                    "pickupAvailable": backup_info["pickupAvailable"],
                    "coverImage": backup_info["coverImage"],
                    "author": backup_info["author"],
                    "price": backup_info["price"],
                    "category": backup_info["category"]
                })
                print(f"[RAG-Validation] '{r_id}'를 실제 도서 '{backup_id}'로 성공적으로 대체하였습니다.")

    if len(validated_books) < 3:
        print(f"[RAG-Validation] 경고: 유효한 추천 도서 개수가 부족합니다 ({len(validated_books)}권). RAG 도서 데이터로 채웁니다.")
        used_ids = {b["id"] for b in validated_books}
        for b_id in valid_ids:
            if len(validated_books) >= 3:
                break
            if b_id not in used_ids:
                info = rag_books_map[b_id]
                validated_books.append({
                    "id": b_id,
                    "title": info["title"],
                    "reason": f"고민하신 상황에 도움이 될 만한 {info['category']} 분야의 우수 도서입니다.",
                    "order": len(validated_books) + 1,
                    "pickupAvailable": info["pickupAvailable"],
                    "coverImage": info["coverImage"],
                    "author": info["author"],
                    "price": info["price"],
                    "category": info["category"]
                })

    result_dict["recommendedBooks"] = validated_books[:3]
    
    for i, book in enumerate(result_dict["recommendedBooks"]):
        if result_dict.get("readingFlow") == "순서 무관":
            book["order"] = 1
        else:
            book["order"] = i + 1

    return result_dict
