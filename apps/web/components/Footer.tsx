import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-xl bg-[#f8f8f8] border-t border-outline-variant">
      <div className="max-w-[1200px] mx-auto px-gutter w-full flex flex-col text-[#666] text-[15px] leading-[1.6] gap-md">
        {/* Brand Logo & Info */}
        <div className="flex items-center gap-md">
          <img
            src="/kyobo-logo.png"
            alt="교보문고"
            className="h-[28px] w-auto object-contain opacity-80"
          />

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
