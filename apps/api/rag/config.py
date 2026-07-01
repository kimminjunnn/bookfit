import os
from pathlib import Path
from dotenv import load_dotenv

# config.py가 위치한 폴더 기준으로 BASE_DIR(apps/api) 설정
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", str(BASE_DIR / "chroma_db"))

# books.json 기본 경로 (프로젝트 루트/data/bookdata/books.json)
PROJECT_ROOT = BASE_DIR.parent.parent
DEFAULT_BOOKS_JSON = PROJECT_ROOT / "data" / "bookdata" / "books.json"

BOOKS_JSON_PATH = os.getenv("BOOKS_JSON_PATH")
if BOOKS_JSON_PATH:
    path_obj = Path(BOOKS_JSON_PATH)
    if not path_obj.is_absolute():
        # 설정된 상대 경로가 있으면 apps/api 기준 절대 경로로 변환
        BOOKS_JSON_PATH = str((BASE_DIR / path_obj).resolve())
else:
    BOOKS_JSON_PATH = str(DEFAULT_BOOKS_JSON.resolve())
