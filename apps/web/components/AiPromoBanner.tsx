export default function AiPromoBanner() {
  return (
    <section className="mt-section">
      <div className="flex flex-col md:flex-row items-center justify-between p-xl rounded-xl bg-ai-promo-bg border border-outline-variant shadow-sm gap-xl">
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
              번아웃, 자격증, 취업... 내게 필요한 책은? 당신의 고민을
              들려주세요.
            </p>
          </div>
        </div>
        <button className="w-full md:w-auto h-12 px-xl bg-secondary-container text-on-secondary-container rounded-lg text-[15px] font-semibold tracking-[0.02em] hover:opacity-90 transition-opacity whitespace-nowrap">
          지금 상담 시작
        </button>
      </div>
    </section>
  );
}
