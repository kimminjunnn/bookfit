import { NextResponse } from "next/server";
import { Book, UserBookConsultInput, AiRecommendationResult } from "@/types/book";
import booksData from "@/data/books.json";

export async function POST(request: Request) {
  try {
    const body: UserBookConsultInput = await request.json();
    const { situation, preferredCategory, goal, pickupStore } = body;

    // Simulate 2-second AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const books = booksData as Book[];

    // 1. Filtering logic based on input
    let filtered = [...books];

    // If preferredCategory is selected, prioritize it
    if (preferredCategory) {
      filtered = filtered.filter(
        (b) => b.category.toLowerCase() === preferredCategory.toLowerCase()
      );
    }

    // If no preferredCategory or too few matches, try situation keyword matching
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

    // Default back to all books if still somehow less than 3
    if (filtered.length < 3) {
      filtered = [...books];
    }

    // Shuffle and pick 3 books
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selectedBooks = shuffled.slice(0, 3);

    // 2. Determine reading flow
    const hasStudyBook = selectedBooks.some(b => 
      b.category === "자격증/수험서" || b.category === "전공서"
    );
    
    let readingFlow = "순서 무관";
    if (hasStudyBook) {
      readingFlow = "개념서 → 문제집 → 기출문제집";
    } else {
      // Create a nice customized flow
      const titles = selectedBooks.map(b => b.title);
      if (titles.length >= 3) {
        readingFlow = `${titles[0]} (기초) → ${titles[1]} (심화) → ${titles[2]} (마무리)`;
      }
    }

    // 3. Construct recommendedBooks array
    const recommendedBooks = selectedBooks.map((book, idx) => {
      // Construct a customized recommendation reason based on the book's metadata and the situation
      let reason = `이 책은 "${book.description.slice(0, 60)}..." 처럼 독자에게 실질적인 해답을 제시합니다. `;
      if (book.targetReader) {
        reason += `특히, ${book.targetReader}를 대상으로 하여 현재 고민하시는 상황인 "${situation.slice(0, 20)}..."에 딱 맞는 위로와 통찰을 줄 것입니다.`;
      } else {
        reason += `현재 고민하시는 "${situation.slice(0, 20)}..." 상황에 새로운 시각과 긍정적인 에너지를 불어넣어 줄 것입니다.`;
      }

      // Check if store pickup matches
      let pickupAvailable = book.pickupAvailable;
      if (pickupStore && pickupStore !== "온라인 전용") {
        // Just mock it so that it's pickup available at the requested store
        pickupAvailable = book.pickupAvailable;
      }

      return {
        id: book.id,
        title: book.title,
        reason,
        order: idx + 1,
        pickupAvailable,
      };
    });

    // 4. Construct category summary
    const neededCategory = selectedBooks[0]?.category || "인문학/자기계발";
    const summary = `작성해주신 "${situation.slice(0, 30)}..." 상황을 심층 분석한 결과, 현재 마음의 안정과 새로운 원동력이 필요한 시기인 것 같습니다. 이에 적절한 성찰을 도와줄 [${neededCategory}] 분야를 핵심으로 선정하여, 순차적으로 독서하시기 좋은 3권의 도서를 추천해 드립니다.`;

    const result: AiRecommendationResult = {
      summary,
      neededCategory,
      recommendedBooks,
      readingFlow,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
