import api from "./api";

export const bookService = {
  searchBooks: (params) => api.get("/books", { params }),
  createBook: (data) => api.post("/books/admin", data),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  deleteBook: (id) => api.delete(`/books/${id}`),
  getGenres: () => api.get("/genres/get"),
  getAuthors: () => api.get("/authors"),
  getPublishers: () => api.get("/publishers"),
  uploadImage: (formData) => api.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
};
