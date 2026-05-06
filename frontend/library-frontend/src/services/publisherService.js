import api from "./api";

export const publisherService = {
  searchPublishers: (params) => api.get("/publishers", { params }),
  createPublisher: (data) => api.post("/publishers", data),
  updatePublisher: (id, data) => api.put(`/publishers/${id}`, data),
  deletePublisher: (id) => api.delete(`/publishers/${id}`),
  getAllPublishers: () => api.get("/publishers"),
};
