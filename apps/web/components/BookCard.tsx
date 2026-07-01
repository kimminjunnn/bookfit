"use client";

import { Book } from "@/types/book";
import { COVER_GRADIENTS } from "@/dummy_data/dummy-books";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type BookCardVariant = "new-release" | "bestseller" | "recommendation";

interface BookCardProps {
  book: Book;
  variant: BookCardVariant;
  rank?: number;
  index?: number;
  discount?: number;
}

/** 가격을 원화 형식으로 포맷 */
function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

/** 도서 인덱스로 그라디언트 색상 선택 */
function getGradient(index: number): string {
  return COVER_GRADIENTS[index % COVER_GRADIENTS.length];
}

/** 그라디언트 플레이스홀더 */
function CoverPlaceholder({
  book,
  index = 0,
}: {
  book: Book;
  index?: number;
}) {
  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${getGradient(index)} flex flex-col items-center justify-center p-4`}
    >
      <div className="text-white/30 text-[48px] mb-2">
        <span className="material-symbols-outlined text-[48px]">menu_book</span>
      </div>
      <p className="text-white text-center text-[13px] font-semibold leading-tight line-clamp-2">
        {book.title}
      </p>
      <p className="text-white/60 text-[11px] mt-1">{book.author}</p>
    </div>
  );
}

/** 커버 이미지 또는 플레이스홀더 렌더 — 이미지 로딩 실패 시 자동 fallback */
function BookCover({
  book,
  index = 0,
}: {
  book: Book;
  index?: number;
}) {
  const [imgError, setImgError] = useState(false);

  // coverImage가 없거나, 로딩 실패했거나, 아직 실제 파일이 없는 로컬 경로인 경우
  const isExternalUrl = book.coverImage?.startsWith("http");
  const hasValidImage = book.coverImage && (isExternalUrl || !imgError);

  if (hasValidImage && !imgError) {
    return (
      <>
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 180px, 220px"
          onError={() => setImgError(true)}
        />
      </>
    );
  }

  return <CoverPlaceholder book={book} index={index} />;
}

/** 신간 도서 카드 */
function NewReleaseCard({ book, index = 0 }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="min-w-[180px] md:min-w-[220px] group block">
      <div className="relative aspect-[3/4] w-full rounded-lg bg-surface border border-outline-variant shadow-sm overflow-hidden mb-sm transition-transform group-hover:-translate-y-1">
        <BookCover book={book} index={index} />
      </div>
      <h3 className="text-[15px] font-semibold text-on-surface line-clamp-1">
        {book.title}
      </h3>
      <p className="text-[14px] text-on-surface-variant mt-base">
        {book.author} 저자
      </p>
      <p className="text-[12px] text-on-surface-variant/75 mt-xs line-clamp-2 h-[34px] leading-snug">
        {book.description}
      </p>
      <p className="text-[15px] font-semibold text-primary mt-xs">
        {formatPrice(book.price)}
      </p>
    </Link>
  );
}

/** 베스트셀러 카드 */
function BestsellerCard({
  book,
  rank = 1,
  index = 0,
  discount = 10,
}: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="group block">
      <div className="relative aspect-[3/4] w-full rounded-lg border border-outline-variant overflow-hidden mb-sm transition-transform group-hover:-translate-y-1">
        {/* 순위 배지 */}
        <div className="absolute top-2 left-2 w-8 h-8 bg-primary text-on-primary flex items-center justify-center font-bold rounded-md z-10 text-[14px]">
          {rank}
        </div>
        <BookCover book={book} index={index} />
      </div>
      <h3 className="text-[15px] font-semibold text-on-surface line-clamp-1">
        {book.title}
      </h3>
      <p className="text-[14px] text-on-surface-variant mt-base">
        {book.author} 저자
      </p>
      <p className="text-[12px] text-on-surface-variant/75 mt-xs line-clamp-2 h-[34px] leading-snug">
        {book.description}
      </p>
      <div className="flex items-center gap-xs mt-xs">
        <span className="text-error font-bold text-[13px]">{discount}%</span>
        <span className="text-[15px] font-semibold text-on-surface">
          {formatPrice(book.price)}
        </span>
      </div>
    </Link>
  );
}

/** 추천 도서 카드 */
function RecommendationCard({ book, index = 0 }: BookCardProps) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="bg-surface p-sm rounded-xl border border-outline-variant hover:shadow-md transition-shadow cursor-pointer block"
    >
      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-sm">
        <BookCover book={book} index={index} />
      </div>
      <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold rounded mb-xs inline-block">
        {book.category}
      </span>
      <h3 className="text-[15px] font-semibold text-on-surface line-clamp-1">
        {book.title}
      </h3>
      <p className="text-[13px] text-on-surface-variant mt-xs line-clamp-2">
        {book.description}
      </p>
    </Link>
  );
}

/** 통합 BookCard 컴포넌트 */
export default function BookCard(props: BookCardProps) {
  switch (props.variant) {
    case "new-release":
      return <NewReleaseCard {...props} />;
    case "bestseller":
      return <BestsellerCard {...props} />;
    case "recommendation":
      return <RecommendationCard {...props} />;
    default:
      return <NewReleaseCard {...props} />;
  }
}
