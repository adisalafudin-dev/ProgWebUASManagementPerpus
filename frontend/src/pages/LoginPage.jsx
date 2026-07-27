import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import aksaraHubLogo from "../assets/AksaraHub Logo.png";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ROLES } from "../constants/roles.js";
import aksaraToast from "../utils/toast.js";
import { extractErrorMessage } from "../services/httpClient.js";

export default function LoginPage({ redirectTo = "/" }) {
  const { user, isAuthenticated, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const nextRedirect = location.state?.redirectTo || redirectTo;
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
    setErrors([]);
  };

  const validate = () => {
    const msgs = [];
    const email = values.email.trim();
    const password = values.password.trim();

    if (!email) msgs.push("Email wajib diisi.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      msgs.push("Format email tidak valid.");
    if (!password) msgs.push("Password wajib diisi.");

    return msgs;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const session = await login({
        email: values.email.trim(),
        password: values.password.trim(),
      });
      aksaraToast.loginSuccess();
      const role = session?.user?.role;
      if (role === ROLES.ADMIN) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(nextRedirect, { replace: true });
      }
    } catch (err) {
      const msg = extractErrorMessage(err);
      setErrors(Array.isArray(msg) ? msg : [msg]);
      aksaraToast.loginError();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const fillAdmin = () => {
    setValues({ email: "admin@perpustakaan.com", password: "admin123" });
    setErrors([]);
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-borderSoft bg-white p-7 shadow-book sm:p-9 dark:bg-[#17211f]">
        {isAuthenticated ? (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-cream shadow-book">
              <img
                src={aksaraHubLogo}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-full w-full scale-[1.55] object-cover"
              />
            </div>
            <p className="section-label mb-2">Sudah Login</p>
            <h2 className="font-playfair text-2xl font-bold text-textMain">
              {user.name}
            </h2>
            <p className="mt-1 text-sm text-textSecondary">{user.email}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/" className="btn-primary">
                <Icon name="compass" className="h-4 w-4" />
                Ke Jelajah
              </Link>
              {user?.role === ROLES.ADMIN && (
                <Link to="/admin/dashboard" className="btn-primary">
                  <Icon name="settings" className="h-4 w-4" />
                  Panel Admin
                </Link>
              )}
              <button type="button" className="btn-secondary" onClick={handleLogout}>
                Keluar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream shadow-book">
                <img
                  src={aksaraHubLogo}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full scale-[1.55] object-cover"
                />
              </div>
              <div>
                <p className="section-label mb-1">Login</p>
                <h1 className="font-playfair text-2xl font-bold leading-tight text-textMain">
                  Masuk ke AksaraHub
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="section-label mb-1.5 block">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="input-field"
                  placeholder="nama@email.com"
                  value={values.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="login-password" className="section-label">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex items-center gap-1 text-xs font-semibold text-textSecondary hover:text-accentHover"
                  >
                    <Icon name="eye" className="h-3.5 w-3.5" />
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="input-field"
                  placeholder="Masukkan password"
                  value={values.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                />
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-accentHover dark:bg-red-950/20">
                {errors.map((msg, i) => (
                  <p key={i}>{msg}</p>
                ))}
              </div>
            )}

            <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
              <Icon name="users" className="h-4 w-4" />
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <button
              type="button"
              onClick={fillAdmin}
              className="mt-3 w-full rounded-lg border border-dashed border-borderSoft px-4 py-2.5 text-center text-sm text-textSecondary transition-colors hover:border-accent hover:text-accentHover"
            >
              Gunakan akun admin{" "}
              <span className="font-semibold">admin@perpustakaan.com</span> /{" "}
              <span className="font-semibold">admin123</span>
            </button>

            <p className="mt-5 text-center text-sm text-textSecondary">
              Belum punya akun?{" "}
              <Link to="/register" className="font-semibold text-accentHover">
                Daftar
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
