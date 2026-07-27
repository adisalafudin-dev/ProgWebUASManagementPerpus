import { Link, useLocation } from "react-router-dom";
import Icon from "./Icon";

const labelMap = {
  "": "Jelajah",
  books: "Katalog Buku",
  favorites: "Favorit",
  about: "Tentang",
  login: "Masuk",
  register: "Daftar",
  profile: "Profil",
  settings: "Pengaturan",
  admin: "Panel Admin",
  dashboard: "Dashboard",
  categories: "Kategori",
  users: "Pengguna",
  statistics: "Statistik",
};

function formatSegment(segment, index, segments) {
  if (segment === "books" && segments.length === 1) {
    return "Katalog Buku";
  }
  if (segments[0] === "books" && index === 1) {
    return "Detail Buku";
  }
  return (
    labelMap[segment] ||
    segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    return (
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-textSecondary font-crimson py-1"
      >
        <span className="font-semibold text-textMain flex items-center gap-1.5">
          <Icon name="compass" className="w-3.5 h-3.5 text-accent" />
          Jelajah
        </span>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-xs sm:text-sm text-textSecondary font-crimson py-1"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            to="/"
            className="text-textSecondary hover:text-accentHover transition-colors flex items-center gap-1"
          >
            Jelajah
          </Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const path = `/${segments.slice(0, index + 1).join("/")}`;
          const label = formatSegment(segment, index, segments);

          return (
            <li key={path} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-textSecondary/60 text-xs">
                &gt;
              </span>
              {isLast ? (
                <span className="font-semibold text-textMain">{label}</span>
              ) : (
                <Link
                  to={path}
                  className="text-textSecondary hover:text-accentHover transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

