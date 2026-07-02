"use client";

import { useAiConsult } from "./AiConsultContext";

export default function FloatingAiButton() {
  const { openModal } = useAiConsult();

  return (
    <button
      onClick={openModal}
      className="fixed bottom-10 right-gutter hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer"
      aria-label="AI 도서 상담"
    >
      <div className="relative w-12 h-12 shrink-0">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-primary shadow-lg">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology
          </span>
        </div>
        {/* AI 말풍선 뱃지 */}
        <span className="absolute -top-1 -right-1 bg-secondary text-white text-[9px] font-bold leading-none px-[5px] py-[3px] rounded-full shadow-sm tracking-wide">
          AI
        </span>
      </div>
    </button>
  );
}
