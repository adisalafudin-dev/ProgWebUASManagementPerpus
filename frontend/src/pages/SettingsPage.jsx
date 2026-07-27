import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../components/Icon";
import { useTheme } from "../contexts/ThemeContext.jsx";
import aksaraToast from "../utils/toast.js";

/* ─── constants ──────────────────────────────────────────────────── */

const APP_VERSION = "1.0.0";
const DATA_SOURCE = "Backend API (NestJS + MongoDB)";

const SETTINGS_KEY = "aksarahub-preferences";

const DEFAULT_SETTINGS = {
  catalogView: "grid",   // "grid" | "list"
  booksPerPage: 20,      // 10 | 20 | 30
  uiAnimations: true,    // boolean
};

/** Keys to wipe when the user clears local cache */
const CACHE_KEYS = [
  "aksarahub-theme",
  "aksarahub-preferences",
  "aksarahub-favorites",
  "aksarahub-notifications",
];

/* ─── helpers ────────────────────────────────────────────────────── */

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

/* ─── sub-components ─────────────────────────────────────────────── */

/** Section wrapper with heading */
function SettingsSection({ icon, title, description, children }) {
  return (
    <div className="rounded-xl border border-borderSoft bg-white shadow-book overflow-hidden">
      {/* Section header */}
      <div className="flex items-start gap-4 border-b border-borderSoft bg-cream px-6 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-borderSoft shadow-sm text-amber-700 dark:text-amber-400">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold text-sm text-textMain">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-textSecondary leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {/* Section body */}
      <div className="divide-y divide-borderSoft">{children}</div>
    </div>
  );
}

