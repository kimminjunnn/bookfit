"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BookCard from "@/components/BookCard";
import LoadingState from "@/components/LoadingState";
import AiCuratorNudge from "@/components/AiCuratorNudge";
import { Book } from "@/types/book";
import { looksLikeConsultQuery, SearchResponse } from "@/src/features/search/searchBooks";

function SearchBar({
  defaultValue,
  onSearch,
}: {
  defaultValue: string;
  onSearch: (q: string) => void;
}) {
  const [localQ, setLocalQ] = useState(defaultValue);

  useEffect(() => {
    setLocalQ(defaultValue);
  }, [defaultValue]);

  return (
    <div className="flex flex-col gap-xs">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (localQ.trim()) onSearch(localQ.trim());
        }}
        className="relative"
      >
        <input
          id="search-input"
          type="text"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="제목, 저자, 출판사 검색"
          className="w-full h-14 px-md pl-12 pr-[120px] rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-[16px] shadow-sm"
          autoComplete="off"
        />
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">
          search
        </span>
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-md h-10 bg-primary text-white rounded-lg font-semibold text-[14px] hover:opacity-90 transition-all cursor-pointer"
        >
          검색
        </button>
      </form>

      {/* 보조 링크 형태의 AI 큐레이터 유도 (link) */}
      <AiCuratorNudge variant="link" query={localQ} />
    </div>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") ?? "";

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBooks([]);
      setTotal(0);
      return;
    }
    setLoading(true);
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
    }
  }, []);

  useEffect(() => {
    fetchResults(q);
  }, [q, fetchResults]);

  const handleSearch = (newQ: string) => {
    const params = new URLSearchParams({ q: newQ });
    router.push(`/search?${params.toString()}`);
  };

  const isConsultQuery = looksLikeConsultQuery(q);
  const noResult = !loading && !error && books.length === 0 && q.trim() !== "";

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
              &ldquo;<span className="text-primary">{q}</span>&rdquo; 검색 결과
            </>
          ) : (
            "도서 검색"
          )}
        </h1>
        {!loading && q && (
          <p className="text-[14px] text-on-surface-variant mt-xs">
            총 <strong>{total}</strong>권의 도서를 찾았습니다.
          </p>
        )}
      </div>

      {/* 검색바 */}
      <div className="mb-lg">
        <SearchBar defaultValue={q} onSearch={handleSearch} />
      </div>

      {/* 상황형 쿼리 감지 배너 (banner) */}
      {isConsultQuery && q && !loading && (
        <div className="mb-lg animate-fade-in">
          <AiCuratorNudge variant="banner" query={q} />
        </div>
      )}

      {/* 로딩 표시 */}
      {loading && (
        <div className="py-2xl">
          <LoadingState />
        </div>
      )}

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
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-lg">
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
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1200px] mx-auto px-gutter py-xl">
          <LoadingState />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
