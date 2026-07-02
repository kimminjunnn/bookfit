"use client";

import { RecommendedBook, Book } from "@/types/book";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import booksData from "@/data/books.json";
import { COVER_GRADIENTS } from "@/dummy_data/dummy-books";
import { useAiConsult } from "./AiConsultContext";
import { useRouter } from "next/navigation";

interface RecommendationBookCardProps {
  recommendedBook: RecommendedBook;
  index: number;
}

export default function RecommendationBookCard({
  recommendedBook,
  index,
}: RecommendationBookCardProps) {
  const { closeModal } = useAiConsult();
  const router = useRouter();
  const [fullBook, setFullBook] = useState<Book | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleDetailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeModal();
    router.push(`/books/${recommendedBook.id}?reason=${encodeURIComponent(recommendedBook.reason)}`);
  };

  useEffect(() => {
    // Find the full book details from books.json using the recommended ID
    const found = (booksData as Book[]).find((b) => b.id === recommendedBook.id);
    if (found) {
      setFullBook(found);
    }
  }, [recommendedBook.id]);

  const bookTitle = recommendedBook.title || fullBook?.title;
  const author = recommendedBook.author || recommendedBook.author || fullBook?.author || "";
  const price = recommendedBook.price || fullBook?.price;
  const category = recommendedBook.category || fullBook?.category;
  const coverImage = recommendedBook.coverImage || fullBook?.coverImage;
  const pickupAvailable = recommendedBook.pickupAvailable !== undefined ? recommendedBook.pickupAvailable : (fullBook ? fullBook.pickupAvailable : false);

  const gradientClass = COVER_GRADIENTS[index % COVER_GRADIENTS.length];

  return (
    <div className="flex gap-md p-md bg-white border border-outline-variant rounded-xl hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Sequence badge */}
      <div className="absolute top-0 left-0 bg-primary text-on-primary text-[12px] font-bold px-2.5 py-1 rounded-br-xl z-10">
        {recommendedBook.order}
      </div>

      {/* Book Cover Container */}
      <div className="relative w-[75px] h-[100px] bg-surface border border-outline-variant rounded overflow-hidden shrink-0 shadow-sm mt-3 sm:mt-0">
        {coverImage && !imgError ? (
          <Image
            src={coverImage}
            alt={bookTitle}
            fill
            className="object-cover"
            sizes="75px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center p-2`}>
            <span className="material-symbols-outlined text-white/40 text-[20px]">
              menu_book
            </span>
            <p className="text-white text-center text-[9px] font-semibold leading-tight line-clamp-2 mt-1">
              {bookTitle}
            </p>
          </div>
        )}
      </div>

      {/* Book Info & Recommendation Reason */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center flex-wrap gap-xs mb-1">
            {category && (
              <span className="px-1.5 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold rounded">
                {category}
              </span>
            )}
            {pickupAvailable ? (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">store</span>
                바로드림 가능
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-on-surface-variant/10 text-on-surface-variant text-[11px] font-bold rounded">
                배송 주문 전용
              </span>
            )}
          </div>

          <h4 className="font-bold text-[16px] text-on-surface line-clamp-1">
            {bookTitle}
          </h4>

          {author && (
            <p className="text-[13px] text-on-surface-variant/80 mt-0.5">
              {author} 저자 {price && `· ${price.toLocaleString("ko-KR")}원`}
            </p>
          )}

          {/* AI Recommendation Reason */}
          <div className="mt-2 bg-background p-2 rounded-lg border border-outline-variant/50">
            <p className="text-[13px] leading-relaxed text-on-surface-variant">
              <span className="font-semibold text-primary text-[12px] block mb-0.5">추천 이유</span>
              {recommendedBook.reason}
            </p>
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-3 flex justify-end">
          <Link
            href={`/books/${recommendedBook.id}?reason=${encodeURIComponent(recommendedBook.reason)}`}
            onClick={handleDetailClick}
            className="text-[12px] font-semibold text-secondary hover:text-secondary-container flex items-center gap-0.5 group"
          >
            상세 보기
            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5">
              chevron_right
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
