"use client";
import { useState, useEffect } from "react";

const STEPS = [
  { id: 1, text: "도서 데이터베이스 검색", activeMin: 0, doneMin: 33 },
  { id: 2, text: "고민 및 도서 매칭", activeMin: 33, doneMin: 66 },
  { id: 3, text: "AI 맞춤 처방 분석", activeMin: 66, doneMin: 98 },
];

export default function LoadingState() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99;
        const remaining = 100 - prev;
        const increment = Math.max(0.18, remaining * 0.05 * (Math.random() * 0.6 + 0.7));
        return Math.min(99, Number((prev + increment).toFixed(1)));
      });
    }, 110);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-sm select-none animate-fade-in flex-1 min-h-0">

      {/* Left Column: Big Circle Spinner & Progress */}
      <div className="flex flex-col items-center justify-center text-center gap-4 bg-[#f8f9f6] p-md rounded-xl border border-outline-variant/60">
        {/* Circle spinner — larger */}
        <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="43"
              stroke="#e1e3de" strokeWidth="4" fill="transparent" className="opacity-20"
            />
            <circle
              cx="50" cy="50" r="43"
              stroke="url(#progress-gradient-loading)"
              strokeWidth="5.5"
              strokeDasharray={270.18}
              strokeDashoffset={270.18 - (270.18 * progress) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-200 ease-out"
            />
            <defs>
              <linearGradient id="progress-gradient-loading" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#006b32" />
                <stop offset="100%" stopColor="#009e49" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute font-extrabold text-[22px] text-primary tracking-tighter">
            {Math.floor(progress)}%
          </div>
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-[16px] text-on-surface tracking-tight">
            AI 도서 처방전 작성 중
          </h3>
          <p className="text-[13px] text-on-surface-variant/80 font-medium leading-relaxed max-w-[220px] mx-auto">
            {progress < 33
              ? "데이터베이스에서 도서를 탐색하고 있습니다."
              : progress < 66
                ? "고민의 맥락과 최적의 대안을 매칭 중입니다."
                : "AI 맞춤형 처방 기안을 분석하고 있습니다."}
          </p>
        </div>
      </div>

      {/* Right Column: Steps Tracker + Skeletons */}
      <div className="flex flex-col gap-sm">
        {/* Progress Checklist Tracker */}
        <div className="bg-white border border-outline-variant rounded-xl p-md space-y-2 flex-1">
          <p className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest mb-3">분석 진행 단계</p>
          {STEPS.map((step) => {
            const isDone = progress >= step.doneMin;
            const isActive = progress >= step.activeMin && progress < step.doneMin;

            return (
              <div
                key={step.id}
                className={`flex items-center text-[13px] font-bold px-3 py-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-primary/5 text-primary border border-primary/15"
                    : isDone
                      ? "text-on-surface-variant/50 opacity-60"
                      : "text-on-surface-variant/25"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isDone ? (
                    <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  ) : isActive ? (
                    <span className="material-symbols-outlined text-primary text-[16px] animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant/25 text-[16px]">
                      radio_button_unchecked
                    </span>
                  )}
                  <span className={isDone ? "line-through text-on-surface-variant/40 font-medium" : ""}>
                    {step.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Skeletons side-by-side */}
        <div className="flex flex-row gap-xs">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 flex flex-col p-sm bg-white border border-outline-variant/40 rounded-xl items-center text-center opacity-60 gap-2"
            >
              <div className="w-[52px] h-[72px] bg-[#f2f4f1] rounded animate-pulse" />
              <div className="w-full space-y-1.5">
                <div className="h-2 w-4/5 bg-[#f2f4f1] rounded mx-auto animate-pulse" />
                <div className="h-1.5 w-3/5 bg-[#f2f4f1] rounded mx-auto animate-pulse" />
                <div className="h-1.5 w-2/4 bg-[#f2f4f1] rounded mx-auto animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
