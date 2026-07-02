"use client";

import { AiRecommendationResult } from "@/types/book";
import RecommendationBookCard from "./RecommendationBookCard";

interface RecommendationResultProps {
  result: AiRecommendationResult;
  onReset: () => void;
}

export default function RecommendationResult({
  result,
  onReset,
}: RecommendationResultProps) {


  return (
    <div className="flex flex-col gap-sm animate-fade-in h-full">

      {/* ── Top strip: AI summary + meta ─────────────────────────────── */}
      <div className="bg-[#f8f9f6] border border-outline-variant rounded-xl p-sm flex flex-col gap-xs shrink-0">
        {/* Row 1: icon + summary */}
        <div className="flex gap-xs items-start">
          <span
            className="material-symbols-outlined text-primary text-[15px] shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
          <p className="text-[12px] leading-relaxed text-on-surface font-medium line-clamp-2 flex-1">
            {result.summary}
          </p>
        </div>

        {/* Row 2: badges */}
        <div className="flex items-center flex-wrap gap-xs pt-0.5 border-t border-outline-variant/40">
          {/* Category badge */}
          <span className="flex items-center gap-0.5 bg-primary/8 text-primary text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-primary/15">
            <span className="material-symbols-outlined text-[11px]">menu_book</span>
            {result.neededCategory}
          </span>

          {/* Reset button — tucked to right */}
          <button
            onClick={onReset}
            className="ml-auto flex items-center gap-0.5 text-[10.5px] font-bold text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px]">restart_alt</span>
            다시 추천
          </button>
        </div>
      </div>

      {/* ── Bottom: 3-column book cards (all visible at once) ───────── */}
      <div className="grid grid-cols-3 gap-sm flex-1 min-h-0">
        {result.recommendedBooks.map((recBook, idx) => (
          <RecommendationBookCard
            key={recBook.id}
            recommendedBook={recBook}
            index={idx}
          />
        ))}
      </div>

    </div>
  );
}
