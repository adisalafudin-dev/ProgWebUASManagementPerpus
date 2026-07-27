import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import bookApi from "../services/bookApi";
import borrowingApi from "../services/borrowingApi";
import { formatBackendBook } from "../utils/bookFormatter";
import { useFavorites } from "../contexts/FavoriteContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import Icon from "../components/Icon";
import BookReviewSection from "../components/BookReviewSection";
import aksaraToast from "../utils/toast";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBorrowing, setIsBorrowing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    bookApi
      .getBookById(id)
      .then((data) => {
        if (isMounted) {
          setBook(formatBackendBook(data));
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Gagal mengambil detail buku:", err);
          setError(
            err?.message || "Buku tidak ditemukan atau server mengalami kendala."
          );
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isFavorite = book ? favoriteIds.has(book.id) : false;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-32 rounded bg-borderSoft/60" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="aspect-[2/3] w-full rounded-2xl bg-borderSoft/60" />
            <div className="space-y-4 md:col-span-2">
              <div className="h-8 w-3/4 rounded bg-borderSoft/60" />
              <div className="h-4 w-1/2 rounded bg-borderSoft/60" />
              <div className="grid grid-cols-2 gap-4 py-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-borderSoft/40" />
                ))}
              </div>
              <div className="h-28 rounded-xl bg-borderSoft/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <section className="mx-auto min-h-[60vh] max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-book">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Icon name="info" className="h-7 w-7" />
          </div>
          <h2 className="font-playfair text-2xl font-bold text-textMain mb-2">
            Buku Tidak Ditemukan
          </h2>
          <p className="font-crimson text-textSecondary mb-6">
            {error || "Mohon periksa kembali tautan yang Anda gunakan atau kembali ke katalog."}
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/books")}
            >
              <Icon name="arrowLeft" className="h-4 w-4" />
              Kembali ke Katalog
            </button>
          </div>
        </div>
      </section>
    );
  }

  const categoryName = book.categoryName || book.genre || "Tidak ada kategori";
  const isAvailable = (book.stock ?? 0) > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb / Back button */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-textSecondary">
        <Link to="/books" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
          <Icon name="arrowLeft" className="h-4 w-4" />
          Katalog Buku
        </Link>
        <span>/</span>
        <span className="truncate max-w-xs text-textMain font-medium">{book.title}</span>
      </nav>

      {/* Main Detail Card */}
      <div className="overflow-hidden rounded-3xl border border-borderSoft bg-white p-6 shadow-book lg:p-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr] lg:gap-12">
          {/* Cover & Quick Actions */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-2xl border border-borderSoft bg-cream shadow-md">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={`Sampul ${book.title}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-primary to-accent">
                  <Icon name="bookOpen" className="h-16 w-16 text-white/50 mb-3" />
                  <p className="font-playfair text-white font-bold text-base">{book.title}</p>
                </div>
              )}
              <span
                className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow-md ${
                  isAvailable
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-red-500 text-white"
                }`}
              >
                {isAvailable ? `Tersedia (${book.stock} Stok)` : "Dipinjam / Stok Habis"}
              </span>
            </div>

            {/* Favorite Button */}
            <button
              type="button"
              className={`w-full max-w-[280px] inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isFavorite
                  ? "border-red-500 bg-red-500 text-white hover:bg-red-600 shadow-sm"
                  : "border-borderSoft bg-white text-textMain hover:border-red-500 hover:text-red-500"
              }`}
              onClick={() => toggleFavorite(book)}
            >
              <Icon name="heart" className="h-4 w-4" strokeWidth={2} />
              {isFavorite ? "Hapus dari Favorit" : "Simpan ke Favorit"}
            </button>
          </div>

          {/* Book Info & Specs */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-cream border border-borderSoft px-3 py-1 text-xs font-semibold text-accentHover">
                <Icon name="tag" className="h-3.5 w-3.5" />
                <span>{categoryName}</span>
              </div>

              <h1 className="font-playfair text-3xl font-extrabold text-textMain sm:text-4xl leading-tight">
                {book.title}
              </h1>

              <p className="mt-2 text-lg text-textSecondary font-crimson">
                Penulis: <span className="font-semibold text-textMain">{book.author}</span>
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-borderSoft bg-cream/50 p-3.5">
                <p className="text-xs text-textSecondary font-semibold uppercase tracking-wider">Penerbit</p>
                <p className="mt-1 font-playfair font-bold text-sm text-textMain truncate">
                  {book.publisher || "Tidak tersedia"}
                </p>
              </div>

              <div className="rounded-xl border border-borderSoft bg-cream/50 p-3.5">
                <p className="text-xs text-textSecondary font-semibold uppercase tracking-wider">Tahun Terbit</p>
                <p className="mt-1 font-playfair font-bold text-sm text-textMain">
                  {book.publishedYear || book.year || "Tidak tersedia"}
                </p>
              </div>

              <div className="rounded-xl border border-borderSoft bg-cream/50 p-3.5">
                <p className="text-xs text-textSecondary font-semibold uppercase tracking-wider">ISBN</p>
                <p className="mt-1 font-playfair font-bold text-sm text-textMain truncate">
                  {book.isbn || "Tidak tersedia"}
                </p>
              </div>

              <div className="rounded-xl border border-borderSoft bg-cream/50 p-3.5">
                <p className="text-xs text-textSecondary font-semibold uppercase tracking-wider">Jumlah Halaman</p>
                <p className="mt-1 font-playfair font-bold text-sm text-textMain">
                  {book.pages ? `${book.pages} halaman` : "Tidak tersedia"}
                </p>
              </div>

              <div className="rounded-xl border border-borderSoft bg-cream/50 p-3.5">
                <p className="text-xs text-textSecondary font-semibold uppercase tracking-wider">Stok Buku</p>
                <p className="mt-1 font-playfair font-bold text-sm text-textMain">
                  {book.stock ?? 0} Eksemplar
                </p>
              </div>

              <div className="rounded-xl border border-borderSoft bg-cream/50 p-3.5">
                <p className="text-xs text-textSecondary font-semibold uppercase tracking-wider">Status</p>
                <p className={`mt-1 font-playfair font-bold text-sm ${isAvailable ? "text-emerald-700" : "text-red-600"}`}>
                  {isAvailable ? "Tersedia" : "Tidak Tersedia"}
                </p>
              </div>
            </div>

            {/* Synopsis Section */}
            <div className="rounded-2xl border border-borderSoft bg-cream/30 p-5">
              <h3 className="section-label mb-2 text-xs uppercase tracking-wider text-accentHover">
                Sinopsis Buku
              </h3>
              <p className="text-sm leading-relaxed text-textSecondary font-crimson text-justify">
                {book.synopsis || "Belum ada sinopsis resmi untuk buku ini."}
              </p>
            </div>

            {/* Actions — Borrow */}
            <div className="pt-4 border-t border-borderSoft flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                disabled={!isAvailable || isBorrowing}
                className={`btn-primary py-3 px-8 text-base justify-center flex-1 sm:flex-none ${
                  !isAvailable || isBorrowing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={async () => {
                  if (!isAuthenticated) {
                    aksaraToast.error("Silakan login untuk meminjam buku.");
                    navigate("/login");
                    return;
                  }
                  setIsBorrowing(true);
                  try {
                    await borrowingApi.borrowBook(book.id);
                    aksaraToast.success(`Buku "${book.title}" berhasil dipinjam!`);
                    // Refresh book data to update stock
                    const refreshed = await bookApi.getBookById(id);
                    setBook(formatBackendBook(refreshed));
                  } catch (err) {
                    const msg = err?.response?.data?.message || "Gagal meminjam buku.";
                    if (msg.toLowerCase().includes("stok")) {
                      aksaraToast.error("Stok buku habis. Buku ini sudah dipinjam oleh pengguna lain.");
                      // Refresh to show updated stock
                      const refreshed = await bookApi.getBookById(id).catch(() => null);
                      if (refreshed) setBook(formatBackendBook(refreshed));
                    } else {
                      aksaraToast.error(msg);
                    }
                  } finally {
                    setIsBorrowing(false);
                  }
                }}
              >
                <Icon name="bookOpen" className="h-5 w-5" />
                {isBorrowing
                  ? "Memproses..."
                  : isAvailable
                    ? "Pinjam Buku Ini"
                    : "Stok Tidak Tersedia"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-borderSoft bg-white p-6 shadow-book lg:p-8">
        <BookReviewSection bookId={book.id} />
      </div>
    </div>
  );
}
