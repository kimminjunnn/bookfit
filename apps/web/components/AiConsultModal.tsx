"use client";

import { useState } from "react";
import { useAiConsult } from "./AiConsultContext";
import AiConsultForm from "./AiConsultForm";
import LoadingState from "./LoadingState";
import RecommendationResult from "./RecommendationResult";
import ErrorState from "./ErrorState";
import { UserBookConsultInput, AiRecommendationResult } from "@/types/book";

export default function AiConsultModal() {
  const { isModalOpen, closeModal } = useAiConsult();
  const [status, setStatus] = useState<"idle" | "loading" | "result" | "error">("idle");
  const [result, setResult] = useState<AiRecommendationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastInput, setLastInput] = useState<UserBookConsultInput | null>(null);

  if (!isModalOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop/Overlay */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity duration-300 modal-overlay-enter"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed bg-white rounded-xl z-50 modal-shadow flex flex-col overflow-hidden modal-panel-enter inset-0 m-auto w-full max-w-[600px] h-[95vh] max-h-[750px] shadow-2xl">
        {/* Header */}
        <header className="bg-primary px-md h-[60px] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-xs text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <span className="font-semibold text-[18px] text-white">
              BookFit AI 도서 추천
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:opacity-80 transition-opacity flex items-center justify-center p-1 cursor-pointer"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Modal Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-md space-y-md">
          {status === "idle" && (
            <AiConsultForm onSubmit={handleFormSubmit} />
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
      </div>
    </div>
  );
}
