import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BookModal from "../components/BookModal";
import BookCardSkeleton from "../components/BookCardSkeleton";
import Icon from "../components/Icon";
import { useFavorites } from "../contexts/FavoriteContext.jsx";
import { useNotification } from "../contexts/NotificationContext.jsx";
import { useDebounce } from "../hooks/useDebounce";
import { formatRating, getBookId } from "../utils/bookHelpers.js";

const FAVORITES_UI_STATE_KEY = "aksarahub-favorites-ui-state";

const SORT_OPTIONS = [
  { value: "added-desc", label: "Terbaru Ditambahkan" },
  { value: "added-asc", label: "Terlama Ditambahkan" },
  { value: "title-asc", label: "Judul A-Z" },
  { value: "title-desc", label: "Judul Z-A" },
  { value: "year-desc", label: "Tahun Terbit" },
  { value: "rating-desc", label: "Rating Tertinggi" },
];

const SUBJECT_FILTERS = [
  "Semua",
  "Fiction",
  "Fantasy",
  "Science",
  "History",
  "Mystery",
];

const DEFAULT_UI_STATE = {
  search: "",
  sort: "added-desc",
  subject: "Semua",
};

const getBookTitle = (book) => book?.title || "Judul tidak tersedia";

const getBookAuthor = (book) =>
  book?.author || book?.author_name?.join(", ") || "Penulis tidak diketahui";

const getBookYear = (book) => book?.year || book?.first_publish_year || "-";

const getBookRating = (book) => Number(book?.rating) || 0;

const getBookCover = (book) => book?.cover || "";

const getBookPublisher = (book) => {
  if (typeof book?.publisher === "string" && book.publisher.trim()) {
    return book.publisher;
  }
  if (Array.isArray(book?.publisher) && book.publisher.length > 0) {
    return book.publisher.slice(0, 2).join(", ");
  }
  if (Array.isArray(book?.publishers) && book.publishers.length > 0) {
    return book.publishers.slice(0, 2).join(", ");
  }
  return null;
};

const getBookSubjects = (book) => {
  const values = [
    ...(book?.subjects || []),
    ...(book?.subject || []),
    book?.genre,
    ...(book?.genres || []),
    ...(book?.tags || []),
  ].filter(Boolean);

  return [...new Set(values.map((value) => String(value).trim()))];
};

const getPrimarySubject = (book) => getBookSubjects(book)[0] || null;

const bookMatchesSubject = (book, subject) => {
  if (!subject || subject === "Semua") return true;

  const normalizedSubject = subject.toLowerCase();
  return getBookSubjects(book).some((value) =>
    value.toLowerCase().includes(normalizedSubject),
  );
};

const bookMatchesSearch = (book, query) => {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const title = getBookTitle(book).toLowerCase();
  const author = getBookAuthor(book).toLowerCase();

  return title.includes(normalizedQuery) || author.includes(normalizedQuery);
};

const sortFavoriteBooks = (books, sort) => {
  const result = [...books];

  switch (sort) {
    case "added-asc":
      return result.sort(
        (a, b) => (a.favoritedAt || 0) - (b.favoritedAt || 0),
      );
    case "title-asc":
      return result.sort((a, b) =>
        getBookTitle(a).localeCompare(getBookTitle(b)),
      );
    case "title-desc":
      return result.sort((a, b) =>
        getBookTitle(b).localeCompare(getBookTitle(a)),
      );
    case "year-desc":
      return result.sort(
        (a, b) =>
          (Number(getBookYear(b)) || 0) - (Number(getBookYear(a)) || 0),
      );
    case "rating-desc":
      return result.sort(
        (a, b) => getBookRating(b) - getBookRating(a),
      );
    case "added-desc":
    default:
      return result.sort(
        (a, b) => (b.favoritedAt || 0) - (a.favoritedAt || 0),
      );
  }
};

