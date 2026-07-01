import json
import os
import shutil
from pathlib import Path
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from rag import config

def format_book_document(book: dict) -> str:
    """AGENTS.md 에 정의된 RAG 문서 형태 규격을 엄격히 준수하여 포맷팅합니다."""
    lines = []
    lines.append(f"도서명: {book.get('title')}")
    lines.append(f"분야: {book.get('category')}")
    
    if book.get('subject'):
        lines.append(f"주제: {book.get('subject')}")
        
    if book.get('studyBookType'):
        lines.append(f"책 유형: {book.get('studyBookType')}")
        
    lines.append(f"난이도: {book.get('level')}")
    lines.append(f"책 소개: {book.get('description')}")
    
    toc = book.get('toc', [])
    if isinstance(toc, list):
        toc_str = ", ".join(toc)
    else:
        toc_str = str(toc)
    lines.append(f"목차: {toc_str}")
    
    lines.append(f"리뷰 요약: {book.get('reviewSummary')}")
    lines.append(f"추천 대상: {book.get('targetReader')}")
    
    pickup = "가능" if book.get('pickupAvailable') else "불가"
    lines.append(f"바로드림 가능 여부: {pickup}")
    
    return "\n".join(lines)

def load_books_from_json(json_path: str) -> list[dict]:
    """JSON 파일로부터 도서 데이터를 불러옵니다."""
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"도서 데이터 파일을 찾을 수 없습니다: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

# Chroma Vector Store 싱글톤 인스턴스 홀더
_vector_store = None

def get_vector_store() -> Chroma:
    """Chroma Vector Store의 싱글톤 인스턴스를 반환하며, 초기화되지 않았다면 생성 및 도서 적재를 진행합니다."""
    global _vector_store
    if _vector_store is not None:
        return _vector_store

    # OpenAI Embeddings 설정
    embeddings = OpenAIEmbeddings(
        model=config.EMBEDDING_MODEL,
        openai_api_key=config.OPENAI_API_KEY
    )

    db_dir = config.CHROMA_DB_DIR
    
    # 로컬 개발 환경에서 빠른 초기화를 보장하기 위해 기존 Chroma 폴더가 존재한다면 새로 로드하도록 비웁니다.
    # (실제 MVP 시연 중에는 DB 디렉토리가 꼬이는 것을 방지하기 위해 기동 시 매번 초기화하는 편이 안전합니다)
    if os.path.exists(db_dir):
        try:
            shutil.rmtree(db_dir)
        except Exception:
            pass

    # JSON 데이터 로드 및 Document 객체 생성
    books = load_books_from_json(config.BOOKS_JSON_PATH)
    documents = []
    for book in books:
        formatted_text = format_book_document(book)
        doc = Document(
            page_content=formatted_text,
            metadata={
                "id": book.get("id"),
                "title": book.get("title"),
                "category": book.get("category"),
                "pickupAvailable": book.get("pickupAvailable")
            }
        )
        documents.append(doc)

    # Chroma DB 인덱싱 수행 (FastAPI 메모리/임베디드 내 적재)
    _vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=db_dir
    )
    
    print(f"[RAG] 성공적으로 {len(documents)}권의 도서를 Chroma DB({db_dir})에 적재했습니다.")
    return _vector_store
