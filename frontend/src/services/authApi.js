/**
 * authApi.js — Semua endpoint auth mengarah ke satu backend monolith.
 */
import api from "./httpClient.js";

const unwrap = (r) => r.data;

export const login = (credentials) =>
  api.post("/auth/login", credentials).then(unwrap);

export const register = (payload) =>
  api.post("/auth/register", payload).then(unwrap);

export const logout = () =>
  api
    .post("/auth/logout", {}, { _skipAuthRefresh: true })
    .then(unwrap);

export const refreshToken = (payload) =>
  api
    .post("/auth/refresh", payload, { _skipAuthRefresh: true })
    .then(unwrap);

export const getProfile = () => api.get("/auth/me").then(unwrap);

export const updateProfile = (payload) =>
  api.patch("/auth/me", payload).then(unwrap);

export const changePassword = (payload) =>
  api.post("/auth/change-password", payload).then(unwrap);

const authApi = {
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
};

export default authApi;
