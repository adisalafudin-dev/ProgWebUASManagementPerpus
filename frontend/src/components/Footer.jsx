import { Link } from "react-router-dom";
import Icon from "./Icon";
import aksaraHubLogo from "../assets/AksaraHub Logo.png";

export default function Footer({ activePage = "home" }) {
  const currentYear = new Date().getFullYear();

  const navItems = [
    { label: "Jelajah", to: "/", page: "jelajah", icon: "compass" },
    { label: "Katalog Buku", to: "/books", page: "katalog", icon: "bookOpen" },
    { label: "Buku Favorit", to: "/favorites", page: "favorit", icon: "heart" },
    { label: "Tentang Kami", to: "/about", page: "tentang", icon: "info" },
  ];

  const legalItems = [
    { label: "Kebijakan Privasi", status: "Coming Soon" },
    { label: "Syarat & Ketentuan", status: "Coming Soon" },
    { label: "Bantuan & Layanan", status: "Coming Soon" },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t border-borderSoft bg-primary text-white/70 font-crimson">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-10">
          {/* Section 1: Profil & Deskripsi AksaraHub */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 overflow-hidden rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={aksaraHubLogo}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full scale-[1.55] object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-playfair font-bold text-xl text-white tracking-wide">
                  AksaraHub
                </span>
                <span className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent border border-accent/30">
                  v1.0.0
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/80">
              AksaraHub adalah Sistem Informasi Perpustakaan Digital modern yang
              memfasilitasi penjelajahan, pencarian, dan pengelolaan koleksi
              literatur serta buku secara efisien, praktis, dan terbuka.
            </p>
          </div>

          {/* Section 2: Navigasi Utama */}
          <nav aria-label="Navigasi footer">
            <h4 className="font-playfair font-semibold text-white mb-4 text-base">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2.5 text-sm">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    aria-current={activePage === item.page ? "page" : undefined}
                    className={`inline-flex items-center gap-2.5 transition-colors duration-200 hover:text-accent ${
                      activePage === item.page
                        ? "text-accent font-semibold"
                        : "text-white/70"
                    }`}
                  >
                    <Icon name={item.icon} className="w-4 h-4 text-accent/80" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Section 3: Sumber Data & API */}
          <div className="space-y-4">
            <h4 className="font-playfair font-semibold text-white mb-4 text-base">
              Sumber Data
            </h4>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <Icon name="database" className="w-4 h-4 text-accent shrink-0" />
                <span>Book Management Backend</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Seluruh katalog buku, metadata, status stok, dan kategori pada aplikasi ini
                terhubung langsung ke REST API Monolith NestJS SIAKAD.
              </p>
            </div>
          </div>
        </div>

        {/* Divider & Bottom Footer Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Copyright Info */}
          <div className="flex items-center gap-2 text-white/50 text-center md:text-left">
            <span>
              &copy; {currentYear} AksaraHub. Sistem Informasi Perpustakaan Digital.
            </span>
          </div>

          {/* Legal / Policy Links with Coming Soon state */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/60">
            {legalItems.map((item) => (
              <span
                key={item.label}
                aria-disabled="true"
                className="inline-flex items-center gap-1.5 cursor-not-allowed text-white/40 select-none"
                title={`${item.label} (${item.status})`}
              >
                {item.label}
                <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded font-sans uppercase tracking-wider">
                  {item.status}
                </span>
              </span>
            ))}
          </div>

          {/* Back to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 transition-all duration-200 hover:border-accent hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <span>Kembali ke Atas</span>
            <Icon name="arrowUp" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
