"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BookCard from "@/components/BookCard";
import LoadingState from "@/components/LoadingState";
import AiCuratorNudge from "@/components/AiCuratorNudge";
import { Book } from "@/types/book";
import { looksLikeConsultQuery, SearchResponse } from "@/src/features/search/searchBooks";


function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") ?? "";

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBooks([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(false);
    setError(null);
    try {
      const params = new URLSearchParams({ q: query });
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("검색 결과를 불러오지 못했습니다.");
      const data: SearchResponse = await res.json();
      setBooks(data.books);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    if (q.trim()) {
      setLoading(true);
      setHasSearched(false);
    }
    fetchResults(q);
  }, [q, fetchResults]);

  const handleSearch = (newQ: string) => {
    const params = new URLSearchParams({ q: newQ });
    router.push(`/search?${params.toString()}`);
  };

  const isConsultQuery = looksLikeConsultQuery(q);
  const noResult = !loading && !error && books.length === 0 && q.trim() !== "" && hasSearched;

  return (
    <div className="max-w-[1200px] w-full mx-auto px-gutter py-xl animate-fade-in">
      {/* 페이지 헤더 */}
      <div className="mb-lg">
        <span className="text-primary font-bold text-[13px] uppercase tracking-wider mb-xs block">
          Search
        </span>
        <h1 className="text-[28px] font-bold text-on-surface leading-tight tracking-[-0.02em]">
          {q ? (
            <>
              &ldquo;<span className="text-primary">{q}</span>&rdquo; 검색
            </>
          ) : (
            "도서 검색"
          )}
        </h1>
      </div>





      {/* 에러 표시 */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-error font-medium">{error}</p>
          <button
            onClick={() => fetchResults(q)}
            className="mt-md px-md py-sm bg-primary text-white rounded-lg text-[14px] font-semibold hover:opacity-90 cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 검색어 미입력 시 */}
      {!loading && !error && q.trim() === "" && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[56px] text-on-surface-variant/30">
            search
          </span>
          <p className="text-on-surface-variant text-[16px] mt-md">
            검색어를 입력해주세요.
          </p>
        </div>
      )}

      {/* 검색 결과 없음 메인 CTA (no-result) */}
      {noResult && (
        <div className="animate-fade-in">
          <AiCuratorNudge variant="no-result" query={q} />
        </div>
      )}

      {/* 검색 결과 리스트 */}
      {!loading && !error && books.length > 0 && (
        <section className="mt-section">
          <div className="flex justify-between items-end mb-lg">
            <h2 className="text-[20px] font-bold leading-[1.3] tracking-[-0.02em] text-on-surface">
              도서 검색 결과 <span className="text-primary font-extrabold text-[16px] ml-1">({total}권)</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-lg animate-fade-in">
            {books.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                variant="new-release"
                index={i}
              />
            ))}
          </div>

          {/* 하단 마무리 CTA 섹션 (footer) */}
          <div className="animate-fade-in">
            <AiCuratorNudge variant="footer" query={q} />
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1200px] mx-auto px-gutter py-xl">
          <LoadingState variant="search" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
