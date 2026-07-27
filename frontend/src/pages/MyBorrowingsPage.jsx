import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import borrowingApi from "../services/borrowingApi";
import aksaraToast from "../utils/toast";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function BorrowingCard({ borrowing, onReturn }) {
  const book = borrowing.book;
  const isBorrowed = borrowing.status === "dipinjam";
  const [isReturning, setIsReturning] = useState(false);

  const handleReturn = async () => {
    if (!window.confirm(`Kembalikan buku "${book?.title}"?`)) return;
    setIsReturning(true);
    try {
      await onReturn(borrowing.id);
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-borderSoft bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Book Cover */}
      <div className="flex-shrink-0">
        {book?.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="h-32 w-20 rounded-lg object-cover shadow-sm sm:h-36 sm:w-24"
          />
        ) : (
          <div className="flex h-32 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent sm:h-36 sm:w-24">
            <Icon name="bookOpen" className="h-8 w-8 text-white/60" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/books/${book?.id}`}
                className="font-playfair text-base font-bold text-textMain hover:text-accentHover transition-colors line-clamp-1"
              >
                {book?.title || "Buku tidak tersedia"}
              </Link>
              <p className="text-sm text-textSecondary font-crimson mt-0.5">
                {book?.author || "Penulis tidak diketahui"}
              </p>
            </div>
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                isBorrowed
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <Icon
                name={isBorrowed ? "clock" : "check"}
                className="h-3 w-3"
              />
              {isBorrowed ? "Dipinjam" : "Dikembalikan"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-textSecondary">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" className="h-3.5 w-3.5" />
              Tanggal Pinjam: <strong className="text-textMain">{formatDate(borrowing.borrowDate)}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" className="h-3.5 w-3.5" />
              Tanggal Kembali: <strong className="text-textMain">{formatDate(borrowing.returnDate)}</strong>
            </span>
          </div>
        </div>

        {isBorrowed && (
          <button
            type="button"
            onClick={handleReturn}
            disabled={isReturning}
            className={`self-start inline-flex items-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 ${
              isReturning ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
            {isReturning ? "Mengembalikan..." : "Kembalikan Buku"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyBorrowingsPage() {
  const [borrowings, setBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dipinjam");

  const loadBorrowings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await borrowingApi.getMyBorrowings();
      setBorrowings(data || []);
      setError(null);
    } catch (err) {
      setError("Gagal memuat data peminjaman.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBorrowings();
  }, [loadBorrowings]);

  const handleReturn = async (id) => {
    try {
      await borrowingApi.returnBook(id);
      aksaraToast.success("Buku berhasil dikembalikan!");
      loadBorrowings();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mengembalikan buku.";
      aksaraToast.error(msg);
    }
  };

  const activeBorrowings = useMemo(
    () => borrowings.filter((b) => b.status === "dipinjam"),
    [borrowings]
  );
  const returnedBorrowings = useMemo(
    () => borrowings.filter((b) => b.status === "dikembalikan"),
    [borrowings]
  );

  const displayed = activeTab === "dipinjam" ? activeBorrowings : returnedBorrowings;

  const tabs = [
    { id: "dipinjam", label: "Sedang Dipinjam", count: activeBorrowings.length },
    { id: "dikembalikan", label: "Riwayat", count: returnedBorrowings.length },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-playfair text-2xl font-bold text-textMain sm:text-3xl">
          Buku Saya
        </h1>
        <p className="mt-1 text-sm text-textSecondary font-crimson">
          Kelola peminjaman buku Anda di sini.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-1 rounded-xl bg-cream/60 p-1 border border-borderSoft">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-bold transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? "bg-white text-primary shadow-sm"
                : "text-textSecondary hover:text-textMain hover:bg-white/50"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.id
                  ? "bg-accent/10 text-accentHover"
                  : "bg-borderSoft/50 text-textSecondary"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-borderSoft bg-white p-5">
              <div className="flex gap-4">
                <div className="h-32 w-20 rounded-lg bg-borderSoft/50" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-borderSoft/50" />
                  <div className="h-4 w-1/2 rounded bg-borderSoft/40" />
                  <div className="h-3 w-1/3 rounded bg-borderSoft/30" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
          <Icon name="info" className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="text-sm text-red-600 font-semibold">{error}</p>
          <button
            onClick={loadBorrowings}
            className="mt-4 btn-primary py-2 px-6 text-sm"
          >
            Coba Lagi
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borderSoft bg-cream/30 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream text-textSecondary">
            <Icon name="bookOpen" className="h-8 w-8" />
          </div>
          <h3 className="font-playfair text-lg font-bold text-textMain">
            {activeTab === "dipinjam"
              ? "Tidak ada buku yang sedang dipinjam"
              : "Belum ada riwayat pengembalian"}
          </h3>
          <p className="mt-2 text-sm text-textSecondary max-w-sm mx-auto font-crimson">
            {activeTab === "dipinjam"
              ? "Jelajahi katalog dan mulai pinjam buku yang Anda inginkan."
              : "Riwayat pengembalian buku Anda akan muncul di sini."}
          </p>
          {activeTab === "dipinjam" && (
            <Link to="/books" className="btn-primary mt-6 inline-flex py-2 px-6 text-sm">
              <Icon name="search" className="h-4 w-4" />
              Jelajahi Katalog
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((borrowing) => (
            <BorrowingCard
              key={borrowing.id}
              borrowing={borrowing}
              onReturn={handleReturn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
