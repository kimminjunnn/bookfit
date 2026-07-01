# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, status
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional
import sys
from pathlib import Path

# 모듈 탐색 경로 설정 (현재 폴더를 sys.path에 추가하여 절대 경로 임포트 보장)
sys.path.append(str(Path(__file__).resolve().parent))

from rag.data_loader import get_vector_store
from rag.chain import get_ai_recommendation

# =====================================================================
# 1. Pydantic 요청 스키마 정의 (프론트엔드 카멜케이스 형식과 일치시킴)
# =====================================================================
class ConsultRequest(BaseModel):
    situation: str
    goal: Optional[str] = None
    preferredCategory: Optional[str] = None
    level: Optional[str] = None
    studyPeriod: Optional[str] = None
    pickupStore: Optional[str] = None
    freeText: Optional[str] = None

# =====================================================================
# 2. FastAPI Lifespan (시작/종료 이벤트 처리)
# =====================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 기동 시 Chroma DB 사전 로드 및 도서 임베딩 적재 진행
    print("[FastAPI] 서버 가동을 시작합니다. Chroma DB 및 RAG 파이프라인 초기화를 시도합니다...")
    try:
        get_vector_store()
        print("[FastAPI] RAG 데이터 적재 완료. 벡터 검색이 준비되었습니다.")
    except Exception as e:
        print(f"[FastAPI] 경고: 서버 시작 시 RAG DB 초기화에 실패하였습니다: {e}")
        print("[FastAPI] OpenAI API Key 설정이 되어있는지 확인해주세요. API 호출 시점에 재초기화됩니다.")
    yield
    print("[FastAPI] 서버 가동을 종료합니다.")

# FastAPI 앱 생성
app = FastAPI(
    title="BookFit AI Recommendation Backend",
    description="RAG 기반 도서 추천 상담을 제공하는 FastAPI 서버",
    version="1.0.0",
    lifespan=lifespan
)

# =====================================================================
# 3. CORS 미들웨어 설정 (Next.js 로컬 서버와의 원활한 통신 보장)
# =====================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실 배포 환경에서는 Next.js URL로 한정하는 것이 바람직하나, MVP 데모를 위해 전체 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# 4. API 엔드포인트 정의
# =====================================================================

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """서버 헬스 체크용 엔드포인트"""
    return {
        "status": "healthy",
        "message": "BookFit AI 백엔드 서버가 정상적으로 작동 중입니다."
    }

@app.post("/recommend", status_code=status.HTTP_200_OK)
def recommend_books(request: ConsultRequest):
    """
    RAG 기반으로 도서를 검색하고 AI 추천을 생성하여 반환합니다.
    """
    # 필수 파라미터 상황/고민 검사
    if not request.situation or not request.situation.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="situation(상황/고민) 필드는 필수 입력 항목입니다."
        )

    # RAG 파이프라인 수행
    response = get_ai_recommendation(
        situation=request.situation,
        goal=request.goal,
        preferred_category=request.preferredCategory,
        level=request.level,
        study_period=request.studyPeriod,
        pickup_store=request.pickupStore,
        free_text=request.freeText
    )
    
    # RAG 추론 과정 중 에러 발생 시 처리
    if "error" in response:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 추천 프로세스 실패: {response.get('message')}"
        )
        
    return response