/** A single settings row */
function SettingsRow({ label, description, children }) {
  return (
    <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-textMain">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-textSecondary leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Segmented button control */
function SegmentedControl({ value, options, onChange, name }) {
  return (
    <div
      role="group"
      aria-label={name}
      className="inline-flex rounded-lg border border-borderSoft bg-cream p-0.5 gap-0.5"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={[
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
              active
                ? "bg-white shadow-sm text-textMain border border-borderSoft"
                : "text-textSecondary hover:text-textMain",
            ].join(" ")}
          >
            {opt.icon && <Icon name={opt.icon} className="h-3.5 w-3.5" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Toggle switch */
function Toggle({ checked, onChange, id, label }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
        checked ? "bg-amber-600" : "bg-borderSoft",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm",
          "transform transition-transform duration-300",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

/** Confirmation dialog overlay */
function ConfirmDialog({ isOpen, title, message, confirmLabel, onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-sm rounded-xl border border-borderSoft bg-white p-6 shadow-2xl outline-none"
        style={{ animation: "fadeInScale 0.2s ease-out both" }}
      >
        {/* Warning icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100">
          <Icon name="trash" className="h-5 w-5 text-red-600" />
        </div>

        <h2
          id="confirm-dialog-title"
          className="font-playfair text-lg font-bold text-textMain text-center mb-2"
        >
          {title}
        </h2>
        <p className="text-sm text-textSecondary text-center leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
          >
            <Icon name="trash" className="h-4 w-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────── */

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();

  // Preference state – initialised from localStorage
  const [prefs, setPrefs] = useState(loadSettings);

  // Whether the user has unsaved changes (dirty state)
  const [isDirty, setIsDirty] = useState(false);

  // Confirm-dialog state
  const [showClearDialog, setShowClearDialog] = useState(false);

  /* helpers */
  const updatePref = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  /* save */
  const handleSave = useCallback(() => {
    const ok = saveSettings(prefs);
    if (ok) {
      setIsDirty(false);
      aksaraToast.settingsSaved();
    }
  }, [prefs]);

  /* reset */
  const handleReset = useCallback(() => {
    setPrefs({ ...DEFAULT_SETTINGS });
    saveSettings(DEFAULT_SETTINGS);
    setIsDirty(false);
    aksaraToast.settingsReset();
  }, []);

  /* clear cache */
  const handleClearCache = useCallback(() => {
    try {
      CACHE_KEYS.forEach((key) => localStorage.removeItem(key));
      aksaraToast.cacheCleared();
    } catch {
      aksaraToast.cacheClearError();
    } finally {
      setShowClearDialog(false);
    }
  }, []);

  const themeLabel = isDarkMode ? "Gelap" : "Terang";

  return (
    <>
      <section
        className="mx-auto min-h-[70vh] max-w-3xl px-4 py-14 sm:px-6 lg:px-8"
        aria-label="Halaman Pengaturan"
      >
        {/* ── Page header ── */}
        <div className="mb-8">
          <p className="section-label mb-2">Preferensi</p>
          <h1 className="font-playfair text-3xl font-bold text-textMain">
            Pengaturan Aplikasi
          </h1>
          <p className="mt-2 text-sm text-textSecondary">
            Sesuaikan AksaraHub sesuai kebutuhan Anda. Semua pengaturan disimpan
            secara lokal di perangkat ini.
          </p>
        </div>

        <div className="space-y-5">
          {/* ── 1. Tampilan & Tema ── */}
          <SettingsSection
            icon="monitor"
            title="Tampilan & Tema"
            description="Atur mode warna dan tampilan visual aplikasi."
          >
            {/* Dark / Light mode */}
            <SettingsRow
              label="Tema Aplikasi"
              description={`Mode tampilan saat ini: ${themeLabel}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-textSecondary font-medium">
                  {isDarkMode ? "Gelap" : "Terang"}
                </span>
                <Toggle
                  id="theme-toggle"
                  label="Toggle tema gelap"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <Icon
                  name={isDarkMode ? "moon" : "sun"}
                  className="h-4 w-4 text-amber-600"
                />
              </div>
            </SettingsRow>

            {/* UI Animations */}
            <SettingsRow
              label="Animasi UI"
              description="Aktifkan transisi dan animasi antarmuka."
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-textSecondary font-medium">
                  {prefs.uiAnimations ? "Aktif" : "Nonaktif"}
                </span>
                <Toggle
                  id="animation-toggle"
                  label="Toggle animasi UI"
                  checked={prefs.uiAnimations}
                  onChange={(v) => updatePref("uiAnimations", v)}
                />
              </div>
            </SettingsRow>
          </SettingsSection>

          {/* ── 2. Katalog Buku ── */}
          <SettingsSection
            icon="collection"
            title="Katalog Buku"
            description="Tentukan cara katalog buku ditampilkan secara default."
          >
            {/* Default view */}
            <SettingsRow
              label="Tampilan Default"
              description="Pilih antara tampilan kartu grid atau daftar baris."
            >
              <SegmentedControl
                name="Tampilan katalog"
                value={prefs.catalogView}
                onChange={(v) => updatePref("catalogView", v)}
                options={[
                  { value: "grid", label: "Grid", icon: "grid" },
                  { value: "list", label: "List", icon: "sort" },
                ]}
              />
            </SettingsRow>

            {/* Books per page */}
            <SettingsRow
              label="Buku per Halaman"
              description="Jumlah buku yang ditampilkan di setiap halaman katalog."
            >
              <SegmentedControl
                name="Jumlah buku per halaman"
                value={prefs.booksPerPage}
                onChange={(v) => updatePref("booksPerPage", Number(v))}
                options={[
                  { value: 10, label: "10" },
                  { value: 20, label: "20" },
                  { value: 30, label: "30" },
                ]}
              />
            </SettingsRow>
          </SettingsSection>

          {/* ── 3. Data & Privasi ── */}
          <SettingsSection
            icon="database"
            title="Data & Privasi"
            description="Kelola data lokal yang tersimpan di perangkat ini."
          >
            <SettingsRow
              label="Hapus Cache Lokal"
              description="Menghapus favorit, preferensi, dan data tersimpan lainnya dari perangkat ini."
            >
              <button
                type="button"
                id="clear-cache-btn"
                onClick={() => setShowClearDialog(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-all duration-200 hover:bg-red-100 hover:border-red-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 cursor-pointer"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
                Hapus Cache
              </button>
            </SettingsRow>
          </SettingsSection>

          {/* ── 4. Informasi Aplikasi ── */}
          <SettingsSection
            icon="info"
            title="Informasi Aplikasi"
            description="Detail teknis aplikasi AksaraHub."
          >
            {/* App version */}
            <SettingsRow label="Versi Aplikasi">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-borderSoft bg-cream px-3 py-1 text-xs font-semibold text-textMain">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                v{APP_VERSION}
              </span>
            </SettingsRow>

            {/* Data source */}
            {/* <SettingsRow label="Sumber Data">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <Icon name="database" className="h-3.5 w-3.5" />
                {DATA_SOURCE}
              </span>
            </SettingsRow> */}

            {/* Storage */}
            <SettingsRow
              label="Penyimpanan Preferensi"
              description="Semua preferensi disimpan di LocalStorage perangkat Anda."
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-borderSoft bg-cream px-3 py-1 text-xs font-semibold text-textSecondary">
                <Icon name="database" className="h-3 w-3" />
                LocalStorage
              </span>
            </SettingsRow>
          </SettingsSection>

          {/* ── Action bar ── */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between pt-2">
            <button
              type="button"
              id="reset-settings-btn"
              onClick={handleReset}
              className="btn-secondary inline-flex items-center gap-2 text-sm"
            >
              <Icon name="refresh" className="h-4 w-4" />
              Reset ke Default
            </button>

            <button
              type="button"
              id="save-settings-btn"
              onClick={handleSave}
              disabled={!isDirty}
              className={[
                "btn-primary inline-flex items-center gap-2 text-sm",
                !isDirty ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
            >
              <Icon name="check" className="h-4 w-4" />
              {isDirty ? "Simpan Pengaturan" : "Tersimpan"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Confirm dialog ── */}
      <ConfirmDialog
        isOpen={showClearDialog}
        title="Hapus Cache Lokal?"
        message="Tindakan ini akan menghapus semua data lokal termasuk favorit, preferensi, dan riwayat. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Sekarang"
        onConfirm={handleClearCache}
        onCancel={() => setShowClearDialog(false)}
      />
    </>
  );
}
