import { useState, useEffect } from "react";
import Icon from "../Icon";

export default function AdminBookModal({
  isOpen,
  onClose,
  onSave,
  book = null,
  categories = [],
}) {
  const isEditing = Boolean(book?.id);

  const emptyForm = {
    title: "",
    author: "",
    isbn: "",
    stock: "0",
    categoryIds: [],
    publishedYear: "",
    publisher: "",
    synopsis: "",
    pages: "",
    cover: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (book) {
        setFormData({
          title: book.title || "",
          author: book.author || "",
          isbn: book.isbn || "",
          stock: String(book.stock ?? 0),
          categoryIds: (book.categories || []).map((c) => c.id),
          publishedYear: book.publishedYear ? String(book.publishedYear) : "",
          publisher: book.publisher || "",
          synopsis: book.synopsis || "",
          pages: book.pages ? String(book.pages) : "",
          cover: book.cover || "",
        });
      } else {
        setFormData(emptyForm);
      }
      setErrorMsg("");
    }
  }, [isOpen, book]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return setErrorMsg("Judul wajib diisi.");
    if (!formData.author.trim()) return setErrorMsg("Penulis wajib diisi.");
    if (!formData.isbn.trim()) return setErrorMsg("ISBN wajib diisi.");
    if (formData.categoryIds.length === 0)
      return setErrorMsg("Pilih minimal 1 kategori.");
    if (formData.stock === "" || Number(formData.stock) < 0) {
      return setErrorMsg("Stok tidak valid.");
    }

    onSave({
      id: book?.id,
      title: formData.title.trim(),
      author: formData.author.trim(),
      isbn: formData.isbn.trim(),
      stock: Number(formData.stock),
      categoryIds: formData.categoryIds,
      publishedYear: formData.publishedYear
        ? Number(formData.publishedYear)
        : undefined,
      publisher: formData.publisher.trim() || undefined,
      synopsis: formData.synopsis.trim() || undefined,
      pages: formData.pages ? Number(formData.pages) : undefined,
      cover: formData.cover.trim() || undefined,
    });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-800">
              <Icon name={isEditing ? "pen" : "bookOpen"} className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold text-slate-900">
                {isEditing ? "Edit Buku" : "Tambah Buku Baru"}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Perbarui data buku di katalog perpustakaan"
                  : "Tambahkan buku baru ke katalog perpustakaan"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Tutup modal"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100 flex items-center gap-2">
              <Icon name="info" className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Contoh: Laskar Pelangi"
              className={inputClass}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Penulis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author: e.target.value }))
                }
                placeholder="Contoh: Andrea Hirata"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                ISBN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isbn: e.target.value }))
                }
                placeholder="Contoh: 9789793062792"
                className={inputClass}
              />
            </div>
          </div>

          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stock: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tahun Terbit</label>
              <input
                type="number"
                value={formData.publishedYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    publishedYear: e.target.value,
                  }))
                }
                placeholder="2008"
                className={inputClass}
              />
            </div>
          </div> */}
          <div>
            <label className={labelClass}>
              Kategori <span className="text-red-500">*</span>
            </label>
            <div className="max-h-52 space-y-2 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-sm">
              {categories.length === 0 && (
                <p className="text-xs text-slate-400">
                  Belum ada kategori. Tambahkan dulu di menu Kategori.
                </p>
              )}
              {categories.map((cat) => {
                const checked = formData.categoryIds.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition duration-200 hover:border-slate-500 hover:bg-slate-850 hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          categoryIds: checked
                            ? prev.categoryIds.filter((id) => id !== cat.id)
                            : [...prev.categoryIds, cat.id],
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 accent-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="grow">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Penerbit</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    publisher: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Jumlah Halaman</label>
              <input
                type="number"
                min="1"
                value={formData.pages}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pages: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>URL Cover</label>
            <input
              type="url"
              value={formData.cover}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cover: e.target.value }))
              }
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Sinopsis</label>
            <textarea
              rows={3}
              value={formData.synopsis}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, synopsis: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Icon name={isEditing ? "check" : "plus"} className="h-4 w-4" />
              <span>{isEditing ? "Simpan Perubahan" : "Tambah Buku"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
