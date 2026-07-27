import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { useAuth } from "../contexts/AuthContext.jsx";
import authApi from "../services/authApi.js";
import aksaraToast from "../utils/toast.js";
import { extractErrorMessage } from "../services/httpClient.js";

/* ─── helpers ─────────────────────────────────────────────────── */

function getInitials(name, email) {
  const source = name || email || "";
  const words = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase())
    .filter(Boolean);
  if (words.length >= 2) return words[0] + words[1];
  if (words.length === 1) return words[0];
  return "?";
}

/* ─── sub-components ──────────────────────────────────────────── */

function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md skeleton-shimmer ${className}`}
    />
  );
}

function ProfileSkeleton() {
  return (
    <section
      className="mx-auto min-h-[70vh] max-w-5xl px-4 py-14 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Memuat profil…"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-borderSoft bg-white p-8 shadow-book">
          <SkeletonBlock className="h-3 w-28 mb-6" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <SkeletonBlock className="h-20 w-20 rounded-full flex-shrink-0" />
            <div className="space-y-3 flex-1">
              <SkeletonBlock className="h-7 w-48" />
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-borderSoft bg-white p-6 shadow-book">
          <SkeletonBlock className="h-3 w-28 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-cream p-4">
                <SkeletonBlock className="h-3 w-24 mb-2" />
                <SkeletonBlock className="h-7 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileEmptyState() {
  return (
    <section
      className="mx-auto min-h-[70vh] max-w-5xl px-4 py-14 sm:px-6 lg:px-8 flex items-center justify-center"
      aria-label="Profil tidak tersedia"
    >
      <div className="rounded-xl border border-borderSoft bg-white p-12 shadow-book text-center max-w-md w-full">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "rgba(184,137,45,0.10)" }}
          aria-hidden="true"
        >
          <Icon name="user" className="h-10 w-10" style={{ color: "#b8892d" }} />
        </div>
        <h1 className="font-playfair text-2xl font-bold text-textMain mb-3">
          Profil Tidak Aktif
        </h1>
        <p className="text-sm text-textSecondary mb-8 leading-relaxed">
          Anda belum masuk ke akun. Silakan login untuk mengakses profil.
        </p>
        <Link to="/login" className="btn-primary">
          <Icon name="users" className="h-4 w-4" aria-hidden="true" />
          Masuk Sekarang
        </Link>
      </div>
    </section>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold profile-role-badge ${isAdmin ? "profile-role-badge--admin" : "profile-role-badge--user"}`}
    >
      <Icon
        name={isAdmin ? "shield" : "user"}
        className="h-3 w-3"
        aria-hidden="true"
      />
      {isAdmin ? "Administrator" : "Regular User"}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon
        name={icon}
        className="h-4 w-4 mt-0.5 flex-shrink-0 profile-info-icon"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <span className="font-semibold text-textMain mr-1.5">{label}:</span>
        <span className="text-textSecondary break-words">{value}</span>
      </div>
    </div>
  );
}

/* ─── Edit Profile Form ───────────────────────────────────────── */

