"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Book } from "@/types/book";
import booksData from "@/data/books.json";
import {
  COVER_GRADIENTS,
  newReleases,
  bestsellers as dummyBestsellers,
  recommendations as dummyRecommendations,
} from "@/dummy_data/dummy-books";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

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

// 개별 관련 도서 카드 컴포넌트 (이미지 에러 발생 시 그라디언트 플레이스홀더로 독립 대체)
function RelatedBookCard({ relBook, index }: { relBook: Book; index: number }) {
  const [imgError, setImgError] = useState(false);
  const relGradient = COVER_GRADIENTS[parseInt(relBook.id.replace(/[^0-9]/g, "")) % COVER_GRADIENTS.length] || COVER_GRADIENTS[0];

  const isExternalUrl = relBook.coverImage?.startsWith("http");
  const hasValidImage = relBook.coverImage && (isExternalUrl || !imgError);

  return (
    <Link
      href={`/books/${relBook.id}`}
      className="min-w-[180px] max-w-[180px] flex-shrink-0 group cursor-pointer block"
    >
      <div className="aspect-[3/4] rounded-xl overflow-hidden border border-outline-variant bg-white shadow-soft mb-3 relative">
        {hasValidImage && !imgError ? (
          <Image
            src={relBook.coverImage}
            alt={relBook.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="180px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${relGradient} flex flex-col items-center justify-center p-4 transition-transform duration-300 group-hover:scale-105`}>
            <span className="material-symbols-outlined text-white/30 text-[36px] mb-2">
              menu_book
            </span>
            <p className="text-white text-center text-[12px] font-semibold leading-tight line-clamp-2">
              {relBook.title}
            </p>
          </div>
        )}
      </div>
      <h3 className="text-[15px] text-on-surface font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
        {relBook.title}
      </h3>
      <p className="text-[14px] text-on-surface-variant mt-1">{relBook.author}</p>
    </Link>
  );
}

function BookDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [book, setBook] = useState<Book | null>(null);
  const [imgError, setImgError] = useState(false);
  const [selectedStore, setSelectedStore] = useState(STORES[0].id);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"intro" | "toc" | "review" | "pickup">("intro");
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [livePool, setLivePool] = useState<Book[]>([]);

  useEffect(() => {
    async function loadBookData() {
      setIsLoading(true);
      setImgError(false); // 네비게이션 시 이미지 에러 상태 초기화

      let fetchedLive: Book[] = [];
      try {
        const [bestRes, newRes] = await Promise.all([
          fetch("/api/bestsellers").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/new-releases").then((r) => (r.ok ? r.json() : [])),
        ]);
        fetchedLive = [...bestRes, ...newRes];
        setLivePool(fetchedLive);
      } catch (err) {
        console.error("Failed to load live books pool:", err);
      }

      // 1. 로컬 books.json에서 검색
      let found = (booksData as Book[]).find((b) => b.id === id);

      // 2. 더미 도서 목록에서 검색
      if (!found) {
        const allDummies = [...newReleases, ...dummyBestsellers, ...dummyRecommendations];
        found = allDummies.find((b) => b.id === id);
      }

      // 3. 실시간 API 결과에서 검색
      if (!found) {
        found = fetchedLive.find((b) => b.id === id);
      }

      if (found) {
        setBook(found);
      }
      setIsLoading(false);
    }

    loadBookData();
  }, [id]);

  // 관련 도서 로드 (같은 카테고리 도서 필터링, 자기 자신 제외)
  useEffect(() => {
    if (book) {
      const allBooksData = [
        ...(booksData as Book[]),
        ...newReleases,
        ...dummyBestsellers,
        ...dummyRecommendations,
        ...livePool,
      ];
      const filtered = allBooksData.filter((b) => b.category === book.category && b.id !== book.id);
      // 중복 제거
      const unique = filtered.filter(
        (value, index, self) => self.findIndex((t) => t.id === value.id) === index
      );
      setRelatedBooks(unique.slice(0, 6));
    }
  }, [book, livePool]);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-gutter py-section text-center flex flex-col items-center justify-center">
        <div className="flex space-x-2 mb-4 justify-center">
          <div className="w-3 h-3 bg-primary rounded-full pulse-dot"></div>
          <div className="w-3 h-3 bg-primary rounded-full pulse-dot"></div>
          <div className="w-3 h-3 bg-primary rounded-full pulse-dot"></div>
        </div>
        <p className="text-[15px] text-on-surface-variant font-medium">도서 정보를 불러오고 있습니다...</p>
      </div>
    );
  }

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
  const activeStore = STORES.find((s) => s.id === selectedStore) || STORES[0];

  const handlePickupSubmit = () => {
    setIsSuccessModalOpen(true);
  };

  const handleAddToCartClick = () => {
    if (book.pickupAvailable) {
      setActiveTab("pickup");
      const element = document.getElementById("detail-tabs-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      alert("이 도서는 바로드림 신청이 불가능한 도서입니다.");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-gutter py-lg flex flex-col gap-lg md:gap-xl">
      {/* 뒤로가기 링크 */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          뒤로 가기
        </Link>
      </div>

      {/* Book Details Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 bg-white p-8 md:p-12 rounded-xl shadow-soft border border-outline-variant">
        {/* Left: Cover */}
        <div className="lg:col-span-4 flex justify-center lg:justify-start">
          <div className="aspect-[3/4] w-full max-w-[320px] rounded-xl overflow-hidden border border-outline-variant shadow-soft relative group bg-white">
            {book.coverImage && !imgError ? (
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 320px"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center p-8 transition-transform duration-500 group-hover:scale-105`}
              >
                <span className="material-symbols-outlined text-white/30 text-[96px] mb-4">
                  menu_book
                </span>
                <p className="text-white text-center text-[20px] font-bold leading-tight px-4">
                  {book.title}
                </p>
                <p className="text-white/70 text-[14px] mt-2 font-medium">{book.author} 저</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-on-surface-variant text-white text-[14px] px-3.5 py-1 rounded-full font-medium">
              {book.category}
            </span>
            {book.pickupAvailable ? (
              <span className="bg-primary/10 text-primary text-[14px] px-3.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span> 바로드림 가능
              </span>
            ) : (
              <span className="bg-on-surface-variant/10 text-on-surface-variant text-[14px] px-3.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[15px]">local_shipping</span> 일반 배송 전용
              </span>
            )}
          </div>

          <h1 className="text-[28px] font-bold text-on-surface leading-tight mb-2 tracking-tight">
            {book.title}
          </h1>
          <p className="text-[14px] text-on-surface-variant mb-6">
            {book.author} 저 | 출판사 교보출판
          </p>

          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-on-surface">
              {book.price.toLocaleString("ko-KR")}원
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {book.pickupAvailable ? (
              <button
                onClick={handleAddToCartClick}
                className="bg-primary text-white font-semibold text-[15px] h-12 px-6 rounded-lg flex-1 sm:flex-none flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                바로드림 담기
              </button>
            ) : (
              <button
                disabled
                className="bg-on-surface-variant/10 text-on-surface-variant font-semibold text-[15px] h-12 px-6 rounded-lg flex-1 sm:flex-none flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                바로드림 불가 도서
              </button>
            )}
            <button className="bg-white text-primary border border-primary font-semibold text-[15px] h-12 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">favorite_border</span>
              위시리스트
            </button>
          </div>
        </div>
      </section>

      {/* AI Recommendation Box */}
      {reason && (
        <section className="bg-ai-promo-bg border border-secondary/20 rounded-xl p-8 flex flex-col md:flex-row gap-6 items-center shadow-soft">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-secondary text-white">
            <span className="material-symbols-outlined text-[24px]">psychology</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[16px] font-bold text-secondary">AI 독서 큐레이터 추천 사유</h3>
            </div>
            <p className="text-[15px] text-on-surface-variant leading-[1.6] font-normal">
              &quot;{decodeURIComponent(reason)}&quot;
            </p>
          </div>
        </section>
      )}

      {/* Tabs Content Area */}
      <section id="detail-tabs-section" className="bg-white rounded-xl shadow-soft border border-outline-variant overflow-hidden">
        <div className="flex border-b border-outline-variant overflow-x-auto no-scrollbar px-2">
          <button
            onClick={() => setActiveTab("intro")}
            className={`font-semibold text-[15px] px-6 py-4 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "intro"
                ? "text-primary border-b-2 border-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            책 소개
          </button>
          <button
            onClick={() => setActiveTab("toc")}
            className={`font-semibold text-[15px] px-6 py-4 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "toc"
                ? "text-primary border-b-2 border-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            목차
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`font-semibold text-[15px] px-6 py-4 whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === "review"
                ? "text-primary border-b-2 border-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">auto_awesome</span> 리뷰 요약
          </button>
          <button
            onClick={() => setActiveTab("pickup")}
            className={`font-semibold text-[15px] px-6 py-4 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "pickup"
                ? "text-primary border-b-2 border-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            바로드림 가능 매장
          </button>
        </div>

        <div className="p-8">
          {/* 1. 책 소개 */}
          {activeTab === "intro" && (
            <div className="prose max-w-none text-on-surface text-[15px] leading-[1.6] whitespace-pre-line font-sans">
              {book.description}
            </div>
          )}

          {/* 2. 목차 */}
          {activeTab === "toc" && (
            <div className="prose max-w-none">
              {book.toc && book.toc.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  {book.toc.map((chapter, idx) => (
                    <li key={idx} className="flex gap-2 text-[15px] text-on-surface-variant leading-relaxed">
                      <span className="font-bold text-primary shrink-0">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="line-clamp-1">{chapter}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-on-surface-variant text-[14px]">등록된 목차 정보가 없습니다.</p>
              )}
            </div>
          )}

          {/* 3. 리뷰 요약 */}
          {activeTab === "review" && (
            <div className="p-6 bg-ai-promo-bg/30 border border-secondary/10 rounded-xl">
              <div className="flex items-center gap-xs mb-xs text-secondary">
                <span className="material-symbols-outlined text-[18px]">reviews</span>
                <span className="text-[13px] font-bold">주요 평평 핵심 요약</span>
              </div>
              <p className="text-[15px] leading-[1.6] text-on-surface-variant italic">
                &quot;{book.reviewSummary}&quot;
              </p>
            </div>
          )}

          {/* 4. 바로드림 가능 매장 */}
          {activeTab === "pickup" && (
            <div className="max-w-xl">
              <div className="flex items-center gap-xs mb-md">
                <span className="material-symbols-outlined text-primary text-[24px]">storefront</span>
                <h3 className="text-[18px] font-bold text-on-surface">바로드림 서비스 신청</h3>
              </div>

              {book.pickupAvailable ? (
                <div className="flex flex-col gap-md">
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">
                    인터넷으로 주문하고 가까운 매장에서 직접 빠르게 찾아가는 서비스입니다.
                    배송료 부담 없이, 결제 후 <strong className="text-primary font-bold">1시간 이내</strong>에 바로 수령하실 수 있습니다.
                  </p>

                  <div className="flex flex-col gap-xs mt-base">
                    <label htmlFor="store-select" className="text-[13px] font-bold text-on-surface-variant">
                      수령 희망 매장 선택
                    </label>
                    <select
                      id="store-select"
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      className="w-full p-sm border border-outline-variant rounded-lg bg-white text-on-surface focus:outline-none focus:border-primary text-[14px] focus:ring-1 focus:ring-primary/20"
                    >
                      {STORES.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-background p-sm rounded-lg border border-outline-variant text-[13px] text-on-surface-variant flex items-start gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                      info
                    </span>
                    <p>
                      선택한 <strong className="font-bold">{activeStore.name}</strong>의 수령처: <span className="font-medium text-on-surface">{activeStore.desc}</span>
                    </p>
                  </div>

                  <button
                    onClick={handlePickupSubmit}
                    className="w-full py-md bg-primary text-on-primary hover:bg-opacity-95 rounded-lg font-bold text-[16px] transition-all flex items-center justify-center gap-xs shadow-sm mt-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined">bolt</span>
                    바로드림으로 도서 신청하기
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-md">
                  <div className="p-md bg-error/5 border border-error/20 rounded-xl text-center">
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
                    className="w-full py-md bg-on-surface-variant/10 text-on-surface-variant rounded-lg font-bold text-[16px] flex items-center justify-center gap-xs cursor-not-allowed"
                  >
                    바로드림 불가 도서
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related Books Carousel */}
      {relatedBooks.length > 0 && (
        <section className="flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span> 관련 추천 도서
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
            {relatedBooks.map((relBook, i) => (
              <RelatedBookCard key={relBook.id} relBook={relBook} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* 바로드림 성공 안내 모달 */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 modal-overlay-enter">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden modal-panel-enter">
            {/* 헤더 */}
            <div className="bg-primary text-on-primary p-lg text-center relative">
              <span className="material-symbols-outlined text-[48px] mb-xs animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <h3 className="text-[20px] font-bold">바로드림 신청이 완료되었습니다!</h3>
              <p className="text-[13px] text-white/80 mt-1">도서 준비 즉시 문자로 알림을 드립니다.</p>
            </div>

            {/* 본문 정보 */}
            <div className="p-lg flex flex-col gap-md">
              <div className="flex flex-col gap-base pb-sm border-b border-outline-variant">
                <span className="text-[12px] text-on-surface-variant font-bold">신청 도서</span>
                <span className="text-[16px] font-bold text-on-surface">{book.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-md pb-sm border-b border-outline-variant">
                <div className="flex flex-col gap-base">
                  <span className="text-[12px] text-on-surface-variant font-bold">수령 매장</span>
                  <span className="text-[15px] font-bold text-primary">{activeStore.name}</span>
                </div>
                <div className="flex flex-col gap-base">
                  <span className="text-[12px] text-on-surface-variant font-bold">결제 금액</span>
                  <span className="text-[15px] font-bold text-on-surface">{book.price.toLocaleString("ko-KR")}원</span>
                </div>
              </div>

              <div className="flex flex-col gap-base">
                <span className="text-[12px] text-on-surface-variant font-bold">도서 수령 위치</span>
                <span className="text-[13px] text-on-surface font-medium bg-background p-sm rounded-lg border border-outline-variant">
                  {activeStore.desc}
                </span>
              </div>

              {/* 시연용 바코드 영역 */}
              <div className="bg-background p-md rounded-lg border border-dashed border-outline-variant flex flex-col items-center justify-center my-base">
                <div className="w-[200px] h-[50px] relative bg-white border border-outline-variant flex items-center justify-center text-on-surface font-mono tracking-[6px] font-semibold text-[13px] select-none">
                  ||||| | |||| || ||| || ||
                </div>
                <p className="text-[11px] text-on-surface-variant/80 mt-sm">수령 번호: KF-{(Date.now() % 100000000).toString().padStart(8, "0")}</p>
              </div>

              <div className="bg-primary/5 p-sm rounded-lg border border-primary/20 text-[12px] text-primary flex items-start gap-1">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                <p className="leading-normal">
                  주문 접수 후 <strong className="font-bold">1시간 이내</strong>에 도서 준비 문자가 발송됩니다. 문자를 수령하신 후 바코드를 제시하여 수령하여 주세요.
                </p>
              </div>
            </div>

            {/* 푸터 */}
            <div className="p-lg bg-background flex gap-sm border-t border-outline-variant">
              <Link
                href="/"
                className="flex-1 py-sm bg-outline-variant text-on-surface-variant font-bold text-center rounded-lg text-[14px] hover:bg-opacity-80 transition-colors"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                메인 홈으로 가기
              </Link>
              <button
                className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg text-[14px] hover:bg-opacity-90 transition-opacity cursor-pointer"
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

export default function BookDetailPage({ params }: BookDetailPageProps) {
  const resolvedParams = React.use(params);

  return (
    <Suspense
      fallback={
        <div className="max-w-[1200px] mx-auto px-gutter py-section text-center">
          <p className="text-[15px] text-on-surface-variant font-medium">로딩 중...</p>
        </div>
      }
    >
      <BookDetailContent id={resolvedParams.id} />
    </Suspense>
  );
}
