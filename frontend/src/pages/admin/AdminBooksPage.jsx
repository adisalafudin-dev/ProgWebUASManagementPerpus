import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import AdminBookModal from "../../components/admin/AdminBookModal";
import { bookApi } from "../../services/bookApi.js";
import categoryApi from "../../services/categoryApi.js";
import { useDebounce } from "../../hooks/useDebounce";
import aksaraToast from "../../utils/toast.js";

const ITEMS_PER_PAGE = 10;

const displayValue = (value) => value || "—";

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    categoryApi
      .getCategories()
      .then((res) => setCategories(res?.data ?? res ?? []))
      .catch(() => setCategories([]));
  }, [refreshKey]);

  useEffect(() => {
    let isCurrentRequest = true;

    const loadBooks = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await bookApi.getBooks({
          search: debouncedSearchTerm || undefined,
          category: selectedCategoryId || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        if (isCurrentRequest) {
          setBooks(response?.data ?? []);
          setMeta(response?.meta ?? { total: 0, totalPages: 1 });
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setBooks([]);
          setError(
            requestError?.response?.data?.message ||
              "Data buku tidak dapat dimuat. Silakan coba lagi.",
          );
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    };

    loadBooks();
    return () => {
      isCurrentRequest = false;
    };
  }, [debouncedSearchTerm, selectedCategoryId, currentPage, refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategoryId]);

  const hasActiveFilters = Boolean(searchTerm.trim() || selectedCategoryId);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategoryId("");
  };

  const openCreateModal = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleSave = async (payload) => {
    const { id, ...rest } = payload;
    try {
      if (id) {
        await bookApi.updateBook(id, rest);
        aksaraToast.show?.("Buku berhasil diperbarui", "success");
      } else {
        await bookApi.createBook(rest);
        aksaraToast.show?.("Buku berhasil ditambahkan", "success");
      }
      setIsModalOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (saveError) {
      window.alert(
        saveError?.response?.data?.message || "Gagal menyimpan data buku.",
      );
    }
  };

  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Hapus buku "${book.title}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;

    try {
      await bookApi.deleteBook(book.id);
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      window.alert(
        deleteError?.response?.data?.message || "Gagal menghapus buku.",
      );
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-slate-900 sm:text-3xl">
            Manajemen Buku
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Katalog buku Sistem Informasi Perpustakaan.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <Icon name="plus" className="h-4 w-4" /> Tambah Buku
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <label className="relative block">
            <span className="sr-only">Cari buku</span>
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari judul, penulis, atau ISBN..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                aria-label="Hapus pencarian"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          <label className="relative block">
            <span className="sr-only">Filter kategori</span>
            <select
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Semua kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Icon
              name="chevronDown"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{meta.total}</span>{" "}
            buku ditemukan
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <Icon name="refresh" className="h-3.5 w-3.5" /> Reset filter
            </button>
          )}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Icon name="info" className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-playfair text-xl font-bold text-slate-900">
            Gagal memuat data buku
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Icon name="refresh" className="h-4 w-4" /> Coba lagi
          </button>
        </div>
      ) : !isLoading && books.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <EmptyState
            icon="bookOpen"
            title="Buku tidak ditemukan"
            description={
              hasActiveFilters
                ? "Tidak ada buku yang sesuai dengan filter."
                : "Belum ada buku di katalog. Tambahkan buku pertama kamu."
            }
          />
          {hasActiveFilters && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset semua filter
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-20 px-5 py-3.5 font-semibold">Cover</th>
                  <th className="min-w-48 px-5 py-3.5 font-semibold">Judul</th>
                  <th className="min-w-40 px-5 py-3.5 font-semibold">
                    Penulis
                  </th>
                  <th className="px-5 py-3.5 font-semibold">Tahun</th>
                  <th className="min-w-36 px-5 py-3.5 font-semibold">ISBN</th>
                  <th className="min-w-32 px-5 py-3.5 font-semibold">
                    Kategori
                  </th>
                  <th className="px-5 py-3.5 font-semibold">Stok</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => (
                  <tr
                    key={book.id}
                    className="transition-colors hover:bg-slate-100"
                  >
                    <td className="px-5 py-3">
                      <div className="h-14 w-10 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        {book.cover ? (
                          <img
                            src={book.cover}
                            alt={`Sampul ${book.title}`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center p-1 text-center text-[8px] font-semibold text-slate-400">
                            No cover
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="max-w-56 font-semibold text-slate-900 line-clamp-2">
                        {book.title}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <p className="max-w-44 line-clamp-2">{book.author}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {displayValue(book.publishedYear)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">
                      {displayValue(book.isbn)}
                    </td>
                    <td className="px-5 py-3">
                      {book.categories?.length ? (
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {book.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {book.stock}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          to={`/admin/books/${book.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Icon name="eye" className="h-3.5 w-3.5" /> Detail
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(book)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(book)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={setCurrentPage}
            totalItems={meta.total}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}

      <AdminBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        book={editingBook}
        categories={categories}
      />
    </div>
  );
}
