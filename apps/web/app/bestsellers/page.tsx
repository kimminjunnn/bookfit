"use client";

import { useState, useEffect, useRef } from "react";
import { Book, BookCategory } from "@/types/book";
import BookCard from "@/components/BookCard";
import { getCachedBestsellers, setCachedBestsellers } from "@/lib/bookCache";

const CATEGORIES: (BookCategory | "전체")[] = [
  "전체",
  "소설",
  "에세이",
  "인문학",
  "자기계발",
  "경제경영",
  "시/희곡",
  "역사",
  "과학",
  "예술",
  "자격증/수험서",
  "전공서",
  "기타",
];

export default function BestsellersPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | "전체">("전체");
  const [loading, setLoading] = useState(true);
  
  // 클라이언트 사이드 무한 스크롤을 위한 상태
  const [visibleCount, setVisibleCount] = useState(20);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  // 최초 1회 전체 데이터를 가져옴 (최대 200개)
  useEffect(() => {
    async function fetchBestsellers() {
      // 1. 캐시 확인
      const cached = getCachedBestsellers();
      if (cached && cached.length > 0) {
        setAllBooks(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 캐시가 없으면 기본 limit=100 정도로 긁어서 캐싱 & 노출
        const res = await fetch("/api/bestsellers?limit=100");
        if (res.ok) {
          const data = await res.json();
          setAllBooks(data);
          setCachedBestsellers(data);
        }
      } catch (err) {
        console.error("Failed to load bestsellers page data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBestsellers();
  }, []);

  // 카테고리 변경 시 화면 리셋 및 필터링 적용
  const handleCategoryChange = (category: BookCategory | "전체") => {
    setSelectedCategory(category);
    setVisibleCount(20); // 노출 개수도 20개로 초기화
  };

  // 선택한 카테고리에 맞는 도서 필터링
  useEffect(() => {
    if (selectedCategory === "전체") {
      setFilteredBooks(allBooks);
    } else {
      setFilteredBooks(allBooks.filter((book) => book.category === selectedCategory));
    }
  }, [allBooks, selectedCategory]);

  // 스크롤이 끝에 도달하면 20개씩 더 디스플레이
  useEffect(() => {
    if (loading || filteredBooks.length <= visibleCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 20, filteredBooks.length));
        }
      },
      { threshold: 0.1 }
    );

    const currentTrigger = triggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [loading, filteredBooks.length, visibleCount]);

  // 현재 화면에 디스플레이할 도서 슬라이싱
  const currentBooks = filteredBooks.slice(0, visibleCount);
  const hasMore = filteredBooks.length > visibleCount;

  return (
    <div className="max-w-[1200px] w-full mx-auto px-gutter py-xl animate-fade-in">
      {/* 히어로 헤더 */}
      <div className="mb-xl text-center md:text-left py-lg border-b border-outline-variant">
        <span className="text-primary font-bold text-[14px] uppercase tracking-wider mb-xs block">
          Best Seller
        </span>
        <h1 className="text-[36px] font-bold text-on-surface leading-tight tracking-[-0.03em] mb-sm">
          종합 베스트셀러
        </h1>
        <p className="text-on-surface-variant text-[16px] max-w-[600px] leading-relaxed">
          교보문고에서 가장 사랑받고 있는 분야별 인기 도서 순위입니다. 
          AI 상담사를 통해서도 언제든지 맞춤 큐레이션을 받으실 수 있습니다.
        </p>
      </div>

      {/* 카테고리 필터 칩 리스트 */}
      <div className="mb-xl">
        <div className="flex gap-sm overflow-x-auto no-scrollbar pb-xs">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-md py-sm rounded-full text-[14px] font-semibold transition-all border shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-surface text-on-surface-variant border-outline-variant hover:border-on-surface-variant/40"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* 로딩 스켈레톤 상태 */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-lg">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col">
              <div className="aspect-[3/4] w-full bg-surface border border-outline-variant rounded-lg mb-sm" />
              <div className="h-4 bg-surface rounded w-3/4 mb-xs" />
              <div className="h-3 bg-surface rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        /* 매칭되는 도서가 없을 경우 */
        <div className="text-center py-20 border border-dashed border-outline-variant rounded-2xl bg-surface/50">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-sm">
            info
          </span>
          <p className="text-on-surface-variant text-[16px] font-medium">
            선택하신 카테고리의 베스트셀러 도서가 없습니다.
          </p>
          <button
            onClick={() => handleCategoryChange("전체")}
            className="mt-md px-md py-sm bg-primary text-white font-semibold rounded-lg text-[14px] hover:bg-primary/90 transition-all cursor-pointer"
          >
            전체 보기
          </button>
        </div>
      ) : (
        /* 도서 리스트 그리드 */
        <div>
          <div className="flex justify-between items-center mb-md">
            <span className="text-[14px] text-on-surface-variant">
              총 <strong>{filteredBooks.length}</strong>권 중 {currentBooks.length}권 표시됨
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-lg">
            {currentBooks.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                variant="bestseller"
                rank={i + 1}
                index={i}
                discount={10}
              />
            ))}
          </div>

          {/* 무한 스크롤 트리거 & 추가 로드 상태 바 */}
          {hasMore && (
            <div
              ref={triggerRef}
              className="flex justify-center items-center py-xl mt-lg border-t border-outline-variant/30"
            >
              <div className="flex items-center gap-sm text-primary text-[14px] font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                <span>도서 더 가져오는 중...</span>
              </div>
            </div>
          )}

          {!hasMore && filteredBooks.length > 0 && (
            <div className="text-center py-xl mt-lg border-t border-outline-variant/30 text-on-surface-variant/50 text-[14px]">
              모든 도서를 불러왔습니다. (최대 {filteredBooks.length}권)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
