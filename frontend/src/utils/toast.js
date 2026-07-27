import { toast } from "sonner";

// Explicit durations in milliseconds
export const TOAST_DURATIONS = {
  success: 3000,
  info: 3000,
  warning: 4000,
  error: 5000,
};

/**
 * Base helper functions with default durations
 */
export const toastSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: TOAST_DURATIONS.success,
    ...options,
  });
};

export const toastInfo = (message, options = {}) => {
  return toast.info(message, {
    duration: TOAST_DURATIONS.info,
    ...options,
  });
};

export const toastWarning = (message, options = {}) => {
  return toast.warning(message, {
    duration: TOAST_DURATIONS.warning,
    ...options,
  });
};

export const toastError = (message, options = {}) => {
  return toast.error(message, {
    duration: TOAST_DURATIONS.error,
    ...options,
  });
};

/**
 * Flexible adapter function for legacy / generic toast calls
 */
export const showToast = (
  titleOrMessage,
  descriptionOrType,
  typeParam = "info",
  durationParam,
) => {
  let message = titleOrMessage;
  let description = undefined;
  let type = typeParam;
  let duration = durationParam;

  if (typeof descriptionOrType === "string") {
    if (["success", "info", "warning", "error"].includes(descriptionOrType)) {
      type = descriptionOrType;
    } else {
      description = descriptionOrType;
    }
  }

  const selectedDuration = duration || TOAST_DURATIONS[type] || 3000;
  const options = { duration: selectedDuration, description };

  switch (type) {
    case "success":
      return toast.success(message, options);
    case "warning":
      return toast.warning(message, options);
    case "error":
      return toast.error(message, options);
    case "info":
    default:
      return toast.info(message, options);
  }
};

/**
 * AksaraHub Action-Specific Toast Helpers
 */
export const aksaraToast = {
  // Favorit
  favoriteAdded: () => toastSuccess("Berhasil ditambahkan ke Favorit."),
  favoriteRemoved: () => toastSuccess("Buku dihapus dari Favorit."),
  favoriteAlreadyExists: () => toastInfo("Buku sudah berada di Favorit."),
  favoriteStorageReadError: () => toastWarning("Gagal membaca data favorit."),

  // Login & Logout
  loginSuccess: () => toastSuccess("Selamat datang!"),
  loginError: () => toastError("Email atau password tidak valid."),
  logoutSuccess: () => toastInfo("Berhasil keluar dari akun."),

  // Theme
  themeDarkMode: () => toastInfo("Dark Mode diaktifkan."),
  themeLightMode: () => toastInfo("Light Mode diaktifkan."),

  // API & Detail Buku
  apiFetchError: () => toastError("Gagal mengambil data buku."),
  bookDetailError: () => toastError("Gagal memuat detail buku."),

  // Admin Helpers (backend integration)
  adminBookAdded: () => toastSuccess("Buku berhasil ditambahkan."),
  adminBookUpdated: () => toastSuccess("Buku berhasil diperbarui."),
  adminBookDeleted: () => toastSuccess("Buku berhasil dihapus."),
  adminSyncSuccess: () => toastSuccess("Sinkronisasi data berhasil."),
  adminSyncFailed: () => toastError("Sinkronisasi gagal."),

  // Settings
  settingsSaved: () => toastSuccess("Pengaturan berhasil disimpan."),
  settingsReset: () => toastInfo("Pengaturan dikembalikan ke default."),
  cacheCleared: () => toastSuccess("Cache lokal berhasil dihapus."),
  cacheClearError: () => toastError("Gagal menghapus cache lokal."),

  // Generic helpers for ad-hoc messages
  success: (message, options) => toastSuccess(message, options),
  info: (message, options) => toastInfo(message, options),
  warning: (message, options) => toastWarning(message, options),
  error: (message, options) => toastError(message, options),
};

export default aksaraToast;
