import { NextRequest, NextResponse } from "next/server";
import { fetchKyoboBestsellers, fetchKyoboNewReleases } from "@/lib/kyoboApi";
import { searchBooks } from "@/src/features/search/searchBooks";
import { Book, BookCategory, BookLevel } from "@/types/book";
import booksData from "@/data/books.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const category = (searchParams.get("category") as BookCategory) || undefined;
    const level = (searchParams.get("level") as BookLevel) || undefined;

    let apiBooks: Book[] = [];

    // 병렬로 API 데이터 로드 시도
    try {
      const results = await Promise.allSettled([
        fetchKyoboBestsellers(),
        fetchKyoboNewReleases(),
      ]);

      const bestsellers =
        results[0].status === "fulfilled" ? results[0].value : [];
      const newReleases =
        results[1].status === "fulfilled" ? results[1].value : [];

      // 중복 도서 제거 병합
      const seenIds = new Set<string>();
      const merged: Book[] = [];

      for (const b of [...bestsellers, ...newReleases]) {
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          merged.push(b);
        }
      }

      apiBooks = merged;
    } catch (apiError) {
      console.warn("Kyobo API load failed, using fallback static data:", apiError);
    }

    // API 결과가 없거나 실패한 경우 로컬 백업 데이터 사용
    if (apiBooks.length === 0) {
      apiBooks = booksData as Book[];
    }

    // 순수 검색 함수로 검색 필터링 및 정렬 수행
    const searchResults = searchBooks(apiBooks, q, { category, level });

    return NextResponse.json({
      books: searchResults,
      total: searchResults.length,
      query: q,
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
