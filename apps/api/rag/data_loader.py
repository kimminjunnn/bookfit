import json
import os
import shutil
import threading
from pathlib import Path
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from rag import config

def format_book_document(book: dict) -> str:
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
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"도서 데이터 파일을 찾을 수 없습니다: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def map_category(kyobo_category: str) -> str:
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
    isbn = item.get("cmdtCode") or ""
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

def fetch_kyobo_bestsellers(pages: list[int] = [1], timeout: float = 8.0) -> list[dict]:
    import requests
    api_key = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ZLYbgLboRn9J3QDp.A-YRBm6F9k1E7qI5iavgb0fVVjf3ssgmxnSkhW_hW_pTdNUpVjElQkaxXYjj1c0_5ycE4Sgl75QDatH5olqvIN35DPL8xmcQmH4ClipOkZ40xMMf0YXbj_vez5_z0mqXPL2_ysQu.6bVxg8WPbzFolcmHaf_-zw"
    all_books = []
    headers = {
        "X-Api-Gw-Key": api_key,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    for page in pages:
        url = f"https://store.kyobobook.co.kr/api/gw/best/best-seller/online?page={page}&per=200&period=001&dsplDvsnCode=000&dsplTrgtDvsnCode=001"
        try:
            print(f"[RAG-DataLoader] 교보 API 호출 중 (페이지 {page})...")
            response = requests.get(url, headers=headers, timeout=timeout)
            if response.status_code == 200:
                result = response.json()
                raw_books = result.get("data", {}).get("bestSeller", [])
                print(f"[RAG-DataLoader] 페이지 {page}에서 {len(raw_books)}권의 도서 데이터를 성공적으로 수신했습니다.")
                for item in raw_books:
                    all_books.append(map_kyobo_to_book(item))
            else:
                raise Exception(f"HTTP Status {response.status_code}")
        except Exception as e:
            print(f"[RAG-DataLoader] 페이지 {page} 수집 중 오류 발생: {e}")
            if page == 1:
                raise e
            break
    print(f"[RAG-DataLoader] 교보 API 수집 완료 (요청 페이지: {pages}). 총 {len(all_books)}권을 적재 준비했습니다.")
    return all_books

def map_kyobo_newest_to_book(item: dict) -> dict:
    p = item.get("productInfo") or {}
    price = item.get("priceInfo") or {}
    review = item.get("reviewInfo") or {}
    isbn = p.get("cmdtcode") or p.get("isbn") or ""
    cover_image = (
        f"https://contents.kyobobook.co.kr/sih/fit-in/200x300/pdt/{isbn}.jpg"
        if isbn else "/images/book-placeholder.png"
    )
    rating = review.get("score")
    review_count = review.get("count") or 0
    if rating is not None and review_count > 0:
        review_summary = f"구매 평점 {float(rating):.1f}점 ({review_count}개 리뷰)"
    else:
        review_summary = "아직 리뷰가 없는 따끈따끈한 신간입니다."
    category = map_category(p.get("saleCmdtClstName") or p.get("cmdtClstName") or "")
    study_book_type = None
    if category in ["자격증/수험서", "전공서"]:
        study_book_type = "개념서"
        cmdt_name = p.get("cmdtName") or ""
        if "문제집" in cmdt_name:
            study_book_type = "문제집"
        elif "기출" in cmdt_name:
            study_book_type = "기출문제집"
        elif "요약" in cmdt_name or "한권으로 끝내기" in cmdt_name:
            study_book_type = "요약집"
    desc = p.get("anntCntt") or p.get("sbttName1") or "책 소개 정보가 없습니다."
    desc = desc.strip()
    return {
        "id": p.get("saleCmdtid") or f"kyobo-new-{isbn}",
        "title": p.get("cmdtName") or "제목 없음",
        "author": p.get("chrcName") or "저자 미상",
        "category": category,
        "studyBookType": study_book_type,
        "subject": p.get("saleCmdtClstName") or p.get("cmdtClstName") if category in ["자격증/수험서", "전공서"] else None,
        "price": price.get("saleCmdtSapr") or price.get("saleCmdtPrce") or 0,
        "description": desc,
        "toc": [],
        "reviewSummary": review_summary,
        "targetReader": f"{category} 분야 신간 도서에 관심이 있는 모든 독자",
        "level": "입문",
        "pickupAvailable": True,
        "coverImage": cover_image,
    }

def fetch_kyobo_new_releases() -> list[dict]:
    import requests
    api_key = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ZLYbgLboRn9J3QDp.A-YRBm6F9k1E7qI5iavgb0fVVjf3ssgmxnSkhW_hW_pTdNUpVjElQkaxXYjj1c0_5ycE4Sgl75QDatH5olqvIN35DPL8xmcQmH4ClipOkZ40xMMf0YXbj_vez5_z0mqXPL2_ysQu.6bVxg8WPbzFolcmHaf_-zw"
    url = "https://store.kyobobook.co.kr/api/gw/pdt/v2/newest/md-pick/list?page=1&per=200&sort=rec&saleCmdtDvsnCode=KOR&soldOutExcludeYn=N&weekth=2026071"
    headers = {
        "X-Api-Gw-Key": api_key,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    all_books = []
    try:
        print("[RAG-DataLoader] 교보 신간 API 호출 중...")
        response = requests.get(url, headers=headers, timeout=8)
        if response.status_code == 200:
            result = response.json()
            raw_books = result.get("data", {}).get("newestList", [])
            print(f"[RAG-DataLoader] 신간 API에서 {len(raw_books)}권 of 도서 데이터를 성공적으로 수신했습니다.")
            for item in raw_books:
                all_books.append(map_kyobo_newest_to_book(item))
        else:
            raise Exception(f"HTTP Status {response.status_code}")
    except Exception as e:
        print(f"[RAG-DataLoader] 신간 API 수집 중 오류 발생: {e}")
        return []
    return all_books

# Chroma Vector Store 싱글톤 인스턴스 홀더
_vector_store = None

def background_fetch_and_update(full_bestsellers: list[dict], full_new_releases: list[dict]):
    """백그라운드 스레드에서 초기 동기 적재에 빠진 나머지 1페이지 도서들과 베스트셀러 2, 3페이지를 추가 수집하여 Chroma DB에 점진적으로 인덱싱합니다."""
    try:
        global _vector_store
        if _vector_store is None:
            print("[RAG-Background] 벡터 스토어가 아직 초기화되지 않아 취소합니다.")
            return

        collection = _vector_store._collection
        existing_data = collection.get()
        existing_ids = set()
        if existing_data and "metadatas" in existing_data:
            for meta in existing_data["metadatas"]:
                if meta and "id" in meta:
                    existing_ids.add(meta["id"])

        # 1. 초기 1페이지 도서 중 동기 적재에서 제외되었던 나머지 부분 적재
        remaining_books = []
        for book in (full_bestsellers + full_new_releases):
            book_id = book.get("id")
            if book_id and book_id not in existing_ids:
                existing_ids.add(book_id)
                remaining_books.append(book)

        if remaining_books:
            print(f"[RAG-Background] 초기 수집 데이터 중 나머지 {len(remaining_books)}권의 도서 추가 임베딩 적재를 시작합니다...")
            documents = []
            for book in remaining_books:
                formatted_text = format_book_document(book)
                doc = Document(
                    page_content=formatted_text,
                    metadata={
                        "id": book.get("id"),
                        "title": book.get("title"),
                        "author": book.get("author", "저자 미상"),
                        "category": book.get("category"),
                        "studyBookType": book.get("studyBookType") or "",
                        "subject": book.get("subject") or "",
                        "level": book.get("level", "입문"),
                        "price": book.get("price", 0),
                        "description": book.get("description", ""),
                        "toc": json.dumps(book.get("toc", [])),
                        "reviewSummary": book.get("reviewSummary", ""),
                        "targetReader": book.get("targetReader", ""),
                        "pickupAvailable": book.get("pickupAvailable", True),
                        "coverImage": book.get("coverImage", "")
                    }
                )
                documents.append(doc)
            _vector_store.add_documents(documents)
            print(f"[RAG-Background] 1페이지 나머지 {len(documents)}권 적재 완료. (현재 총 {collection.count()}권)")

        # 2. 베스트셀러 2, 3페이지 추가 수집 및 적재
        print("[RAG-Background] 백그라운드에서 베스트셀러 2, 3페이지 추가 수집을 시작합니다...")
        extra_books = fetch_kyobo_bestsellers(pages=[2, 3], timeout=15.0)
        
        if not extra_books:
            print("[RAG-Background] 백그라운드로 가져온 추가 도서 데이터가 없습니다.")
            return

        documents = []
        for book in extra_books:
            book_id = book.get("id")
            if book_id and book_id not in existing_ids:
                existing_ids.add(book_id)
                formatted_text = format_book_document(book)
                doc = Document(
                    page_content=formatted_text,
                    metadata={
                        "id": book_id,
                        "title": book.get("title"),
                        "author": book.get("author", "저자 미상"),
                        "category": book.get("category"),
                        "studyBookType": book.get("studyBookType") or "",
                        "subject": book.get("subject") or "",
                        "level": book.get("level", "입문"),
                        "price": book.get("price", 0),
                        "description": book.get("description", ""),
                        "toc": json.dumps(book.get("toc", [])),
                        "reviewSummary": book.get("reviewSummary", ""),
                        "targetReader": book.get("targetReader", ""),
                        "pickupAvailable": book.get("pickupAvailable", True),
                        "coverImage": book.get("coverImage", "")
                    }
                )
                documents.append(doc)
                
        if documents:
            _vector_store.add_documents(documents)
            print(f"[RAG-Background] 성공적으로 {len(documents)}권의 백그라운드 수집 도서를 Chroma DB에 추가 적재했습니다. (현재 총 {collection.count()}권)")
        else:
            print("[RAG-Background] 수집된 추가 도서가 이미 모두 DB에 적재되어 있어 추가하지 않았습니다.")
            
    except Exception as err:
        print(f"[RAG-Background] 백그라운드 도서 업데이트 중 오류 발생: {err}")

def get_vector_store() -> Chroma:
    """Chroma Vector Store의 싱글톤 인스턴스를 반환하며, 초기화되지 않았다면 생성 및 도서 적재를 진행합니다.
    초기 로딩 속도를 위해 1페이지 베스트셀러 + 신간도서만 빠르게 가져오며, 나머지는 백그라운드에서 로드합니다.
    """
    global _vector_store
    if _vector_store is not None:
        return _vector_store

    embeddings = OpenAIEmbeddings(
        model=config.EMBEDDING_MODEL,
        openai_api_key=config.OPENAI_API_KEY
    )

    db_dir = config.CHROMA_DB_DIR
    if os.path.exists(db_dir):
        try:
            shutil.rmtree(db_dir)
        except Exception:
            pass

    books = []
    api_success = False
    
    # 1. 초기 동기 API 호출 시도 (베스트셀러 1페이지 + 신간도서 100권)
    try:
        print("[RAG] 교보문고 일간 베스트셀러 1페이지 데이터를 API로부터 직접 로드합니다...")
        bestsellers = fetch_kyobo_bestsellers(pages=[1], timeout=5.0)
        print("[RAG] 교보문고 신간/MD추천 데이터를 API로부터 직접 로드합니다...")
        new_releases = fetch_kyobo_new_releases()
        
        # ID 기준 중복 제거 병합 (초기 기동을 위해 베스트셀러 상위 30권, 신간 상위 20권만 먼저 병합)
        bestsellers_slice = bestsellers[:30]
        new_releases_slice = new_releases[:20]

        seen_ids = set()
        merged_books = []
        for book in bestsellers_slice:
            book_id = book.get("id")
            if book_id and book_id not in seen_ids:
                seen_ids.add(book_id)
                merged_books.append(book)
        for book in new_releases_slice:
            book_id = book.get("id")
            if book_id and book_id not in seen_ids:
                seen_ids.add(book_id)
                merged_books.append(book)
                
        if len(merged_books) > 0:
            books = merged_books
            api_success = True
            print(f"[RAG] 초기 API 로드 완료 (초기 동기 적재 {len(books)}권: 베스트셀러 상위 {len(bestsellers_slice)}권, 신간도서 상위 {len(new_releases_slice)}권)")
    except Exception as api_err:
        print(f"[RAG] 경고: 초기 API 로드 중 오류가 발생하여 정적 백업 데이터로 대체합니다. 오류 원인: {api_err}")

    # 2. API 호출이 완전히 실패했거나 데이터가 없는 경우 로컬 books.json 로딩
    if not api_success or not books:
        try:
            print(f"[RAG] 정적 백업 파일({config.BOOKS_JSON_PATH})로부터 도서 데이터를 대체 로드합니다...")
            books = load_books_from_json(config.BOOKS_JSON_PATH)
        except Exception as json_err:
            print(f"[RAG] 치명적 오류: 정적 백업 파일 로드에 실패했습니다: {json_err}")
            raise json_err

    documents = []
    for book in books:
        formatted_text = format_book_document(book)
        doc = Document(
            page_content=formatted_text,
            metadata={
                "id": book.get("id"),
                "title": book.get("title"),
                "author": book.get("author", "저자 미상"),
                "category": book.get("category"),
                "studyBookType": book.get("studyBookType") or "",
                "subject": book.get("subject") or "",
                "level": book.get("level", "입문"),
                "price": book.get("price", 0),
                "description": book.get("description", ""),
                "toc": json.dumps(book.get("toc", [])),
                "reviewSummary": book.get("reviewSummary", ""),
                "targetReader": book.get("targetReader", ""),
                "pickupAvailable": book.get("pickupAvailable", True),
                "coverImage": book.get("coverImage", "")
            }
        )
        documents.append(doc)

    # Chroma DB 초기 적재
    _vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=db_dir
    )
    print(f"[RAG] 성공적으로 {len(documents)}권 of 도서를 Chroma DB({db_dir})에 초기 적재했습니다.")

    # 3. 초기 API 호출이 성공한 경우에만 백그라운드 스레드를 띄워 베스트셀러 2, 3페이지 및 나머지 도서 추가 적재 시작
    if api_success:
        print("[RAG] 베스트셀러 2, 3페이지 및 나머지 1페이지 도서의 추가 적재를 위한 백그라운드 스레드를 기동합니다...")
        threading.Thread(target=background_fetch_and_update, args=(bestsellers, new_releases), daemon=True).start()

    return _vector_store
