import { NextResponse } from "next/server";
import { Book, UserBookConsultInput, AiRecommendationResult } from "@/types/book";
import booksData from "@/data/books.json";
import { fetchKyoboBestsellers } from "@/lib/kyoboApi";

// 1. Fallback 추천 함수 (AI 백엔드 서버 에러/타임아웃 시 가동)
async function getFallbackRecommendation(body: UserBookConsultInput): Promise<AiRecommendationResult> {
  const { situation, preferredCategory, pickupStore } = body;
  const booksDataTyped = booksData as Book[];
  let books: Book[];
  try {
    // 3초 타임아웃 내에 교보문고 일간 베스트 API 데이터를 가져옵니다.
    const fetchPromise = fetchKyoboBestsellers();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 3000)
    );
    books = await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.warn("Kyobo API fetch failed, falling back to local books.json:", error);
    books = booksDataTyped;
  }

  let filtered = [...books];

  // 선호 카테고리 필터링 시도
  if (preferredCategory && preferredCategory !== "전체") {
    filtered = filtered.filter(
      (b) => b.category.toLowerCase() === preferredCategory.toLowerCase()
    );
  }

  // 매칭 도서가 부족한 경우 키워드 매칭 fallback 적용
  if (filtered.length < 3) {
    filtered = [...books];
    const situationLower = situation.toLowerCase();
    
    if (situationLower.includes("번아웃") || situationLower.includes("무기력") || situationLower.includes("지쳐")) {
      filtered = books.filter(b => ["에세이", "자기계발", "인문학"].includes(b.category));
    } else if (situationLower.includes("돈") || situationLower.includes("투자") || situationLower.includes("성공")) {
      filtered = books.filter(b => ["경제경영", "자기계발"].includes(b.category));
    } else if (situationLower.includes("시험") || situationLower.includes("자격증") || situationLower.includes("공부")) {
      filtered = books.filter(b => ["자격증/수험서", "전공서"].includes(b.category));
    }
  }

  if (filtered.length < 3) {
    filtered = [...books];
  }

  // 3권 선정
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  const selectedBooks = shuffled.slice(0, 3);

  const hasStudyBook = selectedBooks.some(b => 
    b.category === "자격증/수험서" || b.category === "전공서"
  );
  
  let readingFlow = "순서 무관";
  if (hasStudyBook) {
    readingFlow = "개념서 → 문제집 → 기출문제집";
  } else {
    const titles = selectedBooks.map(b => b.title);
    if (titles.length >= 3) {
      readingFlow = `${titles[0]} (기초) → ${titles[1]} (심화) → ${titles[2]} (마무리)`;
    }
  }

  const recommendedBooks = selectedBooks.map((book, idx) => {
    let reason = `이 책은 "${book.description.slice(0, 60)}..." 처럼 독자에게 실질적인 해답을 제시합니다. `;
    if (book.targetReader) {
      reason += `특히, ${book.targetReader}를 대상으로 하여 현재 고민하시는 상황인 "${situation.slice(0, 20)}..."에 딱 맞는 위로와 통찰을 줄 것입니다.`;
    } else {
      reason += `현재 고민하시는 "${situation.slice(0, 20)}..." 상황에 새로운 시각과 긍정적인 에너지를 불어넣어 줄 것입니다.`;
    }

    let pickupAvailable = book.pickupAvailable;
    if (pickupStore && pickupStore !== "온라인 전용") {
      pickupAvailable = book.pickupAvailable;
    }

    return {
      id: book.id,
      title: book.title,
      reason,
      order: hasStudyBook ? idx + 1 : 1,
      pickupAvailable,
      coverImage: book.coverImage,
      author: book.author,
      price: book.price,
      category: book.category,
    };
  });

  const neededCategory = selectedBooks[0]?.category || "인문학/자기계발";
  const summary = `[안내] AI 추천 서버 지연으로 인해 차선책으로 고객님의 관심사/상황에 맞추어 가장 평가가 좋은 베스트셀러 도서 [${neededCategory}] 3권을 선정해 드립니다.`;

  return {
    summary,
    neededCategory,
    recommendedBooks,
    readingFlow,
  };
}

export async function POST(request: Request) {
  try {
    const body: UserBookConsultInput = await request.json();
    
    // FastAPI URL 환경변수 (로컬 기본값: http://localhost:8000)
    const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
    
    console.log(`[Next.js API Proxy] FastAPI 서버(${FASTAPI_BASE_URL}/recommend) 호출 시도 중...`);
    
    // 10초 타임아웃 AbortController 구성
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`FastAPI 서버 응답 실패: ${response.status}`);
      }
      
      const result: AiRecommendationResult = await response.json();
      console.log("[Next.js API Proxy] FastAPI로부터 추천 결과를 성공적으로 받았습니다.");
      return NextResponse.json(result);
      
    } catch (apiError: any) {
      clearTimeout(timeoutId);
      console.warn("[Next.js API Proxy] API 호출 중 오류 혹은 10초 타임아웃이 발생했습니다:", apiError.message || apiError);
      console.log("[Next.js API Proxy] Fallback 베스트셀러 추천 모드를 실행합니다.");
      
      const fallbackResult = await getFallbackRecommendation(body);
      return NextResponse.json(fallbackResult);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
