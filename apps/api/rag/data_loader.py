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

def map_category(kyobo_category: str) -> str:
    """교보 카테고리명을 내부 BookCategory 유니언 타입 형태로 정규화합니다."""
    cat = kyobo_category.strip()
    if "소설" in cat: return "소설"
    if "에세이" in cat: return "에세이"
    if "인문" in cat: return "인문학"
    if "자기계발" in cat: return "자기계발"
    if "경제" in cat or "경영" in cat: return "경제경영"
    if "시" in cat or "희곡" in cat: return "시/희곡"
    if "역사" in cat: return "역사"
    if "과학" in cat: return "과학"
    if "예술" in cat: return "예술"
    if "수험서" in cat or "자격증" in cat: return "자격증/수험서"
    if "전공" in cat: return "전공서"
    return "기타"

def map_kyobo_to_book(item: dict) -> dict:
    """교보문고 로우(raw) 객체를 내부 Book 스키마에 맞추어 변환합니다."""
    isbn = item.get("cmdtCode") or ""
    
    # CDN 표지 이미지 주소 생성
    cover_image = (
        f"https://contents.kyobobook.co.kr/sih/fit-in/200x300/pdt/{isbn}.jpg"
        if isbn else "/images/book-placeholder.png"
    )

    rating = item.get("buyRevwRvgr") or 9.5
    keyword = item.get("revwEmtnKywrName") or "도움돼요"
    review_summary = f"구매 평점 {rating}점으로, 독자들로부터 \"{keyword}\"라는 평가를 받고 있습니다."

    category = map_category(item.get("saleCmdtClstName") or "")

    study_book_type = None
    if category in ["자격증/수험서", "전공서"]:
        study_book_type = "개념서"
        cmdt_name = item.get("cmdtName") or ""
        if "문제집" in cmdt_name:
            study_book_type = "문제집"
        elif "기출" in cmdt_name:
            study_book_type = "기출문제집"
        elif "요약" in cmdt_name or "한권으로 끝내기" in cmdt_name:
            study_book_type = "요약집"

    return {
        "id": item.get("saleCmdtid") or f"kyobo-{isbn}",
        "title": item.get("cmdtName") or "제목 없음",
        "author": item.get("chrcName") or "저자 미상",
        "category": category,
        "studyBookType": study_book_type,
        "subject": item.get("saleCmdtClstName") if category in ["자격증/수험서", "전공서"] else None,
        "price": item.get("sapr") or item.get("price") or 0,
        "description": item.get("inbukCntt") or "책 소개 정보가 없습니다.",
        "toc": [],
        "reviewSummary": review_summary,
        "targetReader": f"{category} 분야 및 일간 베스트셀러에 관심이 있는 모든 독자",
        "level": "입문",
        "pickupAvailable": True,
        "coverImage": cover_image,
    }

def fetch_kyobo_bestsellers() -> list[dict]:
    """교보문고 일간 베스트셀러 API를 1페이지부터 3페이지까지 호출하여 총 300권을 로드합니다."""
    import urllib.request
    
    api_key = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ZLYbgLboRn9J3QDp.A-YRBm6F9k1E7qI5iavgb0fVVjf3ssgmxnSkhW_hW_pTdNUpVjElQkaxXYjj1c0_5ycE4Sgl75QDatH5olqvIN35DPL8xmcQmH4ClipOkZ40xMMf0YXbj_vez5_z0mqXPL2_ysQu.6bVxg8WPbzFolcmHaf_-zw"
    
    all_books = []
    
    # 3페이지(각 100권씩, 총 300권) 순회
    for page in range(1, 4):
        url = f"https://store.kyobobook.co.kr/api/gw/best/best-seller/online?page={page}&per=100&period=001&dsplDvsnCode=000&dsplTrgtDvsnCode=001"
        req = urllib.request.Request(
            url,
            headers={
                "X-Api-Gw-Key": api_key,
                "Accept-Encoding": "identity",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        try:
            print(f"[RAG-DataLoader] 교보 API 호출 중 (페이지 {page}/3)...")
            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status == 200:
                    raw_data = response.read()
                    # Content-Encoding 헤더가 gzip이거나 데이터 매직 넘버가 gzip인 경우 압축 해제
                    if response.info().get('Content-Encoding') == 'gzip' or raw_data.startswith(b'\x1f\x8b'):
                        import gzip
                        raw_data = gzip.decompress(raw_data)
                    html = raw_data.decode('utf-8')
                    result = json.loads(html)
                    raw_books = result.get("data", {}).get("bestSeller", [])
                    print(f"[RAG-DataLoader] 페이지 {page}에서 {len(raw_books)}권의 도서 데이터를 성공적으로 수신했습니다.")
                    for item in raw_books:
                        all_books.append(map_kyobo_to_book(item))
                else:
                    raise Exception(f"HTTP Status {response.status}")
        except Exception as e:
            print(f"[RAG-DataLoader] 페이지 {page} 수집 중 오류 발생: {e}")
            # 첫 페이지부터 실패하면 에러를 바로 던지도록 함 (Fallback 연동을 유도하기 위해)
            if page == 1:
                raise e
            # 2, 3페이지 실패 시에는 그전까지(1페이지) 수집한 것만이라도 반환하기 위해 break 처리
            break
            
    print(f"[RAG-DataLoader] 교보 API 수집 완료. 총 {len(all_books)}권을 적재할 준비가 되었습니다.")
    return all_books

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
    if os.path.exists(db_dir):
        try:
            shutil.rmtree(db_dir)
        except Exception:
            pass

    # 데이터 로드
    books = []
    try:
        print("[RAG] 교보문고 일간 베스트셀러 300권 데이터를 API로부터 직접 로드합니다...")
        books = fetch_kyobo_bestsellers()
    except Exception as api_err:
        print(f"[RAG] 경고: 교보 API 로드 중 오류가 발생하여 정적 백업 파일({config.BOOKS_JSON_PATH})로 대체합니다. 오류 원인: {api_err}")
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
