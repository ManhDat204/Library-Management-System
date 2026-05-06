import api from "./api";

export const authorService = {
  searchAuthors: (params) => api.get("/authors", { params }),
  createAuthor: (data) => api.post("/authors", data),
  updateAuthor: (id, data) => api.put(`/authors/${id}`, data),
  softDeleteAuthor: (id) => api.delete(`/authors/${id}`),
};
