import { useEffect } from "react";
import Icon from "../Icon";

export default function AdminBookCoverPreviewModal({
  isOpen,
  onClose,
  book = null,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900 transition-colors"
          aria-label="Tutup"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>

        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Cover Image Container */}
          <div className="w-48 sm:w-56 flex-shrink-0 aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 border border-slate-200 shadow-md">
            {book.cover ? (
              <img
                src={book.cover}
                alt={`Sampul ${book.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-slate-800 p-4 text-center text-white">
                <Icon name="bookOpen" className="h-10 w-10 mb-2 opacity-60" />
                <p className="font-playfair font-bold text-sm">{book.title}</p>
                <p className="text-xs text-slate-400 mt-1">Belum Ada Sampul</p>
              </div>
            )}
          </div>

          {/* Book Information */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {book.categories?.[0]?.name || book.category || book.genre || "General"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  book.status === "Aktif"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {book.status || "Aktif"}
              </span>
            </div>

            <h3 className="font-playfair text-2xl font-bold text-slate-900 leading-snug">
              {book.title}
            </h3>

            <p className="text-sm font-medium text-slate-600">
              Oleh <span className="text-slate-900">{book.author}</span>
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="text-slate-500 block">Tahun Terbit</span>
                <span className="font-bold text-slate-800">{book.year || "-"}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="text-slate-500 block">Rating</span>
                <span className="font-bold text-slate-800">
                  {book.rating ? `${book.rating} / 5.0` : "-"}
                </span>
              </div>
            </div>

            {book.synopsis && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                  Sinopsis
                </span>
                <p className="text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto">
                  {book.synopsis}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
