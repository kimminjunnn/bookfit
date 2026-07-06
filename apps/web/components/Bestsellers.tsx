"use client";

import { useState, useEffect } from "react";
import { Book } from "@/types/book";
import BookCard from "./BookCard";
import { getCachedBestsellers, setCachedBestsellers } from "@/lib/bookCache";

export default function Bestsellers() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const pageSize = 20; // 5 * 4 grid = 20 items per page

  useEffect(() => {
    async function loadBestsellers() {
      // 1. 캐시 확인
      const cached = getCachedBestsellers();
      if (cached && cached.length > 0) {
        setBooks(cached);
        setLoading(false);
        return;
      }

      try {
        // 2. 초기 기동속도를 위한 최소 로딩 (40개)
        const res = await fetch("/api/bestsellers?limit=40");
        let initialData: Book[] = [];
        if (res.ok) {
          initialData = await res.json();
          setBooks(initialData);
        }
        setLoading(false);

        // 3. 백그라운드 프리페치 (0.5초 대기 후 전체 200개 호출)
        setTimeout(async () => {
          try {
            const fullRes = await fetch("/api/bestsellers");
            if (fullRes.ok) {
              const fullData = await fullRes.json();
              setCachedBestsellers(fullData);
              setBooks(fullData); // 전체 데이터로 자연스럽게 확장
            } else if (initialData.length > 0) {
              setCachedBestsellers(initialData);
            }
          } catch (prefetchErr) {
            console.error("Failed to prefetch full bestsellers:", prefetchErr);
            if (initialData.length > 0) {
              setCachedBestsellers(initialData);
            }
          }
        }, 500);
      } catch (err) {
        console.error("Failed to load bestsellers:", err);
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
