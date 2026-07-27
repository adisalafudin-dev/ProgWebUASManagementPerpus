import api from "./httpClient.js";

const unwrap = (r) => r.data;

export const getReviews = () => api.get("/reviews").then(unwrap);

export const getReviewById = (id) =>
  api.get(`/reviews/${id}`).then(unwrap);

export const getBookReviews = (bookId) =>
  api.get(`/books/${bookId}/reviews`).then(unwrap);

export const getBookRatingSummary = (bookId) =>
  api.get(`/books/${bookId}/rating-summary`).then(unwrap);

export const createReview = (payload) =>
  api.post("/reviews", payload).then(unwrap);

export const updateReview = (id, payload) =>
  api.put(`/reviews/${id}`, payload).then(unwrap);

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`).then(unwrap);

export const moderateReview = (id, payload) =>
  api.patch(`/reviews/${id}/moderate`, payload).then(unwrap);

const reviewApi = {
  getReviews,
  getReviewById,
  getBookReviews,
  getBookRatingSummary,
  createReview,
  updateReview,
  deleteReview,
  moderateReview,
};

export default reviewApi;
