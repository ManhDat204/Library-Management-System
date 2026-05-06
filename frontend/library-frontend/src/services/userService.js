import api from "./api";

export const userService = {
  searchUsers: (params) => api.get("/users", { params }),
  getAllUsers: () => api.get("/users/list"),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post("/users/admin", data),
  updateUser: (id, data) => api.put(`/users/admin/${id}`, data),
  deleteUser: (id) => api.delete(`/users/admin/${id}`),
  uploadAvatar: (id, formData) => api.post(`/users/${id}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
};
