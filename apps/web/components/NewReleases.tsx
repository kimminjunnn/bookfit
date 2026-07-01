import Link from "next/link";
import { newReleases } from "@/dummy_data/dummy-books";
import BookCard from "./BookCard";

export default function NewReleases() {
  return (
    <section className="mt-section">
      <div className="flex justify-between items-end mb-lg">
        <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em]">
          신간 도서
        </h2>
        <Link
          href="#"
          className="text-primary text-[15px] font-semibold tracking-[0.02em] flex items-center gap-xs"
        >
          더보기{" "}
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </Link>
      </div>
      <div className="flex gap-lg overflow-x-auto no-scrollbar pb-md">
        {newReleases.map((book, i) => (
          <BookCard key={book.id} book={book} variant="new-release" index={i} />
        ))}
      </div>
    </section>
  );
}
