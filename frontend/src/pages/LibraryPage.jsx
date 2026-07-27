import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import BookCardSkeleton from "../components/BookCardSkeleton";
import Icon from "../components/Icon";
import bookApi from "../services/bookApi";
import categoryApi from "../services/categoryApi";
import { formatBackendBook } from "../utils/bookFormatter";
import { useFavorites } from "../contexts/FavoriteContext.jsx";
import { useNotification } from "../contexts/NotificationContext.jsx";
import { useDebounce } from "../hooks/useDebounce";

const ITEMS_PER_PAGE = 12;

function EmptyStateBlock({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-borderSoft bg-white py-16 px-6 text-center shadow-book mb-10">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cream text-accentHover">
        <Icon name="bookOpen" className="h-8 w-8" strokeWidth={1.5} />
      </span>
      <h3 className="font-playfair text-xl font-semibold text-textMain">
        Tidak ada buku ditemukan
      </h3>
      <p className="mx-auto mt-2 max-w-sm font-crimson text-sm text-textSecondary">
        Coba gunakan kata kunci pencarian lain atau ubah filter kategori yang aktif.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-secondary" onClick={onReset}>
          <Icon name="refresh" className="h-4 w-4" />
          Reset Filter
        </button>
      </div>
    </div>
  );
}

function ErrorStateBlock({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-white py-14 px-6 text-center shadow-book mb-10">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-accentHover">
        <Icon name="info" className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <h3 className="font-playfair text-xl font-semibold text-textMain">
        Gagal Memuat Katalog Buku
      </h3>
      <p className="mx-auto mt-2 max-w-sm font-crimson text-sm text-textSecondary">
        {message || "Terjadi kesalahan saat terhubung ke server API."}
      </p>
      <button type="button" className="btn-primary mt-6" onClick={onRetry}>
        <Icon name="refresh" className="h-4 w-4" />
        Coba Lagi
      </button>
    </div>
  );
}

