import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import Icon from "../components/Icon";
import { useAuth } from "../contexts/AuthContext.jsx";

const getActivePage = (pathname) => {
  if (pathname.startsWith("/admin/books")) return "books";
  if (pathname.startsWith("/admin/categories")) return "categories";
  if (pathname.startsWith("/admin/users")) return "users";
  if (pathname.startsWith("/admin/reviews")) return "reviews";
  if (pathname.startsWith("/admin/borrowings")) return "borrowings";
  if (pathname.startsWith("/admin/statistics")) return "statistics";
  return "dashboard";
};

const pageTitles = {
  dashboard: "Dashboard",
  books: "Kelola Buku",
  categories: "Kelola Kategori",
  users: "Manajemen Anggota",
  reviews: "Moderasi Ulasan",
  borrowings: "Peminjaman Buku",
  statistics: "Statistik Perpustakaan",
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const activePage = getActivePage(location.pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-shell min-h-screen bg-cream font-crimson">
      <div className="flex min-h-screen">
        <aside className="hidden border-r border-black/10 bg-primary lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
          <AdminSidebar
            activePage={activePage}
            currentUser={user}
            onLogout={handleLogout}
          />
        </aside>

        <div
          className={`fixed inset-0 z-40 bg-slate-950/50 transition-opacity duration-300 lg:hidden ${
            drawerOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!drawerOpen}
          onClick={() => setDrawerOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-primary transition-transform duration-300 lg:hidden ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi admin"
        >
          <AdminSidebar
            activePage={activePage}
            currentUser={user}
            onLogout={handleLogout}
            onClose={() => setDrawerOpen(false)}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-borderSoft bg-white px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-borderSoft text-textSecondary transition-colors duration-200 hover:bg-cream lg:hidden"
                  aria-label="Buka menu admin"
                >
                  <Icon name="collection" className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accentHover">
                    Admin
                  </p>
                  <h1 className="font-playfair text-xl font-bold text-textMain">
                    {pageTitles[activePage]}
                  </h1>
                </div>
              </div>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-primary">
                {user?.role || "ADMIN"}
              </span>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
