"use client";

import React, { useEffect, useState } from "react";
import { Book } from "@/types/book";
import booksData from "@/data/books.json";
import { COVER_GRADIENTS } from "@/dummy_data/dummy-books";
import Link from "next/link";
import Image from "next/image";

interface BookDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 바로드림 수령 가능 매장 목록
const STORES = [
  { id: "gwanghwamun", name: "광화문점", desc: "도서 코너 (C구역) 옆 바로드림 존" },
  { id: "gangnam", name: "강남점", desc: "지하 1층 바로드림 데스크" },
  { id: "jamsil", name: "잠실점", desc: "회전문 진입 후 우측 바로드림 존" },
  { id: "yeongdeungpo", name: "영등포점", desc: "타임스퀘어 2층 바로드림 코너" },
  { id: "mokdong", name: "목동점", desc: "현대백화점 지하 2층 바로드림 데스크" },
];

export default function BookDetailPage({ params }: BookDetailPageProps) {
  const resolvedParams = React.use(params);
  const [book, setBook] = useState<Book | null>(null);
  const [imgError, setImgError] = useState(false);
  const [selectedStore, setSelectedStore] = useState(STORES[0].id);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const found = (booksData as Book[]).find((b) => b.id === resolvedParams.id);
    if (found) {
      setBook(found);
    }
  }, [resolvedParams.id]);

  if (!book) {
    return (
      <div className="max-w-[1200px] mx-auto px-gutter py-20 text-center">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40 mb-4">
          error_outline
        </span>
        <h2 className="text-[24px] font-bold text-on-surface mb-2">도서를 찾을 수 없습니다</h2>
        <p className="text-[14px] text-on-surface-variant mb-6">존재하지 않거나 삭제된 도서 정보입니다.</p>
        <Link
          href="/"
          className="px-lg py-sm bg-primary text-on-primary rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          메인 홈으로 이동
        </Link>
      </div>
    );
  }

  // 커버 이미지 백업 그라디언트
  const coverIndex = book.id ? parseInt(book.id.replace(/[^0-9]/g, "")) || 0 : 0;
  const gradientClass = COVER_GRADIENTS[coverIndex % COVER_GRADIENTS.length];
  const activeStore = STORES.find(s => s.id === selectedStore) || STORES[0];

  const handlePickupSubmit = () => {
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-gutter py-lg">
      {/* 뒤로가기 링크 */}
      <div className="mb-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          뒤로 가기
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* 왼쪽: 커버 이미지 및 주요 상태 */}
        <div className="lg:col-span-1">
          <div className="sticky top-lg">
            <div className="relative aspect-[3/4] w-full rounded-2xl border border-outline-variant overflow-hidden shadow-md bg-surface">
              {book.coverImage && !imgError ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center p-8`}>
                  <span className="material-symbols-outlined text-white/30 text-[96px] mb-4">
                    menu_book
                  </span>
                  <p className="text-white text-center text-[20px] font-bold leading-tight px-4 font-sans">
                    {book.title}
                  </p>
                  <p className="text-white/70 text-[14px] mt-2 font-medium font-sans">{book.author} 저</p>
                </div>
              )}
            </div>

            {/* 바로드림 빠른 배지 */}
            <div className="mt-md p-md bg-surface border border-outline-variant rounded-xl flex items-center justify-between">
              <span className="text-[14px] font-medium text-on-surface-variant">바로드림 가능 여부</span>
              {book.pickupAvailable ? (
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-[13px] font-bold rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">store</span>
                  매장 바로드림 가능
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-on-surface-variant/10 text-on-surface-variant text-[13px] font-bold rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  택배 배송 전용
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 상세 정보 및 구매 패널 */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          {/* 타이틀 영역 */}
          <div className="border-b border-outline-variant pb-md">
            <div className="flex items-center gap-sm mb-sm flex-wrap">
              <span className="px-2.5 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[13px] font-bold rounded-md">
                {book.category}
              </span>
              {book.studyBookType && (
                <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[13px] font-bold rounded-md">
                  {book.studyBookType}
                </span>
              )}
              {book.subject && (
                <span className="px-2.5 py-1 bg-on-surface-variant/5 text-on-surface-variant text-[13px] font-semibold rounded-md">
                  {book.subject}
                </span>
              )}
              <span className="px-2 py-0.5 border border-outline-variant text-[12px] text-on-surface-variant rounded font-sans">
                난이도: {book.level}
              </span>
            </div>
            <h1 className="text-[28px] font-bold text-on-surface mb-xs leading-tight font-sans">
              {book.title}
            </h1>
            <p className="text-[16px] text-on-surface-variant mb-md font-sans">
              {book.author} 저 · 교보출판
            </p>
            <div className="flex items-baseline gap-xs">
              <span className="text-[24px] font-bold text-on-surface font-sans">
                {book.price.toLocaleString("ko-KR")}
              </span>
              <span className="text-[14px] text-on-surface-variant font-sans">원</span>
            </div>
          </div>

          {/* 바로드림 구매 신청 구역 */}
          <div className="bg-white p-lg border border-outline-variant rounded-2xl shadow-sm">
            <div className="flex items-center gap-xs mb-md">
              <span className="material-symbols-outlined text-primary text-[24px]">storefront</span>
              <h3 className="text-[18px] font-bold text-on-surface font-sans">바로드림 서비스 신청</h3>
            </div>

            {book.pickupAvailable ? (
              <div className="flex flex-col gap-md">
                <p className="text-[14px] text-on-surface-variant leading-relaxed font-sans">
                  인터넷으로 주문하고 가까운 매장에서 직접 빠르게 찾아가는 서비스입니다.
                  배송료 부담 없이, 결제 후 <strong className="text-primary font-bold">1시간 이내</strong>에 바로 수령하실 수 있습니다.
                </p>

                <div className="flex flex-col gap-xs mt-base">
                  <label htmlFor="store-select" className="text-[13px] font-bold text-on-surface-variant font-sans">
                    수령 희망 매장 선택
                  </label>
                  <select
                    id="store-select"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full p-sm border border-outline-variant rounded-lg bg-surface text-on-surface focus:outline-none focus:border-primary text-[14px] font-sans"
                  >
                    {STORES.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-surface p-sm rounded-lg border border-outline-variant/50 text-[13px] text-on-surface-variant flex items-start gap-1 font-sans">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
                    info
                  </span>
                  <p>
                    선택한 <strong className="font-bold">{activeStore.name}</strong>의 수령처: <span className="font-medium text-on-surface">{activeStore.desc}</span>
                  </p>
                </div>

                <button
                  onClick={handlePickupSubmit}
                  className="w-full py-md bg-primary text-on-primary hover:bg-opacity-95 rounded-xl font-bold text-[16px] transition-all flex items-center justify-center gap-xs shadow-sm mt-xs cursor-pointer font-sans"
                >
                  <span className="material-symbols-outlined">bolt</span>
                  바로드림으로 도서 신청하기
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-md">
                <div className="p-md bg-error/5 border border-error/20 rounded-xl text-center font-sans">
                  <span className="material-symbols-outlined text-error text-[36px] mb-xs">
                    local_shipping
                  </span>
                  <p className="text-[14px] font-semibold text-error">이 책은 바로드림이 불가능한 도서입니다</p>
                  <p className="text-[13px] text-on-surface-variant mt-xs">
                    출판사 직배송 또는 품절 대기 상품으로, 매장 직접 수령 서비스가 제한됩니다.
                  </p>
                </div>
                <button
                  disabled
                  className="w-full py-md bg-on-surface-variant/10 text-on-surface-variant rounded-xl font-bold text-[16px] flex items-center justify-center gap-xs cursor-not-allowed font-sans"
                >
                  바로드림 불가 도서
                </button>
                <div className="text-[12px] text-on-surface-variant text-center font-sans">
                  일반 배송 주문(익일 배송)을 이용하시면 주문일로부터 1~2일 내에 수령 가능합니다.
                </div>
              </div>
            )}
          </div>

          {/* 도서 정보 탭 상세 */}
          <div className="flex flex-col gap-lg font-sans">
            {/* 1. 도서 소개 */}
            <div>
              <h3 className="text-[18px] font-bold text-on-surface mb-sm border-l-4 border-primary pl-xs flex items-center gap-1 font-sans">
                도서 소개
              </h3>
              <p className="text-[15px] leading-relaxed text-on-surface-variant whitespace-pre-line font-sans">
                {book.description}
              </p>
            </div>

            {/* 2. 추천 대상 */}
            {book.targetReader && (
              <div>
                <h3 className="text-[18px] font-bold text-on-surface mb-sm border-l-4 border-primary pl-xs font-sans">
                  추천 대상
                </h3>
                <div className="p-sm bg-surface rounded-xl border border-outline-variant/60 font-sans">
                  <p className="text-[14px] leading-relaxed text-on-surface font-medium flex items-center gap-xs font-sans">
                    <span className="material-symbols-outlined text-primary text-[18px]">workspace_premium</span>
                    {book.targetReader}
                  </p>
                </div>
              </div>
            )}

            {/* 3. 독자 리뷰 요약 */}
            {book.reviewSummary && (
              <div>
                <h3 className="text-[18px] font-bold text-on-surface mb-sm border-l-4 border-primary pl-xs font-sans">
                  독자 평평 및 리뷰 요약
                </h3>
                <div className="p-md bg-ai-promo-bg/30 border border-secondary/10 rounded-xl font-sans">
                  <div className="flex items-center gap-xs mb-xs text-secondary font-sans">
                    <span className="material-symbols-outlined text-[18px]">reviews</span>
                    <span className="text-[13px] font-bold">주요 평평 핵심 요약</span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-on-surface-variant italic font-sans">
                    &quot;{book.reviewSummary}&quot;
                  </p>
                </div>
              </div>
            )}

            {/* 4. 목차 */}
            {book.toc && book.toc.length > 0 && (
              <div>
                <h3 className="text-[18px] font-bold text-on-surface mb-sm border-l-4 border-primary pl-xs font-sans">
                  목차
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-sm bg-surface p-md rounded-xl border border-outline-variant/50 font-sans">
                  {book.toc.map((chapter, idx) => (
                    <li key={idx} className="flex gap-2 text-[14px] text-on-surface-variant font-sans">
                      <span className="font-bold text-primary shrink-0 font-sans">{(idx + 1).toString().padStart(2, "0")}</span>
                      <span className="line-clamp-1 font-sans">{chapter}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 바로드림 성공 안내 모달 */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 modal-overlay-enter">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden modal-panel-enter">
            {/* 헤더 */}
            <div className="bg-primary text-on-primary p-lg text-center relative">
              <span className="material-symbols-outlined text-[48px] mb-xs animate-bounce">
                check_circle
              </span>
              <h3 className="text-[20px] font-bold font-sans">바로드림 신청이 완료되었습니다!</h3>
              <p className="text-[13px] text-white/80 mt-1 font-sans">도서 준비 즉시 문자로 알림을 드립니다.</p>
            </div>

            {/* 본문 정보 */}
            <div className="p-lg flex flex-col gap-md">
              <div className="flex flex-col gap-base pb-sm border-b border-outline-variant font-sans">
                <span className="text-[12px] text-on-surface-variant font-bold">신청 도서</span>
                <span className="text-[16px] font-bold text-on-surface">{book.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-md pb-sm border-b border-outline-variant font-sans">
                <div className="flex flex-col gap-base">
                  <span className="text-[12px] text-on-surface-variant font-bold">수령 매장</span>
                  <span className="text-[15px] font-bold text-primary">{activeStore.name}</span>
                </div>
                <div className="flex flex-col gap-base">
                  <span className="text-[12px] text-on-surface-variant font-bold">결제 금액</span>
                  <span className="text-[15px] font-bold text-on-surface">{book.price.toLocaleString("ko-KR")}원</span>
                </div>
              </div>

              <div className="flex flex-col gap-base font-sans">
                <span className="text-[12px] text-on-surface-variant font-bold">도서 수령 위치</span>
                <span className="text-[13px] text-on-surface font-medium bg-surface p-sm rounded-lg border border-outline-variant/60">
                  {activeStore.desc}
                </span>
              </div>

              {/* 시연용 바코드 영역 */}
              <div className="bg-surface p-md rounded-xl border border-dashed border-outline-variant flex flex-col items-center justify-center my-base font-sans">
                <div className="w-[200px] h-[50px] relative bg-white border border-outline-variant/40 flex items-center justify-center text-on-surface font-mono tracking-[6px] font-semibold text-[13px]">
                  ||||| | |||| || ||| || ||
                </div>
                <p className="text-[11px] text-on-surface-variant/80 mt-sm">수령 번호: KF-{(Date.now() % 100000000).toString().padStart(8, "0")}</p>
              </div>

              <div className="bg-primary/5 p-sm rounded-lg border border-primary/20 text-[12px] text-primary flex items-start gap-1 font-sans">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5 font-sans">info</span>
                <p className="leading-normal font-sans">
                  주문 접수 후 <strong className="font-bold">1시간 이내</strong>에 도서 준비 문자가 발송됩니다. 문자를 수령하신 후 바코드를 제시하여 수령하여 주세요.
                </p>
              </div>
            </div>

            {/* 푸터 */}
            <div className="p-lg bg-surface flex gap-sm border-t border-outline-variant font-sans">
              <Link
                href="/"
                className="flex-1 py-sm bg-outline-variant text-on-surface-variant font-bold text-center rounded-lg text-[14px] hover:bg-opacity-80 transition-colors font-sans"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                메인 홈으로 가기
              </Link>
              <button
                className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg text-[14px] hover:bg-opacity-90 transition-opacity cursor-pointer font-sans"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
