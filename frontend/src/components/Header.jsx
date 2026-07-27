import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import Breadcrumb from "./Breadcrumb";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import NotificationDropdown from "./NotificationDropdown";
import { ROLES } from "../constants/roles.js";
import { useDebounce } from "../hooks/useDebounce";
import { bookApi } from "../services/bookApi.js";
import { formatBackendBook } from "../utils/bookFormatter.js";

export default function Header({
  drawerOpen = false,
  onToggleDrawer,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs
  const headerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, 300);

  // ── Scroll detection for shadow effect ─────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Fetch Backend Book Suggestions ──────────────────────────────────────────
  useEffect(() => {
    let isCancelled = false;

    const loadSuggestions = async () => {
      const query = debouncedQuery.trim();
      if (query.length < 2) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await bookApi.getBooks({ search: query, limit: 5 });
        if (!isCancelled) {
          const raw = response?.data || [];
          setSuggestions(raw.map(formatBackendBook));
          setShowSuggestions(true);
        }
      } catch (err) {
        if (!isCancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    };

    loadSuggestions();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  // ── Keyboard Shortcuts (Ctrl + K or /) ────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      const isEditingText =
        activeTag === "INPUT" ||
        activeTag === "TEXTAREA" ||
        activeTag === "SELECT" ||
        document.activeElement?.isContentEditable;

      const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/" && !isEditingText;

      if (isCtrlK || isSlash) {
        e.preventDefault();
        if (window.innerWidth < 640) {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
        } else {
          searchInputRef.current?.focus();
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setShowAvatarDropdown(false);
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Click outside to close dropdowns ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setShowAvatarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Action Handlers ────────────────────────────────────────────────────────
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
        setShowSuggestions(false);
        setIsMobileSearchOpen(false);
      }
    },
    [searchQuery, navigate]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    if (isMobileSearchOpen) {
      mobileSearchInputRef.current?.focus();
    } else {
      searchInputRef.current?.focus();
    }
  }, [isMobileSearchOpen]);

  const handleSelectSuggestion = useCallback(
    (book) => {
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
      if (book.key) {
        navigate(`/books/${encodeURIComponent(book.key)}`);
      } else {
        navigate(`/books?q=${encodeURIComponent(book.title)}`);
      }
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    setShowAvatarDropdown(false);
    navigate("/");
  }, [logout, navigate]);

  const userInitial = useMemo(() => {
    return (user?.name || "?").charAt(0).toUpperCase();
  }, [user?.name]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-30 transition-all duration-300 navbar-shell ${
        isScrolled
          ? "border-b border-borderSoft bg-white/95 shadow-md backdrop-blur-md"
          : "border-b border-borderSoft bg-cream/90 backdrop-blur-sm"
      }`}
    >
      {/* ── MAIN NAVBAR STRIP ──────────────────────────────────────────────── */}
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Drawer Toggle & Desktop Brand / Search */}
        <div className="flex flex-1 items-center gap-3 max-w-lg">
          <button
            type="button"
            aria-label={
              drawerOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
            }
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={onToggleDrawer}
            className="rounded-lg p-2 text-textMain transition-colors hover:bg-cream lg:hidden"
          >
            <div className="flex w-5 flex-col gap-1.5">
              <span
                className={`block h-0.5 rounded bg-textMain transition-all duration-300 ${
                  drawerOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 rounded bg-textMain transition-all duration-300 ${
                  drawerOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 rounded bg-textMain transition-all duration-300 ${
                  drawerOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>

          {/* Desktop Search Bar */}
          <div className="relative hidden w-full sm:block">
            <form onSubmit={handleSearchSubmit} role="search" aria-label="Search">
              <div className="relative flex items-center">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  aria-label="Search"
                  placeholder="Cari judul, penulis, ISBN..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!showSuggestions) setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                  }}
                  className="w-full pl-10 pr-20 py-2 rounded-xl border border-borderSoft bg-white text-sm text-textMain placeholder-textSecondary shadow-xs transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 navbar-search-input"
                />

                {/* Right controls inside search bar */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      aria-label="Hapus teks pencarian"
                      onClick={handleClearSearch}
                      className="rounded-full p-1 text-textSecondary hover:bg-cream hover:text-textMain transition-colors"
                    >
                      <Icon name="x" className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <kbd
                    className="hidden lg:inline-flex items-center rounded border border-borderSoft bg-cream px-1.5 py-0.5 text-[10px] font-sans font-medium text-textSecondary select-none pointer-events-none navbar-kbd"
                    title="Tekan Ctrl+K atau / untuk mencari"
                  >
                    Ctrl K
                  </kbd>
                </div>
              </div>
            </form>

            {/* ── DESKTOP AUTOCOMPLETE SUGGESTIONS DROPDOWN ──────────────── */}
            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-xl border border-borderSoft bg-white shadow-2xl navbar-dropdown">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2 p-4 text-xs font-crimson text-textSecondary">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    Mencari koleksi buku...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="divide-y divide-borderSoft/50 text-sm">
                    <li className="bg-cream/60 px-3 py-1.5 text-[11px] font-semibold text-textSecondary font-crimson navbar-dropdown-header">
                      Hasil Rekomendasi (Maksimal 5)
                    </li>
                    {suggestions.map((item) => (
                      <li key={item.key || item.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-cream/70 navbar-suggestion-item"
                        >
                          <div className="h-10 w-7 shrink-0 overflow-hidden rounded bg-cream border border-borderSoft flex items-center justify-center">
                            {item.cover ? (
                              <img
                                src={item.cover}
                                alt={`Sampul ${item.title}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <Icon name="bookOpen" className="w-3.5 h-3.5 text-textSecondary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-textMain">
                              {item.title}
                            </p>
                            <p className="truncate text-[11px] text-textSecondary font-crimson">
                              {item.author} {item.year !== "-" ? `(${item.year})` : ""}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-xs font-crimson text-textSecondary">
                    Tidak ada hasil ditemukan untuk "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Trigger Icon */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-borderSoft bg-white text-textSecondary shadow-xs transition-all hover:border-accent hover:text-accentHover sm:hidden navbar-icon-btn"
            aria-label="Search"
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
            }}
          >
            <Icon name="search" className="h-4 w-4" strokeWidth={2} />
          </button>

          {/* Dark Mode Button with Hover Tooltip */}
          <div className="relative group">
            <button
              type="button"
              aria-label="Dark Mode"
              aria-pressed={isDarkMode}
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-borderSoft bg-white text-textSecondary shadow-xs transition-all duration-200 hover:border-accent hover:text-accentHover navbar-icon-btn"
            >
              <Icon
                name={isDarkMode ? "sun" : "moon"}
                className="h-4 w-4"
                strokeWidth={2}
              />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-md"
            >
              {isDarkMode ? "Ubah ke Light Mode" : "Ubah ke Dark Mode"}
            </span>
          </div>

          {/* Notification Dropdown (Phase 4) */}
          <NotificationDropdown />

          {/* User Menu Dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                aria-label="User Menu"
                aria-expanded={showAvatarDropdown}
                aria-haspopup="true"
                onClick={() => setShowAvatarDropdown((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-borderSoft bg-white py-1 pl-1 pr-2.5 shadow-xs transition-all duration-200 hover:border-accent navbar-user-btn"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
                  {userInitial}
                </span>
                <span className="hidden max-w-24 truncate text-sm font-semibold text-textMain sm:inline">
                  {user?.name}
                </span>
                <Icon
                  name="chevronDown"
                  className={`hidden h-3.5 w-3.5 text-textSecondary transition-transform duration-200 sm:inline ${
                    showAvatarDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Lazy Rendered User Menu Dropdown */}
              {showAvatarDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-borderSoft bg-white shadow-2xl py-1.5 z-50 navbar-dropdown">
                  <div className="border-b border-borderSoft/60 px-4 py-2.5">
                    <p className="truncate text-xs font-semibold text-textMain">
                      {user?.name}
                    </p>
                    <p className="truncate text-[11px] text-textSecondary font-crimson">
                      {user?.email || "Pengguna Perpustakaan"}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-textMain transition-colors hover:bg-cream navbar-menu-item"
                      onClick={() => setShowAvatarDropdown(false)}
                    >
                      <Icon name="users" className="h-4 w-4 text-textSecondary" />
                      Profil
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-textMain transition-colors hover:bg-cream navbar-menu-item"
                      onClick={() => setShowAvatarDropdown(false)}
                    >
                      <Icon name="monitor" className="h-4 w-4 text-textSecondary" />
                      Pengaturan
                    </Link>
                    <Link
                      to="/about"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-textMain transition-colors hover:bg-cream navbar-menu-item"
                      onClick={() => setShowAvatarDropdown(false)}
                    >
                      <Icon name="info" className="h-4 w-4 text-textSecondary" />
                      Tentang
                    </Link>
                    {user?.role === ROLES.ADMIN && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-cream"
                        onClick={() => setShowAvatarDropdown(false)}
                      >
                        <Icon name="shield" className="h-4 w-4 text-primary" />
                        Panel Admin
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-borderSoft/60 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-semibold text-accentHover transition-colors hover:bg-cream navbar-menu-item"
                    >
                      <Icon name="logOut" className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              aria-label="User Menu"
              className="flex items-center gap-2 rounded-full border border-borderSoft bg-white px-3.5 py-1.5 text-xs font-semibold text-textSecondary shadow-xs transition-all duration-200 hover:border-accent hover:text-accentHover navbar-user-btn"
            >
              <Icon name="users" className="h-3.5 w-3.5" />
              Masuk
            </Link>
          )}
        </div>
      </div>

      {/* ── BREADCRUMB STRIP BELOW NAVBAR ──────────────────────────────────── */}
      <div className="border-t border-borderSoft/60 bg-cream/40 px-4 py-1 sm:px-6 lg:px-8 navbar-breadcrumb">
        <Breadcrumb />
      </div>

      {/* ── MOBILE SEARCH OVERLAY ─────────────────────────────────────────── */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs p-4 sm:hidden">
          <div className="rounded-2xl border border-borderSoft bg-white shadow-2xl p-4 navbar-dropdown">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-borderSoft">
              <p className="text-xs font-semibold font-playfair text-textMain">
                Pencarian Buku Global
              </p>
              <button
                type="button"
                aria-label="Tutup pencarian mobile"
                onClick={() => setIsMobileSearchOpen(false)}
                className="rounded-full p-1 text-textSecondary hover:bg-cream"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-3" role="search" aria-label="Search">
              <div className="relative flex items-center">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  aria-label="Search"
                  placeholder="Cari judul, penulis, ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-borderSoft bg-cream/50 text-sm text-textMain placeholder-textSecondary focus:outline-none focus:border-accent navbar-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Hapus teks pencarian"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-textSecondary hover:bg-white"
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Mobile Suggestions List */}
            {searchQuery.trim().length >= 2 && (
              <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-borderSoft bg-white navbar-dropdown">
                {isSearching ? (
                  <div className="p-3 text-center text-xs font-crimson text-textSecondary">
                    Mencari rekomendasi...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="divide-y divide-borderSoft/50 text-xs">
                    {suggestions.map((item) => (
                      <li key={item.key || item.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="flex w-full items-center gap-3 p-2.5 text-left transition-colors hover:bg-cream"
                        >
                          <div className="h-9 w-6 shrink-0 overflow-hidden rounded bg-cream border border-borderSoft flex items-center justify-center">
                            {item.cover ? (
                              <img
                                src={item.cover}
                                alt={`Sampul ${item.title}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <Icon name="bookOpen" className="w-3 h-3 text-textSecondary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-textMain">
                              {item.title}
                            </p>
                            <p className="truncate text-textSecondary font-crimson">
                              {item.author}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-center text-xs font-crimson text-textSecondary">
                    Tidak ada hasil ditemukan.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
