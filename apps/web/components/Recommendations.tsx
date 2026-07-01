"use client";

import { recommendations } from "@/dummy_data/dummy-books";
import BookCard from "./BookCard";

export default function Recommendations() {
  const handleRefresh = () => {
    // 추후 AI 기반 추천 새로고침으로 교체
  };

  return (
    <section className="mt-section">
      <div className="flex justify-between items-end mb-lg">
        <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">
          당신을 위한 추천
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-xs text-secondary text-[15px] font-semibold tracking-[0.02em]"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            refresh
          </span>
          새로운 추천 받기
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
        {recommendations.map((book, i) => (
          <BookCard
            key={book.id}
            book={book}
            variant="recommendation"
            index={i + 9}
          />
        ))}
      </div>
    </section>
  );
}
