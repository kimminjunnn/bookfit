"use client";

import { useAiConsult } from "./AiConsultContext";

export default function AiPromoBanner() {
  const { openModal } = useAiConsult();

  return (
    <section className="mt-section">
      <div className="flex flex-col md:flex-row items-center justify-between py-md px-xl rounded-xl bg-ai-promo-bg border border-outline-variant shadow-sm gap-lg">
        <div className="flex items-center gap-md shrink-0">
          <div className="relative w-12 h-12 shrink-0">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-primary">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
            {/* AI 말풍선 뱃지 */}
            <span className="absolute -top-1 -right-1 bg-secondary text-white text-[9px] font-bold leading-none px-[5px] py-[3px] rounded-full shadow-sm tracking-wide">
              AI
            </span>
          </div>
          <h2 className="text-[32px] font-bold text-secondary tracking-[-0.01em] leading-none">
            BookFit
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-lg md:ml-auto mt-4 md:mt-0 text-center md:text-right">
          <p className="text-[15px] text-on-surface-variant leading-relaxed">
            <span className="font-semibold text-secondary">당신의 AI 독서 큐레이터</span><br />
            번아웃, 자격증, 취업... 내게 필요한 책은? 당신의 고민을 들려주세요.
          </p>
          <button
            onClick={openModal}
            className="w-full md:w-auto h-12 px-xl bg-secondary-container text-on-secondary-container rounded-lg text-[15px] font-semibold tracking-[0.02em] hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer shrink-0"
          >
            대화하기
          </button>
        </div>
      </div>
    </section>
  );
}
