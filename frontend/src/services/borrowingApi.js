import api from "./httpClient.js";

const unwrap = (r) => r.data;

export const borrowBook = (bookId) =>
  api.post("/borrowings", { bookId }).then(unwrap);

export const returnBook = (id) =>
  api.patch(`/borrowings/${id}/return`).then(unwrap);

export const getMyBorrowings = () =>
  api.get("/borrowings/me").then(unwrap);

export const getAllBorrowings = () =>
  api.get("/borrowings").then(unwrap);

const borrowingApi = {
  borrowBook,
  returnBook,
  getMyBorrowings,
  getAllBorrowings,
};

export default borrowingApi;
