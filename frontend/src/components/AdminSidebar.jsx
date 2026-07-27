import { Link } from "react-router-dom";
import Icon from "./Icon";

const adminLinks = [
  { to: "/admin/dashboard", page: "dashboard", label: "Dashboard", icon: "home" },
  { to: "/admin/books", page: "books", label: "Buku", icon: "bookOpen" },
  { to: "/admin/categories", page: "categories", label: "Kategori", icon: "tag" },
  { to: "/admin/statistics", page: "statistics", label: "Statistik", icon: "collection" },
  { to: "/admin/users", page: "users", label: "Anggota", icon: "users" },
  { to: "/admin/reviews", page: "reviews", label: "Ulasan", icon: "star" },
  { to: "/admin/borrowings", page: "borrowings", label: "Peminjaman", icon: "bookOpen" },
];

export default function AdminSidebar({
  activePage = "dashboard",
  currentUser,
  onLogout,
  onClose,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent/80">
          Panel Admin
        </p>
        <p className="mt-1 font-playfair text-xl font-bold text-white">
          AksaraHub
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => onClose?.()}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
              activePage === link.page
                ? "bg-accent text-white shadow-book"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon name={link.icon} className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        {currentUser ? (
          <div className="mb-3 rounded-xl bg-white/5 px-4 py-3">
            <p className="text-sm font-semibold text-white">{currentUser.name}</p>
            <p className="mt-0.5 text-xs text-slate-400">{currentUser.email}</p>
          </div>
        ) : null}
        <Link
          to="/"
          onClick={() => onClose?.()}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <Icon name="globe" className="h-4 w-4" />
          Ke Situs User
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accentHover"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
