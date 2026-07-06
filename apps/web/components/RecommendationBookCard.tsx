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

  const bookTitle = fullBook?.title || recommendedBook.title;
  const author = fullBook?.author || recommendedBook.author || "";
  const price = fullBook?.price || recommendedBook.price;
  const category = fullBook?.category || recommendedBook.category;
  const coverImage = fullBook?.coverImage || recommendedBook.coverImage;
  const pickupAvailable = fullBook ? fullBook.pickupAvailable : recommendedBook.pickupAvailable;

  const gradientClass = COVER_GRADIENTS[index % COVER_GRADIENTS.length];

  return (
    <div className="flex flex-col p-sm bg-white border border-outline-variant rounded-xl transition-shadow relative overflow-hidden h-full justify-between">
      {/* Sequence badge */}
      <div className="absolute top-0 left-0 bg-primary text-on-primary text-[10.5px] font-bold px-2 py-0.5 rounded-br-lg z-10">
        {recommendedBook.order}
      </div>

      {/* Book Cover Container (Top) */}
      <div className="relative w-full h-[170px] bg-[#f8f9f6] border border-outline-variant/60 rounded overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
        {coverImage && !imgError ? (
          <Image
            src={coverImage}
            alt={bookTitle}
            fill
            className="object-contain"
            sizes="220px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center p-2`}>
            <span className="material-symbols-outlined text-white/40 text-[18px]">
              menu_book
            </span>
            <p className="text-white text-center text-[9px] font-semibold leading-tight line-clamp-2 mt-1">
              {bookTitle}
            </p>
          </div>
        )}
      </div>

      {/* Book Info & Reason (Bottom) */}
      <div className="flex-1 flex flex-col justify-between mt-2 min-w-0">
        <div className="space-y-1">
          {/* Title */}
          <h4 className="font-extrabold text-[13px] text-on-surface line-clamp-1" title={bookTitle}>
            {bookTitle}
          </h4>

          {/* Details & Status */}
          <div className="flex flex-wrap items-center justify-between text-[10.5px] font-bold text-on-surface-variant/70">
            {category ? (
              <span className="text-secondary truncate max-w-[70px]">
                {category}
              </span>
            ) : (
              <span />
            )}
            {pickupAvailable ? (
              <span className="text-primary flex items-center gap-0.5 shrink-0">
                <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>store</span>
                바로드림
              </span>
            ) : (
              <span className="text-on-surface-variant/50 shrink-0">
                배송전용
              </span>
            )}
          </div>

          {/* Recommendation Reason (line-clamp-3) */}
          <p className="text-[11px] leading-relaxed text-on-surface-variant/80 line-clamp-3 font-medium bg-[#fafbfa] p-1.5 rounded border border-outline-variant/30">
            {recommendedBook.reason}
          </p>
        </div>

        {/* View Details Button */}
        <div className="pt-2 border-t border-outline-variant/35 flex justify-end">
          <Link
            href={`/books/${recommendedBook.id}?reason=${encodeURIComponent(recommendedBook.reason)}`}
            onClick={handleDetailClick}
            className="text-[11px] font-bold text-secondary hover:text-secondary-container flex items-center gap-0.5 group"
          >
            상세 보기
            <span className="material-symbols-outlined text-[12px] transition-transform group-hover:translate-x-0.5">
              chevron_right
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
