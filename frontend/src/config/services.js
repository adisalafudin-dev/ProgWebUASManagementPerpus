export const SERVICE_KEYS = {
  AUTH: "auth",
  BOOK: "book",
  REVIEW: "review",
  FAVORITE: "favorite",
  USER: "user",
  MEMBER: "member",
  CATEGORY: "category",
  NOTIFICATION: "notification",
};

const DEFAULT_TIMEOUT = 10000;

export const services = {
  [SERVICE_KEYS.AUTH]: {
    name: "Auth Service",
    baseURL:
      import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:4001/api",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  },
  [SERVICE_KEYS.BOOK]: {
    name: "Book Service",
    baseURL:
      import.meta.env.VITE_BOOK_SERVICE_URL || "http://localhost:4002/api",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  },
  [SERVICE_KEYS.REVIEW]: {
    name: "Review Service",
    baseURL:
      import.meta.env.VITE_REVIEW_SERVICE_URL || "http://localhost:4003/api",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  },
  [SERVICE_KEYS.FAVORITE]: {
    name: "Favorite Service",
    baseURL:
      import.meta.env.VITE_FAVORITE_SERVICE_URL || "http://localhost:4004/api",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  },
  [SERVICE_KEYS.USER]: {
    name: "User Service",
    baseURL:
      import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:4005/api",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  },
  [SERVICE_KEYS.MEMBER]: {
    name: "Member Service",
    baseURL:
      import.meta.env.VITE_MEMBER_SERVICE_URL || "http://localhost:4005/api",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  },
  [SERVICE_KEYS.CATEGORY]: {
    name: "Category Service",
    baseURL:
      import.meta.env.VITE_CATEGORY_SERVICE_URL ||
      "http://localhost:4006/api",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  },
  [SERVICE_KEYS.NOTIFICATION]: {
    name: "Notification Service",
    baseURL:
      import.meta.env.VITE_NOTIFICATION_SERVICE_URL ||
      "http://localhost:4007/api",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  },
};

export const getServiceConfig = (serviceKey) => {
  const config = services[serviceKey];
  if (!config) {
    throw new Error(`Service config tidak ditemukan: ${serviceKey}`);
  }
  return config;
};
