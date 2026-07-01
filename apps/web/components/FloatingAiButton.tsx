"use client";

import { useAiConsult } from "./AiConsultContext";

export default function FloatingAiButton() {
  const { openModal } = useAiConsult();

  return (
    <button
      onClick={openModal}
      className="fixed bottom-10 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-50 cursor-pointer"
      aria-label="AI 도서 상담"
    >
      <span
        className="material-symbols-outlined text-[28px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        chat
      </span>
    </button>
  );
}
