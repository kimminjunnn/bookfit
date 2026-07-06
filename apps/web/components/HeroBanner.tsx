"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAiConsult } from "./AiConsultContext";
import { slides } from "@/lib/slidesData";

const SLIDE_DURATION = 3333; // 1.5x faster (5000ms / 1.5)

export default function HeroBanner() {
  const router = useRouter();
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

  const handleCta = (slideId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/events/${slideId}`);
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
            onClick={() => router.push(`/events/${slide.id}`)}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out cursor-pointer ${translateClass} ${
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
                      onClick={(e) => handleCta(slide.id, e)}
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
