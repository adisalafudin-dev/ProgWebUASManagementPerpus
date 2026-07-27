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
    const [booksRes, categories, members, borrowings, reviews, allBooksRes] =
      await Promise.allSettled([
        bookApi.getBooks({ limit: 1 }),
        categoryApi.getCategories(),
        memberApi.getMembers(),
        borrowingApi.getAllBorrowings(),
        reviewApi.getAllReviews(),
        bookApi.getBooks({ limit: 100 }), // for low stock
      ]);

    const totalBooks =
      booksRes.status === "fulfilled" ? booksRes.value?.meta?.total || 0 : 0;
    const totalCategories =
      categories.status === "fulfilled" && Array.isArray(categories.value)
        ? categories.value.length
        : 0;
    const totalMembers =
      members.status === "fulfilled" && Array.isArray(members.value)
        ? members.value.length
        : 0;

    const activeBorrowings =
      borrowings.status === "fulfilled" && Array.isArray(borrowings.value)
        ? borrowings.value.filter((b) => b.status === "dipinjam").length
        : 0;

    const pendingReviews =
      reviews.status === "fulfilled" && Array.isArray(reviews.value)
        ? reviews.value.filter((r) => r.status === "pending").length
        : 0;

    const lowStockBooks =
      allBooksRes.status === "fulfilled" &&
      Array.isArray(allBooksRes.value?.data)
        ? allBooksRes.value.data.filter((b) => b.stock > 0 && b.stock <= 2)
            .length
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

let _statsCache = null;
let _statsCacheTime = 0;
let _statsPromise = null;
const STATS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 menit

export const invalidateLibraryStatisticsCache = () => {
  _statsCache = null;
  _statsCacheTime = 0;
  _statsPromise = null;
};

const countValues = (items, getValue) => {
  const counter = new Map();
  items.forEach((item) => {
    const value = getValue(item);
    if (!value) return;
    counter.set(value, (counter.get(value) || 0) + 1);
  });
  return [...counter.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "id"));
};

/**
 * GANTI TOTAL dari versi Open Library — sekarang murni dari backend NestJS
 * sendiri (books + categories). Field `language`/`editionCount` sengaja
 * tidak ada lagi karena backend tidak menyimpan data itu.
 */

const countValuesMulti = (items, getValues) => {
  const counter = new Map();
  items.forEach((item) => {
    [...new Set(getValues(item).filter(Boolean))].forEach((value) =>
      counter.set(value, (counter.get(value) || 0) + 1),
    );
  });
  return [...counter.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "id"));
};

export const getLibraryStatistics = async () => {
  const now = Date.now();
  if (_statsCache && now - _statsCacheTime < STATS_CACHE_TTL_MS) {
    return _statsCache;
  }
  if (_statsPromise) return _statsPromise;

  _statsPromise = (async () => {
    const [booksResponse, categoriesResponse] = await Promise.all([
      bookApi.getBooks({ limit: 1000 }), // lihat catatan di bawah soal limit ini
      categoryApi.getCategories(),
    ]);

    const books = booksResponse?.data ?? [];
    const categories = categoriesResponse?.data ?? categoriesResponse ?? [];

    const authors = countValues(books, (book) => book.author?.trim());
    const publishers = countValues(books, (book) => book.publisher?.trim());
    const categoryDistribution = countValuesMulti(books, (book) =>
      (book.categories || []).map((c) => c.name),
    );
    const yearDistribution = countValues(books, (book) =>
      book.publishedYear ? String(book.publishedYear) : "Tidak diketahui",
    );

    const availableCount = books.filter((book) => (book.stock ?? 0) > 0).length;
    const availabilityDistribution = [
      { label: "Tersedia", value: availableCount },
      { label: "Stok Habis", value: books.length - availableCount },
    ].filter((item) => item.value > 0);

    const highestStockBook =
      [...books].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))[0] || null;

    const stats = {
      totalBooks: books.length,
      totalAuthors: authors.length,
      totalPublishers: publishers.length,
      totalCategories: categories.length,
      yearDistribution,
      availabilityDistribution,
      categoryDistribution,
      highestStockBook,
    };

    _statsCache = stats;
    _statsCacheTime = Date.now();
    return stats;
  })().finally(() => {
    _statsPromise = null;
  });

  return _statsPromise;
};
