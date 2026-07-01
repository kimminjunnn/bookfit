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
  const [studyPeriod, setStudyPeriod] = useState("1주일");
  const [pickupStore, setPickupStore] = useState("광화문 본점");
  
  // Accordion active state: 'category' | 'purpose' | 'duration' | 'store' | null
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
      studyPeriod: studyPeriod || undefined,
      pickupStore: pickupStore || undefined,
      freeText: situation.trim(),
    });
  };

  const categories = [
    "소설", "에세이", "인문학", "자기계발", 
    "경제경영", "과학", "자격증/수험서", "전공서", "기타"
  ];

  const goals = [
    "위로/공감", "지식 탐구", "전문성 향상", 
    "취미/여가", "시험 준비", "기타"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-md pb-12">
      {/* Welcome message bubble */}
      <div className="flex gap-xs items-start">
        <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0 mt-1">
          <span
            className="material-symbols-outlined text-primary text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
        </div>
        <div className="bg-surface-container px-md py-sm rounded-xl rounded-tl-none max-w-[85%] border border-outline-variant/30">
          <p className="text-[14px] text-on-surface">
            안녕하세요! 어떤 책을 찾으시나요? 당신의 고민이나 관심사를 편하게 들려주세요.
          </p>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="space-y-xs">
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          className="w-full h-32 p-md rounded-lg border border-outline-variant bg-white focus:ring-1 focus:ring-secondary focus:border-secondary resize-none text-[15px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all"
          placeholder="예: 요즘 번아웃이 와서 마음을 다잡을 책이 필요해요. 가벼운 수필이나 인문 서적이면 좋겠어요."
        />
        <p className="text-[12px] text-on-surface-variant/60 px-1">
          더 상세히 적어주실수록 정확한 추천이 가능합니다.
        </p>
      </div>

      {/* Collapsible Input Sections */}
      <div className="space-y-xs">
        
        {/* Category Accordion */}
        <div className="border border-outline-variant rounded-lg overflow-hidden transition-all bg-white shadow-sm">
          <button
            type="button"
            className="w-full flex justify-between items-center p-md bg-surface-container-low hover:bg-surface-container/50 transition-colors text-left"
            onClick={() => toggleAccordion("category")}
          >
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">category</span>
              <span className="text-[14px] font-semibold text-on-surface">
                선호 분야 {preferredCategory && `(${preferredCategory})`}
              </span>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200 ${activeAccordion === "category" ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>
          
          {activeAccordion === "category" && (
            <div className="p-md border-t border-outline-variant bg-white space-y-xs animate-in fade-in duration-200">
              <div className="flex flex-wrap gap-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPreferredCategory(preferredCategory === cat ? "" : cat)}
                    className={`px-3 py-1.5 rounded-full text-[13px] border border-outline-variant transition-all hover:border-secondary cursor-pointer ${
                      preferredCategory === cat
                        ? "bg-primary text-white border-primary"
                        : "bg-surface text-on-surface-variant"
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
        <div className="border border-outline-variant rounded-lg overflow-hidden transition-all bg-white shadow-sm">
          <button
            type="button"
            className="w-full flex justify-between items-center p-md bg-surface-container-low hover:bg-surface-container/50 transition-colors text-left"
            onClick={() => toggleAccordion("purpose")}
          >
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">track_changes</span>
              <span className="text-[14px] font-semibold text-on-surface">
                독서 목적 {goal && `(${goal})`}
              </span>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200 ${activeAccordion === "purpose" ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {activeAccordion === "purpose" && (
            <div className="p-md border-t border-outline-variant bg-white animate-in fade-in duration-200">
              <div className="grid grid-cols-3 gap-xs">
                {goals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(goal === g ? "" : g)}
                    className={`p-2 text-[13px] border rounded transition-all text-center hover:bg-surface-container/30 ${
                      goal === g
                        ? "border-primary bg-primary/5 font-semibold text-primary"
                        : "border-outline-variant text-on-surface-variant"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Duration Accordion */}
        <div className="border border-outline-variant rounded-lg overflow-hidden transition-all bg-white shadow-sm">
          <button
            type="button"
            className="w-full flex justify-between items-center p-md bg-surface-container-low hover:bg-surface-container/50 transition-colors text-left"
            onClick={() => toggleAccordion("duration")}
          >
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">calendar_today</span>
              <span className="text-[14px] font-semibold text-on-surface">
                학습/독서 기간 ({studyPeriod})
              </span>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200 ${activeAccordion === "duration" ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {activeAccordion === "duration" && (
            <div className="p-md border-t border-outline-variant bg-white space-y-sm animate-in fade-in duration-200">
              <div className="flex justify-between gap-xs">
                {["1주일", "2주일", "1개월", "1개월 이상"].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setStudyPeriod(period)}
                    className={`flex-1 py-2 text-[13px] border rounded text-center transition-all ${
                      studyPeriod === period
                        ? "border-primary bg-primary/5 font-semibold text-primary"
                        : "border-outline-variant text-on-surface-variant bg-surface"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Store Accordion */}
        <div className="border border-outline-variant rounded-lg overflow-hidden transition-all bg-white shadow-sm">
          <button
            type="button"
            className="w-full flex justify-between items-center p-md bg-surface-container-low hover:bg-surface-container/50 transition-colors text-left"
            onClick={() => toggleAccordion("store")}
          >
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">storefront</span>
              <span className="text-[14px] font-semibold text-on-surface">
                바로드림 매장 ({pickupStore})
              </span>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200 ${activeAccordion === "store" ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {activeAccordion === "store" && (
            <div className="p-md border-t border-outline-variant bg-white animate-in fade-in duration-200">
              <select
                value={pickupStore}
                onChange={(e) => setPickupStore(e.target.value)}
                className="w-full p-2.5 text-[14px] border border-outline-variant rounded bg-white outline-none focus:border-primary"
              >
                <option value="광화문 본점">광화문 본점</option>
                <option value="강남점">강남점</option>
                <option value="영등포점">영등포점</option>
                <option value="온라인 전용">온라인 전용</option>
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Footer Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-md bg-white border-t border-outline-variant z-10 max-w-[600px] mx-auto rounded-b-xl">
        <button
          type="submit"
          className="w-full h-12 bg-primary text-white rounded-lg font-semibold text-[15px] flex items-center justify-center gap-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          책 추천받기
        </button>
      </div>
    </form>
  );
}
