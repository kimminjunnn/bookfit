"use client";

import { useAiConsult } from "./AiConsultContext";

interface AiCuratorNudgeProps {
  variant: "banner" | "no-result" | "footer" | "link" | "few-result";
  query?: string;
}

export default function AiCuratorNudge({ variant, query }: AiCuratorNudgeProps) {
  const { openModal } = useAiConsult();

  const handleOpen = () => {
    openModal(query || undefined);
  };

  // ── 1) 상황형 쿼리 감지 배너 (banner) ──────────────────────────────
  if (variant === "banner") {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-lg flex flex-col md:flex-row md:items-center justify-between gap-md animate-fade-in">
        <div className="flex gap-sm items-start">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <span
              className="material-symbols-outlined text-[20px] font-bold"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <p className="font-bold text-[16px] text-primary">
              이건 일반 검색보다 AI 상담이 더 빨라요!
            </p>
            <p className="text-[13px] text-on-surface-variant mt-0.5 leading-relaxed">
              고민이나 상황에 딱 맞는 책을 찾고 계시네요. AI 큐레이터가 적절한 도서와 읽는 순서까지 설계해 드릴게요.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpen}
          className="h-11 px-md bg-primary text-white rounded-lg text-[14px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
          AI 상담 시작하기
        </button>
      </div>
    );
  }

  // ── 2) 무결과 메인 CTA (no-result) ───────────────────────────────
  if (variant === "no-result") {
    return (
      <div className="text-center py-16 px-md max-w-xl mx-auto flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-outline-variant/30 flex items-center justify-center mb-md text-on-surface-variant/70">
          <span className="material-symbols-outlined text-[32px]">search_off</span>
        </div>
        <h3 className="text-[18px] font-bold text-on-surface">
          🔎 &lsquo;{query}&rsquo; 검색 결과가 없습니다
        </h3>
        <p className="text-[14px] text-on-surface-variant mt-xs leading-relaxed">
          검색어의 철자를 확인하시거나, 아래 AI 독서 큐레이터에게 상황을 설명하고 맞춤형 추천을 받아보세요.
        </p>
        <button
          onClick={handleOpen}
          className="mt-lg h-12 px-xl bg-primary text-white rounded-lg text-[14px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-xs cursor-pointer shadow-md"
        >
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          AI 독서 큐레이터에게 맡기기
        </button>
      </div>
    );
  }

  // ── 3) 하단 마무리 CTA (footer) ─────────────────────────────────
  if (variant === "footer") {
    return (
      <div className="mt-2xl border-t border-outline-variant pt-xl flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h3 className="font-bold text-[18px] text-on-surface flex items-center gap-xs">
            <span
              className="material-symbols-outlined text-primary text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            무엇을 읽을지 여전히 고민되신다면?
          </h3>
          <p className="text-[14px] text-on-surface-variant mt-xs">
            현재 겪고 있는 고민, 목표, 카테고리를 골라 상황 맞춤형 책 추천과 체계적인 독서 플랜을 짜보세요.
          </p>
        </div>
        <button
          onClick={handleOpen}
          className="h-11 px-md bg-secondary-container text-on-secondary-container rounded-lg text-[14px] font-semibold hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
          내 상황으로 추천받기
        </button>
      </div>
    );
  }

  // ── 4) 검색바 바로 밑 보조 텍스트 링크 (link) ────────────────────────
  if (variant === "link") {
    return (
      <div className="flex items-center gap-xs pl-xs mt-1 animate-fade-in">
        <span
          className="material-symbols-outlined text-primary text-[15px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <button
          onClick={handleOpen}
          className="text-[12.5px] text-primary font-medium hover:underline text-left cursor-pointer"
        >
          찾는 책이 애매한가요? AI 독서 큐레이터가 상황에 맞게 골라드려요.
        </button>
      </div>
    );
  }

  // ── 5) AI에게 추천받기 카드 (few-result) ──────────────────────────
  // 사용자 요건: 결과 3권 이하 시 표시되던 카드(AI에게 추천받기 테이블) 삭제 요청
  // 따라서 few-result는 아무것도 렌더링하지 않고 null을 반환합니다.
  return null;
}
