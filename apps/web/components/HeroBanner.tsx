"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useAiConsult } from "./AiConsultContext";

interface Slide {
  id: number;
  tag: string;
  tagColor: string;
  tagTextColor: string;
  title: string;
  subtitle: string;
  description: string;
  cta?: string;
  ctaStyle: string;
  bgImage: string;
  overlayGradient: string;
  accentColor: string;
  rightVisual: "book" | "trophy" | "store" | "none";
}

const slides: Slide[] = [
  {
    id: 0,
    tag: "이벤트",
    tagColor: "bg-[#F97316]",
    tagTextColor: "text-white",
    title: "독서의 달 기념\n전 도서 10% 적립",
    subtitle: "7월 한 달간",
    description:
      "가을의 시작을 책과 함께하세요.\n모든 도서 구매 시 포인트 혜택을 드립니다.",
    cta: "이벤트 보기",
    ctaStyle:
      "bg-[#F97316] text-white hover:bg-[#ea6a08] shadow-[0_0_24px_rgba(249,115,22,0.5)]",
    bgImage: "/banner-slide1.png",
    overlayGradient:
      "linear-gradient(105deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.1) 100%)",
    accentColor: "#F97316",
    rightVisual: "none",
  },
  {
    id: 1,
    tag: "신작 출시",
    tagColor: "bg-[#0EA5E9]",
    tagTextColor: "text-white",
    title: "올해의 화제작\n내 몸 건강 진단서",
    subtitle: "2025 베스트셀러",
    description:
      "몸이 보내는 신호, 부위별로 점검하기.\n당신의 건강을 위한 필독서가 출시되었습니다.",
    cta: "자세히 보기",
    ctaStyle:
      "bg-[#0EA5E9] text-white hover:bg-[#0284c7] shadow-[0_0_24px_rgba(14,165,233,0.5)]",
    bgImage: "/banner-slide2.png",
    overlayGradient:
      "linear-gradient(105deg, rgba(2,12,30,0.88) 0%, rgba(2,12,30,0.65) 50%, rgba(2,12,30,0.15) 100%)",
    accentColor: "#0EA5E9",
    rightVisual: "book",
  },
  {
    id: 2,
    tag: "공모전",
    tagColor: "bg-[#EAB308]",
    tagTextColor: "text-black",
    title: "제1회 BookFit AI\n독후감 공모전",
    subtitle: "총 상금 500만원",
    description:
      "AI와 함께하는 새로운 독서 경험.\n당신만의 이야기를 들려주세요.",
    cta: "지금 참여하기",
    ctaStyle:
      "bg-[#EAB308] text-black hover:bg-[#ca9a07] shadow-[0_0_24px_rgba(234,179,8,0.5)]",
    bgImage: "/banner-slide3.png",
    overlayGradient:
      "linear-gradient(105deg, rgba(20,10,40,0.85) 0%, rgba(20,10,40,0.60) 50%, rgba(20,10,40,0.1) 100%)",
    accentColor: "#EAB308",
    rightVisual: "trophy",
  },
  {
    id: 3,
    tag: "서비스 안내",
    tagColor: "bg-[#22C55E]",
    tagTextColor: "text-white",
    title: "바로드림 서비스\n이용 안내",
    subtitle: "30분 내 픽업 보장",
    description:
      "온라인으로 주문하고 매장에서 바로 픽업!\n더 빠르고 편리한 독서 생활을 경험하세요.",
    cta: "이용방법 확인",
    ctaStyle:
      "bg-[#22C55E] text-white hover:bg-[#16a34a] shadow-[0_0_24px_rgba(34,197,94,0.5)]",
    bgImage: "/banner-slide4.png",
    overlayGradient:
      "linear-gradient(105deg, rgba(0,20,10,0.82) 0%, rgba(0,20,10,0.55) 50%, rgba(0,20,10,0.1) 100%)",
    accentColor: "#22C55E",
    rightVisual: "store",
  },
];

const SLIDE_DURATION = 3333; // 1.5x faster (5000ms / 1.5)