const readUiState = () => {
  try {
    const saved = sessionStorage.getItem(FAVORITES_UI_STATE_KEY);
    if (!saved) return DEFAULT_UI_STATE;
    return { ...DEFAULT_UI_STATE, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_UI_STATE;
  }
};

const FavoriteBookCard = memo(function FavoriteBookCard({
  book,
  onDetail,
  onRemove,
}) {
  const title = getBookTitle(book);
  const authors = getBookAuthor(book);
  const year = getBookYear(book);
  const rating = getBookRating(book);
  const coverUrl = getBookCover(book);
  const subject = getPrimarySubject(book);
  const publisher = getBookPublisher(book);

  const gradients = [
    "from-primary to-secondary",
    "from-textMain to-primary",
    "from-accentHover to-primary",
    "from-primary to-accent",
  ];
  const gradient = gradients[title.charCodeAt(0) % gradients.length];

  return (
    <article
      className="book-card group mx-auto flex h-full w-full max-w-sm flex-col sm:max-w-none"
      aria-label={`Buku favorit: ${title} oleh ${authors}`}
    >
      <figure className="relative aspect-[2/3] shrink-0 overflow-hidden border-b border-borderSoft bg-cream">
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${gradient} p-5`}
          aria-hidden="true"
        >
          <Icon name="bookOpen" className="mb-2 h-8 w-8 text-white/70" />
          <p className="font-playfair text-center text-sm leading-relaxed text-white/85 line-clamp-3">
            {title}
          </p>
        </div>

        {coverUrl && (
          <img
            src={coverUrl}
            alt={`Sampul buku ${title}`}
            loading="lazy"
            className="relative z-[1] h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}

        <figcaption className="sr-only">
          {title} - {authors}
        </figcaption>

        <button
          type="button"
          className="absolute right-2 top-2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-500 bg-red-500 text-white transition-all duration-200 hover:bg-red-600"
          aria-label={`Hapus ${title} dari favorit`}
          aria-pressed="true"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(book);
          }}
        >
          <Icon name="heart" className="h-4 w-4" strokeWidth={2.4} />
        </button>

        <div
          className="absolute inset-0 z-10 flex translate-y-2 items-center justify-center bg-primary/70 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
        >
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            aria-label={`Lihat detail buku ${title}`}
            onClick={() => onDetail(book)}
          >
            Lihat Detail
          </button>
        </div>
      </figure>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {subject && (
          <p className="section-label mb-1 min-h-[1rem] truncate">{subject}</p>
        )}

        <h3 className="mb-1 line-clamp-2 min-h-[2.75rem] font-playfair text-base font-semibold leading-snug text-textMain transition-colors duration-200 group-hover:text-accentHover">
          {title}
        </h3>

        <p className="mb-2 line-clamp-1 font-crimson text-sm text-textSecondary">
          {authors}
        </p>

        <div className="mb-3 space-y-1 font-crimson text-xs text-textSecondary">
          <p>
            Tahun Terbit:{" "}
            <span className="font-semibold text-textMain">{year}</span>
          </p>
          {publisher && (
            <p className="line-clamp-1">
              Penerbit:{" "}
              <span className="font-semibold text-textMain">{publisher}</span>
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <div
            className="flex items-center gap-1"
            aria-label={
              rating ? `Rating ${formatRating(rating)}` : "Rating belum tersedia"
            }
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                aria-hidden="true"
                className={`h-3 w-3 ${
                  star <= Math.round(rating) ? "text-accent" : "text-borderSoft"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-0.5 font-crimson text-xs text-textSecondary">
              {formatRating(rating)}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-500 bg-red-500 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-red-600"
            aria-label={`Hapus ${title} dari favorit`}
            aria-pressed="true"
            onClick={() => onRemove(book)}
          >
            <Icon name="heart" className="h-3.5 w-3.5" strokeWidth={2} />
            Hapus dari Favorit
          </button>
        </div>
      </div>
    </article>
  );
});

function FavoritesEmptyState() {
  return (
    <div className="rounded-lg border border-borderSoft bg-white p-8 text-center shadow-book">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-cream text-accentHover">
        <Icon name="bookOpen" className="h-7 w-7" strokeWidth={2} />
      </div>
      <p className="font-playfair text-lg font-semibold text-textMain">
        Belum ada buku favorit.
      </p>
      <p className="mx-auto mt-1 max-w-md font-crimson text-sm text-textSecondary">
        Simpan buku dari halaman Katalog atau Jelajah agar muncul di sini.
      </p>
      <Link to="/" className="btn-primary mt-5 inline-flex">
        Jelajahi Buku
      </Link>
    </div>
  );
}

function FavoritesFilteredEmptyState({ onReset }) {
  return (
    <div className="rounded-lg border border-borderSoft bg-white p-8 text-center shadow-book">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-cream text-accentHover">
        <Icon name="search" className="h-7 w-7" strokeWidth={2} />
      </div>
      <p className="font-playfair text-lg font-semibold text-textMain">
        Tidak ada buku favorit yang cocok
      </p>
      <p className="mx-auto mt-1 max-w-md font-crimson text-sm text-textSecondary">
        Coba ubah kata kunci pencarian, filter subjek, atau urutan tampilan.
      </p>
      <button type="button" className="btn-secondary mt-5" onClick={onReset}>
        Reset Filter
      </button>
    </div>
  );
}

function FavoritesErrorState({ message, onReload }) {
  return (
    <div className="rounded-lg border border-red-100 bg-white p-8 text-center shadow-book">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-accentHover">
        <Icon name="info" className="h-7 w-7" strokeWidth={2} />
      </div>
      <p className="font-playfair text-lg font-semibold text-textMain">
        Gagal Memuat Favorit
      </p>
      <p className="mx-auto mt-1 max-w-md font-crimson text-sm text-textSecondary">
        {message ||
          "Terjadi kesalahan saat membaca data favorit. Silakan muat ulang halaman."}
      </p>
      <button type="button" className="btn-primary mt-5" onClick={onReload}>
        <Icon name="refresh" className="h-4 w-4" />
        Muat Ulang
      </button>
    </div>
  );
}

export default function FavoritesPage() {
  const {
    favoriteBooks,
    favoriteIds,
    loading,
    error,
    reloadFavorites,
    toggleFavorite,
  } = useFavorites();
  const { showToast } = useNotification();

  const [uiState, setUiState] = useState(readUiState);
  const [selectedBook, setSelectedBook] = useState(null);

  const debouncedSearch = useDebounce(uiState.search, 300);

  useEffect(() => {
    sessionStorage.setItem(FAVORITES_UI_STATE_KEY, JSON.stringify(uiState));
  }, [uiState]);

  const availableSubjects = useMemo(() => {
    const dynamicSubjects = new Set();

    favoriteBooks.forEach((book) => {
      getBookSubjects(book).forEach((subject) => {
        SUBJECT_FILTERS.slice(1).forEach((filter) => {
          if (subject.toLowerCase().includes(filter.toLowerCase())) {
            dynamicSubjects.add(filter);
          }
        });
      });
    });

    const ordered = SUBJECT_FILTERS.filter(
      (subject) => subject === "Semua" || dynamicSubjects.has(subject),
    );

    return ordered.length > 1 ? ordered : ["Semua"];
  }, [favoriteBooks]);

  const filteredBooks = useMemo(() => {
    const searched = favoriteBooks.filter(
      (book) =>
        bookMatchesSearch(book, debouncedSearch) &&
        bookMatchesSubject(book, uiState.subject),
    );

    return sortFavoriteBooks(searched, uiState.sort);
  }, [favoriteBooks, debouncedSearch, uiState.subject, uiState.sort]);

  const handleSearchChange = useCallback((event) => {
    setUiState((current) => ({ ...current, search: event.target.value }));
  }, []);

  const handleSortChange = useCallback((event) => {
    setUiState((current) => ({ ...current, sort: event.target.value }));
  }, []);

  const handleSubjectChange = useCallback((subject) => {
    setUiState((current) => ({ ...current, subject }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setUiState(DEFAULT_UI_STATE);
  }, []);

  const handleDetail = useCallback((book) => {
    setSelectedBook(book);
  }, []);

  const handleRemove = useCallback(
    (book) => {
      toggleFavorite(book);
      showToast(
        "Dihapus dari favorit",
        `${getBookTitle(book)} telah dihapus dari koleksi favorit.`,
        "info",
      );
    },
    [toggleFavorite, showToast],
  );

  const handleReload = useCallback(() => {
    reloadFavorites();
  }, [reloadFavorites]);

  const isBookFavorite = useCallback(
    (book) => (book ? favoriteIds.has(getBookId(book)) : false),
    [favoriteIds],
  );

  const hasActiveFilters =
    uiState.search.trim() !== "" ||
    uiState.subject !== "Semua" ||
    uiState.sort !== DEFAULT_UI_STATE.sort;

  return (
    <>
      <section
        id="favorit"
        aria-labelledby="favorite-heading"
        className="mx-auto min-h-[70vh] max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="section-label">Rak Pribadi</p>
            <h1
              id="favorite-heading"
              className="font-playfair text-3xl font-bold text-textMain"
            >
              Buku Favorit
            </h1>
            <p className="mt-2 font-crimson text-sm text-textSecondary">
              Kelola koleksi buku favorit yang telah kamu simpan.
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-lg border border-borderSoft bg-white px-4 py-2 text-sm font-semibold text-textSecondary shadow-book"
            aria-live="polite"
          >
            <Icon name="heart" className="h-4 w-4 text-accent" />
            <span>{favoriteBooks.length} Buku Favorit</span>
          </div>
        </div>

        {error ? (
          <FavoritesErrorState message={error} onReload={handleReload} />
        ) : loading ? (
          <div className="book-grid" aria-busy="true" aria-label="Memuat buku favorit">
            {Array.from({ length: 4 }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </div>
        ) : favoriteBooks.length === 0 ? (
          <FavoritesEmptyState />
        ) : (
          <>
            <div className="mb-6 space-y-4 rounded-xl border border-borderSoft bg-white p-4 shadow-book sm:p-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
                <div>
                  <label htmlFor="favorite-search" className="section-label mb-1.5 block">
                    Cari Favorit
                  </label>
                  <div className="relative">
                    <Icon
                      name="search"
                      className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary"
                    />
                    <input
                      id="favorite-search"
                      type="search"
                      value={uiState.search}
                      onChange={handleSearchChange}
                      placeholder="Cari berdasarkan judul atau penulis..."
                      autoComplete="off"
                      aria-label="Cari buku favorit berdasarkan judul atau penulis"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="favorite-sort" className="section-label mb-1.5 block">
                    Urutkan
                  </label>
                  <div className="relative">
                    <select
                      id="favorite-sort"
                      value={uiState.sort}
                      onChange={handleSortChange}
                      className="input-field appearance-none bg-white pr-10"
                      aria-label="Urutkan buku favorit"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="chevronDown"
                      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary"
                    />
                  </div>
                </div>
              </div>

              {availableSubjects.length > 1 && (
                <div>
                  <p className="section-label mb-2">Filter Subjek</p>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Filter subjek buku favorit"
                  >
                    {availableSubjects.map((subject) => {
                      const isActive = uiState.subject === subject;
                      return (
                        <button
                          key={subject}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => handleSubjectChange(subject)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                            isActive
                              ? "border-primary bg-primary text-white"
                              : "border-borderSoft bg-cream text-textSecondary hover:border-accent hover:text-accentHover"
                          }`}
                        >
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="btn-secondary py-2 text-xs"
                    onClick={handleResetFilters}
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {filteredBooks.length > 0 ? (
              <div className="book-grid">
                {filteredBooks.map((book) => (
                  <FavoriteBookCard
                    key={getBookId(book)}
                    book={book}
                    onDetail={handleDetail}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            ) : (
              <FavoritesFilteredEmptyState onReset={handleResetFilters} />
            )}
          </>
        )}
      </section>

      <BookModal
        key={selectedBook ? getBookId(selectedBook) : "favorites-book-modal"}
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        isFavorite={isBookFavorite(selectedBook)}
        onToggleFavorite={toggleFavorite}
        onToast={showToast}
      />
    </>
  );
}
