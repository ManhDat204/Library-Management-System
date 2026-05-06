import api from "./api";

export const notificationService = {
  send: (data) => api.post("/notifications/send", data),
};
