import { Book, BookCategory, StudyBookType } from "@/types/book";

// Normalized category mapping to match BookCategory union type
const mapCategory = (kyoboCategory: string): BookCategory => {
  const cat = kyoboCategory.trim();
  if (cat.includes("소설")) return "소설";
  if (cat.includes("에세이")) return "에세이";
  if (cat.includes("인문")) return "인문학";
  if (cat.includes("자기계발")) return "자기계발";
  if (cat.includes("경제") || cat.includes("경영")) return "경제경영";
  if (cat.includes("시") || cat.includes("희곡")) return "시/희곡";
  if (cat.includes("역사")) return "역사";
  if (cat.includes("과학")) return "과학";
  if (cat.includes("예술")) return "예술";
  if (cat.includes("수험서") || cat.includes("자격증")) return "자격증/수험서";
  if (cat.includes("전공")) return "전공서";
  return "기타";
};

// ─────────────────────────────────────────────
// Bestseller: flat item schema
// ─────────────────────────────────────────────
export function mapKyoboToBook(item: any): Book {
  const isbn = item.cmdtCode || "";

  // Construct CDN Cover Image URL
  const coverImage = isbn
    ? `https://contents.kyobobook.co.kr/sih/fit-in/200x300/pdt/${isbn}.jpg`
    : "/images/book-placeholder.png";

  const rating = item.buyRevwRvgr || 9.5;
  const keyword = item.revwEmtnKywrName || "도움돼요";
  const reviewSummary = `구매 평점 ${rating}점으로, 독자들로부터 "${keyword}"라는 평가를 받고 있습니다.`;

  const category = mapCategory(item.saleCmdtClstName || "");

  // Determine studyBookType if category is Exam/Major
  let studyBookType: StudyBookType | undefined;
  if (category === "자격증/수험서" || category === "전공서") {
    studyBookType = "개념서"; // Fallback default
    if (item.cmdtName?.includes("문제집")) {
      studyBookType = "문제집";
    } else if (item.cmdtName?.includes("기출")) {
      studyBookType = "기출문제집";
    } else if (item.cmdtName?.includes("요약") || item.cmdtName?.includes("한권으로 끝내기")) {
      studyBookType = "요약집";
    }
  }

  return {
    id: item.saleCmdtid || `kyobo-${isbn}`,
    title: item.cmdtName || "제목 없음",
    author: item.chrcName || "저자 미상",
    category,
    studyBookType,
    subject: category === "자격증/수험서" || category === "전공서" ? item.saleCmdtClstName : undefined,
    price: item.sapr || item.price || 0,
    description: item.inbukCntt || "책 소개 정보가 없습니다.",
    toc: [],
    reviewSummary,
    targetReader: `${category} 분야 및 일간 베스트셀러에 관심이 있는 모든 독자`,
    level: "입문", // Bestsellers are generally tailored for general audience
    pickupAvailable: true, // Mark true for seamless MVP demo
    coverImage,
  };
}

// ─────────────────────────────────────────────
// New Releases: nested item schema
// { productInfo, priceInfo, reviewInfo, ... }
// ─────────────────────────────────────────────
export function mapKyoboNewestToBook(item: any): Book {
  const p = item.productInfo || {};
  const price = item.priceInfo || {};
  const review = item.reviewInfo || {};

  const isbn = p.cmdtcode || p.isbn || "";
  const coverImage = isbn
    ? `https://contents.kyobobook.co.kr/sih/fit-in/200x300/pdt/${isbn}.jpg`
    : "/images/book-placeholder.png";

  const rating = review.score ?? 0;
  const reviewCount = review.count ?? 0;
  const reviewSummary =
    reviewCount > 0
      ? `구매 평점 ${rating.toFixed(1)}점 (${reviewCount}개 리뷰)`
      : "아직 리뷰가 없는 따끈따끈한 신간입니다.";

  const category = mapCategory(p.saleCmdtClstName || p.cmdtClstName || "");

  let studyBookType: StudyBookType | undefined;
  if (category === "자격증/수험서" || category === "전공서") {
    studyBookType = "개념서";
    if (p.cmdtName?.includes("문제집")) studyBookType = "문제집";
    else if (p.cmdtName?.includes("기출")) studyBookType = "기출문제집";
    else if (p.cmdtName?.includes("요약") || p.cmdtName?.includes("한권으로 끝내기")) studyBookType = "요약집";
  }

  // Use anntCntt (annotation content) as book description, fallback to sbttName1
  const description =
    p.anntCntt?.trim() ||
    p.sbttName1?.trim() ||
    "책 소개 정보가 없습니다.";

  return {
    id: p.saleCmdtid || `kyobo-new-${isbn}`,
    title: p.cmdtName || "제목 없음",
    author: p.chrcName || "저자 미상",
    category,
    studyBookType,
    subject: category === "자격증/수험서" || category === "전공서" ? (p.saleCmdtClstName || p.cmdtClstName) : undefined,
    price: price.saleCmdtSapr || price.saleCmdtPrce || 0,
    description,
    toc: [],
    reviewSummary,
    targetReader: `${category} 분야 신간 도서에 관심이 있는 모든 독자`,
    level: "입문",
    pickupAvailable: true,
    coverImage,
  };
}

// ─────────────────────────────────────────────
// Fetch functions
// ─────────────────────────────────────────────
const API_KEY =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ZLYbgLboRn9J3QDp.A-YRBm6F9k1E7qI5iavgb0fVVjf3ssgmxnSkhW_hW_pTdNUpVjElQkaxXYjj1c0_5ycE4Sgl75QDatH5olqvIN35DPL8xmcQmH4ClipOkZ40xMMf0YXbj_vez5_z0mqXPL2_ysQu.6bVxg8WPbzFolcmHaf_-zw";

export async function fetchKyoboBestsellers(): Promise<Book[]> {
  const url =
    "https://store.kyobobook.co.kr/api/gw/best/best-seller/online?page=1&per=100&period=001&dsplDvsnCode=000&dsplTrgtDvsnCode=001";

  const response = await fetch(url, {
    headers: {
      "X-Api-Gw-Key": API_KEY,
      "Accept-Encoding": "gzip, deflate, br",
    },
    next: { revalidate: 3600 }, // Cache the bestsellers for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Kyobo Bestsellers API failed with status ${response.status}`);
  }

  const result = await response.json();
  const rawBooks = result?.data?.bestSeller || [];
  return rawBooks.map(mapKyoboToBook);
}

export async function fetchKyoboNewReleases(): Promise<Book[]> {
  const url =
    "https://store.kyobobook.co.kr/api/gw/pdt/v2/newest/md-pick/list?page=1&per=20&sort=rec&saleCmdtDvsnCode=KOR&soldOutExcludeYn=N&weekth=2026071";

  const response = await fetch(url, {
    headers: {
      "X-Api-Gw-Key": API_KEY,
      "Accept-Encoding": "gzip, deflate, br",
    },
    next: { revalidate: 3600 }, // Cache new releases for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Kyobo New Releases API failed with status ${response.status}`);
  }

  const result = await response.json();
  // New releases API: data.newestList[] with nested { productInfo, priceInfo, reviewInfo }
  const rawBooks: any[] = result?.data?.newestList || [];
  return rawBooks.map(mapKyoboNewestToBook);
}
