import { Book } from "@/types/book";

interface BookCache {
  bestsellers: Book[] | null;
  newReleases: Book[] | null;
}

// Client-side in-memory singleton cache
const cache: BookCache = {
  bestsellers: null,
  newReleases: null,
};

export const getCachedBestsellers = (): Book[] | null => {
  return cache.bestsellers;
};

export const setCachedBestsellers = (books: Book[]) => {
  cache.bestsellers = books;
};

export const getCachedNewReleases = (): Book[] | null => {
  return cache.newReleases;
};

export const setCachedNewReleases = (books: Book[]) => {
  cache.newReleases = books;
};
