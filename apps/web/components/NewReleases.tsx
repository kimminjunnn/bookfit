"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Book } from "@/types/book";
import BookCard from "./BookCard";

export default function NewReleases() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNewReleases() {
      try {
        const res = await fetch("/api/new-releases");
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
        }
      } catch (err) {
        console.error("Failed to load new releases:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNewReleases();
  }, []);

  // 메인 화면에는 상위 10개만 표시 (5열 × 2행)
  const displayBooks = books.slice(0, 10);

  if (loading) {
    return (
      <section className="mt-section">
        <div className="flex justify-between items-end mb-lg">
          <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">
            신간 도서
          </h2>
        </div>
        {/* 5열 × 2행 스켈레톤 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-lg">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] w-full bg-surface border border-outline-variant rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-section">
      <div className="flex justify-between items-end mb-lg">
        <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">
          신간 도서
        </h2>
        <Link
          href="/new-releases"
          className="text-primary text-[15px] font-semibold tracking-[0.02em] flex items-center gap-xs"
        >
          더보기{" "}
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </Link>
      </div>
      {/* 5열 × 2행 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-lg">
        {displayBooks.map((book, i) => (
          <BookCard key={book.id} book={book} variant="new-release" index={i} />
        ))}
      </div>
    </section>
  );
}
