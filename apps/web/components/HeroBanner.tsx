"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAiConsult } from "./AiConsultContext";

export default function HeroBanner() {
  const { openModal } = useAiConsult();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = 4;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, currentSlide]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePlayPause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="mt-xl relative w-full h-[400px] rounded-xl overflow-hidden group">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          alt="Banner Background"
          fill
          priority
          className="object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuALVxtc0-34KUwU55RNlS0sXGElOn0CTnvhnD1IAHa1nK5zGugY2_dS2DW6ThSa526qcr1Vp1uy_6pSceuID3WopkWl_S_-yJRNQFl5zN3nLSgI8momCk0ebgLSEZ5Tn0zY6LhGaaj4T1Un0qRhIZnDJQTOAKimWR5X4mOXCUMiq-sk2cNn88DnInIDFz43xTLwX6Jk6lu641P_E3i8gjHzHqWze1OdvVqDMMPRvHTu0lDYq4Cifb5ZZ8C7A9A4npjik_CENfqewuE"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Slides Container */}
      <div className="relative h-full z-10">
        {/* Slide 1: Event */}
        <div
          className={`hero-slide absolute inset-0 flex items-center px-xl transition-opacity duration-1000 ${
            currentSlide === 0 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-xl">
            <div className="text-white">
              <span className="inline-block px-2 py-1 bg-primary rounded text-[13px] font-medium tracking-[0.01em] mb-sm">
                이벤트
              </span>
              <h1 className="text-[32px] font-bold leading-tight mb-md">
                독서의 달 기념
                <br />
                전 도서 10% 적립
              </h1>
              <p className="text-[15px] leading-[1.6] opacity-90 mb-xl">
                가을의 시작을 책과 함께하세요. 모든 도서 구매 시 포인트 혜택을 드립니다.
              </p>
            </div>
          </div>
        </div>

        {/* Slide 2: New Release */}
        <div
          className={`hero-slide absolute inset-0 flex items-center px-xl transition-opacity duration-1000 ${
            currentSlide === 1 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-xl">
            <div className="text-white">
              <span className="inline-block px-2 py-1 bg-secondary rounded text-[13px] font-medium tracking-[0.01em] mb-sm">
                신작출시
              </span>
              <h1 className="text-[32px] font-bold leading-tight mb-md">
                올해의 화제작:
                <br />
                내 몸 건강 진단서
              </h1>
              <p className="text-[15px] leading-[1.6] opacity-90 mb-xl">
                몸이 보내는 신호, 부위별 점검하기. 당신의 건강을 위한 필독서.
              </p>
              <button className="bg-secondary text-white px-xl py-md rounded-lg text-[15px] font-semibold tracking-[0.02em] hover:scale-[1.02] transition-transform shadow-md cursor-pointer">
                자세히 보기
              </button>
            </div>
            <div className="hidden md:flex justify-center relative h-[340px] w-[280px]">
              <Image
                alt="Book Cover"
                fill
                className="object-contain rounded-lg shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSxmT3YmjjcU_3HcXA36bkkv64_GCSUKSV0mm08EFNxlMjE3B-_j_TKieltsjxaIvvKPPYQIzFAZl155bH3KkKMZCS3ZVhe3d7UrXuszS1qRZ0KfMr6MFAS6Kw60MsPsghshDv-YobW1ljHjFSnioknYQWetVPjtceREh2jh5vQurtiVi6XQEP0UnCKXpnXAafII7efaP44kDKdSBk6-J1YMNIXl9xwaGBK-S3maoEnrmbZA4e-0TXBW2BtaO1iUcd0kL73Du3hfo"
                sizes="(max-width: 768px) 100vw, 280px"
              />
            </div>
          </div>
        </div>

        {/* Slide 3: Contest */}
        <div
          className={`hero-slide absolute inset-0 flex items-center px-xl transition-opacity duration-1000 ${
            currentSlide === 2 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-xl">
            <div className="text-white">
              <span className="inline-block px-2 py-1 bg-[#FFD700] text-on-surface rounded text-[13px] font-medium tracking-[0.01em] mb-sm">
                공모전
              </span>
              <h1 className="text-[32px] font-bold leading-tight mb-md">
                제1회 BookFit AI
                <br />
                독후감 공모전
              </h1>
              <p className="text-[15px] leading-[1.6] opacity-90 mb-xl">
                AI와 함께하는 새로운 독서 경험. 당신의 이야기를 들려주세요.
              </p>
              <button
                onClick={openModal}
                className="bg-[#FFD700] text-on-surface px-xl py-md rounded-lg text-[15px] font-semibold tracking-[0.02em] hover:scale-[1.02] transition-transform shadow-md cursor-pointer"
              >
                참여하기
              </button>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-[280px] h-[360px] bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[120px] text-[#FFD700]">
                  trophy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 4: Notice */}
        <div
          className={`hero-slide absolute inset-0 flex items-center px-xl transition-opacity duration-1000 ${
            currentSlide === 3 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-xl">
            <div className="text-white">
              <span className="inline-block px-2 py-1 bg-white/20 rounded text-[13px] font-medium tracking-[0.01em] mb-sm">
                안내
              </span>
              <h1 className="text-[32px] font-bold leading-tight mb-md">
                바로드림 서비스
                <br />
                이용 안내
              </h1>
              <p className="text-[15px] leading-[1.6] opacity-90 mb-xl">
                온라인 주문 후 매장에서 바로 픽업! 더 빠르고 편리한 독서 생활.
              </p>
              <button className="bg-white text-primary px-xl py-md rounded-lg text-[15px] font-semibold tracking-[0.02em] hover:scale-[1.02] transition-transform shadow-md cursor-pointer">
                이용방법 확인
              </button>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-[280px] h-[360px] bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[120px] text-white">
                  local_shipping
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-xs z-20">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`w-2 h-2 rounded-full transition-colors duration-500 cursor-pointer ${
              currentSlide === i ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`슬라이드 ${i + 1} 보기`}
          />
        ))}
      </div>

      {/* Slide Controls */}
      <div className="absolute bottom-6 right-gutter flex items-center gap-xs z-20 bg-black/30 backdrop-blur-sm rounded-full px-sm py-1">
        <button
          onClick={handlePrev}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          id="hero-prev"
          aria-label="이전 슬라이드"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <button
          onClick={handlePlayPause}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          id="hero-play-pause"
          aria-label={isPaused ? "재생" : "일시정지"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isPaused ? "play_arrow" : "pause"}
          </span>
        </button>
        <button
          onClick={handleNext}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          id="hero-next"
          aria-label="다음 슬라이드"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
    </section>
  );
}
