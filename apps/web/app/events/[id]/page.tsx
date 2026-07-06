"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { eventDetails, slides } from "@/lib/slidesData";
import { useAiConsult } from "@/components/AiConsultContext";
import AiPromoBanner from "@/components/AiPromoBanner";
import booksData from "@/data/books.json";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { openModal } = useAiConsult();
  
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const eventId = idStr ? parseInt(idStr, 10) : -1;
  const detail = eventDetails[eventId];
  const slide = slides.find((s) => s.id === eventId);
  const tagText = slide?.tag || "이벤트";

  if (!detail) {
    return (
      <div className="max-w-[1200px] mx-auto px-gutter py-2xl text-center">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-md">
          warning
        </span>
        <h1 className="text-[24px] font-bold text-on-surface mb-sm">
          존재하지 않거나 종료된 이벤트입니다.
        </h1>
        <p className="text-on-surface-variant text-[15px] mb-lg">
          이벤트 번호를 다시 확인해 주세요.
        </p>
        <Link
          href="/"
          className="inline-flex h-12 px-xl bg-primary text-white rounded-lg text-[14px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all items-center justify-center cursor-pointer"
        >
          홈으로 이동
        </Link>
      </div>
    );
  }

  const handleCta = () => {
    if (detail.ctaAction === "modal") {
      openModal();
    } else if (detail.ctaAction === "link" && detail.ctaLink) {
      router.push(detail.ctaLink);
    }
  };

  // 슬라이드별 어울리는 아이콘 선정
  const getHeaderIcon = (id: number) => {
    switch (id) {
      case 0:
        return "database";
      case 1:
        return "health_and_safety";
      case 2:
        return "emoji_events";
      case 3:
        return "storefront";
      default:
        return "event";
    }
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto px-gutter py-xl animate-fade-in">
      {/* 이벤트 메인 히어로 배너 */}
      <div className="w-full rounded-2xl p-xl md:p-2xl text-white mb-xl relative overflow-hidden shadow-lg min-h-[320px] flex items-center">
        {/* Background Image */}
        {slide && (
          <div className="absolute inset-0 z-0">
            <Image
              src={slide.bgImage}
              alt={detail.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            {/* Gradient Overlay */}
            <div
              className="absolute inset-0"
              style={{ background: slide.overlayGradient }}
            />
          </div>
        )}

        {/* 장식용 큰 배경 아이콘 */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 hidden md:block z-0">
          <span className="material-symbols-outlined text-[240px]">
            {getHeaderIcon(detail.id)}
          </span>
        </div>

        <div className="relative z-10 max-w-2xl">
          {slide && (
            <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-extrabold tracking-wider mb-sm uppercase ${slide.tagColor} ${slide.tagTextColor}`}>
              {tagText}
            </span>
          )}
          <h1 className="text-[28px] md:text-[36px] font-extrabold leading-[1.2] tracking-[-0.02em] mb-md">
            {detail.title}
          </h1>
          <p className="text-white/80 text-[15px] md:text-[17px] leading-relaxed mb-lg font-medium">
            {detail.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-sm text-[13px] text-white/90 bg-black/15 py-xs px-md rounded-full w-fit backdrop-blur-sm">
            <span className="material-symbols-outlined text-[16px]">
              calendar_today
            </span>
            <span className="font-bold">진행 기간:</span>
            <span>{detail.period}</span>
          </div>
        </div>
      </div>

      {/* 신작 도서 소개 이벤트일 경우 (eventId === 1), 도서 정보 카드 노출 */}
      {eventId === 1 && (
        <div className="w-full bg-white border border-outline-variant rounded-2xl p-lg md:p-xl shadow-sm mb-lg animate-fade-in">
          <h2 className="text-[20px] font-bold text-on-surface mb-md flex items-center gap-xs">
            <span className="w-1.5 h-6 rounded-full bg-primary" />
            소개 도서 정보
          </h2>
          {(() => {
            const healthBook = booksData.find(b => b.id === "health_diagnosis");
            if (!healthBook) return null;
            return (
              <div className="flex flex-col md:flex-row gap-lg items-center md:items-start">
                {/* 도서 표지 */}
                <div className="relative w-[180px] h-[260px] shrink-0 rounded-lg overflow-hidden shadow-md border border-outline-variant bg-surface">
                  <Image
                    src={healthBook.coverImage}
                    alt={healthBook.title}
                    fill
                    className="object-cover animate-fade-in"
                  />
                </div>
                {/* 도서 정보 */}
                <div className="flex-1 space-y-sm">
                  <div>
                    <span className="text-[12px] font-bold text-primary tracking-wider block uppercase mb-1">
                      {healthBook.category}
                    </span>
                    <h3 className="text-[22px] font-extrabold text-on-surface leading-tight">
                      {healthBook.title}
                    </h3>
                    <p className="text-[14px] text-on-surface-variant/80 mt-1">
                      {healthBook.author} 저자
                    </p>
                  </div>
                  <p className="text-[14.5px] text-on-surface-variant leading-relaxed">
                    {healthBook.description}
                  </p>
                  <div className="pt-2 flex items-center gap-md">
                    <span className="font-bold text-[18px] text-on-surface">
                      {healthBook.price.toLocaleString("ko-KR")}원
                    </span>
                    {healthBook.pickupAvailable && (
                      <span className="text-[12px] font-semibold text-secondary bg-secondary/10 px-2 py-1 rounded-full before:content-['✓_']">
                        바로드림 가능
                      </span>
                    )}
                  </div>
                  {/* 도서 목차 (TOC) */}
                  {healthBook.toc && healthBook.toc.length > 0 && (
                    <div className="pt-3 border-t border-outline-variant/60">
                      <span className="text-[13px] font-bold text-on-surface block mb-1">목차 정보</span>
                      <ul className="text-[13px] text-on-surface-variant space-y-1 grid grid-cols-1 sm:grid-cols-2 gap-x-sm">
                        {healthBook.toc.map((t, idx) => (
                          <li key={idx} className="truncate">• {t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* 도서 상세 버튼 */}
                  <div className="pt-4">
                    <Link
                      href={`/books/${healthBook.id}`}
                      className="inline-flex items-center gap-xs px-md py-sm bg-primary text-white text-[13px] font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                    >
                      <span>도서 상세 정보 보기</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 이벤트 상세 본문 콘텐츠 */}
      <div className="w-full space-y-xl bg-white border border-outline-variant rounded-2xl p-lg md:p-xl shadow-sm mb-lg">
        {detail.sections.map((section, index) => (
          <div
            key={index}
            className={`pb-lg ${
              index !== detail.sections.length - 1
                ? "border-b border-outline-variant"
                : ""
            }`}
          >
            <h2 className="text-[20px] font-bold text-on-surface mb-md flex items-center gap-xs">
              <span
                className="w-1.5 h-6 rounded-full"
                style={{ backgroundColor: detail.accentColor }}
              />
              {section.title}
            </h2>
            
            {section.content.map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className="text-on-surface-variant text-[15px] leading-relaxed mb-sm last:mb-0"
              >
                {paragraph}
              </p>
            ))}

            {section.list && section.list.length > 0 && (
              <ul className="mt-md space-y-sm">
                {section.list.map((item, lIdx) => (
                  <li
                    key={lIdx}
                    className="flex items-start gap-xs text-[14.5px] text-on-surface-variant"
                  >
                    <span
                      className="material-symbols-outlined text-[16px] mt-1 shrink-0"
                      style={{ color: detail.accentColor }}
                    >
                      check_circle
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* 하단 AI 배너 */}
      <AiPromoBanner />
    </div>
  );
}
