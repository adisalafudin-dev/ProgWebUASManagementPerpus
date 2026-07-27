import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Tag,
  Star,
  Search,
  Library,
  CalendarDays,
  ArrowUpRight,
  BarChart3,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  InboxIcon,
  FolderPlus,
  UserPlus,
  Plus,
  Activity,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";
import { clearSearchHistory } from "../../services/dashboardService";

// ── Icon Map ─────────────────────────────────────────────────────────────────
const ICON_MAP = {
  BookOpen,
  Tag,
  Star,
  Search,
  Library,
  CalendarDays,
};

// ── Accent Styles ─────────────────────────────────────────────────────────────
const ACCENT = {
  blue: {
    icon: "bg-blue-50 text-blue-600 border-blue-100",
    badge: "bg-blue-50 text-blue-700",
    ring: "ring-blue-200",
    chip: "bg-blue-50 text-blue-700 border-blue-200",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 border-emerald-100",
    badge: "bg-emerald-50 text-emerald-700",
    ring: "ring-emerald-200",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 border-violet-100",
    badge: "bg-violet-50 text-violet-700",
    ring: "ring-violet-200",
    chip: "bg-violet-50 text-violet-700 border-violet-200",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 border-amber-100",
    badge: "bg-amber-50 text-amber-700",
    ring: "ring-amber-200",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
  },
  indigo: {
    icon: "bg-indigo-50 text-indigo-600 border-indigo-100",
    badge: "bg-indigo-50 text-indigo-700",
    ring: "ring-indigo-200",
    chip: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 border-rose-100",
    badge: "bg-rose-50 text-rose-700",
    ring: "ring-rose-200",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

// ── Quick Actions ─────────────────────────────────────────────────────────────
const quickActions = [
  {
    label: "Tambah Buku",
    description: "Input judul & detail buku baru",
    href: "/admin/books",
    icon: Plus,
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    label: "Kelola Kategori",
    description: "Atur taksonomi & genre",
    href: "/admin/categories",
    icon: FolderPlus,
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Manajemen Anggota",
    description: "Kelola data & status keanggotaan",
    href: "/admin/users",
    icon: UserPlus,
    iconBg: "bg-violet-100 text-violet-700",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Components
// ─────────────────────────────────────────────────────────────────────────────

function Pulse({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
      aria-hidden="true"
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <Pulse className="h-11 w-11 rounded-xl" />
        <Pulse className="h-5 w-20 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Pulse className="h-3 w-24" />
        <Pulse className="h-7 w-16" />
        <Pulse className="h-3 w-20" />
      </div>
    </div>
  );
}

function BookRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-2 py-3.5">
      <Pulse className="h-[68px] w-12 flex-shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-4 w-3/4" />
        <Pulse className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Pulse className="h-4 w-16 rounded-md" />
          <Pulse className="h-4 w-20 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Pulse className="h-5 w-16 rounded-full" />
        <Pulse className="h-3 w-10" />
      </div>
    </div>
  );
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
      <Pulse className="h-8 w-8 flex-shrink-0 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Pulse className="h-3.5 w-3/4" />
        <Pulse className="h-3 w-1/3" />
      </div>
      <Pulse className="h-3 w-12" />
    </div>
  );
}

function CategoryChipSkeleton() {
  return <Pulse className="h-8 w-24 rounded-full" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton Layout
// ─────────────────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div
      className="space-y-8 pb-10"
      aria-label="Memuat dashboard…"
      aria-busy="true"
    >
      {/* Stat Cards */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <Pulse className="h-6 w-44" />
          <Pulse className="h-4 w-28" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <Pulse className="h-5 w-32" />
              <Pulse className="h-3 w-44" />
            </div>
          </div>
          <div className="mt-2 divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <BookRowSkeleton key={i} />
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4 space-y-2">
            <Pulse className="h-5 w-40" />
            <Pulse className="h-3 w-48" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ActivityRowSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <Pulse className="h-5 w-32" />
              <Pulse className="h-3 w-44" />
            </div>
          </div>
          <div className="mt-2 divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <BookRowSkeleton key={i} />
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4 space-y-2">
            <Pulse className="h-5 w-36" />
            <Pulse className="h-3 w-44" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <CategoryChipSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Error State
// ─────────────────────────────────────────────────────────────────────────────

function DashboardError({ message, onRetry }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-10 text-center space-y-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-bold text-red-700">
          Gagal Memuat Dashboard
        </h2>
        <p className="max-w-xs text-sm text-red-500">
          {message || "Terjadi kesalahan saat mengambil data dari server."}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-red-700 active:scale-95"
      >
        <RefreshCw className="h-4 w-4" />
        Coba Lagi
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function SectionEmpty({ message = "Belum ada data." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <InboxIcon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function RatingStars({ value }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${
            s <= rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-100 text-slate-300"
          }`}
        />
      ))}
      <span className="ml-1 text-[11px] font-semibold text-slate-600">
        {Number(value).toFixed(1)}
      </span>
    </div>
  );
}

/** Baris buku (dipakai di Buku Terbaru & Buku Populer) */
function BookRow({ book, rank }) {
  return (
    <div className="group flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-slate-100">
      {/* Rank */}
      {rank !== undefined && (
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            rank <= 3
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {rank}
        </span>
      )}

      {/* Cover */}
      <div className="flex h-[68px] w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-center text-[9px] font-semibold text-slate-400 shadow-sm">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          "No cover"
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {book.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          oleh <span className="font-medium text-slate-700">{book.author}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {book.genre && (
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {book.genre}
            </span>
          )}
          {book.rating > 0 && <RatingStars value={book.rating} />}
        </div>
      </div>

      {/* Year / Available */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {book.year && book.year !== "-" && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
            {book.year}
          </span>
        )}
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${
            book.stock > 0
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              book.stock > 0 ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {book.stock > 0 ? "Tersedia" : "Tidak"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Welcome Banner
// ─────────────────────────────────────────────────────────────────────────────

function WelcomeBanner() {
  return (
    <section className="rounded-3xl bg-primary p-6 text-white shadow-book sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold text-accent">
            Sistem Informasi Perpustakaan
          </span>
          <h1 className="font-playfair text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/75">
            Pantau koleksi buku, kategori, dan aktivitas pencarian dari satu
            tempat. Data tersinkronisasi langsung dengan sistem backend Anda.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="inline-flex items-start gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-medium text-white/85">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Mode Administrator
          </span>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Stat Cards
// ─────────────────────────────────────────────────────────────────────────────

function StatCards({ stats }) {
  if (!stats || stats.length === 0) {
    return (
      <div className="col-span-full">
        <SectionEmpty message="Tidak ada data statistik tersedia." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {stats.map((s) => {
        const Ico = ICON_MAP[s.icon] || BookOpen;
        const a = ACCENT[s.accent] || ACCENT.blue;
        return (
          <div
            key={s.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            {/* Subtle gradient blob */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-slate-50 blur-2xl" />

            <div className="relative flex items-start justify-between">
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${a.icon} transition-transform duration-300 group-hover:scale-110`}
              >
                <Ico className="h-5 w-5" />
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.badge}`}
              >
                <TrendingUp className="h-3 w-3" />
                Live
              </span>
            </div>

            <div className="relative mt-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
              <p className="mt-1 font-playfair text-2xl font-bold text-slate-900">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{s.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Buku Terbaru
// ─────────────────────────────────────────────────────────────────────────────

function RecentBooksSection({ books }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <CalendarDays className="h-5 w-5 text-violet-600" />
            Buku Terbaru
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Berdasarkan waktu penambahan ke katalog
          </p>
        </div>
        <Link
          to="/admin/books"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-600 hover:text-white"
        >
          Lihat Semua <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-2 divide-y divide-slate-100">
        {books.length === 0 ? (
          <SectionEmpty message="Tidak ada buku terbaru yang ditemukan." />
        ) : (
          books.map((book) => <BookRow key={book.id} book={book} />)
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Aktivitas Terakhir
// ─────────────────────────────────────────────────────────────────────────────

function RecentActivitySection({ activities, onClear }) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Activity className="h-5 w-5 text-indigo-600" />
            Aktivitas Terakhir
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Riwayat pencarian terakhir admin
          </p>
        </div>
        {activities.length > 0 && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-red-700 hover:text-white"
            title="Hapus riwayat"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </button>
        )}
      </div>

      <div className="mt-4 flex-1 space-y-2">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              Belum ada pencarian
            </p>
            <p className="text-xs text-slate-400">
              Riwayat pencarian buku akan muncul di sini.
            </p>
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:bg-slate-100/60"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Search className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  &ldquo;{act.query}&rdquo;
                </p>
                <p className="text-[11px] text-slate-500">
                  {act.resultCount} hasil ditemukan
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {act.timeLabel}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Buku Populer
// ─────────────────────────────────────────────────────────────────────────────

function PopularBooksSection({ books }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between border-b  pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Star className="h-5 w-5 text-amber-500" />
            Buku Populer
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Berdasarkan penilaian pengguna katalog
          </p>
        </div>
        <Link
          to="/admin/books"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-700 hover:text-white"
        >
          Lihat Semua <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-2 divide-y divide-slate-100">
        {books.length === 0 ? (
          <SectionEmpty message="Tidak ada data buku populer." />
        ) : (
          books.map((book, idx) => (
            <BookRow key={book.id} book={book} rank={idx + 1} />
          ))
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Kategori Populer
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_ACCENT_CYCLE = [
  "blue",
  "emerald",
  "violet",
  "amber",
  "indigo",
  "rose",
];

function PopularCategoriesSection({ categories }) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Tag className="h-5 w-5 text-emerald-600" />
            Kategori Populer
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Genre dengan koleksi terbanyak
          </p>
        </div>
        <Link
          to="/admin/categories"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-700 hover:text-white"
        >
          Kelola <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {categories.length === 0 ? (
        <SectionEmpty message="Tidak ada kategori yang ditemukan." />
      ) : (
        <>
          {/* Top 3 with progress bar */}
          {(() => {
            const sorted = [...categories].sort(
              (a, b) => (b.bookCount || 0) - (a.bookCount || 0),
            );
            const top = sorted.slice(0, 3);
            const maxCount = sorted[0]?.bookCount || 1;
            return (
              <div className="mt-5 space-y-3">
                {top.map((cat, idx) => {
                  console.log(cat);
                  const pct = Math.round(
                    ((cat.bookCount || 0) / maxCount) * 100,
                  );
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">
                          {cat.name}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {cat.bookCount || 0} buku
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${
                            idx === 0
                              ? "bg-blue-500"
                              : idx === 1
                                ? "bg-emerald-500"
                                : "bg-violet-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Chips for the rest */}
          <div className="mt-5 flex flex-wrap gap-2">
            {(() => {
              const sortedAll = [...categories].sort(
                (a, b) => (b.bookCount || 0) - (a.bookCount || 0),
              );
              return sortedAll.slice(3).map((cat, idx) => {
                const accent =
                  ACCENT[
                    CATEGORY_ACCENT_CYCLE[
                      (idx + 3) % CATEGORY_ACCENT_CYCLE.length
                    ]
                  ];
                return (
                  <Link
                    key={cat.id}
                    to="/admin/categories"
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-sm ${accent.chip}`}
                  >
                    {cat.name}
                    {cat.bookCount > 0 && (
                      <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-bold">
                        {cat.bookCount}
                      </span>
                    )}
                  </Link>
                );
              });
            })()}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Aksi Cepat
            </p>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition-all duration-200 hover:border-slate-900 hover:bg-slate-100 hover:shadow-md"
                  >
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${action.iconBg} transition-transform duration-200 group-hover:scale-110`}
                    >
                      <ActionIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                        {action.label}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data, loading, error, refetch } = useDashboardData();
  const [activityKey, setActivityKey] = useState(0);

  const handleClearActivity = () => {
    clearSearchHistory();
    setActivityKey((k) => k + 1);
    refetch();
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <WelcomeBanner />
        <DashboardSkeleton />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-8 pb-10">
        <WelcomeBanner />
        <DashboardError message={error} onRetry={refetch} />
      </div>
    );
  }

  const {
    stats = [],
    recentBooks = [],
    popularBooks = [],
    popularCategories = [],
    recentActivity = [],
  } = data || {};

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-10">
      {/* ══ Welcome Banner ═══════════════════════════════════════════════════ */}
      <WelcomeBanner />

      {/* ══ Statistik ════════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Ringkasan Statistik
          </h2>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Data dari Database Internal
          </span>
        </div>
        <StatCards stats={stats} />
      </section>

      {/* ══ Row 1: Buku Terbaru + Aktivitas Terakhir ════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentBooksSection books={recentBooks} />
        <RecentActivitySection
          key={activityKey}
          activities={recentActivity}
          onClear={handleClearActivity}
        />
      </div>

      {/* ══ Row 2: Buku Populer + Kategori Populer ══════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PopularBooksSection books={popularBooks} />
        <PopularCategoriesSection categories={popularCategories} />
      </div>
    </div>
  );
}
