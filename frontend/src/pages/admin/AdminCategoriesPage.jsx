import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import Icon from "../../components/Icon";
import Pagination from "../../components/Pagination";
import categoryApi from "../../services/categoryApi.js";
import AdminCategoryModal from "../../components/admin/AdminCategoryModal";
import AdminCategoryDeleteModal from "../../components/admin/AdminCategoryDeleteModal";
import aksaraToast from "../../utils/toast.js";

const ITEMS_PER_PAGE = 10;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [deletingCategory, setDeletingCategory] = useState(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await categoryApi.getCategories();
      // the backend typically returns array on /categories
      setCategories(result?.data ?? result ?? []);
    } catch (requestError) {
      setCategories([]);
      setError(
        requestError?.response?.data?.message ||
          "Data kategori tidak dapat dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [refreshKey]);

  // Client side search and pagination
  const processedCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const result = keyword
      ? categories.filter((c) => c.name.toLowerCase().includes(keyword))
      : [...categories];
    // Sort alphabetically
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(processedCategories.length / ITEMS_PER_PAGE),
  );
  
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [processedCategories, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleSave = async (payload) => {
    const { id, ...rest } = payload;
    try {
      if (id) {
        await categoryApi.updateCategory(id, rest);
        aksaraToast.show?.("Kategori berhasil diperbarui", "success");
      } else {
        await categoryApi.createCategory(rest);
        aksaraToast.show?.("Kategori berhasil ditambahkan", "success");
      }
      setIsModalOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (saveError) {
      window.alert(
        saveError?.response?.data?.message || "Gagal menyimpan kategori.",
      );
    }
  };

  const handleConfirmDelete = async (categoryId) => {
    try {
      await categoryApi.deleteCategory(categoryId);
      aksaraToast.show?.("Kategori berhasil dihapus", "success");
      setDeletingCategory(null);
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      window.alert(
        deleteError?.response?.data?.message || "Gagal menghapus kategori.",
      );
      setDeletingCategory(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-slate-900 sm:text-3xl">
            Manajemen Kategori
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Kelola data master kategori buku.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <Icon name="plus" className="h-4 w-4" /> Tambah Kategori
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <label className="relative block">
            <span className="sr-only">Cari kategori</span>
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kategori..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                aria-label="Hapus pencarian"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Icon name="info" className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-playfair text-xl font-bold text-slate-900">
            Gagal memuat data kategori
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Icon name="refresh" className="h-4 w-4" /> Coba lagi
          </button>
        </div>
      ) : !isLoading && processedCategories.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <EmptyState
            icon="tag"
            title="Kategori tidak ditemukan"
            description={
              searchTerm
                ? "Tidak ada kategori yang sesuai dengan pencarian."
                : "Belum ada kategori terdaftar."
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Nama Kategori</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {category.name}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(category);
                            setIsModalOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Icon name="pen" className="mr-1 h-3.5 w-3.5 inline" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(category)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          <Icon name="trash" className="mr-1 h-3.5 w-3.5 inline" /> Hapus
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
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={processedCategories.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}

      <AdminCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        category={editingCategory}
      />

      <AdminCategoryDeleteModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        category={deletingCategory}
      />
    </div>
  );
}
