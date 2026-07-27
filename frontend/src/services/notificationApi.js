import api from "./httpClient.js";

const unwrap = (r) => r.data;

export const getNotifications = () =>
  api.get("/notifications").then(unwrap);

export const getUnreadCount = () =>
  api.get("/notifications/unread-count").then(unwrap);

export const getNotificationById = (id) =>
  api.get(`/notifications/${id}`).then(unwrap);

export const markAsRead = (id) =>
  api.patch(`/notifications/${id}/read`).then(unwrap);

export const markAllAsRead = () =>
  api.patch("/notifications/read-all").then(unwrap);

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`).then(unwrap);

const notificationApi = {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

export default notificationApi;
