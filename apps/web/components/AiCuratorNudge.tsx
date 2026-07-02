"use client";

import { useState, useEffect } from "react";
import { useAiConsult } from "./AiConsultContext";

interface AiCuratorNudgeProps {
  variant: "banner" | "no-result" | "footer" | "link" | "few-result";
  query?: string;
}

export default function AiCuratorNudge({ variant, query }: AiCuratorNudgeProps) {
  const { openModal } = useAiConsult();
  const [inlineQuery, setInlineQuery] = useState("");

  useEffect(() => {
    if (variant === "no-result" && query) {
      setInlineQuery(query.trim());
    } else {
      setInlineQuery("");
    }
  }, [query, variant]);

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
    const handleInlineSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inlineQuery.trim()) {
        alert("현재 고민이나 찾고 있는 책의 상황을 입력해주세요.");
        return;
      }
      openModal(inlineQuery.trim(), true);
    };

    return (
      <div className="max-w-2xl mx-auto mt-lg p-xl rounded-xl bg-ai-promo-bg border border-outline-variant shadow-sm animate-fade-in text-left">
        <div className="flex items-start gap-md mb-lg">
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
            <p className="text-[14px] text-on-surface-variant mt-xs leading-relaxed">
              찾으시는 도서가 없거나 조건에 맞지 않습니다. 철자를 확인하시거나, 아래 AI 큐레이터에게 자신의 현재 상황이나 찾는 도서의 특징을 들려주고 맞춤형 추천을 받아보세요!
            </p>
          </div>
        </div>

        <form onSubmit={handleInlineSubmit} className="space-y-sm">
          <div className="relative group">
            <textarea
              value={inlineQuery}
              onChange={(e) => setInlineQuery(e.target.value)}
              className="w-full h-24 p-md rounded-xl border border-outline-variant bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary resize-none text-[14px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all shadow-inner"
              placeholder="예: 요즘 무기력해서 힘이 나는 자기계발서나 가벼운 소설을 추천해주세요."
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-md">
            <p className="text-[12px] text-on-surface-variant/60 font-medium flex items-center gap-xs">
              <span className="material-symbols-outlined text-[15px]">info</span>
              상황을 자세히 작성해 주시면 더욱 정밀한 큐레이션 결과를 받으실 수 있습니다.
            </p>
            <button
              type="submit"
              className="w-full sm:w-auto h-11 px-xl bg-primary text-white rounded-lg text-[14px] font-semibold hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-xs cursor-pointer shadow-md shrink-0"
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              AI 독서 큐레이션 받기
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── 3) 하단 마무리 CTA (footer) ─────────────────────────────────
  if (variant === "footer") {
    const handleInlineSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inlineQuery.trim()) {
        alert("현재 고민이나 찾고 있는 책의 상황을 입력해주세요.");
        return;
      }
      openModal(inlineQuery.trim(), true);
    };

    return (
      <div className="mt-section p-xl rounded-xl bg-ai-promo-bg border border-outline-variant shadow-sm animate-fade-in text-left">
        <div className="flex flex-col md:flex-row items-start justify-between gap-lg mb-md">
          <div className="flex items-start gap-md">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-primary shrink-0 shadow-sm">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-secondary tracking-[-0.01em]">
                AI 독서 큐레이터에게 직접 상황 물어보기
              </h2>
              <p className="text-[14.5px] text-on-surface-variant mt-xs leading-relaxed">
                검색 결과에서 원하는 책을 찾지 못하셨나요? 현재 겪고 있는 고민이나 구체적인 목적을 아래에 적어주시면 딱 맞는 책들과 독서 플랜을 추천해 드릴게요.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleInlineSubmit} className="space-y-sm">
          <div className="relative group">
            <textarea
              value={inlineQuery}
              onChange={(e) => setInlineQuery(e.target.value)}
              className="w-full h-24 p-md rounded-xl border border-outline-variant bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary resize-none text-[14px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all shadow-inner"
              placeholder="예: 업무 효율성을 높이고 싶은데 시간 관리가 너무 안 돼요. 실용적인 팁이 있는 자기계발서를 추천해주세요."
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-md">
            <p className="text-[12px] text-on-surface-variant/60 font-medium flex items-center gap-xs">
              <span className="material-symbols-outlined text-[15px]">info</span>
              상황을 자세히 적어주실수록 정확한 도서 매칭 및 플랜 생성이 가능합니다.
            </p>
            <button
              type="submit"
              className="w-full sm:w-auto h-11 px-xl bg-secondary-container text-on-secondary-container rounded-lg text-[14px] font-semibold hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-xs cursor-pointer shadow-md shrink-0"
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              AI 독서 큐레이션 받기
            </button>
          </div>
        </form>
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
