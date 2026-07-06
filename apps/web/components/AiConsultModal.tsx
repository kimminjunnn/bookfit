"use client";

import { useState, useEffect } from "react";
import { useAiConsult } from "./AiConsultContext";
import AiConsultForm from "./AiConsultForm";
import LoadingState from "./LoadingState";
import RecommendationResult from "./RecommendationResult";
import ErrorState from "./ErrorState";
import { UserBookConsultInput, AiRecommendationResult } from "@/types/book";

export default function AiConsultModal() {
  const { isModalOpen, prefillText, autoSubmit, closeModal } = useAiConsult();
  const [status, setStatus] = useState<"idle" | "loading" | "result" | "error">("idle");
  const [result, setResult] = useState<AiRecommendationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastInput, setLastInput] = useState<UserBookConsultInput | null>(null);

  // Reset modal state when closed to ensure it starts fresh next time
  useEffect(() => {
    if (!isModalOpen) {
      setStatus("idle");
      setResult(null);
      setErrorMessage("");
      setLastInput(null);
    }
  }, [isModalOpen]);

  const handleFormSubmit = async (input: UserBookConsultInput) => {
    setLastInput(input);
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("서버와의 통신에 실패했습니다.");
      }

      const data: AiRecommendationResult = await response.json();
      setResult(data);
      setStatus("result");
    } catch (err: any) {
      setErrorMessage(err?.message || "추천을 생성하는 도중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  // Handle autoSubmit from context
  useEffect(() => {
    if (isModalOpen && autoSubmit && prefillText.trim() && status === "idle") {
      handleFormSubmit({
        situation: prefillText.trim(),
        freeText: prefillText.trim(),
      });
    }
  }, [isModalOpen, autoSubmit, prefillText, status]);

  const handleRetry = () => {
    if (lastInput) {
      handleFormSubmit(lastInput);
    } else {
      setStatus("idle");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    setLastInput(null);
  };

  const handleClose = () => {
    closeModal();
    setStatus("idle");
    setResult(null);
    setErrorMessage("");
    setLastInput(null);
  };

  // Fallback handler: fetch bestseller-based recommendations directly
  const handleFallback = async () => {
    setStatus("loading");
    try {
      // Mock fallback: Send empty input or special key to trigger default bestselling recommendations
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ situation: "베스트셀러 추천" }),
      });
      const data = await response.json();
      setResult(data);
      setStatus("result");
    } catch (e) {
      setErrorMessage("기본 추천 도서를 불러오는데 실패했습니다.");
      setStatus("error");
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop/Overlay */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity duration-300 modal-overlay-enter"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed bg-white rounded-2xl z-50 flex flex-col overflow-y-auto md:overflow-hidden modal-panel-enter inset-0 m-auto w-[95%] md:w-full max-w-[760px] h-auto max-h-[80vh] md:h-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-outline-variant/30">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-[#005226] px-md h-[64px] flex justify-between items-center shrink-0 border-b border-white/10 shadow-sm">
          <div className="flex items-center gap-xs text-white">
            <span className="material-symbols-outlined text-[20px] animate-pulse text-white/95" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <span className="font-semibold text-[17px] tracking-tight text-white">
              BookFit AI 독서 큐레이터
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all rounded-full p-1.5 flex items-center justify-center cursor-pointer"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Modal Content Area */}
        <div className="flex-1 overflow-y-visible md:overflow-y-auto no-scrollbar p-md flex flex-col">
          {status === "idle" && (
            <AiConsultForm onSubmit={handleFormSubmit} initialSituation={prefillText} />
          )}

          {status === "loading" && (
            <LoadingState />
          )}

          {status === "result" && result && (
            <RecommendationResult result={result} onReset={handleReset} />
          )}

          {status === "error" && (
            <ErrorState
              message={errorMessage}
              onRetry={handleRetry}
              onFallbackRecommendation={handleFallback}
            />
          )}
        </div>

        {/* Fixed bottom footer — submit button, only shown on input screen */}
        {status === "idle" && (
          <div className="shrink-0 px-md pb-md pt-sm border-t border-outline-variant/40 bg-white rounded-b-2xl">
            <button
              type="submit"
              form="ai-consult-form"
              className="w-full h-11 bg-primary hover:bg-[#005226] text-white rounded-lg font-bold text-[14px] flex items-center justify-center gap-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              책 추천받기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
