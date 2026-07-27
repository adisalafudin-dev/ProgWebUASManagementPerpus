import api from "./httpClient.js";

const unwrap = (r) => r.data;

export const getUsers = () => api.get("/users").then(unwrap);

export const getUserById = (id) => api.get(`/users/${id}`).then(unwrap);

export const createUser = (payload) =>
  api.post("/users", payload).then(unwrap);

export const updateUser = (id, payload) =>
  api.put(`/users/${id}`, payload).then(unwrap);

export const patchUser = (id, payload) =>
  api.patch(`/users/${id}`, payload).then(unwrap);

export const updateUserRole = (id, payload) =>
  api.patch(`/users/${id}/role`, payload).then(unwrap);

export const deleteUser = (id) =>
  api.delete(`/users/${id}`).then(unwrap);

const userApi = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  updateUserRole,
  deleteUser,
};

export default userApi;
