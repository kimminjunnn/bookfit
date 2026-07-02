"use client";

import { useState, useEffect, useRef } from "react";
import { Book, BookCategory } from "@/types/book";
import BookCard from "@/components/BookCard";

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

export default function NewReleasesPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | "전체">("전체");
  const [loading, setLoading] = useState(true);
  
  // 무한 스크롤을 위한 현재 노출 개수 상태 (초기 10행 = 50권)
  const [visibleCount, setVisibleCount] = useState(50);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchNewReleases() {
      try {
        const res = await fetch("/api/new-releases");
        if (res.ok) {
          const data = await res.json();
          setAllBooks(data);
          setFilteredBooks(data);
        }
      } catch (err) {
        console.error("Failed to load new releases page data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNewReleases();
  }, []);

  // 카테고리 변경 시 페이지 리셋 및 초기 노출 개수 50개로 리셋
  const handleCategoryChange = (category: BookCategory | "전체") => {
    setSelectedCategory(category);
    setVisibleCount(50);
    if (category === "전체") {
      setFilteredBooks(allBooks);
    } else {
      setFilteredBooks(allBooks.filter((book) => book.category === category));
    }
  };

  // 무한 스크롤 감지 IntersectionObserver 설정
  useEffect(() => {
    if (loading || filteredBooks.length <= visibleCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // 스크롤이 하단에 다다르면 50개(10행) 추가 노출
          setVisibleCount((prev) => Math.min(prev + 50, filteredBooks.length));
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

  // 현재 화면에 표시할 도서 목록 슬라이싱
  const currentBooks = filteredBooks.slice(0, visibleCount);

  return (
    <div className="max-w-[1200px] w-full mx-auto px-gutter py-xl animate-fade-in">
      {/* 히어로 헤더 */}
      <div className="mb-xl text-center md:text-left py-lg border-b border-outline-variant">
        <span className="text-primary font-bold text-[14px] uppercase tracking-wider mb-xs block">
          New Releases
        </span>
        <h1 className="text-[36px] font-bold text-on-surface leading-tight tracking-[-0.03em] mb-sm">
          따끈따끈한 신간 도서
        </h1>
        <p className="text-on-surface-variant text-[16px] max-w-[600px] leading-relaxed">
          교보문고에 새롭게 입고된 각 분야별 주목할 만한 신간 도서 목록입니다.
          원하시는 도서의 상세 정보와 바로드림 가능 지점을 확인해보세요.
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
            선택하신 카테고리의 신간 도서가 없습니다.
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
                variant="new-release"
                index={i}
              />
            ))}
          </div>

          {/* 무한 스크롤 트리거 & 추가 로드 상태 바 */}
          {filteredBooks.length > visibleCount && (
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

          {filteredBooks.length <= visibleCount && filteredBooks.length > 0 && (
            <div className="text-center py-xl mt-lg border-t border-outline-variant/30 text-on-surface-variant/50 text-[14px]">
              모든 도서를 불러왔습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
