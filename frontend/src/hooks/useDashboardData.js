/**
 * useDashboardData
 *
 * Hook untuk mengambil semua data yang dibutuhkan Admin Dashboard Perpustakaan.
 * Semua data sekarang diambil dari backend NestJS melalui dashboardService.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getDashboardStats,
  getRecentBooks,
  getPopularBooks,
  getPopularCategories,
  getSearchHistory,
} from "../services/dashboardService";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Format timestamp ISO menjadi label relatif / lokal.
 * @param {string} iso
 * @returns {string}
 */
const formatTime = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "-";
  }
};

// ── Shape Defaults ─────────────────────────────────────────────────────────────

const DEFAULT_DATA = {
  stats: [],
  recentBooks: [],
  popularBooks: [],
  popularCategories: [],
  recentActivity: [],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDashboardData() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ── Parallel fetch dari semua service ──────────────────────────────────
      // Promise.allSettled: satu kegagalan tidak membatalkan yang lain.
      const [statsRes, recentRes, popularRes, categoriesRes] =
        await Promise.allSettled([
          getDashboardStats(),
          getRecentBooks(8),
          getPopularBooks(8),
          getPopularCategories(12),
        ]);

      // ── Data Extraction ────────────────────────────────────────────────────
      const statsRaw =
        statsRes.status === "fulfilled" && statsRes.value
          ? statsRes.value
          : {
              totalBooks: 0,
              totalCategories: 0,
              totalMembers: 0,
              activeBorrowings: 0,
              pendingReviews: 0,
              lowStockBooks: 0,
            };

      const recentBooks =
        recentRes.status === "fulfilled" && Array.isArray(recentRes.value)
          ? recentRes.value
          : [];

      const popularBooks =
        popularRes.status === "fulfilled" && Array.isArray(popularRes.value)
          ? popularRes.value
          : [];

      const popularCategories =
        categoriesRes.status === "fulfilled" &&
        Array.isArray(categoriesRes.value)
          ? categoriesRes.value
          : [];

      // ── Aktivitas Terakhir (dari localStorage) ─────────────────────────────
      // Ini adalah riwayat pencarian yang dilakukan admin di halaman Buku.
      // Tidak memerlukan endpoint backend — tersimpan di browser lokal.
      const rawHistory = getSearchHistory();
      const recentActivity = rawHistory.slice(0, 8).map((entry) => ({
        id: entry.id || `act-${entry.timestamp}`,
        query: entry.query || "Pencarian tidak diketahui",
        resultCount:
          typeof entry.resultCount === "number" ? entry.resultCount : 0,
        timeLabel: formatTime(entry.timestamp),
        timestamp: entry.timestamp,
      }));

      // ── Stats Array (untuk Stat Cards) ────────────────────────────────────
      // Semua data bersumber dari fetch default yang sama dengan halaman USER.
      const stats = [
        {
          id: "total-books",
          label: "Total Buku",
          value: statsRaw.totalBooks.toLocaleString("id-ID"),
          sub: "Koleksi perpustakaan",
          icon: "BookOpen",
          accent: "blue",
        },
        {
          id: "total-categories",
          label: "Total Kategori",
          value: statsRaw.totalCategories.toLocaleString("id-ID"),
          sub: "Genre tersedia",
          icon: "Tag",
          accent: "emerald",
        },
        {
          id: "total-members",
          label: "Total Anggota",
          value: statsRaw.totalMembers.toLocaleString("id-ID"),
          sub: "Pengguna terdaftar",
          icon: "Library",
          accent: "violet",
        },
        {
          id: "active-borrowings",
          label: "Peminjaman Aktif",
          value: statsRaw.activeBorrowings.toLocaleString("id-ID"),
          sub: "Buku sedang dipinjam",
          icon: "BookOpen",
          accent: "amber",
        },
        {
          id: "pending-reviews",
          label: "Menunggu Moderasi",
          value: statsRaw.pendingReviews.toLocaleString("id-ID"),
          sub: "Ulasan perlu ditinjau",
          icon: "Star",
          accent: "indigo",
        },
        {
          id: "low-stock",
          label: "Stok Menipis",
          value: statsRaw.lowStockBooks.toLocaleString("id-ID"),
          sub: "Sisa stok ≤ 2",
          icon: "Tag",
          accent: "rose",
        },
      ];

      setData({ stats, recentBooks, popularBooks, popularCategories, recentActivity });
    } catch (err) {
      setError(err?.message || "Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, error, refetch: fetchAll };
}
