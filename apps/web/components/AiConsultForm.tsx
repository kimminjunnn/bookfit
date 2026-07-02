"use client";

import { UserBookConsultInput } from "@/types/book";
import { useState } from "react";

interface AiConsultFormProps {
  onSubmit: (input: UserBookConsultInput) => void;
}

export default function AiConsultForm({ onSubmit }: AiConsultFormProps) {
  const [situation, setSituation] = useState("");
  const [preferredCategory, setPreferredCategory] = useState("");
  const [goal, setGoal] = useState("");

  // Accordion active state: 'category' | 'purpose' | null
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleAccordion = (name: string) => {
    setActiveAccordion((prev) => (prev === name ? null : name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) {
      alert("현재 고민이나 찾고 있는 책의 상황을 적어주세요.");
      return;
    }

    onSubmit({
      situation: situation.trim(),
      preferredCategory: preferredCategory || undefined,
      goal: goal || undefined,
      freeText: situation.trim(),
    });
  };

  const categories = [
    "소설", "에세이", "인문학", "자기계발",
    "경제경영", "과학", "자격증/수험서", "전공서", "기타"
  ];

  const goals = [
    "위로", "지식 탐구", "전문성",
    "여가", "시험 준비", "기타"
  ];

  return (
    <form id="ai-consult-form" onSubmit={handleSubmit} className="flex flex-col gap-sm">
      {/* Welcome message bubble */}
      <div className="flex gap-sm items-start animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
          <span
            className="material-symbols-outlined text-primary text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
        </div>
        <div className="bg-[#f8f9f6] px-md py-xs rounded-2xl rounded-tl-none border border-outline-variant/50 flex-1">
          <p className="text-[12.5px] leading-relaxed text-on-surface font-medium">
            어떤 책을 찾고 계신가요? 😊<br />
            지금 상황이나 필요한 것을 편하게 말씀해 주세요.
          </p>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="space-y-xs animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="relative">
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            className="w-full h-56 p-sm rounded-xl border border-outline-variant bg-white focus:ring-1 focus:ring-primary focus:border-primary resize-none text-[13px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors"
            placeholder="예: 번아웃이 와서 가볍게 읽을 책이 필요해요 / 내년 공인중개사 시험을 준비하려고 해요."
          />
        </div>
      </div>

      {/* Category + Purpose Filters (Horizontal split 2-columns) */}
      <div className="grid grid-cols-2 gap-sm animate-fade-in" style={{ animationDelay: "200ms" }}>

        {/* Category Accordion */}
        <div className="border border-outline-variant bg-white rounded-xl overflow-hidden self-start">
          <button
            type="button"
            className="w-full flex justify-between items-center p-xs bg-[#fafbfa] hover:bg-surface/50 transition-colors text-left cursor-pointer"
            onClick={() => toggleAccordion("category")}
          >
            <div className="flex items-center gap-xs">
              <span className={`material-symbols-outlined text-[16px] ${preferredCategory ? 'text-primary' : 'text-on-surface-variant/75'}`}>category</span>
              <span className="text-[12.5px] font-bold text-on-surface">
                선호 분야 {preferredCategory && <span className="text-primary ml-0.5">({preferredCategory})</span>}
              </span>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant/60 text-[16px] transition-transform duration-200 ${activeAccordion === "category" ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {activeAccordion === "category" && (
            <div className="p-xs border-t border-outline-variant bg-white animate-fade-in max-h-[140px] overflow-y-auto no-scrollbar">
              <div className="flex flex-wrap gap-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPreferredCategory(preferredCategory === cat ? "" : cat)}
                    className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${preferredCategory === cat
                        ? "bg-primary text-white border-primary"
                        : "bg-[#f8f9f6] text-on-surface-variant/80 border-outline-variant hover:bg-white"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Goal Accordion */}
        <div className="border border-outline-variant bg-white rounded-xl overflow-hidden self-start">
          <button
            type="button"
            className="w-full flex justify-between items-center p-xs bg-[#fafbfa] hover:bg-surface/50 transition-colors text-left cursor-pointer"
            onClick={() => toggleAccordion("purpose")}
          >
            <div className="flex items-center gap-xs">
              <span className={`material-symbols-outlined text-[16px] ${goal ? 'text-primary' : 'text-on-surface-variant/75'}`}>track_changes</span>
              <span className="text-[12.5px] font-bold text-on-surface">
                독서 목적 {goal && <span className="text-primary ml-0.5">({goal})</span>}
              </span>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant/60 text-[16px] transition-transform duration-200 ${activeAccordion === "purpose" ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {activeAccordion === "purpose" && (
            <div className="p-xs border-t border-outline-variant bg-white animate-fade-in">
              <div className="grid grid-cols-2 gap-xs">
                {goals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(goal === g ? "" : g)}
                    className={`py-1 px-1 rounded text-[11px] font-bold border transition-colors text-center cursor-pointer ${goal === g
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-outline-variant text-on-surface-variant/80 bg-[#f8f9f6] hover:bg-white"
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </form>
  );
}
