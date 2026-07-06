"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Book } from "@/types/book";
import BookCard from "./BookCard";
import { getCachedNewReleases, setCachedNewReleases } from "@/lib/bookCache";

export default function NewReleases() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNewReleases() {
      // 1. 캐시 확인
      const cached = getCachedNewReleases();
      if (cached && cached.length > 0) {
        setBooks(cached);
        setLoading(false);
        return;
      }

      try {
        // 2. 초기 기동속도를 위한 최소 로딩 (10개)
        const res = await fetch("/api/new-releases?limit=10");
        let initialData: Book[] = [];
        if (res.ok) {
          initialData = await res.json();
          setBooks(initialData);
        }
        setLoading(false);

        // 3. 백그라운드 프리페치 (0.5초 대기 후 전체 200개 호출)
        setTimeout(async () => {
          try {
            const fullRes = await fetch("/api/new-releases");
            if (fullRes.ok) {
              const fullData = await fullRes.json();
              setCachedNewReleases(fullData);
              setBooks(fullData);
            } else if (initialData.length > 0) {
              setCachedNewReleases(initialData);
            }
          } catch (prefetchErr) {
            console.error("Failed to prefetch full new releases:", prefetchErr);
            if (initialData.length > 0) {
              setCachedNewReleases(initialData);
            }
          }
        }, 500);
      } catch (err) {
        console.error("Failed to load new releases:", err);
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
