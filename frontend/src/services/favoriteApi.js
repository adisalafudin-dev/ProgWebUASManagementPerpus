import api from "./httpClient.js";

const unwrap = (r) => r.data;

export const getFavorites = () => api.get("/favorites").then(unwrap);

export const getFavoriteById = (id) =>
  api.get(`/favorites/${id}`).then(unwrap);

export const checkFavorite = (bookId) =>
  api.get(`/favorites/check/${bookId}`).then(unwrap);

export const addFavorite = (bookId) =>
  api.post("/favorites", { bookId }).then(unwrap);

export const removeFavoriteById = (id) =>
  api.delete(`/favorites/${id}`).then(unwrap);

export const removeFavoriteByBook = (bookId) =>
  api.delete(`/favorites/book/${bookId}`).then(unwrap);

const favoriteApi = {
  getFavorites,
  getFavoriteById,
  checkFavorite,
  addFavorite,
  removeFavoriteById,
  removeFavoriteByBook,
};

export default favoriteApi;
