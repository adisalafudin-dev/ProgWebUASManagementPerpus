import { useEffect, useState } from "react";
import Icon from "../Icon";
import { bookApi } from "../../services/bookApi.js";

export default function AdminCategoryDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  category = null,
}) {
  const [affectedBooks, setAffectedBooks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && category?.id) {
      setIsLoading(true);
      bookApi
        .getBooks({ category: category.id, limit: 1 })
        .then((res) => {
          setAffectedBooks(res?.meta?.total || 0);
        })
        .catch(() => {
          setAffectedBooks(0);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setAffectedBooks(0);
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl bg-red-50 p-4 text-red-600 border border-red-100">
            <Icon name="trash" className="h-8 w-8" />
          </div>

          <h3 className="font-playfair text-xl font-bold text-slate-900 mb-1">
            Hapus Kategori Ini?
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Apakah Anda yakin ingin menghapus kategori{" "}
            <span className="font-semibold text-slate-900 font-playfair">
              "{category.name}"
            </span>
            ?
          </p>

          {isLoading ? (
            <div className="mb-4 text-xs text-slate-500">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 mr-2"></span>
              Memeriksa daftar buku...
            </div>
          ) : (
            affectedBooks > 0 && (
              <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 text-left flex items-start gap-2">
                <Icon
                  name="info"
                  className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5"
                />
                <span>
                  Kategori ini saat ini digunakan oleh{" "}
                  <strong>{affectedBooks} buku</strong>. Jika kategori dihapus, buku-buku tersebut tidak akan terhapus, tetapi akan kehilangan data kategori (menjadi Umum).
                </span>
              </div>
            )
          )}

          <p className="text-xs text-slate-400 mb-6">
            Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="flex items-center justify-center gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => onConfirm(category.id)}
              className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Icon name="trash" className="h-4 w-4" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
