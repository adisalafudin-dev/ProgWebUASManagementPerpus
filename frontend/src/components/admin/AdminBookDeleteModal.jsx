import { useEffect } from "react";
import Icon from "../Icon";

export default function AdminBookDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  bookTitle = "",
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
            Hapus Buku Ini?
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Apakah Anda yakin ingin menghapus{" "}
            <span className="font-semibold text-slate-900 font-playfair">
              "{bookTitle}"
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="flex items-center justify-center gap-3 w-full mt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
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
