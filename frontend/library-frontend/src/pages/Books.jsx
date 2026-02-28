import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', category: '' });
  const [loading, setLoading] = useState(false);

  // Lấy danh sách sách
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sách:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Thêm sách mới
  const addBook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/books', newBook);
      setNewBook({ title: '', author: '', category: '' });
      fetchBooks(); // Refresh danh sách
    } catch (error) {
      console.error('Lỗi khi thêm sách:', error);
    }
  };

  // Xóa sách
  const deleteBook = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sách này?')) {
      try {
        await api.delete(`/api/books/${id}`);
        fetchBooks(); // Refresh danh sách
      } catch (error) {
        console.error('Lỗi khi xóa sách:', error);
      }
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Quản lý sách</h2>

      {/* Form thêm sách */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Thêm sách mới</h3>
        <form onSubmit={addBook} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tên sách"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Tác giả"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Thể loại"
            value={newBook.category}
            onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Thêm sách
          </button>
        </form>
      </div>

      {/* Bảng danh sách sách */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Danh sách sách</h3>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Tên sách</th>
                <th className="px-4 py-2 text-left">Tác giả</th>
                <th className="px-4 py-2 text-left">Thể loại</th>
                <th className="px-4 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td className="border px-4 py-2">{book.id}</td>
                  <td className="border px-4 py-2">{book.title}</td>
                  <td className="border px-4 py-2">{book.author}</td>
                  <td className="border px-4 py-2">{book.category}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default Books;