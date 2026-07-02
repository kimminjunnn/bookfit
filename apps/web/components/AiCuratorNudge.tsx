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
      <div className="max-w-4xl mx-auto mt-lg p-xl rounded-xl bg-ai-promo-bg border border-outline-variant shadow-sm animate-fade-in text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-xl">
          <div className="flex items-start gap-md">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                search_off
              </span>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-on-surface tracking-[-0.01em]">
                🔎 &lsquo;{query}&rsquo; 검색 결과가 없습니다
              </h2>
              <p className="text-[14.5px] text-on-surface-variant mt-xs leading-relaxed">
                찾으시는 도서가 없거나 조건에 맞지 않습니다. AI 큐레이터에게 상황을 설명하고 딱 맞는 추천 도서를 받아보세요.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpen}
            className="w-full md:w-auto h-12 px-xl bg-primary text-white rounded-lg text-[14px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-xs cursor-pointer shadow-md whitespace-nowrap"
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            AI 상담 시작
          </button>
        </div>
      </div>
    );
  }

  // ── 3) 하단 마무리 CTA (footer) ─────────────────────────────────
  if (variant === "footer") {
    return (
      <div className="mt-section flex flex-col md:flex-row items-center justify-between p-xl rounded-xl bg-ai-promo-bg border border-outline-variant shadow-sm gap-xl text-left animate-fade-in">
        <div className="flex items-start gap-md">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-primary shrink-0">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              psychology
            </span>
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-secondary tracking-[-0.01em]">
              AI 독서 큐레이터
            </h2>
            <p className="text-[15px] text-on-surface-variant mt-xs">
              번아웃, 자격증, 취업... 내게 필요한 책은? 당신의 고민을 들려주세요.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpen}
          className="w-full md:w-auto h-12 px-xl bg-secondary-container text-on-secondary-container rounded-lg text-[15px] font-semibold tracking-[0.02em] hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
        >
          지금 상담 시작
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