export default function HeroBanner() {
  const { openModal } = useAiConsult();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback(
    (index: number, dir: "next" | "prev" = "next") => {
      if (isAnimating || index === currentSlide) return;
      setIsAnimating(true);
      setDirection(dir);
      setPrevSlide(currentSlide);
      setCurrentSlide(index);
      setProgress(0);
      setTimeout(() => {
        setPrevSlide(null);
        setIsAnimating(false);
      }, 700);
    },
    [isAnimating, currentSlide]
  );

  const goNext = useCallback(() => {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next, "next");
  }, [currentSlide, goToSlide]);

  const goPrev = useCallback(() => {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prev, "prev");
  }, [currentSlide, goToSlide]);

  // Single timer for both progress and slide advance
  useEffect(() => {
    if (isPaused || isAnimating) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    const intervalTime = 30; // ~33fps
    const totalSteps = SLIDE_DURATION / intervalTime;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 100 / totalSteps);
      });
    }, intervalTime);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPaused, isAnimating, currentSlide]);

  // Effect to watch progress and trigger slide change
  useEffect(() => {
    if (progress >= 100) {
      goNext();
    }
  }, [progress, goNext]);

  const handleCta = (slideId: number) => {
    if (slideId === 2) openModal();
  };

  return (
    <section
      className="mt-xl relative w-full rounded-2xl overflow-hidden group"
      style={{ height: "440px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === currentSlide;
        const isPrev = idx === prevSlide;

        let translateClass = "translate-x-full";
        if (isCurrent) translateClass = "translate-x-0";
        else if (isPrev) {
          translateClass = direction === "next" ? "-translate-x-full" : "translate-x-full";
        }

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${translateClass} ${
              !isCurrent && !isPrev ? "hidden" : ""
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={slide.bgImage}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              {/* Gradient Overlay */}
              <div
                className="absolute inset-0"
                style={{ background: slide.overlayGradient }}
              />
            </div>

            {/* Slide Content */}
            <div className="relative z-10 h-full flex items-center px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center gap-8">
                {/* Left: Text */}
                <div className="text-white">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase ${slide.tagColor} ${slide.tagTextColor}`}
                    >
                      {slide.tag}
                    </span>
                    {slide.subtitle && (
                      <span className="text-white/60 text-[13px] font-medium">
                        {slide.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2
                    className="font-extrabold leading-[1.15] mb-4"
                    style={{
                      fontSize: "clamp(26px, 3vw, 38px)",
                      textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {slide.title}
                  </h2>

                  {/* Description */}
                  <p
                    className="text-white/80 mb-6 leading-relaxed"
                    style={{
                      fontSize: "clamp(13px, 1.5vw, 15px)",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {slide.description}
                  </p>

                  {/* CTA Button */}
                  {slide.cta && (
                    <button
                      onClick={() => handleCta(slide.id)}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] cursor-pointer ${slide.ctaStyle}`}
                    >
                      {slide.cta}
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </button>
                  )}
                </div>

                {/* Right: Visual */}
                <div className="hidden md:flex justify-end items-center pr-4">
                  {slide.rightVisual === "book" && (
                    <div
                      className="relative w-[200px] h-[300px]"
                      style={{
                        filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.6))",
                        transform: "perspective(800px) rotateY(-8deg) rotateX(2deg)",
                      }}
                    >
                      <Image
                        src={slide.bgImage}
                        alt="신작 도서"
                        fill
                        className="object-cover rounded-lg"
                        sizes="200px"
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent" />
                    </div>
                  )}
                  {slide.rightVisual === "trophy" && (
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-[180px] h-[220px] rounded-2xl flex flex-col items-center justify-center gap-2"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))",
                          border: "1px solid rgba(234,179,8,0.3)",
                          backdropFilter: "blur(12px)",
                          boxShadow:
                            "0 0 60px rgba(234,179,8,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="material-symbols-outlined text-[72px] text-[#EAB308]">
                          emoji_events
                        </span>
                        <div className="text-center">
                          <div className="text-[#EAB308] font-bold text-[13px]">
                            총 상금
                          </div>
                          <div className="text-white font-extrabold text-[20px]">
                            500만원
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {["🥇 1등", "🥈 2등", "🥉 3등"].map((award) => (
                          <span
                            key={award}
                            className="px-2 py-1 rounded-full text-[11px] font-medium text-white/80"
                            style={{
                              background: "rgba(255,255,255,0.1)",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            {award}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {slide.rightVisual === "store" && (
                    <div
                      className="w-[200px] h-[240px] rounded-2xl flex flex-col items-center justify-center gap-4"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
                        border: "1px solid rgba(34,197,94,0.25)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 0 60px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
                      }}
                    >
                      <span className="material-symbols-outlined text-[64px] text-[#22C55E]">
                        storefront
                      </span>
                      <div className="text-center px-4">
                        <div className="text-white font-bold text-[14px] mb-1">
                          매장 즉시 픽업
                        </div>
                        <div className="text-white/60 text-[12px] leading-relaxed">
                          온라인 결제 후<br />30분 내 수령 가능
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#22C55E]"
                        style={{ background: "rgba(34,197,94,0.15)" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                        전국 120개 매장 운영중
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Progress Bar */}
        <div className="h-[3px] bg-white/20">
          <div
            className="h-full bg-white transition-none"
            style={{ width: `${progress}%`, opacity: isPaused ? 0.4 : 1 }}
          />
        </div>

        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
        >
          {/* Slide Indicators */}
          <div className="flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={i}
                onClick={() =>
                  goToSlide(i, i > currentSlide ? "next" : "prev")
                }
                className="group/dot flex items-center gap-1.5 cursor-pointer"
                aria-label={`슬라이드 ${i + 1} 보기`}
              >
                <div
                  className={`h-[3px] rounded-full transition-all duration-500 ${
                    currentSlide === i ? "w-6" : "w-2 opacity-50"
                  }`}
                  style={{
                    background:
                      currentSlide === i ? slide.accentColor : "white",
                  }}
                />
              </button>
            ))}
            <span className="text-white/50 text-[12px] ml-1 font-mono">
              {String(currentSlide + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              id="hero-prev"
              aria-label="이전 슬라이드"
              className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 rounded-full transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>
            <button
              onClick={() => setIsPaused((p) => !p)}
              id="hero-play-pause"
              aria-label={isPaused ? "재생" : "일시정지"}
              className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 rounded-full transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isPaused ? "play_arrow" : "pause"}
              </span>
            </button>
            <button
              onClick={goNext}
              id="hero-next"
              aria-label="다음 슬라이드"
              className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 rounded-full transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
