import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import BookCardSkeleton from "../components/BookCardSkeleton";
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";
import bookApi from "../services/bookApi";
import categoryApi from "../services/categoryApi";
import { formatBackendBook } from "../utils/bookFormatter";
import { useFavorites } from "../contexts/FavoriteContext.jsx";

export default function ExplorePage() {
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [booksRes, catsRes] = await Promise.all([
        bookApi.getBooks({ page: 1, limit: 12 }),
        categoryApi.getCategories().catch(() => []),
      ]);

      const rawBooks = booksRes?.data ?? [];
      setBooks(rawBooks.map(formatBackendBook));
      setCategories(Array.isArray(catsRes) ? catsRes : []);
    } catch (err) {
      console.error("Gagal memuat data explore:", err);
      setError(
        err?.message || "Server backend belum siap atau tidak merespons.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isBookFavorite = (book) => favoriteIds.has(book.id);

  // Hero book (first book or featured)
  const heroBook = books[0] || null;

  // Newest books (sorted by publishedYear desc)
  const newestBooks = useMemo(() => {
    return [...books]
      .sort(
        (a, b) =>
          (Number(b.publishedYear) || 0) - (Number(a.publishedYear) || 0),
      )
      .slice(0, 4);
  }, [books]);

  // Recommended books (books with stock > 0)
  const recommendedList = useMemo(() => {
    return books.filter((b) => b.stock > 0).slice(0, 8);
  }, [books]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const authors = new Set(books.map((b) => b.author).filter(Boolean));
    const publishers = new Set(books.map((b) => b.publisher).filter(Boolean));
    const totalCategories = categories.length;

    return {
      totalBooks,
      totalAuthors: authors.size,
      totalPublishers: publishers.size,
      totalCategories,
    };
  }, [books, categories]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTitle.trim()) params.set("q", searchTitle.trim());
    if (selectedCategoryId) params.set("category", selectedCategoryId);
    navigate(`/books?${params.toString()}`);
  };

  // Error State
  if (error && books.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-cream px-4 py-12">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-book">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 ">
            <Icon name="info" className="h-7 w-7" />
          </div>
          <h2 className="font-playfair text-2xl font-bold text-textMain mb-2">
            Gagal Memuat Katalog Buku
          </h2>
          <p className="font-crimson text-textSecondary mb-6 leading-relaxed">
            {error ||
              "Server API tidak merespons. Silakan periksa koneksi Anda dan coba lagi."}
          </p>
          <button
            type="button"
            className="btn-primary w-full justify-center py-3"
            onClick={loadData}
          >
            <Icon name="refresh" className="h-4 w-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 pb-10 px-4 sm:px-6 lg:px-8">
      {/* 1. HERO SECTION */}
      <section
        aria-label="Hero Banner Perpustakaan Digital"
        className="relative overflow-hidden rounded-3xl bg-primary text-white shadow-2xl transition-all duration-700 mt-4"
      >
        {/* Dynamic Cover Background Layers */}
        {heroBook?.cover ? (
          <div
            className="hero-bg-motion absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-105"
            style={{ backgroundImage: `url(${heroBook.cover})` }}
            aria-hidden="true"
          />
        ) : null}

        <div className="relative px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-accent shadow-sm backdrop-blur-md">
                <Icon name="shield" className="h-3.5 w-3.5" />
                <span>Sistem Informasi Perpustakaan Digital</span>
              </div>

              <h1 className="mb-4 font-playfair text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                {heroBook
                  ? heroBook.title
                  : "Katalog & Koleksi Digital Perpustakaan"}
              </h1>

              <p className="mb-6 max-w-xl text-base text-white/80 leading-relaxed sm:text-lg">
                {heroBook ? (
                  <>
                    Ditulis oleh{" "}
                    <span className="font-semibold text-accent">
                      {heroBook.author}
                    </span>
                    {heroBook.publishedYear && ` (${heroBook.publishedYear})`} -
                    Akses koleksi buku dan literatur ilmiah terpadu secara
                    real-time.
                  </>
                ) : (
                  "Temukan referensi buku ilmiah, sastra, dan pengetahuan umum secara terpadu dari database kami."
                )}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/books" className="btn-primary py-3 px-6 text-base">
                  <Icon name="compass" className="h-5 w-5" />
                  Jelajahi Katalog
                </Link>
                <Link
                  to="/favorites"
                  className="btn-secondary text-primary py-3 px-6 text-base"
                >
                  <Icon name="heart" className="h-5 w-5" />
                  Rak Favorit
                </Link>
                {heroBook && (
                  <button
                    type="button"
                    onClick={() => toggleFavorite(heroBook)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-3 font-semibold transition-all duration-300 ${
                      isBookFavorite(heroBook)
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Icon name="heart" className="h-4 w-4" />
                    {isBookFavorite(heroBook) ? "Favorit" : "Simpan"}
                  </button>
                )}
              </div>
            </div>

            {/* Hero Cover Card */}
            <div className="flex justify-center lg:justify-end">
              {isLoading && !heroBook ? (
                <div className="aspect-[2/3] w-48 animate-pulse rounded-2xl bg-white/10 sm:w-56" />
              ) : heroBook ? (
                <div
                  className="group relative cursor-pointer"
                  onClick={() => navigate(`/books/${heroBook.id}`)}
                >
                  <div className="relative aspect-[2/3] w-48 overflow-hidden rounded-2xl border border-white/20 bg-secondary shadow-2xl transition-transform duration-500 group-hover:scale-105 sm:w-56">
                    {heroBook.cover ? (
                      <img
                        src={heroBook.cover}
                        alt={heroBook.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col justify-center p-6 text-center">
                        <Icon
                          name="bookOpen"
                          className="mx-auto mb-3 h-10 w-10 text-accent"
                        />
                        <p className="font-playfair font-bold text-white text-sm">
                          {heroBook.title}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH BUKU */}
      <section
        aria-label="Pencarian Buku Utama"
        className="rounded-2xl border border-borderSoft bg-white p-6 shadow-book lg:p-8"
      >
        <div className="mb-6">
          <p className="section-label mb-1">Pencarian Cepat</p>
          <h2 className="font-playfair text-2xl font-bold text-textMain sm:text-3xl">
            Cari Buku di Katalog Perpustakaan
          </h2>
          <p className="text-sm text-textSecondary mt-1">
            Gunakan filter kata kunci atau kategori untuk menemukan koleksi buku
            yang Anda inginkan.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Input Judul / Kata Kunci */}
            <div>
              <label
                htmlFor="search-title"
                className="section-label mb-1.5 block text-xs"
              >
                Judul / Penulis / ISBN
              </label>
              <div className="relative">
                <Icon
                  name="search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary"
                />
                <input
                  id="search-title"
                  type="text"
                  placeholder="Ketik judul, nama penulis, atau ISBN..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Select Subjek / Kategori */}
            <div>
              <label
                htmlFor="search-category"
                className="section-label mb-1.5 block text-xs"
              >
                Kategori Buku
              </label>
              <div className="relative">
                <Icon
                  name="tag"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary pointer-events-none"
                />
                <select
                  id="search-category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="input-field pl-10 appearance-none bg-white cursor-pointer"
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
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            {(searchTitle || selectedCategoryId) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTitle("");
                  setSelectedCategoryId("");
                }}
                className="btn-secondary py-2.5 text-xs"
              >
                Reset Filter
              </button>
            )}
            <button type="submit" className="btn-primary py-2.5 px-6 text-sm">
              <Icon name="search" className="h-4 w-4" />
              Cari Katalog
            </button>
          </div>
        </form>
      </section>

      {/* 3. STATISTIK SINGKAT */}
      <section aria-label="Statistik Koleksi Perpustakaan">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-borderSoft bg-white p-5 shadow-book transition-transform hover:-translate-y-1">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accentHover">
              <Icon name="bookOpen" className="h-5 w-5" />
            </div>
            <p className="font-playfair text-2xl font-extrabold text-textMain sm:text-3xl">
              {isLoading ? "..." : stats.totalBooks}
            </p>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mt-1">
              Koleksi Tersedia
            </p>
          </div>

          <div className="rounded-2xl border border-borderSoft bg-white p-5 shadow-book transition-transform hover:-translate-y-1">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon name="users" className="h-5 w-5" />
            </div>
            <p className="font-playfair text-2xl font-extrabold text-textMain sm:text-3xl">
              {isLoading ? "..." : stats.totalAuthors}
            </p>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mt-1">
              Penulis Terdaftar
            </p>
          </div>

          <div className="rounded-2xl border border-borderSoft bg-white p-5 shadow-book transition-transform hover:-translate-y-1">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
              <Icon name="tag" className="h-5 w-5" />
            </div>
            <p className="font-playfair text-2xl font-extrabold text-textMain sm:text-3xl">
              {isLoading ? "..." : stats.totalCategories}
            </p>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mt-1">
              Kategori Aktif
            </p>
          </div>

          <div className="rounded-2xl border border-borderSoft bg-white p-5 shadow-book transition-transform hover:-translate-y-1">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-700">
              <Icon name="globe" className="h-5 w-5" />
            </div>
            <p className="font-playfair text-2xl font-extrabold text-textMain sm:text-3xl">
              {isLoading ? "..." : stats.totalPublishers}
            </p>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mt-1">
              Penerbit Buku
            </p>
          </div>
        </div>
      </section>

      {/* 4. BUKU TERBARU */}
      <section aria-labelledby="heading-buku-terbaru">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-label mb-1">Rilisan Terbaru</p>
            <h2
              id="heading-buku-terbaru"
              className="font-playfair text-2xl font-bold text-textMain sm:text-3xl"
            >
              Koleksi Buku Terbaru
            </h2>
          </div>
          <Link
            to="/books"
            className="flex items-center gap-1.5 text-sm font-semibold text-accentHover hover:underline"
          >
            <span>Lihat Semua</span>
            <Icon name="chevronRight" className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="book-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : newestBooks.length > 0 ? (
          <div className="book-grid">
            {newestBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isFavorite={isBookFavorite(book)}
                onToggleFavorite={toggleFavorite}
                onSelect={() => navigate(`/books/${book.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="collection"
            text="Tidak ada data buku terbaru yang ditemukan."
          />
        )}
      </section>

      {/* 5. REKOMENDASI BUKU */}
      <section aria-labelledby="heading-rekomendasi">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-label mb-1">Rekomendasi Pustaka</p>
            <h2
              id="heading-rekomendasi"
              className="font-playfair text-2xl font-bold text-textMain sm:text-3xl"
            >
              Rekomendasi Pilihan
            </h2>
          </div>
          <Link
            to="/books"
            className="flex items-center gap-1.5 text-sm font-semibold text-accentHover hover:underline"
          >
            <span>Lihat Selengkapnya</span>
            <Icon name="chevronRight" className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="book-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : recommendedList.length > 0 ? (
          <div className="book-grid">
            {recommendedList.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isFavorite={isBookFavorite(book)}
                onToggleFavorite={toggleFavorite}
                onSelect={() => navigate(`/books/${book.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon="star" text="Belum ada buku rekomendasi." />
        )}
      </section>

      {/* 6. KATEGORI POPULER */}
      {categories.length > 0 && (
        <section aria-labelledby="heading-kategori-populer">
          <div className="mb-6">
            <p className="section-label mb-1">Kategori Buku</p>
            <h2
              id="heading-kategori-populer"
              className="font-playfair text-2xl font-bold text-textMain sm:text-3xl"
            >
              Eksplorasi Kategori
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/books?category=${cat.id}`)}
                className="group flex flex-col justify-between rounded-2xl border border-borderSoft bg-white p-5 shadow-book text-left transition-all duration-300 hover:border-accent hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <Icon name="tag" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-playfair text-base font-bold text-textMain group-hover:text-accentHover">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-textSecondary mt-1 line-clamp-1">
                    {cat.description || "Lihat koleksi buku di kategori ini"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
