"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import SearchAutocomplete from "./SearchAutocomplete";

export default function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [mobileSearchVal, setMobileSearchVal] = useState("");
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [mobileAutocompleteOpen, setMobileAutocompleteOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent, val: string) => {
    e.preventDefault();
    if (val.trim()) {
      setAutocompleteOpen(false);
      setMobileAutocompleteOpen(false);
      router.push(`/search?q=${encodeURIComponent(val.trim())}`);
    }
  };

  const closeAutocomplete = useCallback(() => setAutocompleteOpen(false), []);
  const closeMobileAutocomplete = useCallback(() => setMobileAutocompleteOpen(false), []);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return isActive
      ? "text-primary font-bold border-b-2 border-primary pb-1 text-[15px] tracking-[0.02em]"
      : "text-on-surface-variant text-[15px] font-semibold tracking-[0.02em] hover:text-primary transition-colors pb-1";
  };

  return (
    <nav className="sticky top-0 h-[72px] w-full bg-white border-b border-outline-variant z-50">
      <div className="flex justify-between items-center max-w-[1200px] mx-auto px-gutter w-full h-full">
        {/* 로고 + 네비게이션 */}
        <div className="flex items-center gap-[48px]">
          <Link
            href="/"
            className="text-[24px] font-bold text-primary flex items-center gap-xs"
          >
            <img
              src="/kyobo-logo.png"
              alt="교보문고"
              className="h-[28px] w-auto object-contain"
            />
          </Link>
          <div className="hidden md:flex items-center gap-lg">
            <Link href="/bestsellers" className={getLinkClass("/bestsellers")}>
              베스트셀러
            </Link>
            <Link href="/new-releases" className={getLinkClass("/new-releases")}>
              신간
            </Link>
          </div>
        </div>

        {/* 검색바 + 아이콘 */}
        <div className="flex items-center gap-md">
          <div className="relative hidden sm:block">
            <form onSubmit={(e) => handleSearchSubmit(e, searchVal)}>
              <input
                type="text"
                placeholder="제목, 저자, 출판사 검색"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setAutocompleteOpen(e.target.value.trim().length >= 1);
                }}
                onFocus={() => {
                  if (searchVal.trim().length >= 1) setAutocompleteOpen(true);
                }}
                className="w-[320px] h-12 px-md pl-10 rounded-lg border border-outline-variant bg-[#F5F5F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[15px]"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                aria-label="검색"
              >
                <span className="material-symbols-outlined">
                  search
                </span>
              </button>
            </form>
            {autocompleteOpen && (
              <SearchAutocomplete
                query={searchVal}
                onClose={closeAutocomplete}
              />
            )}
          </div>

          {/* 모바일 검색 토글 */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              search
            </span>
          </button>

          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">
              person
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 검색바 */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-gutter pb-sm bg-white border-b border-outline-variant">
          <div className="relative">
            <form onSubmit={(e) => {
              handleSearchSubmit(e, mobileSearchVal);
              setMobileSearchOpen(false);
            }}>
              <input
                type="text"
                placeholder="제목, 저자, 출판사 검색"
                value={mobileSearchVal}
                onChange={(e) => {
                  setMobileSearchVal(e.target.value);
                  setMobileAutocompleteOpen(e.target.value.trim().length >= 1);
                }}
                className="w-full h-12 px-md pl-10 rounded-lg border border-outline-variant bg-[#F5F5F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[15px]"
                autoFocus
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                aria-label="검색"
              >
                <span className="material-symbols-outlined">
                  search
                </span>
              </button>
            </form>
            {mobileAutocompleteOpen && (
              <SearchAutocomplete
                query={mobileSearchVal}
                onClose={closeMobileAutocomplete}
              />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
