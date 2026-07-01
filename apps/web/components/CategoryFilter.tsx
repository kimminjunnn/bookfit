"use client";

import { useState } from "react";
import { BookCategory } from "@/types/book";

const CATEGORIES: (BookCategory | "전체")[] = [
  "전체",
  "소설",
  "에세이",
  "자기계발",
  "경제경영",
  "자격증/수험서",
  "인문학",
];

interface CategoryFilterProps {
  onCategoryChange?: (category: BookCategory | "전체") => void;
}

export default function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [selected, setSelected] = useState<BookCategory | "전체">("전체");

  const handleClick = (category: BookCategory | "전체") => {
    setSelected(category);
    onCategoryChange?.(category);
  };

  return (
    <section className="mt-section">
      <div className="flex items-center gap-sm overflow-x-auto no-scrollbar py-base">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className={`px-xl py-xs rounded-full border text-[15px] font-semibold tracking-[0.02em] whitespace-nowrap transition-colors ${
              selected === cat
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant bg-white text-on-surface-variant hover:border-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
}
