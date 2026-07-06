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
    <div className="flex flex-col gap-xs animate-fade-in h-full">

      {/* ── Top strip: AI summary ─────────────────────────────── */}
      <div className="bg-[#f8f9f6] border border-outline-variant rounded-xl p-sm flex flex-col gap-xs shrink-0">
        {/* Row 1: icon + summary */}
        <div className="flex gap-xs items-start">
          <span
            className="material-symbols-outlined text-primary text-[15px] shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology
          </span>
          <p className="text-[12px] leading-relaxed text-on-surface font-medium flex-1">
            {result.summary}
          </p>
        </div>
      </div>

      {/* ── Bottom: 3-column book cards (horizontal scrollable on mobile, 3-column grid on desktop) ───────── */}
      <div className="flex md:grid md:grid-cols-3 gap-sm flex-1 min-h-0 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-thin pb-3">
        {result.recommendedBooks.map((recBook, idx) => (
          <div
            key={recBook.id}
            className="min-w-[85%] sm:min-w-[45%] md:min-w-0 flex-1 shrink-0 md:shrink snap-start h-full"
          >
            <RecommendationBookCard
              recommendedBook={recBook}
              index={idx}
            />
          </div>
        ))}
      </div>

      {/* ── Bottom Center Button: 다시 질문하기 ──────────────────────── */}
      <div className="flex justify-center shrink-0">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1 bg-[#f8f9f6] hover:bg-[#eef1eb] text-on-surface border border-outline-variant px-md py-2 rounded-lg text-[12px] font-bold transition-all shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">replay</span>
          다시 질문하기
        </button>
      </div>

    </div>
  );
}
