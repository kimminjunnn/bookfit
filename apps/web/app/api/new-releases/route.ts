import { NextResponse } from "next/server";
import { fetchKyoboNewReleases } from "@/lib/kyoboApi";
import booksData from "@/data/books.json";
import { Book } from "@/types/book";

export async function GET() {
  try {
    const books = await fetchKyoboNewReleases();
    return NextResponse.json(books);
  } catch (error) {
    console.warn(
      "Failed to fetch Kyobo new releases, falling back to local dataset:",
      error
    );
    // Fallback: use the first 20 books from local mock data
    return NextResponse.json((booksData as Book[]).slice(0, 20));
  }
}
