"use client";

import { useState } from "react";
import { bestsellers } from "@/dummy_data/dummy-books";
import BookCard from "./BookCard";

export default function Bestsellers() {
  const [page, setPage] = useState(0);
  const pageSize = 4;
  const totalPages = Math.ceil(bestsellers.length / pageSize);
  const currentBooks = bestsellers.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  return (
    <section className="mt-section">
      <div className="flex justify-between items-end mb-lg">
        <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">
          베스트셀러
        </h2>
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
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
        {currentBooks.map((book, i) => (
          <BookCard
            key={book.id}
            book={book}
            variant="bestseller"
            rank={page * pageSize + i + 1}
            index={i + 5}
            discount={10}
          />
        ))}
      </div>
    </section>
  );
}
