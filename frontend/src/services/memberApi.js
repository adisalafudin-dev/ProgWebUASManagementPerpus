import api from "./httpClient.js";

const unwrap = (r) => r.data;

export const getMembers = () => api.get("/members").then(unwrap);

export const getMemberById = (id) =>
  api.get(`/members/${id}`).then(unwrap);

export const createMember = (payload) =>
  api.post("/members", payload).then(unwrap);

export const patchMember = (id, payload) =>
  api.patch(`/members/${id}`, payload).then(unwrap);

export const deleteMember = (id) =>
  api.delete(`/members/${id}`).then(unwrap);

const memberApi = {
  getMembers,
  getMemberById,
  createMember,
  patchMember,
  deleteMember,
};

export default memberApi;
