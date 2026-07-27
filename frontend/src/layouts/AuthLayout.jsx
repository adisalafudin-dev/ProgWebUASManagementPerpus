import { Link, Outlet } from "react-router-dom";
import Icon from "../components/Icon";
import { useTheme } from "../contexts/ThemeContext.jsx";

const HIGHLIGHTS = [
  { icon: "collection", text: "Ribuan judul dari berbagai genre" },
  { icon: "bookmark", text: "Rak favorit tersimpan otomatis" },
  { icon: "star", text: "Rekomendasi personal tiap kunjungan" },
];

export default function AuthLayout() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="grid min-h-screen bg-cream text-textMain dark:bg-[#0c1513] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Brand panel */}
      <div
        className="relative hidden overflow-hidden bg-primary p-12 text-cream lg:flex lg:flex-col lg:justify-between"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(184,137,45,0.16), transparent 45%), radial-gradient(circle at 85% 80%, rgba(184,137,45,0.12), transparent 40%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(246,241,232,0.6) 0 1px, transparent 1px 72px)",
          }}
        />

        <Link to="/" className="relative flex items-center gap-3 font-playfair text-lg font-bold">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-cream text-primary shadow-book">
            <Icon name="bookOpen" className="h-5 w-5" />
          </span>
          AksaraHub
        </Link>

        <div className="relative max-w-md">
          <p className="section-label mb-4 !text-accent">Your Reading Space</p>
          <h1 className="font-playfair text-4xl font-extrabold leading-tight text-cream xl:text-5xl">
            Satu tempat untuk cerita yang tak habis dibaca.
          </h1>
          <p className="mt-5 leading-7 text-cream/70">
            Kelola bacaan, simpan favorit, dan temukan rekomendasi baru dari
            koleksi kami.
          </p>

          <ul className="mt-9 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-cream/85">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cream/10 text-accent">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs uppercase tracking-[0.2em] text-cream/40">
          &copy; {new Date().getFullYear()} AksaraHub
        </p>
      </div>

      {/* Auth card panel */}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Link
            to="/"
            className="flex items-center gap-2 font-playfair text-base font-bold text-textMain lg:hidden"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-cream">
              <Icon name="bookOpen" className="h-4 w-4" />
            </span>
            AksaraHub
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Ubah tema"
            className="inline-flex items-center gap-2 rounded-full border border-borderSoft px-3 py-1.5 text-xs font-semibold text-textSecondary transition-colors hover:border-accent hover:text-accentHover"
          >
            <Icon name={isDarkMode ? "sun" : "moon"} className="h-3.5 w-3.5" />
            {isDarkMode ? "Mode Terang" : "Mode Gelap"}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-14 pt-4 sm:px-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
