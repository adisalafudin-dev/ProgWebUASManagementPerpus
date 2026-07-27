import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import AdminBookModal from "../../components/admin/AdminBookModal";
import { bookApi } from "../../services/bookApi.js";
import categoryApi from "../../services/categoryApi.js";

const unavailable = "Tidak tersedia";

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Memuat detail buku">
      <div className="h-7 w-44 rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="aspect-[2/3] rounded-2xl bg-slate-200" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 rounded bg-slate-200" />
          <div className="h-5 w-1/2 rounded bg-slate-100" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-20 rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="h-32 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function DataCard({ label, value, className = "" }) {
  const hasData = Array.isArray(value) ? value.length > 0 : Boolean(value);
  const text = Array.isArray(value) ? value.join(", ") : value;

  return (
    <article
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${hasData ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
        >
          {hasData ? "Ada Data" : "Kosong"}
        </span>
      </div>
      <p className="mt-2 break-words text-sm font-medium leading-relaxed text-slate-800">
        {text || unavailable}
      </p>
    </article>
  );
}

export default function AdminBookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDetail = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await bookApi.getBookById(id);
      setBook(data);
    } catch (requestError) {
      setBook(null);
      setError(
        requestError?.response?.data?.message ||
          "Detail buku tidak dapat dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    categoryApi
      .getCategories()
      .then((res) => setCategories(res?.data ?? res ?? []))
      .catch(() => setCategories([]));
  }, [id]);

  const copyValue = async (label, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("Gagal disalin");
    }
  };

  const handleSave = async (payload) => {
    const { id: payloadId, ...rest } = payload;
    try {
      await bookApi.updateBook(payloadId, rest);
      setIsModalOpen(false);
      loadDetail();
    } catch (saveError) {
      window.alert(
        saveError?.response?.data?.message || "Gagal menyimpan data buku.",
      );
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Hapus buku "${book?.title}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;

    try {
      await bookApi.deleteBook(id);
      navigate("/admin/books", { replace: true });
    } catch (deleteError) {
      window.alert(
        deleteError?.response?.data?.message || "Gagal menghapus buku.",
      );
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (error || !book) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Icon name="info" className="h-6 w-6" />
        </div>
        <h2 className="mt-3 font-playfair text-xl font-bold text-slate-900">
          Gagal memuat detail buku
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{error}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={loadDetail}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Icon name="refresh" className="h-4 w-4" /> Coba lagi
          </button>
          <Link
            to="/admin/books"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const fields = [
    ["Penulis", book.author],
    ["Kategori", book.categories?.map((c) => c.name).join(", ")],
    ["Penerbit", book.publisher],
    ["Tahun Terbit", book.publishedYear],
    ["ISBN", book.isbn],
    ["Jumlah Halaman", book.pages ? `${book.pages} halaman` : ""],
    ["Stok", `${book.stock ?? 0} eksemplar`],
    ["Status", (book.stock ?? 0) > 0 ? "Tersedia" : "Stok habis"],
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/books"
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-700"
          >
            <Icon name="chevronLeft" className="h-4 w-4" /> Kembali ke Manajemen
            Buku
          </Link>
          <h1 className="mt-3 font-playfair text-2xl font-bold text-slate-900 sm:text-3xl">
            Detail Buku
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Icon name="pen" className="h-4 w-4" /> Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100"
          >
            <Icon name="trash" className="h-4 w-4" /> Hapus
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="flex min-h-72 items-center justify-center bg-slate-100 p-6">
            <div className="w-full max-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={`Sampul ${book.title || unavailable}`}
                  className="aspect-[2/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center p-6 text-center text-sm font-medium text-slate-400">
                  {unavailable}
                </div>
              )}
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Judul
              </p>
              <h2 className="mt-1 font-playfair text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                {book.title || unavailable}
              </h2>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <DataCard key={label} label={label} value={value} />
              ))}
            </div>
            <DataCard label="Sinopsis" value={book.synopsis} className="mt-3" />
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              <button
                type="button"
                disabled={!book.isbn}
                onClick={() => copyValue("ISBN", book.isbn)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Icon name="collection" className="h-4 w-4" /> Salin ISBN
              </button>
              {copied && (
                <span className="self-center text-xs font-semibold text-emerald-700">
                  {copied === "Gagal disalin" ? copied : `${copied} disalin`}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <AdminBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        book={book}
        categories={categories}
      />
    </div>
  );
}
