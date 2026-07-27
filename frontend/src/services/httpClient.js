/**
 * httpClient.js — Satu axios instance untuk semua modul backend.
 *
 * - Base URL dari VITE_API_URL (satu backend monolith).
 * - Request interceptor: pasang Authorization header otomatis.
 * - Response interceptor: auto-refresh token saat 401, lalu retry.
 *   Kalau refresh juga gagal → logout paksa.
 */
import axios from "axios";

const AUTH_STORAGE_KEY = "aksarahub-auth";

// ── Token helpers (standalone, no circular deps) ─────────────────

export const getStoredTokens = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveStoredTokens = (data) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore storage errors */
  }
};

export const clearStoredTokens = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    /* ignore storage errors */
  }
};

// ── Error normalizer ─────────────────────────────────────────────

export class ApiError extends Error {
  constructor({ message, status = 0, data = null, originalError = null }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.originalError = originalError;
  }
}

/**
 * Extracts a user-friendly message from a backend error response.
 * `message` from NestJS can be string OR array of strings.
 */
export const extractErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || "Terjadi kesalahan tidak terduga.";

  const msg = data.message;
  if (Array.isArray(msg)) return msg.join(". ");
  if (typeof msg === "string") return msg;
  return data.error || "Permintaan gagal.";
};

export const normalizeApiError = (error) => {
  if (error instanceof ApiError) return error;

  if (error?.response) {
    return new ApiError({
      message: extractErrorMessage(error),
      status: error.response.status,
      data: error.response.data,
      originalError: error,
    });
  }

  if (error?.request) {
    return new ApiError({
      message: "Tidak dapat terhubung ke server.",
      status: 0,
      originalError: error,
    });
  }

  return new ApiError({
    message: error?.message || "Terjadi kesalahan tidak terduga.",
    status: 0,
    originalError: error,
  });
};

// ── Axios instance ───────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const TIMEOUT =
  Number(import.meta.env.VITE_API_TIMEOUT) || 10_000;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor: attach token ────────────────────────────

api.interceptors.request.use(
  (config) => {
    const stored = getStoredTokens();
    if (stored?.accessToken) {
      config.headers.Authorization = `Bearer ${stored.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeApiError(error)),
);

// ── Response interceptor: auto-refresh on 401 ───────────────────

let refreshPromise = null;

/** Callback set by AuthContext to force logout from React state */
let _forceLogout = null;
export const setForceLogout = (fn) => {
  _forceLogout = fn;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Skip refresh for auth/refresh and auth/logout themselves
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh
    ) {
      originalRequest._retry = true;

      try {
        // Coalesce concurrent refresh calls
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const stored = getStoredTokens();
            if (!stored?.refreshToken) {
              throw new ApiError({ message: "No refresh token", status: 401 });
            }

            // Direct axios call to avoid interceptor loop
            const res = await axios.post(
              `${BASE_URL}/auth/refresh`,
              { refreshToken: stored.refreshToken },
              { headers: { "Content-Type": "application/json" } },
            );

            const newTokens = {
              ...stored,
              accessToken: res.data.accessToken,
              refreshToken: res.data.refreshToken,
            };
            saveStoredTokens(newTokens);
            return newTokens;
          })();
        }

        const refreshed = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed → force logout
        clearStoredTokens();
        if (_forceLogout) _forceLogout();
        return Promise.reject(
          normalizeApiError(
            new ApiError({
              message: "Sesi berakhir, silakan login ulang.",
              status: 401,
            }),
          ),
        );
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export default api;
