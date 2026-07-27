import { useState, useEffect } from "react";
import Icon from "../Icon";

export default function AdminUserModal({
  isOpen,
  onClose,
  onSave,
  user = null,
}) {
  const isEditing = Boolean(user?.id);

  const [formData, setFormData] = useState({
    name: "",
    memberNumber: "",
    email: "",
    status: "Aktif",
    borrowStatus: "Tidak Meminjam",
  });

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name || "",
          memberNumber: user.memberNumber || "",
          email: user.email || "",
          status: user.status || "Aktif",
          borrowStatus: user.borrowStatus || "Tidak Meminjam",
        });
      } else {
        setFormData({
          name: "",
          memberNumber: "",
          email: "",
          status: "Aktif",
          borrowStatus: "Tidak Meminjam",
        });
      }
      setErrorMsg("");
    }
  }, [isOpen, user]);

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

    if (!formData.name.trim()) {
      setErrorMsg("Nama anggota wajib diisi.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg("Email anggota wajib diisi.");
      return;
    }

    onSave({
      id: user?.id,
      name: formData.name.trim(),
      memberNumber: formData.memberNumber.trim(),
      email: formData.email.trim(),
      status: formData.status,
      borrowStatus: formData.borrowStatus,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-800">
              <Icon name={isEditing ? "pen" : "users"} className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold text-slate-900">
                {isEditing ? "Edit Data Anggota" : "Tambah Anggota Baru"}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Perbarui data dan status keanggotaan perpustakaan"
                  : "Tambahkan data anggota perpustakaan baru ke dalam sistem"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100 flex items-center gap-2">
              <Icon name="info" className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Member Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Contoh: Ahmad Dahlan"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              autoFocus
            />
          </div>

          {/* Member Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Nomor Anggota
            </label>
            <input
              type="text"
              value={formData.memberNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, memberNumber: e.target.value }))
              }
              placeholder="Contoh: LIB-2026-001"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Alamat Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="anggota@example.com"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          {/* Member Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Status Anggota
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          {/* Borrow Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Status Peminjaman
            </label>
            <select
              value={formData.borrowStatus}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, borrowStatus: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            >
              <option value="Tidak Meminjam">Tidak Meminjam</option>
              <option value="Sedang Meminjam">Sedang Meminjam</option>
              <option value="Terlambat">Terlambat</option>
            </select>
          </div>

          {/* Actions */}
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
              <span>{isEditing ? "Simpan Perubahan" : "Tambah Anggota"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
