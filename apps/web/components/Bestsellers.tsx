"use client";

import { useState, useEffect } from "react";
import { Book } from "@/types/book";
import BookCard from "./BookCard";

export default function Bestsellers() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const pageSize = 20; // 5 * 4 grid = 20 items per page

  useEffect(() => {
    async function loadBestsellers() {
      try {
        const res = await fetch("/api/bestsellers");
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
        }
      } catch (err) {
        console.error("Failed to load bestsellers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBestsellers();
  }, []);

  const totalPages = Math.ceil(books.length / pageSize);
  const currentBooks = books.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  if (loading) {
    return (
      <section className="mt-section">
        <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em] mb-lg">
          베스트셀러
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-lg animate-pulse">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-surface border border-outline-variant rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-section">
      <div className="flex justify-between items-end mb-lg">
        <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">
          베스트셀러
        </h2>
        {totalPages > 1 && (
          <div className="flex gap-xs">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-lg">
        {currentBooks.map((book, i) => (
          <BookCard
            key={book.id}
            book={book}
            variant="bestseller"
            rank={page * pageSize + i + 1}
            index={i}
            discount={10}
          />
        ))}
      </div>
    </section>
  );
}
