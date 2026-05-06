import api from "./api";

export const subscriptionService = {
  searchSubscriptions: (params) => api.get("/subscriptions/admin", { params }),
  getSubscriptionById: (id) => api.get(`/subscriptions/${id}`),
  createSubscription: (data) => api.post("/subscriptions", data),
  updateSubscription: (id, data) => api.put(`/subscriptions/${id}`, data),
  cancelSubscription: (id) => api.delete(`/subscriptions/${id}`),
  approveSubscription: (id) => api.post(`/subscriptions/${id}/approve`, {}),
  deactivateExpired: () => api.get("/subscriptions/admin/deactivate-expired"),
};
