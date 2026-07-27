import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ToastContainer from "../components/ToastContainer";
import Sidebar from "../components/Sidebar";

const getActivePage = (pathname) => {
  if (pathname === "/") return "jelajah";
  if (pathname.startsWith("/books")) return "katalog";
  if (pathname === "/favorites") return "favorit";
  if (pathname === "/my-borrowings") return "my-borrowings";
  if (pathname === "/about") return "tentang";
  if (pathname === "/login" || pathname === "/register") return "login";
  if (pathname === "/profile") return "profile";
  if (pathname === "/settings") return "settings";
  return "jelajah";
};

export default function MainLayout() {
  const location = useLocation();
  const activePage = getActivePage(location.pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream font-crimson transition-colors duration-300 lg:flex">
      {/* Overlay + drawer sidebar (mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 lg:hidden ${
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        id="mobile-drawer"
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-primary shadow-2xl transition-transform duration-300 lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigasi aplikasi"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">AksaraHub</p>
            <p className="text-xs text-white/50">Navigasi cepat</p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-200 hover:bg-white/10"
            aria-label="Tutup menu"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <Sidebar activePage={activePage} onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Sidebar tetap (desktop) */}
      <aside className="hidden border-r border-black/10 bg-primary lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <Sidebar activePage={activePage} />
      </aside>

      {/* Kolom konten kanan */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header
          activePage={activePage}
          drawerOpen={drawerOpen}
          onToggleDrawer={() => setDrawerOpen((value) => !value)}
        />

        <main id="main-content" role="main" className="flex-1">
          <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        <Footer activePage={activePage} />
      </div>

      <ToastContainer />
    </div>
  );
}
