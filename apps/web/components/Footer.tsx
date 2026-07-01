import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-xl bg-footer-bg border-t border-outline-variant">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-[1200px] mx-auto px-gutter w-full gap-xl">
        {/* 로고 + 태그라인 */}
        <div className="flex flex-col items-center md:items-start gap-xs">
          <div className="text-[20px] font-bold text-primary mb-xs">
            교보문고
          </div>
          <p className="text-[14px] text-on-surface-variant">
            당신에게 꼭 맞는 책을 찾아주는 AI 파트너
          </p>
          <span className="text-[14px] text-on-surface-variant opacity-60">
            BookFit © 2026
          </span>
        </div>

        {/* 링크 */}
        <div className="flex flex-wrap justify-center gap-lg">
          <Link
            href="#"
            className="text-on-surface-variant text-[14px] hover:underline"
          >
            회사소개
          </Link>
          <Link
            href="#"
            className="text-on-surface-variant text-[14px] hover:underline"
          >
            이용약관
          </Link>
          <Link
            href="#"
            className="text-on-surface-variant text-[14px] hover:underline"
          >
            개인정보처리방침
          </Link>
        </div>

        {/* 소셜 아이콘 */}
        <div className="flex gap-md">
          <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              share
            </span>
          </button>
          <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              help_outline
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
