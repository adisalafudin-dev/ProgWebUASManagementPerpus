import bookApi from "./bookApi";
import categoryApi from "./categoryApi";
import memberApi from "./memberApi";
import borrowingApi from "./borrowingApi";
import reviewApi from "./reviewApi";

export const SEARCH_HISTORY_KEY = "lib_admin_search_history";
const MAX_HISTORY = 10;

export const getRecentBooks = async (limit = 8) => {
  try {
    const res = await bookApi.getBooks({ limit: 50 });
    const books = res.data || [];
    return books
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, limit);
  } catch (e) {
    return [];
  }
};

export const getPopularBooks = async (limit = 8) => {
  try {
    const res = await bookApi.getBooks({ limit: 50 });
    const books = res.data || [];
    return books.slice(0, limit);
  } catch (e) {
    return [];
  }
};

export const getPopularCategories = async (limit = 10) => {
  try {
    const categories = await categoryApi.getCategories();
    return (Array.isArray(categories) ? categories : []).slice(0, limit);
  } catch (e) {
    return [];
  }
};

export const getDashboardStats = async () => {
  try {
    const [booksRes, categories, members, borrowings, reviews, allBooksRes] = await Promise.allSettled([
      bookApi.getBooks({ limit: 1 }),
      categoryApi.getCategories(),
      memberApi.getMembers(),
      borrowingApi.getAllBorrowings(),
      reviewApi.getAllReviews(),
      bookApi.getBooks({ limit: 100 }), // for low stock
    ]);

    const totalBooks = booksRes.status === "fulfilled" ? booksRes.value?.meta?.total || 0 : 0;
    const totalCategories = categories.status === "fulfilled" && Array.isArray(categories.value) ? categories.value.length : 0;
    const totalMembers = members.status === "fulfilled" && Array.isArray(members.value) ? members.value.length : 0;
    
    const activeBorrowings = borrowings.status === "fulfilled" && Array.isArray(borrowings.value)
      ? borrowings.value.filter(b => b.status === "dipinjam").length
      : 0;

    const pendingReviews = reviews.status === "fulfilled" && Array.isArray(reviews.value)
      ? reviews.value.filter(r => r.status === "pending").length
      : 0;

    const lowStockBooks = allBooksRes.status === "fulfilled" && Array.isArray(allBooksRes.value?.data)
      ? allBooksRes.value.data.filter(b => b.stock > 0 && b.stock <= 2).length
      : 0;

    return {
      totalBooks,
      totalCategories,
      totalMembers,
      activeBorrowings,
      pendingReviews,
      lowStockBooks,
    };
  } catch (e) {
    return {
      totalBooks: 0,
      totalCategories: 0,
      totalMembers: 0,
      activeBorrowings: 0,
      pendingReviews: 0,
      lowStockBooks: 0,
    };
  }
};

export const getLibraryStatistics = async () => {
  return {
    totalBooks: 0,
    totalAuthors: 0,
    totalPublishers: 0,
    totalSubjects: 0,
    yearDistribution: [],
    languageDistribution: [],
    subjectDistribution: [],
    mostEditions: null,
  };
};

export const saveSearchHistory = (query, resultCount) => {
  if (!query || typeof window === "undefined") return;
  try {
    const existing = getSearchHistory();
    const entry = {
      id: `sh-${Date.now()}`,
      query: query.trim(),
      resultCount,
      timestamp: new Date().toISOString(),
    };
    const updated = [
      entry,
      ...existing.filter((e) => e.query !== entry.query),
    ].slice(0, MAX_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    /* localStorage mungkin tidak tersedia */
  }
};

export const getSearchHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const clearSearchHistory = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    // Invalidate cache agar stats terupdate saat refresh
    _cachedBooks = null;
  } catch {
    /* noop */
  }
};

/**
 * Invalidate cache manual (misal: setelah logout atau refresh paksa).
 */
export const invalidateDashboardCache = () => {
  _cachedBooks = null;
  _cacheTime = 0;
  _cachePromise = null;
};
