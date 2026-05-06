import api from "./api";

export const fineService = {
  searchFines: (params) => api.get("/fines", { params }),
  createFine: (data) => api.post("/fines", data),
  updateFine: (id, data) => api.put(`/fines/${id}`, data),
  deleteFine: (id) => api.delete(`/fines/${id}`),
  payFine: (id, data) => api.post(`/fines/${id}/pay`, data),
  getFineById: (id) => api.get(`/fines/${id}`),
  waiveFine: (id, data) => api.post(`/fines/${id}/waive`, data),
};