function PaginationBar({ currentPage, totalPages, totalItems, onChange }) {
  const scrollToTop = useCallback(() => {
    document.getElementById("katalog-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goToPage = useCallback(
    (page) => {
      onChange(page);
      scrollToTop();
    },
    [onChange, scrollToTop]
  );

  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let pages = [];
  if (totalPages <= maxVisible) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  return (
    <nav aria-label="Paginasi hasil buku" className="mt-10 space-y-3">
      <p className="text-center text-xs text-textSecondary font-crimson">
        Halaman <span className="font-semibold text-textMain">{currentPage}</span> dari{" "}
        <span className="font-semibold text-textMain">{totalPages}</span> (Total{" "}
        <span className="font-semibold text-textMain">{totalItems}</span> buku)
      </p>
      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          className="btn-secondary min-h-9 px-3 py-2 text-sm disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
          aria-label="Halaman sebelumnya"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {pages[0] > 1 && (
          <>
            <button
              type="button"
              className="min-h-9 w-9 rounded-lg border border-borderSoft bg-white text-sm font-semibold text-textSecondary transition-all hover:border-primary hover:text-primary"
              onClick={() => goToPage(1)}
            >
              1
            </button>
            {pages[0] > 2 && (
              <span className="px-1 text-textSecondary text-sm">…</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`min-h-9 w-9 rounded-lg text-sm font-semibold transition-all ${
              page === currentPage
                ? "bg-primary text-white shadow-md"
                : "border border-borderSoft bg-white text-textSecondary hover:border-primary hover:text-primary"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => goToPage(page)}
          >
            {page}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-1 text-textSecondary text-sm">…</span>
            )}
            <button
              type="button"
              className="min-h-9 w-9 rounded-lg border border-borderSoft bg-white text-sm font-semibold text-textSecondary transition-all hover:border-primary hover:text-primary"
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className="btn-secondary min-h-9 px-3 py-2 text-sm disabled:opacity-40"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
          aria-label="Halaman berikutnya"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { showToast } = useNotification();

  // ── States ────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get("category") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Fetch Categories on mount
  useEffect(() => {
    categoryApi
      .getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Gagal memuat kategori:", err));
  }, []);

  // Fetch books from backend (Server-side Search, Filter & Pagination)
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookApi.getBooks({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearchTerm.trim() || undefined,
        category: selectedCategoryId || undefined,
      });

      const rawBooks = response?.data ?? [];
      const formatted = rawBooks.map(formatBackendBook);
      setBooks(formatted);
      setMeta({
        page: response?.meta?.page || 1,
        totalPages: response?.meta?.totalPages || 1,
        total: response?.meta?.total || 0,
      });
    } catch (err) {
      console.error("Gagal mengambil data buku:", err);
      setError(err?.message || "Gagal terhubung ke API backend.");
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, selectedCategoryId]);

  // Trigger fetch whenever filters or pagination change
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Sync URL search params
  useEffect(() => {
    const params = {};
    if (debouncedSearchTerm) params.q = debouncedSearchTerm;
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (currentPage > 1) params.page = currentPage;
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, selectedCategoryId, currentPage, setSearchParams]);

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to page 1 on new search
  };

  const handleCategoryChange = (e) => {
    setSelectedCategoryId(e.target.value);
    setCurrentPage(1); // reset to page 1 on category change
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategoryId("");
    setCurrentPage(1);
    showToast("Filter direset", "Menampilkan semua koleksi buku.", "info");
  };

  const isBookFavorite = (book) => favoriteIds.has(book.id);

  return (
    <div className="space-y-8 pb-12">
      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <section
        id="katalog"
        aria-labelledby="katalog-heading"
        className="border-b border-borderSoft bg-gradient-to-br from-primary via-primary to-accentHover py-10 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="section-label text-accent mb-1.5">
              Sistem Informasi Perpustakaan Digital
            </p>
            <h1
              id="katalog-heading"
              className="font-playfair font-extrabold text-3xl sm:text-4xl leading-tight"
            >
              Katalog Buku Publik
            </h1>
            <p className="font-crimson text-white/80 mt-2 text-base">
              Jelajahi koleksi buku terdaftar dari database perpustakaan. Data tersaji secara real-time dari backend API.
            </p>
          </div>
        </div>
      </section>

      {/* ── SEARCH & CATEGORY FILTER BAR ─────────────────────────────────── */}
      <section
        aria-label="Filter dan pencarian katalog buku"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-borderSoft bg-white p-5 shadow-book">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Icon
                name="search"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary pointer-events-none"
              />
              <input
                type="search"
                placeholder="Cari judul, penulis, atau ISBN..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="input-field pl-10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textMain"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <Icon
                name="tag"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary pointer-events-none"
              />
              <select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className="input-field pl-10 appearance-none bg-white cursor-pointer pr-10"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Icon
                name="chevronDown"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary pointer-events-none"
              />
            </div>
          </div>

          {/* Active Filter Badges */}
          {(searchTerm || selectedCategoryId) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-borderSoft text-xs">
              <span className="text-textSecondary font-semibold">Filter Aktif:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-borderSoft px-3 py-1 text-accentHover font-semibold">
                  Pencarian: "{searchTerm}"
                  <button type="button" onClick={() => setSearchTerm("")}>
                    <Icon name="close" className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategoryId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-borderSoft px-3 py-1 text-accentHover font-semibold">
                  Kategori: {categories.find((c) => c.id === selectedCategoryId)?.name || selectedCategoryId}
                  <button type="button" onClick={() => setSelectedCategoryId("")}>
                    <Icon name="close" className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="text-accentHover underline font-semibold hover:text-accent ml-auto"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CATALOG RESULTS ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="results-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="section-label">Koleksi Terdaftar</p>
            <h2 id="results-heading" className="font-playfair font-bold text-xl text-textMain">
              Daftar Buku
            </h2>
          </div>
          {!isLoading && !error && (
            <p className="font-crimson text-sm text-textSecondary">
              Menampilkan <span className="font-semibold text-textMain">{books.length}</span> dari{" "}
              <span className="font-semibold text-textMain">{meta.total}</span> total buku
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="book-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <ErrorStateBlock message={error} onRetry={fetchBooks} />
        ) : books.length === 0 ? (
          /* Empty State */
          <EmptyStateBlock onReset={resetFilters} />
        ) : (
          /* Books Grid */
          <>
            <div className="book-grid">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isFavorite={isBookFavorite(book)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={() => navigate(`/books/${book.id}`)}
                />
              ))}
            </div>

            {/* Server-side Pagination Bar */}
            <PaginationBar
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              onChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </section>
    </div>
  );
}
