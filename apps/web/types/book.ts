// BookFit 도서 타입 정의
// AGENTS.md 스키마를 그대로 따릅니다.

export type BookCategory =
  | "소설"
  | "에세이"
  | "인문학"
  | "자기계발"
  | "경제경영"
  | "시/희곡"
  | "역사"
  | "과학"
  | "예술"
  | "자격증/수험서"
  | "전공서"
  | "기타";

export type StudyBookType = "개념서" | "문제집" | "기출문제집" | "요약집";
export type BookLevel = "입문" | "초급" | "중급" | "고급";

export type Book = {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  studyBookType?: StudyBookType;
  subject?: string;
  level: BookLevel;
  price: number;
  description: string;
  toc: string[];
  reviewSummary: string;
  targetReader: string;
  pickupAvailable: boolean;
  coverImage: string;
};

export type UserBookConsultInput = {
  situation: string;
  goal?: string;
  preferredCategory?: string;
  level?: string;
  studyPeriod?: string;
  pickupStore?: string;
  freeText?: string;
};

export type RecommendedBook = {
  id: string;
  title: string;
  reason: string;
  order: number;
  pickupAvailable: boolean;
  coverImage?: string;
  author?: string;
  price?: number;
  category?: BookCategory;
};

export type AiRecommendationResult = {
  summary: string;
  neededCategory: string;
  recommendedBooks: RecommendedBook[];
  readingFlow: string;
};
