import { NextResponse } from "next/server";
import { fetchKyoboBestsellers } from "@/lib/kyoboApi";
import booksData from "@/data/books.json";
import { Book } from "@/types/book";

export async function GET() {
  try {
    // Fetch live bestsellers (up to 200 books)
    const books = await fetchKyoboBestsellers();
    // Return all fetched books to allow full client-side pagination/scrolling
    return NextResponse.json(books);
  } catch (error) {
    console.warn("Failed to fetch Kyobo bestsellers, falling back to local dataset:", error);
    // Fallback: Use local mock books
    return NextResponse.json(booksData as Book[]);
  }
}
