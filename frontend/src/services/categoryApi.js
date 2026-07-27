import api from "./httpClient.js";

const unwrap = (r) => r.data;

export const getCategories = () => api.get("/categories").then(unwrap);

export const getCategoryById = (id) =>
  api.get(`/categories/${id}`).then(unwrap);

export const createCategory = (payload) =>
  api.post("/categories", payload).then(unwrap);

export const updateCategory = (id, payload) =>
  api.put(`/categories/${id}`, payload).then(unwrap);

export const patchCategory = (id, payload) =>
  api.patch(`/categories/${id}`, payload).then(unwrap);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then(unwrap);

const categoryApi = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  patchCategory,
  deleteCategory,
};

export default categoryApi;
