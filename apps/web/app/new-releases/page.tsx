"use client";

import { useState, useEffect } from "react";
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
  
  // 페이지네이션을 위한 상태 (책 5개 x 5행 = 페이지당 25권)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

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

  // 카테고리 변경 시 페이지 리셋 및 필터링 적용
  const handleCategoryChange = (category: BookCategory | "전체") => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category === "전체") {
      setFilteredBooks(allBooks);
    } else {
      setFilteredBooks(allBooks.filter((book) => book.category === category));
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const indexOfLastBook = currentPage * pageSize;
  const indexOfFirstBook = indexOfLastBook - pageSize;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // 페이지 변경 시 부드럽게 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        /* 도서 리스트 그리드 및 페이지 네비게이션 */
        <div>
          <div className="flex justify-between items-center mb-md">
            <span className="text-[14px] text-on-surface-variant">
              총 <strong>{filteredBooks.length}</strong>권 중 {indexOfFirstBook + 1}-{Math.min(indexOfLastBook, filteredBooks.length)}권 표시됨
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-lg">
            {currentBooks.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                variant="new-release"
                index={indexOfFirstBook + i}
              />
            ))}
          </div>

          {/* 페이지 네비게이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-xs mt-xl pt-lg border-t border-outline-variant">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center bg-white text-on-surface hover:bg-surface transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg border font-semibold text-[14px] transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-on-surface border-outline-variant hover:bg-surface"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center bg-white text-on-surface hover:bg-surface transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
