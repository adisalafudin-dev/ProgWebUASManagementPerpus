import { Link } from "react-router-dom";
import Icon from "./Icon";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useFavorites } from "../contexts/FavoriteContext.jsx";
import aksaraHubLogo from "../assets/AksaraHub Logo.png";
import { ROLES } from "../constants/roles.js";

const sidebarLinks = [
  { to: "/", page: "jelajah", label: "Jelajah", icon: "compass" },
  { to: "/books", page: "katalog", label: "Katalog Buku", icon: "bookOpen" },
  { to: "/favorites", page: "favorit", label: "Favorit", icon: "heart" },
  { to: "/my-borrowings", page: "my-borrowings", label: "Buku Saya", icon: "collection" },
  { to: "/about", page: "tentang", label: "Tentang", icon: "info" },
];

const bottomLinks = [
  { to: "/profile", page: "profile", label: "Profil", icon: "users" },
  { to: "/settings", page: "settings", label: "Pengaturan", icon: "monitor" },
];

export default function Sidebar({ activePage = "jelajah", onClose }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { favoriteCount } = useFavorites();

  return (
    <div className="flex h-full min-h-full flex-col justify-between px-4 py-6">
      <div>
        <Link
          to="/"
          onClick={() => onClose?.()}
          className="mb-8 flex items-center gap-3 px-2"
        >
          <div className="h-10 w-10 overflow-hidden rounded-xl bg-white shadow-book">
            <img
              src={aksaraHubLogo}
              alt=""
              aria-hidden="true"
              className="h-full w-full scale-[1.55] object-cover"
            />
          </div>
          <div>
            <p className="font-playfair text-lg font-extrabold leading-none text-white">
              AksaraHub
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
              Digital Library
            </p>
          </div>
        </Link>

        <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Menu
        </p>
        <nav aria-label="Navigasi utama" className="space-y-1.5">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => onClose?.()}
              aria-current={activePage === link.page ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                activePage === link.page
                  ? "bg-accent text-white shadow-book"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={link.icon} className="h-4 w-4" />
              {link.label}
              {link.page === "favorit" && favoriteCount > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold">
                  {favoriteCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5 border-t border-white/10 pt-4">
          {bottomLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => onClose?.()}
              aria-current={activePage === link.page ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                activePage === link.page
                  ? "bg-accent text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={link.icon} className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {user?.role === ROLES.ADMIN && (
            <Link
              to="/admin/dashboard"
              onClick={() => onClose?.()}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-accent transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <Icon name="shield" className="h-4 w-4" />
              Panel Admin
            </Link>
          )}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose?.();
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <Icon name="logOut" className="h-4 w-4" />
              Keluar
            </button>
          )}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-accent to-accentHover p-4 text-white shadow-book">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Reading Challenge
          </p>
          <p className="mt-1 font-playfair text-sm font-bold leading-snug">
            {isAuthenticated
              ? `Semangat, ${user?.name?.split(" ")[0] || "Pembaca"}!`
              : "Yuk gabung AksaraHub"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/70">
            {isAuthenticated
              ? "Lanjutkan target bacaanmu minggu ini."
              : "Masuk untuk menyimpan progres bacamu."}
          </p>
        </div>
      </div>
    </div>
  );
}
