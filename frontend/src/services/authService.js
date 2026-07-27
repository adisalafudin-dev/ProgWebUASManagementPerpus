import { ROLES } from "../constants/roles.js";

const AUTH_SESSION_STORAGE_KEY = "aksarahub-auth";
const AUTH_USERS_STORAGE_KEY = "aksarahub-auth-users";
const ACCESS_TOKEN_TTL = 5 * 60 * 1000; // 5 menit
const REFRESH_TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 jam

const DEFAULT_USERS = {
  "demo@aksarahub.local": {
    name: "Demo Reader",
    email: "demo@aksarahub.local",
    password: "demo123",
    role: ROLES.USER,
  },
  "admin@aksarahub.local": {
    name: "Admin AksaraHub",
    email: "admin@aksarahub.local",
    password: "admin123",
    role: ROLES.ADMIN,
  },
};

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const createToken = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const getAuthSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveAuthSession = (session) => {
  try {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors for demo
  }
};

export const clearAuthSession = () => {
  try {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch {
    // ignore storage errors for demo
  }
};

const loadUsers = () => {
  try {
    const raw = localStorage.getItem(AUTH_USERS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USERS };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return { ...DEFAULT_USERS, ...parsed };
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_USERS };
};

const saveUsers = (users) => {
  try {
    localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore storage errors for demo
  }
};

export const isAccessTokenValid = (session) =>
  Boolean(session && Number(session.expiresAt) > Date.now());

export const isRefreshTokenValid = (session) =>
  Boolean(
    session &&
      session.refreshToken &&
      Number(session.refreshExpiresAt) > Date.now(),
  );

export const createAuthSession = ({ name, email, role = ROLES.USER }) => {
  const normalizedEmail = normalizeEmail(email);
  const now = Date.now();
  const user = {
    name: name?.trim() || normalizedEmail.split("@")[0] || "Pembaca",
    email: normalizedEmail,
    role: role || ROLES.USER,
    loggedInAt: new Date(now).toISOString(),
  };

  const session = {
    user,
    tokenType: "Bearer",
    accessToken: createToken("access"),
    refreshToken: createToken("refresh"),
    issuedAt: now,
    expiresAt: now + ACCESS_TOKEN_TTL,
    refreshExpiresAt: now + REFRESH_TOKEN_TTL,
  };

  saveAuthSession(session);
  return session;
};

export const refreshAuthSession = (session, refreshToken) => {
  if (!session || !refreshToken) {
    throw new Error("Refresh token tidak valid.");
  }
  if (session.refreshToken !== refreshToken) {
    throw new Error("Refresh token tidak cocok.");
  }
  if (!isRefreshTokenValid(session)) {
    throw new Error("Refresh token kadaluarsa.");
  }

  const now = Date.now();
  const nextSession = {
    ...session,
    accessToken: createToken("access"),
    issuedAt: now,
    expiresAt: now + ACCESS_TOKEN_TTL,
  };

  saveAuthSession(nextSession);
  return nextSession;
};

export const verifyUserCredentials = ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const users = loadUsers();

  if (!normalizedEmail || !password) {
    throw new Error("Email dan password wajib diisi.");
  }

  const user = users[normalizedEmail];
  if (!user || user.password !== password) {
    throw new Error("Email atau password salah.");
  }

  return {
    name: user.name,
    email: user.email,
    role: user.role || ROLES.USER,
  };
};

export const registerUser = ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const users = loadUsers();

  if (!normalizedEmail || !password) {
    throw new Error("Email dan password wajib diisi.");
  }

  if (users[normalizedEmail]) {
    throw new Error("Email sudah terdaftar.");
  }

  const nextUser = {
    name: name?.trim() || normalizedEmail.split("@")[0] || "Pembaca",
    email: normalizedEmail,
    password,
    role: ROLES.USER,
  };
  saveUsers({ ...users, [normalizedEmail]: nextUser });
  return {
    name: nextUser.name,
    email: nextUser.email,
    role: nextUser.role,
  };
};
