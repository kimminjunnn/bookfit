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
    "위로/공감", "지식 탐구", "전문성 향상", 
    "취미/여가", "시험 준비", "기타"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-md pb-24">
      {/* Welcome message bubble */}
      <div className="flex gap-sm items-start animate-fade-in">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-[#009e49] flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
          <span
            className="material-symbols-outlined text-white text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
        </div>
        <div className="bg-gradient-to-br from-white to-[#f7f9f6] px-md py-sm rounded-2xl rounded-tl-none max-w-[85%] shadow-sm border border-outline-variant/60">
          <p className="font-semibold text-primary text-[11px] mb-0.5">AI 도서 상담사</p>
          <p className="text-[14px] leading-relaxed text-on-surface font-medium">
            안녕하세요! 어떤 책을 찾으시나요? 당신의 고민이나 관심사, 혹은 찾고 계신 도서의 특징을 편하게 들려주세요.
          </p>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="space-y-xs animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="relative group">
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            className="w-full h-36 p-md rounded-xl border border-outline-variant bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary resize-none text-[14.5px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 outline-none shadow-inner transition-all hover:border-outline-variant/80"
            placeholder="예: 요즘 번아웃이 와서 마음을 다잡을 책이 필요해요. 가벼운 수필이나 인문 서적이면 좋겠어요."
          />
        </div>
        <p className="text-[11.5px] text-on-surface-variant/60 px-1 flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[14px]">info</span>
          상세히 적어주실수록 당신에게 딱 맞춘 정확한 추천이 가능합니다.
        </p>
      </div>

      {/* Collapsible Input Sections */}
      <div className="space-y-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
        
        {/* Category Accordion */}
        <div className="border border-outline-variant/80 rounded-xl overflow-hidden transition-all bg-white shadow-sm hover:shadow-md hover:border-primary/20">
          <button
            type="button"
            className="w-full flex justify-between items-center p-md bg-[#fafbfa] hover:bg-surface transition-colors text-left cursor-pointer"
            onClick={() => toggleAccordion("category")}
          >
            <div className="flex items-center gap-xs">
              <span className={`material-symbols-outlined text-[20px] ${preferredCategory ? 'text-primary' : 'text-on-surface-variant/70'}`}>category</span>
              <span className="text-[14px] font-bold text-on-surface">
                선호 분야 {preferredCategory && <span className="text-primary font-extrabold ml-1">({preferredCategory})</span>}
              </span>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant/60 text-[20px] transition-transform duration-250 ${activeAccordion === "category" ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>
          
          {activeAccordion === "category" && (
            <div className="p-md border-t border-outline-variant bg-white space-y-xs animate-fade-in">
              <div className="flex flex-wrap gap-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPreferredCategory(preferredCategory === cat ? "" : cat)}
                    className={`px-3.5 py-2 rounded-full text-[13px] border transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                      preferredCategory === cat
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/30 font-semibold"
                        : "bg-[#f8f9f6] text-on-surface-variant/90 border-outline-variant hover:border-primary/40 hover:bg-white"
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
        <div className="border border-outline-variant/80 rounded-xl overflow-hidden transition-all bg-white shadow-sm hover:shadow-md hover:border-primary/20">
          <button
            type="button"
            className="w-full flex justify-between items-center p-md bg-[#fafbfa] hover:bg-surface transition-colors text-left cursor-pointer"
            onClick={() => toggleAccordion("purpose")}
          >
            <div className="flex items-center gap-xs">
              <span className={`material-symbols-outlined text-[20px] ${goal ? 'text-primary' : 'text-on-surface-variant/70'}`}>track_changes</span>
              <span className="text-[14px] font-bold text-on-surface">
                독서 목적 {goal && <span className="text-primary font-extrabold ml-1">({goal})</span>}
              </span>
            </div>
            <span className={`material-symbols-outlined text-on-surface-variant/60 text-[20px] transition-transform duration-250 ${activeAccordion === "purpose" ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          {activeAccordion === "purpose" && (
            <div className="p-md border-t border-outline-variant bg-white animate-fade-in">
              <div className="grid grid-cols-3 gap-xs">
                {goals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(goal === g ? "" : g)}
                    className={`p-2.5 rounded-lg text-[13px] border transition-all text-center hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                      goal === g
                        ? "border-primary bg-primary/5 font-bold text-primary shadow-sm shadow-primary/10"
                        : "border-outline-variant text-on-surface-variant/90 bg-[#f8f9f6] hover:border-primary/40 hover:bg-white"
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

      {/* Footer Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-md bg-white border-t border-outline-variant/60 z-10 max-w-[600px] mx-auto rounded-b-2xl shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
        <button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-[#00863f] text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-xs hover:from-[#007a39] hover:to-[#009b49] hover:shadow-[0_4px_20px_rgba(0,107,50,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          책 추천받기
        </button>
      </div>
    </form>
  );
}
