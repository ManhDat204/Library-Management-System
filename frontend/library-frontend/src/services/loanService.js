import api from "./api";

export const loanService = {
  searchLoans: (data) => api.post("/book-loans/search", data),

  getLoanById: (id) => api.get(`/book-loans/my/${id}`),

  checkout: (userId, data) => api.post(`/book-loans/checkout/user/${userId}`, data),

  markShipping: (id) => api.patch(`/book-loans/${id}/shipping`),

  approveReturn: (data) => api.post(`/book-loans/admin/approve-return`, data),

  updateOverdue: () => api.post(`/book-loans/admin/update-overdue`),

  confirmReceived: (id) => api.patch(`/book-loans/my/${id}/confirm-received`),

  requestReturn: (data) => api.post(`/book-loans/my/return-request`, data),

  markDelivered: (id) => api.patch(`/book-loans/${id}/delivered`),
};