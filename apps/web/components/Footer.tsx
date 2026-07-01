import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-xl bg-[#f8f8f8] border-t border-outline-variant">
      <div className="max-w-[1200px] mx-auto px-gutter w-full flex flex-col text-[#666] text-[15px] leading-[1.6] gap-md">
        {/* Brand Logo & Info */}
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs">
            <svg
              fill="none"
              height="32"
              viewBox="0 0 40 40"
              width="32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 5C15 5 10 8 10 13C10 15 11 17 13 18.5C12 20 10 21 8 21C11 21 14 20 16 18.5C17.3 18.8 18.6 19 20 19C27 19 32 15 32 10C32 7.2 30 5 27 5H20Z"
                fill="#006B32"
              ></path>
            </svg>
            <span className="text-[24px] font-bold text-on-surface tracking-tight">
              KYOBO <span className="font-normal text-on-surface/80">교보문고</span>
            </span>
          </div>
          <div className="flex items-center gap-sm ml-xl">
            <div className="bg-[#003366] text-white p-1 text-[10px] font-bold leading-none rounded-sm">
              KCSI
            </div>
            <div className="text-[11px] leading-tight">
              2026년 한국산업의 고객만족도
              <br />
              온라인서점 부문 1위
            </div>
          </div>
        </div>

        {/* Corporate Information */}
        <div className="flex flex-col gap-xs text-[13px] leading-[1.4] tracking-[0.01em]">
          <div className="flex flex-wrap items-center gap-x-xs">
            <span>(주)교보문고</span>
            <span className="opacity-30">|</span>
            <span>서울특별시 가상구 가상로 123</span>
            <span className="opacity-30">|</span>
            <span>대표이사 : 홍길동</span>
            <span className="opacity-30">|</span>
            <span>사업자등록번호 : 123-45-67890</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-xs">
            <span>
              대표전화(발신자부담) : 1544-0000(교보문고) · 1661-0000(핫트랙스)
            </span>
            <span className="opacity-30">|</span>
            <span>FAX : 02-1234-5678(지역번호 공통)</span>
          </div>
          <div>
            <span>서울특별시 통신판매업신고번호 : 제 2026-가상-0001호</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-sm text-[13px] leading-[1.4] tracking-[0.01em] opacity-80">
          © KYOBO BOOK CENTRE
        </div>
      </div>
    </footer>
  );
}
