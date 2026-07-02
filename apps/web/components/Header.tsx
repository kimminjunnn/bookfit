"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();

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
            <div className="flex items-center gap-xs">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg
                  className="w-full h-full"
                  fill="none"
                  viewBox="0 0 40 40"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 5C15 5 10 8 10 13C10 15 11 17 13 18.5C12 20 10 21 8 21C11 21 14 20 16 18.5C17.3 18.8 18.6 19 20 19C27 19 32 15 32 10C32 7.2 30 5 27 5H20Z"
                    fill="#006B32"
                  ></path>
                </svg>
              </div>
              <span>교보문고</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-lg">
            <Link href="/" className={getLinkClass("/")}>
              홈
            </Link>
            <Link href="/#category-section" className="text-on-surface-variant text-[15px] font-semibold tracking-[0.02em] hover:text-primary transition-colors pb-1">
              카테고리
            </Link>
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
            <input
              type="text"
              placeholder="제목, 저자, 출판사 검색"
              className="w-[320px] h-12 px-md pl-10 rounded-lg border border-outline-variant bg-[#F5F5F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[15px]"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
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
            <input
              type="text"
              placeholder="제목, 저자, 출판사 검색"
              className="w-full h-12 px-md pl-10 rounded-lg border border-outline-variant bg-[#F5F5F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[15px]"
              autoFocus
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}
