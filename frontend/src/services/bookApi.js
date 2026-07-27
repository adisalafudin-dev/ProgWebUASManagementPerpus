/**
 * bookApi.js — Semua endpoint buku mengarah ke satu backend monolith.
 */
import api from "./httpClient.js";

const unwrap = (r) => r.data;

export const getBooks = (params) =>
  api.get("/books", { params }).then(unwrap);

export const getBookById = (id) => api.get(`/books/${id}`).then(unwrap);

export const createBook = (payload) =>
  api.post("/books", payload).then(unwrap);

export const updateBook = (id, payload) =>
  api.put(`/books/${id}`, payload).then(unwrap);

export const patchBook = (id, payload) =>
  api.patch(`/books/${id}`, payload).then(unwrap);

export const deleteBook = (id) => api.delete(`/books/${id}`).then(unwrap);

export const searchBooks = (params) =>
  api.get("/books/search", { params }).then(unwrap);

export const bookApi = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  patchBook,
  deleteBook,
  searchBooks,
};

export default bookApi;
