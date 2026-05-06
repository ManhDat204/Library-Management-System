import api from "./api";

export const genreService = {
  searchGenres: (params) => api.get("/genres", { params }),
  createGenre: (data) => api.post("/genres/create", data),  // sửa endpoint
  updateGenre: (id, data) => api.put(`/genres/${id}`, data),
  deleteGenre: (id) => api.delete(`/genres/${id}`),
  hardDeleteGenre: (id) => api.delete(`/genres/${id}/hard`),
  getAllGenres: () => api.get("/genres/get"),
  getTopLevelGenres: () => api.get("/genres/top-level"),
  getTopBorrowedGenres: (limit = 5) => api.get("/genres/top-borrowed", { params: { limit } }),
  getTotalActiveGenres: () => api.get("/genres/count"),
  getBookCountByGenre: (id) => api.get(`/genres/${id}/book-count`),
  getGenreById: (id) => api.get(`/genres/${id}`),
};
