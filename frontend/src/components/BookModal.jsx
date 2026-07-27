import { useCallback, useEffect, useRef, useState } from "react";
import bookApi from "../services/bookApi";
import { formatBackendBook } from "../utils/bookFormatter";
import Icon from "./Icon";
import aksaraToast from "../utils/toast.js";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const normalizeDescription = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value?.value === "string") return value.value.trim();
  return "";
};

const NA = "Tidak tersedia";

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded bg-borderSoft/60 ${className}`}
      aria-hidden="true"
    />
  );
}

function ModalSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row">
      {/* cover skeleton */}
      <div className="sm:w-56 flex-shrink-0 bg-borderSoft/30 flex items-center justify-center min-h-72">
        <SkeletonBlock className="w-full h-full min-h-72" />
      </div>

      {/* info skeleton */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-6 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
          </div>
          <SkeletonBlock className="h-8 w-20 rounded-lg" />
        </div>

        {/* info grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="rounded-lg border border-borderSoft bg-white px-3 py-2"
            >
              <SkeletonBlock className="h-2.5 w-16 mb-1.5" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* subjects */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <SkeletonBlock key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>

        {/* synopsis */}
        <div className="rounded-lg border border-borderSoft bg-white px-4 py-3 flex flex-col gap-1.5">
          <SkeletonBlock className="h-3 w-20 mb-1" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-5/6" />
          <SkeletonBlock className="h-3 w-4/6" />
        </div>

        {/* buttons */}
        <div className="flex gap-3 mt-auto">
          <SkeletonBlock className="h-10 w-36 rounded-lg" />
          <SkeletonBlock className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────

function ModalError({ message, onRetry, onClose }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <Icon name="info" className="h-8 w-8 text-red-500" strokeWidth={1.8} />
      </div>
      <div>
        <p className="font-playfair text-lg font-semibold text-textMain mb-1">
          Gagal Memuat Detail Buku
        </p>
        <p className="text-sm text-textSecondary max-w-sm">
          {message || "Terjadi kesalahan saat mengambil data dari server."}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="btn-primary text-sm py-2 px-4"
          onClick={onRetry}
        >
          <Icon name="refresh" className="h-4 w-4" strokeWidth={2} />
          Coba Lagi
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm py-2 px-4 rounded-lg border border-borderSoft bg-white text-textSecondary hover:border-accentHover hover:text-accentHover font-semibold transition-all duration-200"
          onClick={onClose}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  const display = value || NA;
  return (
    <div className="rounded-lg border border-borderSoft bg-white px-3 py-2">
      <p className="text-xs text-textSecondary font-crimson">{label}</p>
      <p className="font-playfair font-semibold text-textMain text-sm break-words">
        {display}
      </p>
    </div>
  );
}

// ─── Subject Badges ────────────────────────────────────────────────────────────

function SubjectBadges({ subjects }) {
  if (!subjects || subjects.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {subjects.slice(0, 10).map((subject) => (
        <span
          key={subject}
          className="inline-block text-[11px] font-crimson font-semibold bg-cream text-secondary px-2.5 py-0.5 rounded-full border border-borderSoft leading-5"
        >
          {subject}
        </span>
      ))}
      {subjects.length > 10 && (
        <span className="inline-block text-[11px] font-crimson text-textSecondary px-2.5 py-0.5">
          +{subjects.length - 10} lainnya
        </span>
      )}
    </div>
  );
}

// ─── Synopsis ─────────────────────────────────────────────────────────────────

function Synopsis({ text }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) {
    return (
      <div className="rounded-lg border border-borderSoft bg-white px-4 py-3">
        <p className="section-label mb-1">Sinopsis</p>
        <p className="text-sm text-textSecondary italic">{NA}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-borderSoft bg-white px-4 py-3">
      <p className="section-label mb-1.5">Sinopsis</p>
      <p
        className={`text-sm leading-relaxed text-textSecondary transition-all duration-300 ${
          expanded ? "" : "line-clamp-5"
        }`}
      >
        {text}
      </p>
      {text.length > 300 && (
        <button
          type="button"
          className="mt-2 text-xs font-semibold font-crimson text-accent hover:text-accentHover transition-colors duration-150"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Tampilkan lebih sedikit ↑" : "Lihat Selengkapnya ↓"}
        </button>
      )}
    </div>
  );
}

// ─── Cover ────────────────────────────────────────────────────────────────────

function BookCover({ src, title }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="sm:w-56 flex-shrink-0 overflow-hidden bg-borderSoft/30 flex items-center justify-center"
      style={{ minHeight: "18rem" }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={`Sampul ${title}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
          style={{
            borderRadius: "0",
            boxShadow: "inset -4px 0 8px -4px rgba(28,27,25,0.18)",
          }}
        />
      ) : (
        <div
          className="w-full flex flex-col items-center justify-center gap-3 p-6"
          style={{
            minHeight: "18rem",
            background: "linear-gradient(135deg, #18332f 0%, #7a2e2e 100%)",
          }}
        >
          <Icon name="bookOpen" className="h-12 w-12 text-white/40" strokeWidth={1.2} />
          <p className="font-playfair text-white/70 text-center text-sm leading-relaxed">
            {title}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BookModal({
  book,
  onClose = () => {},
  isFavorite = false,
  onToggleFavorite,
  onToast,
}) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const retryCountRef = useRef(0);

  // Derive the book ID for the detail fetch
  const bookId = book?.id || book?.key || "";

  const fetchDetail = useCallback(() => {
    if (!bookId) {
      setDetail(null);
      setIsLoading(false);
      setFetchError(null);
      return undefined;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setFetchError(null);
    setDetail(null);

    bookApi
      .getBookById(bookId)
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetail(formatBackendBook(data));
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setFetchError(error?.message || "Gagal mengambil data.");
          setIsLoading(false);
          aksaraToast.bookDetailError();
        }
      });

    return () => controller.abort();
  }, [bookId]);

  // Fetch detail whenever the book changes
  useEffect(() => {
    if (!book) return undefined;
    retryCountRef.current = 0;
    return fetchDetail();
  }, [book, fetchDetail]);

  // Keyboard Escape handler
  useEffect(() => {
    if (!book) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [book, onClose]);

  if (!book) return null;

  // Merge card-level data with detail-level data (detail takes priority)
  const merged = detail
    ? detail
    : {
        title: book.title || "",
        subtitle: book.subtitle || "",
        author: book.author || book.authors?.join(", ") || "",
        publisher: Array.isArray(book.publishers)
          ? book.publishers.slice(0, 2).join(", ")
          : book.publisher || "",
        year: book.year || book.publishedYear || "",
        isbn: Array.isArray(book.isbn) ? book.isbn[0] : book.isbn || "",
        languages: book.languages || [],
        pages: book.pages || "",
        subjects: book.subjects || [],
        description: book.synopsis || book.description || "",
        cover: book.cover || "",
        stock: book.stock ?? 0,
        genre: book.genre || "",
      };

  const title = merged.title || book.title || "Judul tidak tersedia";
  const subtitle = merged.subtitle || "";
  const description = normalizeDescription(merged.description);

  // Format display values
  const formatPublisher = () => {
    if (Array.isArray(merged.publisher)) return merged.publisher.join(", ") || null;
    return merged.publisher || null;
  };

  const formatLanguage = () => {
    if (Array.isArray(merged.languages)) return merged.languages.join(", ") || null;
    return merged.languages || null;
  };

  const formatIsbn = () => {
    if (Array.isArray(merged.isbn)) return merged.isbn[0] || null;
    return merged.isbn || null;
  };

  const isAvailable = (merged.stock ?? 0) > 0;

  const infoRows = [
    { label: "Penulis", value: merged.author || null },
    { label: "Penerbit", value: formatPublisher() },
    { label: "Tahun Terbit", value: merged.year ? String(merged.year) : null },
    { label: "ISBN", value: formatIsbn() },
    { label: "Bahasa", value: formatLanguage() },
    { label: "Jumlah Halaman", value: merged.pages ? `${merged.pages} halaman` : null },
    { label: "Stok", value: merged.stock != null ? `${merged.stock} eksemplar` : null },
    { label: "Status", value: isAvailable ? "Tersedia" : "Tidak Tersedia" },
  ];

  const handleToggleFavorite = () => {
    onToggleFavorite?.(book);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(24, 51, 47, 0.76)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Detail buku: ${title}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-xl bg-cream text-textMain shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* ── Modal Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-borderSoft bg-white/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="bookOpen" className="h-4 w-4 text-accent" strokeWidth={2} />
            <span className="section-label">Detail Buku</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-borderSoft bg-white px-3 py-1.5 text-sm font-semibold text-textSecondary transition-colors hover:border-accent hover:text-accentHover"
            aria-label="Tutup detail buku"
            onClick={onClose}
          >
            <Icon name="close" className="h-4 w-4" strokeWidth={2} />
            Tutup
          </button>
        </div>

        {/* ── Scrollable Body ────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <ModalSkeleton />
          ) : fetchError ? (
            <ModalError
              message={fetchError}
              onClose={onClose}
              onRetry={() => {
                retryCountRef.current += 1;
                fetchDetail();
              }}
            />
          ) : (
            <div className="flex flex-col sm:flex-row">
              {/* ── Left: Cover ─────────────────────────────────────────── */}
              <BookCover src={merged.cover} title={title} />

              {/* ── Right: Information ───────────────────────────────────── */}
              <div className="flex-1 flex flex-col gap-4 p-5">
                {/* Title */}
                <div>
                  <h2 className="font-playfair font-bold text-2xl text-textMain leading-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 text-sm text-textSecondary font-crimson italic">
                      {subtitle}
                    </p>
                  )}
                </div>

                {/* Info Grid */}
                <div>
                  <p className="section-label mb-2">Informasi Buku</p>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {infoRows.map(({ label, value }) => (
                      <InfoRow key={label} label={label} value={value} />
                    ))}
                  </div>
                </div>

                {/* Subjects */}
                {merged.subjects?.length > 0 ? (
                  <div>
                    <p className="section-label mb-2">Kategori</p>
                    <SubjectBadges subjects={merged.subjects} />
                  </div>
                ) : merged.genre ? (
                  <div>
                    <p className="section-label mb-2">Kategori</p>
                    <SubjectBadges subjects={[merged.genre]} />
                  </div>
                ) : (
                  <div>
                    <p className="section-label mb-2">Kategori</p>
                    <p className="text-sm text-textSecondary italic">{NA}</p>
                  </div>
                )}

                {/* Synopsis */}
                <Synopsis text={description} />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-auto pt-1">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 text-sm py-2.5 px-4 rounded-lg border font-semibold transition-all duration-200 ${
                      isFavorite
                        ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                        : "border-borderSoft bg-white text-textSecondary hover:border-red-500 hover:text-red-500"
                    }`}
                    onClick={handleToggleFavorite}
                    aria-pressed={isFavorite}
                  >
                    <Icon name="heart" className="h-4 w-4" strokeWidth={2} />
                    {isFavorite ? "Hapus Favorit" : "Simpan Favorit"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
