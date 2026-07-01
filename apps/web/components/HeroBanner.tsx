export default function HeroBanner() {
  return (
    <section className="mt-xl">
      <div className="relative w-full h-[320px] rounded-xl overflow-hidden flex items-center px-xl bg-gradient-to-br from-primary-container to-[#004D24]">
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full" />
          <div className="absolute bottom-10 right-40 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute top-20 right-60 w-20 h-20 bg-white/10 rounded-full" />
        </div>

        <div className="z-10 text-on-primary max-w-[500px]">
          <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em] mb-md">
            상황을 말하면 딱 맞는 책을
            <br />
            추천받으세요
          </h1>
          <p className="text-[15px] leading-[1.6] opacity-90 mb-xl">
            독서의 시작부터 끝까지, 인공지능이 당신의 마음을 읽고 최고의 책을
            선별해 드립니다.
          </p>
          <button className="bg-secondary-container text-on-secondary-container px-xl py-md rounded-lg text-[15px] font-semibold tracking-[0.02em] hover:scale-[1.02] transition-transform shadow-md">
            AI 추천 시작하기
          </button>
        </div>
      </div>
    </section>
  );
}
