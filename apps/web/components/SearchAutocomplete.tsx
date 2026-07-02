"use client";

import { useEffect, useRef } from "react";
import { useAiConsult } from "./AiConsultContext";

interface SearchAutocompleteProps {
  query: string;
  onClose: () => void;
}

export default function SearchAutocomplete({
  query,
  onClose,
}: SearchAutocompleteProps) {
  const { openModal } = useAiConsult();
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫힘 처리
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // 키보드 엔터 입력 시 바로 모달을 열 수 있도록 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (query.trim().length < 1) return null;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white rounded-xl border border-outline-variant shadow-xl z-[60] overflow-hidden animate-fade-in"
    >
      <button
        className="w-full flex items-center gap-xs px-md py-sm text-left hover:bg-primary/5 transition-colors cursor-pointer"
        onClick={() => {
          openModal(query || undefined);
          onClose();
        }}
      >
        <span
          className="material-symbols-outlined text-primary text-[18px] shrink-0 animate-pulse"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <span className="text-[13px] text-on-surface leading-tight">
          <span className="font-semibold text-primary">&lsquo;{query}&rsquo;</span>에 대해 AI 독서 큐레이터에게 상담받기
        </span>
      </button>
    </div>
  );
}
