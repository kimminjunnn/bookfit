import { Book, BookCategory, BookLevel } from "@/types/book";

export interface SearchFilters {
  category?: BookCategory | "전체";
  level?: BookLevel | "전체";
}

export interface SearchRequest {
  q: string;
  category?: string;
  level?: string;
}

export interface SearchResponse {
  books: Book[];
  total: number;
  query: string;
}

// ─── 튜닝 가이드레일 (상수 정의) ──────────────────────────────────
export const WEIGHT_TITLE = 10;
export const WEIGHT_AUTHOR = 5;
export const WEIGHT_SUBJECT = 5;
export const WEIGHT_CATEGORY = 2;
export const WEIGHT_DESCRIPTION = 0.1;

const CORE_FIELDS = ["title", "author", "subject"] as const;
const VALID_NON_DESC_FIELDS = ["title", "author", "subject", "category"] as const;

/** 한글/영문 소문자화 + 공백 정규화 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * 단일 책에 대해 검색 토큰별 매칭 필드 파악 및 가중치 합계 계산
 */
function scoreAndAnalyzeBook(
  book: Book,
  queryWords: string[]
): {
  score: number;
  matchesAllTokens: boolean;
  hasCoreMatch: boolean;
  hasNonDescMatch: boolean;
} {
  const normTitle = normalize(book.title);
  const normAuthor = normalize(book.author);
  const normSubject = normalize(book.subject ?? "");
  const normCategory = normalize(book.category);
  const normDesc = normalize(book.description);

  let totalScore = 0;
  let matchesAllTokens = true;
  let hasCoreMatch = false;
  let hasNonDescMatch = false;

  for (const word of queryWords) {
    let wordMatched = false;
    let wordMatchedInCore = false;
    let wordMatchedInNonDesc = false;

    // 각 필드별 매칭 여부 및 점수 가중치 계산
    if (normTitle.includes(word)) {
      totalScore += WEIGHT_TITLE;
      wordMatched = true;
      wordMatchedInCore = true;
      wordMatchedInNonDesc = true;
    }
    if (normAuthor.includes(word)) {
      totalScore += WEIGHT_AUTHOR;
      wordMatched = true;
      wordMatchedInCore = true;
      wordMatchedInNonDesc = true;
    }
    if (normSubject.includes(word)) {
      totalScore += WEIGHT_SUBJECT;
      wordMatched = true;
      wordMatchedInCore = true;
      wordMatchedInNonDesc = true;
    }
    if (normCategory.includes(word)) {
      totalScore += WEIGHT_CATEGORY;
      wordMatched = true;
      wordMatchedInNonDesc = true;
    }
    if (normDesc.includes(word)) {
      totalScore += WEIGHT_DESCRIPTION;
      wordMatched = true;
    }

    // AND 조건: 질의어의 모든 토큰이 책 어딘가에는 매칭되어야 함
    if (!wordMatched) {
      matchesAllTokens = false;
    }
    if (wordMatchedInCore) {
      hasCoreMatch = true;
    }
    if (wordMatchedInNonDesc) {
      hasNonDescMatch = true;
    }
  }

  return {
    score: totalScore,
    matchesAllTokens,
    hasCoreMatch,
    hasNonDescMatch,
  };
}

/**
 * 도서 목록을 검색어 + 필터로 검색
 */
export function searchBooks(
  books: Book[],
  query: string,
  filters?: SearchFilters
): Book[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const queryWords = normalize(trimmed).split(" ").filter(Boolean);
  if (queryWords.length === 0) return [];

  const candidates: { book: Book; score: number }[] = [];

  for (const book of books) {
    const { score, matchesAllTokens, hasCoreMatch, hasNonDescMatch } =
      scoreAndAnalyzeBook(book, queryWords);

    // 1. 모든 검색 토큰이 매칭되어야 함 (AND 검색)
    if (!matchesAllTokens) continue;

    // 2. 다중 토큰 질의이든 단일 토큰 질의이든, 최소한 1개의 토큰이 핵심 필드(title, author, subject)에 매칭되어야 함
    // (만약 검색어가 카테고리 자체인 경우 예외적으로 카테고리 매칭 허용하기 위해 단일 토큰 검색어일 때는 non-desc 매칭만 있어도 통과시킴)
    const isMultiToken = queryWords.length > 1;
    if (isMultiToken && !hasCoreMatch) continue;

    // 3. 소개글(description)에서만 매칭된 도서는 제외 (Threshold 컷오프)
    // (즉 title, author, subject, category 중 하나라도 매칭되어야 함)
    if (!hasNonDescMatch) continue;

    // 필터 조건 매칭
    if (
      filters?.category &&
      filters.category !== "전체" &&
      book.category !== filters.category
    ) {
      continue;
    }
    if (
      filters?.level &&
      filters.level !== "전체" &&
      book.level !== filters.level
    ) {
      continue;
    }

    candidates.push({ book, score });
  }

  // 관련도 점수 내림차순 정렬, 동점인 경우 제목 오름차순 (안정 정렬)
  candidates.sort((a, b) => {
    if (Math.abs(a.score - b.score) > 0.001) {
      return b.score - a.score;
    }
    return a.book.title.localeCompare(b.book.title, "ko");
  });

  return candidates.map((c) => c.book);
}

/**
 * 자동완성용: title/author/subject에 쿼리가 포함되는 도서 상위 N개 반환
 */
export function autocompleteBooks(
  books: Book[],
  query: string,
  maxResults = 8
): Book[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const q = normalize(trimmed);

  return books
    .filter((book) => {
      return (
        normalize(book.title).includes(q) ||
        normalize(book.author).includes(q) ||
        normalize(book.subject ?? "").includes(q)
      );
    })
    .slice(0, maxResults);
}

/**
 * 문장형/상담형 질문 감지 헬퍼
 */
const CONSULT_HINT_KEYWORDS = [
  "추천",
  "모르겠",
  "준비 중",
  "입문",
  "기초",
  "무기력",
  "위로",
  "번아웃",
  "어떤 책",
  "고민",
  "어떻게",
  "시작",
  "처음",
  "뭘 읽",
  "읽을 책",
];

export function looksLikeConsultQuery(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;

  // 공백 포함 12자 이상이면 상담형으로 판단
  if (trimmed.length >= 12) return true;

  const normalized = normalize(trimmed);
  return CONSULT_HINT_KEYWORDS.some((kw) => normalized.includes(normalize(kw)));
}
