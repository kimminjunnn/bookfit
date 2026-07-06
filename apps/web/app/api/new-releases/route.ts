import { NextRequest, NextResponse } from "next/server";
import { fetchKyoboNewReleases } from "@/lib/kyoboApi";
import booksData from "@/data/books.json";
import { Book } from "@/types/book";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const books = await fetchKyoboNewReleases(limit);
    return NextResponse.json(books);
  } catch (error) {
    console.warn(
      "Failed to fetch Kyobo new releases, falling back to local dataset:",
      error
    );
    // Fallback: use the first 100 books from local mock data
    return NextResponse.json((booksData as Book[]).slice(0, 100));
  }
}
