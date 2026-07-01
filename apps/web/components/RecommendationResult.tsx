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
    <div className="space-y-6 pb-6">
      {/* AI Curator Summary */}
      <div className="flex gap-xs items-start">
        <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0 mt-1">
          <span
            className="material-symbols-outlined text-primary text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
        </div>
        <div className="bg-surface-container px-md py-sm rounded-xl rounded-tl-none max-w-[85%] border border-outline-variant/30">
          <p className="font-semibold text-primary text-[13px] mb-1">AI 큐레이터 분석</p>
          <p className="text-[14px] leading-relaxed text-on-surface">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Recommended Category Callout */}
      <div className="bg-[#EAF1FE] border border-secondary/20 p-md rounded-xl flex items-center justify-between">
        <div>
          <p className="text-[12px] font-semibold text-secondary">추천 도서 분야</p>
          <h4 className="text-[16px] font-bold text-on-surface mt-0.5">
            {result.neededCategory}
          </h4>
        </div>
        <span className="material-symbols-outlined text-secondary text-[28px]">
          menu_book
        </span>
      </div>

      {/* Reading Flow Order */}
      {result.readingFlow && (
        <div className="bg-surface border border-outline-variant p-md rounded-xl">
          <p className="text-[12px] font-semibold text-on-surface-variant">추천 읽기 순서</p>
          <div className="flex items-center gap-xs mt-1.5 flex-wrap">
            {result.readingFlow.split("→").map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <span className="text-[13px] font-bold text-primary px-2.5 py-1 bg-primary/5 rounded border border-primary/10">
                  {step.trim()}
                </span>
                {idx < arr.length - 1 && (
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40">
                    arrow_forward
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Book List */}
      <div className="space-y-4">
        <h3 className="text-[15px] font-bold text-on-surface px-1">
          추천 도서 ({result.recommendedBooks.length}권)
        </h3>
        <div className="space-y-3">
          {result.recommendedBooks.map((recBook, idx) => (
            <RecommendationBookCard
              key={recBook.id}
              recommendedBook={recBook}
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* Reset button */}
      <div className="pt-2">
        <button
          onClick={onReset}
          className="w-full h-12 border border-outline-variant bg-surface hover:bg-surface-container rounded-lg font-semibold text-[14px] text-on-surface-variant flex items-center justify-center gap-xs transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          다시 추천받기
        </button>
      </div>
    </div>
  );
}

import React from "react";