function EditProfileForm({ user, onSuccess }) {
  const [values, setValues] = useState({ name: user.name, email: user.email });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      const payload = {};
      if (values.name.trim() !== user.name) payload.name = values.name.trim();
      if (values.email.trim() !== user.email) payload.email = values.email.trim();

      if (Object.keys(payload).length === 0) {
        setErrors(["Tidak ada perubahan."]);
        setLoading(false);
        return;
      }

      await authApi.updateProfile(payload);
      aksaraToast.settingsSaved();
      if (onSuccess) onSuccess();
      setIsOpen(false);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setErrors(Array.isArray(msg) ? msg : [msg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        id="btn-edit-profile"
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-secondary text-sm"
      >
        <Icon name="pen" className="h-4 w-4" aria-hidden="true" />
        Edit Profil
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-lg border border-borderSoft bg-cream/50 p-5 space-y-4">
      <p className="section-label">Edit Profil</p>
      <div>
        <label htmlFor="edit-name" className="text-xs font-semibold text-textSecondary mb-1 block">
          Nama
        </label>
        <input
          id="edit-name"
          type="text"
          className="input-field"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </div>
      <div>
        <label htmlFor="edit-email" className="text-xs font-semibold text-textSecondary mb-1 block">
          Email
        </label>
        <input
          id="edit-email"
          type="email"
          className="input-field"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-accentHover dark:bg-red-950/20">
          {errors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary text-sm" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
        <button type="button" className="btn-secondary text-sm" onClick={() => setIsOpen(false)}>
          Batal
        </button>
      </div>
    </form>
  );
}

/* ─── Change Password Form ────────────────────────────────────── */

function ChangePasswordForm() {
  const [values, setValues] = useState({ oldPassword: "", newPassword: "" });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!values.oldPassword || !values.newPassword) {
      setErrors(["Semua field wajib diisi."]);
      return;
    }
    if (values.newPassword.length < 6) {
      setErrors(["Password baru minimal 6 karakter."]);
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      aksaraToast.settingsSaved();
      setValues({ oldPassword: "", newPassword: "" });
      setIsOpen(false);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setErrors(Array.isArray(msg) ? msg : [msg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        id="btn-change-password"
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-secondary text-sm"
      >
        <Icon name="settings" className="h-4 w-4" aria-hidden="true" />
        Ubah Password
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-lg border border-borderSoft bg-cream/50 p-5 space-y-4">
      <p className="section-label">Ubah Password</p>
      <div>
        <label htmlFor="old-password" className="text-xs font-semibold text-textSecondary mb-1 block">
          Password Lama
        </label>
        <input
          id="old-password"
          type="password"
          autoComplete="current-password"
          className="input-field"
          value={values.oldPassword}
          onChange={(e) => setValues((v) => ({ ...v, oldPassword: e.target.value }))}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="text-xs font-semibold text-textSecondary mb-1 block">
          Password Baru
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className="input-field"
          placeholder="Minimal 6 karakter"
          value={values.newPassword}
          onChange={(e) => setValues((v) => ({ ...v, newPassword: e.target.value }))}
        />
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-accentHover dark:bg-red-950/20">
          {errors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary text-sm" disabled={loading}>
          {loading ? "Menyimpan..." : "Ubah Password"}
        </button>
        <button type="button" className="btn-secondary text-sm" onClick={() => setIsOpen(false)}>
          Batal
        </button>
      </div>
    </form>
  );
}

/* ─── main component ──────────────────────────────────────────── */

export default function ProfilePage() {
  const { user, isLoading, refreshProfile } = useAuth();

  if (isLoading) return <ProfileSkeleton />;
  if (!user) return <ProfileEmptyState />;

  const displayName = user.name || "—";
  const displayEmail = user.email || "—";
  const role = user.role || "user";
  const initials = getInitials(user.name, user.email);

  return (
    <section
      className="mx-auto min-h-[70vh] max-w-5xl px-4 py-14 sm:px-6 lg:px-8"
      aria-label="Halaman Profil Pengguna"
    >
      <h1 className="sr-only">Profil Pengguna – {displayName}</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Left column: main profile card ─────────────────── */}
        <div
          className="rounded-xl border border-borderSoft bg-white shadow-book overflow-hidden"
          role="region"
          aria-label="Informasi Profil"
        >
          <div
            className="h-2 w-full"
            style={{
              background:
                "linear-gradient(90deg, #18332f 0%, #b8892d 50%, #7a2e2e 100%)",
            }}
            aria-hidden="true"
          />

          <div className="p-8">
            <p className="section-label mb-6">Profil Pengguna</p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <div className="relative flex-shrink-0">
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold select-none"
                  style={{
                    background: "#18332f",
                    color: "#f6f1e8",
                    boxShadow: "0 0 0 4px rgba(184,137,45,0.20)",
                  }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-playfair text-2xl font-bold text-textMain mb-1 truncate">
                  {displayName}
                </h2>
                <p className="text-sm text-textSecondary mb-3 truncate">
                  {displayEmail}
                </p>
                <RoleBadge role={role} />
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <InfoRow icon="user" label="Nama Lengkap" value={displayName} />
              <InfoRow icon="globe" label="Email" value={displayEmail} />
              <InfoRow
                icon="shield"
                label="Role"
                value={role === "admin" ? "Administrator" : "Regular User"}
              />
            </div>

            {/* ── Action forms ──────────────────────────── */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <EditProfileForm user={user} onSuccess={refreshProfile} />
                <ChangePasswordForm />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column: quick links ────────────────────── */}
        <div
          className="rounded-xl border border-borderSoft bg-white p-6 shadow-book"
          role="region"
          aria-label="Navigasi Profil"
        >
          <p className="section-label mb-5">Akses Cepat</p>
          <nav aria-label="Navigasi cepat profil">
            <ul className="space-y-1">
              {[
                { to: "/favorites", icon: "heart", label: "Rak Favorit" },
                { to: "/books", icon: "bookOpen", label: "Katalog Buku" },
                { to: "/settings", icon: "settings", label: "Pengaturan" },
              ].map(({ to, icon, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-textSecondary
                               transition-all duration-150 hover:bg-cream hover:text-textMain group"
                    aria-label={label}
                  >
                    <Icon
                      name={icon}
                      className="h-4 w-4 profile-accent-icon transition-colors"
                      aria-hidden="true"
                    />
                    {label}
                    <Icon
                      name="chevronRight"
                      className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
