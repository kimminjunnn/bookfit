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

  if (loading) {
    return (
      <section className="mt-section">
        <div className="flex justify-between items-end mb-lg">
          <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">
            신간 도서
          </h2>
        </div>
        <div className="flex gap-lg overflow-x-auto no-scrollbar pb-md">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[160px] aspect-[3/4] bg-surface border border-outline-variant rounded-lg animate-pulse"
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
          href="#"
          className="text-primary text-[15px] font-semibold tracking-[0.02em] flex items-center gap-xs"
        >
          더보기{" "}
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </Link>
      </div>
      <div className="flex gap-lg overflow-x-auto no-scrollbar pb-md">
        {books.map((book, i) => (
          <BookCard key={book.id} book={book} variant="new-release" index={i} />
        ))}
      </div>
    </section>
  );
}
