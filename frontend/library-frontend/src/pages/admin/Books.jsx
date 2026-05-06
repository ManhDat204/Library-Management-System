import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Search, Eye, X, BookOpen, Loader2, ImagePlus } from "lucide-react";

// Import common components
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Field from "../../components/common/Field";
import Pagination from "../../components/common/Pagination";

// Import services
import { bookService } from "../../services/bookService";

const EMPTY_FORM = {
  isbn: "", title: "", authorId: "", genreId: "",
  publisherId: "", publicationDate: "", language: "",
  description: "", pages: "", totalCopies: "", availableCopies: "", price: "", coverImageUrl: ""
};

const REQUIRED_FIELDS = ["isbn", "title", "authorId", "genreId", "publisherId", "totalCopies", "availableCopies"];

function Books() {
  const [books, setBooks]           = useState([]);
  const [genres, setGenres]         = useState([]);
  const [authors, setAuthors]       = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [confirm, setConfirm]       = useState(null);
  const [toast, setToast]           = useState(null);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview]     = useState("");
  const fileInputRef    = useRef(null);
  const searchDebounce  = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 400);
    return () => clearTimeout(searchDebounce.current);
  }, [search]);

  useEffect(() => { fetchBooks(); }, [page, debouncedSearch]);
  useEffect(() => { fetchGenres(); fetchAuthors(); fetchPublishers(); }, []);

  const showToast = (message, type = "info") => setToast({ message, type });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await bookService.searchBooks({
        ...(debouncedSearch.trim() && { searchTerm: debouncedSearch.trim() }),
        page,
        size: 10,
        sortBy: "createdAt",
        sortDirection: "DESC",
      });
      const data = res.data;
      setBooks(data.content || []);
      setTotalPages(data.totalPage || 0);
      setTotalElements(data.totalElement || 0);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Không thể tải danh sách sách";
      showToast(String(msg).slice(0, 120), "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await bookService.getGenres();
      setGenres(res.data || []);
    } catch {}
  };

 const fetchAuthors = async () => {
    try {
      const res = await bookService.getAuthors();
      setAuthors(res.data.content || []);
    } catch (err) {
      console.error("authors error:", err);
    }
  };

  const fetchPublishers = async () => {
    try {
      const res = await bookService.getPublishers();
      setPublishers(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const uploadCoverImage = async (file) => {
    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await bookService.uploadImage(form);
      return res.data.url;
    } catch {
      showToast("Upload ảnh thất bại", "error");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = () => {
    const e = {};
    REQUIRED_FIELDS.forEach(f => {
      if (!formData[f] || String(formData[f]).trim() === "") e[f] = "Thông tin này là bắt buộc";
    });
    if (formData.pages && isNaN(Number(formData.pages)))                     e.pages = "Phải là số";
    if (formData.totalCopies && isNaN(Number(formData.totalCopies)))         e.totalCopies = "Phải là số";
    if (formData.availableCopies && isNaN(Number(formData.availableCopies))) e.availableCopies = "Phải là số";
    if (formData.price && isNaN(Number(formData.price)))                     e.price = "Phải là số";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      let coverUrl = formData.coverImageUrl;
      if (coverImageFile) {
        const uploadedUrl = await uploadCoverImage(coverImageFile);
        if (!uploadedUrl) { setSubmitting(false); return; }
        coverUrl = uploadedUrl;
      }

      const payload = {
        isbn:            formData.isbn,
        title:           formData.title,
        authorId:        formData.authorId    && Number(formData.authorId)    > 0 ? Number(formData.authorId)    : null,
        genreId:         formData.genreId     && Number(formData.genreId)     > 0 ? Number(formData.genreId)     : null,
        publisherId:     formData.publisherId && Number(formData.publisherId) > 0 ? Number(formData.publisherId) : null,
        publicationDate: formData.publicationDate || null,
        language:        formData.language        || null,
        description:     formData.description     || null,
        pages:           formData.pages           ? Number(formData.pages)           : null,
        totalCopies:     formData.totalCopies     ? Number(formData.totalCopies)     : null,
        availableCopies: formData.availableCopies ? Number(formData.availableCopies) : null,
        price:           formData.price           ? Number(formData.price)           : null,
        coverImageUrl:   coverUrl                 || null,
      };

      if (editingId) {
        await bookService.updateBook(editingId, payload);
        showToast("Cập nhật sách thành công!", "success");
      } else {
        await bookService.createBook(payload);
        showToast("Thêm sách thành công!", "success");
      }
      await fetchBooks();
      closeForm();
    } catch (err) {
      showToast(err?.response?.data?.message || "Có lỗi xảy ra", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirm) return;
    try {
      await bookService.deleteBook(confirm.id);
      showToast(`Đã xóa sách "${confirm.title}"`, "success");
      if (books.length === 1 && page > 0) setPage(p => p - 1);
      else await fetchBooks();
    } catch { showToast("Xóa sách thất bại", "error"); }
    finally   { setConfirm(null); }
  };

  const handleAddBook = () => {
    setEditingId(null); setFormData(EMPTY_FORM); setErrors({});
    setCoverImageFile(null); setCoverPreview(""); setShowForm(true);
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setFormData({
      isbn:            book.isbn            || "",
      title:           book.title           || "",
      authorId:        book.authorId        || "",
      genreId:         book.genreId         || "",
      publisherId:     book.publisherId     || "",
      publicationDate: book.publicationDate || "",
      language:        book.language        || "",
      description:     book.description     || "",
      pages:           book.pages           || "",
      totalCopies:     book.totalCopies     || "",
      availableCopies: book.availableCopies || "",
      price:           book.price           || "",
      coverImageUrl:   book.coverImageUrl   || "",
    });
    setErrors({});
    setCoverImageFile(null);
    setCoverPreview(book.coverImageUrl || "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); setErrors({});
    setCoverImageFile(null); setCoverPreview("");
  };

  const handleFileChange = (file) => {
    if (!file) return;
    setCoverImageFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity:0 } to { transform: translateX(0); opacity:1 } }
        @keyframes fadeUp  { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        .modal-enter { animation: fadeUp 0.25s ease; }
      `}</style>

      {toast   && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc muốn xóa sách "${confirm.title}"?`}
          confirmLabel="Xóa"
          confirmClass="bg-rose-500 hover:bg-rose-600"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div style={{ width: "100%", padding: "16px", boxSizing: "border-box" }} className="md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý Sách</h2>
          <button
            onClick={handleAddBook}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs md:text-sm font-semibold transition shadow-md shadow-blue-200 w-full sm:w-auto"
          >
            <Plus size={16} />
            Thêm Sách
          </button>
        </div>

        <div className="mb-4 md:mb-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 md:w-4.5 h-4 md:h-4.5" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sách, ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 md:py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ─── BOOK TABLE ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "ID", "Ảnh bìa", "Tên sách","Tác giả","Thể loại","Số lượng","Còn lại","Giá","Hành động",
                ].map((h) => (
                  <th key={h} className="px-3 md:px-5 py-2.5 md:py-3.5 text-left text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                      <Loader2 size={28} className="animate-spin mx-auto mb-2" />
                      <p style={{ fontSize: "13px" }}>Đang tải dữ liệu</p>
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                      <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                      <p style={{ fontSize: "13px" }}>Không tìm thấy sách</p>
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr
                      key={book.id}
                      style={{ borderBottom: "1px solid #f9fafb" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,246,255,0.4)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 12px", color: "#000000", fontSize: "12px", fontWeight: 600 }} className="md:text-base md:px-5 md:py-4">
                        {book.id}
                      </td>
                      <td style={{ padding: "12px 12px" }} className="md:px-5 md:py-4">
                        {book.coverImageUrl ? (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            style={{
                              width: 60,
                              height: 85,
                              objectFit: "cover",
                              borderRadius: 8,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                            }}
                            className="md:w-20 md:h-28"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        ) : (
                          <div
                            style={{
                              width: 50,
                              height: 70,
                              background: "#f3f4f6",
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            className="md:w-20 md:h-28"
                          >
                            <BookOpen size={16} color="#d1d5db" />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 600, color: "#000000", maxWidth: "100px" }} className="md:text-base md:px-5 md:py-4 md:max-w-none">
                        <span className="line-clamp-2">{book.title}</span>
                      </td>
                      <td style={{ padding: "12px 12px", color: "#000000", fontSize: "12px" }} className="md:text-base md:px-5 md:py-4 hidden sm:table-cell">
                        {book.authorName}
                      </td>
                      <td style={{ padding: "12px 12px", color: "#000000", fontSize: "12px", fontWeight: 500 }} className="md:text-base md:px-5 md:py-4 hidden md:table-cell">
                        {book.genreName}
                      </td>
                      <td style={{ padding: "12px 12px", fontWeight: 700, fontSize: "12px", color: "#000000" }} className="md:text-base md:px-5 md:py-4 hidden lg:table-cell">
                        {book.totalCopies}
                      </td>
                      <td style={{ padding: "12px 12px", fontWeight: 700, fontSize: "12px", color: "#000000" }} className="md:text-base md:px-5 md:py-4">
                        {book.availableCopies ?? 0}
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          color: "#000000",
                          fontWeight: 500,
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                        }}
                        className="md:text-base md:px-5 md:py-4 hidden lg:table-cell"
                      >
                        {book.price ? `${Number(book.price).toLocaleString()} ₫` : "—"}
                      </td>
                      <td style={{ padding: "12px 12px" }} className="md:px-5 md:py-4">
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => {
                              setSelectedBook(book);
                              setShowDetail(true);
                            }}
                            title="Xem chi tiết"
                            className="p-1.5 md:p-2.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition flex-shrink-0"
                          >
                            <Eye size={14} className="md:w-4.5 md:h-4.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(book)}
                            title="Chỉnh sửa"
                            className="p-1.5 md:p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex-shrink-0"
                          >
                            <Edit2 size={14} className="md:w-4.5 md:h-4.5" />
                          </button>
                          <button
                            onClick={() => setConfirm({ id: book.id, title: book.title })}
                            title="Xóa"
                            className="p-1.5 md:p-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition flex-shrink-0"
                          >
                            <Trash2 size={14} className="md:w-4.5 md:h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>

  
      {showDetail && selectedBook && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl modal-enter">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Chi tiết sách</h2>
        <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 flex gap-6">
        <div className="flex-shrink-0">
          {selectedBook.coverImageUrl ? (
            <img src={selectedBook.coverImageUrl} alt={selectedBook.title}
              className="w-60 h-80 object-cover rounded-xl shadow-md" />
          ) : (
            <div className="w-48 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
              <BookOpen size={32} className="text-gray-300" />
            </div>
          )}
        </div>

        <div className="flex-1 flex gap-x-6 text-sm">
          {/* Cột trái */}
          <div className="flex-1 flex flex-col gap-y-4">
            {[
              ["ISBN", selectedBook.isbn],
              ["Tác giả", selectedBook.authorName],
              ["Nhà xuất bản", selectedBook.publisherName],
              ["Ngôn ngữ", selectedBook.language],
              ["Tổng số bản", selectedBook.totalCopies],
              ["Giá", selectedBook.price ? `${Number(selectedBook.price).toLocaleString()} ₫` : "—"],
            ].filter(([, v]) => v !== undefined && v !== null && v !== "")
              .map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{label}</p>
                  <p className="text-gray-800 font-medium">{val}</p>
                </div>
              ))}
          </div>

          {/* Cột phải */}
          <div className="flex-1 flex flex-col gap-y-4">
            {[
              ["Tên sách", selectedBook.title],
              ["Thể loại", selectedBook.genreName],
              ["Ngày xuất bản", selectedBook.publicationDate],
              ["Số trang", selectedBook.pages],
              ["Còn lại", selectedBook.availableCopies],
            ].filter(([, v]) => v !== undefined && v !== null && v !== "")
              .map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{label}</p>
                  <p className="text-gray-800 font-medium">{val}</p>
                </div>
              ))}

            {/* Mô tả ngang hàng với Giá */}
            <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Mô tả</p>
            <p className="text-black-600 font-semibold leading-relaxed">
              {selectedBook.description || "Chưa có mô tả"}
            </p>
          </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 pb-6">
        <button onClick={() => { setShowDetail(false); handleEdit(selectedBook); }}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition flex items-center gap-2">
          <Edit2 size={15} /> Chỉnh sửa
        </button>
        <button onClick={() => setShowDetail(false)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
          Đóng
        </button>
      </div>
    </div>
  </div>
)}

      {/* ─── FORM MODAL ─── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-3 md:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-full md:max-w-3xl shadow-2xl modal-enter my-4">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {editingId ? "Cập nhật sách" : "Thêm sách mới"}
              </h2>
              <button onClick={closeForm} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <Field label="ISBN" error={errors.isbn}>
                <input
                  placeholder="978-..."
                  value={formData.isbn}
                  onChange={(e) => handleChange("isbn", e.target.value)}
                  className={`border rounded-xl px-3 py-2 md:py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.isbn ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                />
              </Field>

              <Field label="Tên sách" error={errors.title}>
                <input
                  placeholder="Nhập tên sách"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={`border rounded-xl px-3 py-2 md:py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.title ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                />
              </Field>

              <Field label="Tác giả" error={errors.authorId}>
                <select
                  value={formData.authorId}
                  onChange={(e) => handleChange("authorId", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white ${
                    errors.authorId ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                >
                  <option value="">Chọn tác giả</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.authorName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Thể loại" error={errors.genreId}>
                <select
                  value={formData.genreId}
                  onChange={(e) => handleChange("genreId", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white ${
                    errors.genreId ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                >
                  <option value="">Chọn thể loại</option>
                  {genres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Nhà xuất bản" error={errors.publisherId}>
                <select
                  value={formData.publisherId}
                  onChange={(e) => handleChange("publisherId", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white ${
                    errors.publisherId ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                >
                  <option value="">Chọn nhà xuất bản</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Ngày xuất bản">
                <input
                  type="date"
                  value={formData.publicationDate}
                  onChange={(e) => handleChange("publicationDate", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </Field>

              <Field label="Ngôn ngữ">
                <input
                  placeholder="Tiếng Việt, English..."
                  value={formData.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </Field>

              <Field label="Số trang" error={errors.pages}>
                <input
                  type="number"
                  min="1"
                  placeholder="300"
                  value={formData.pages}
                  onChange={(e) => handleChange("pages", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.pages ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                />
              </Field>

              <Field label="Tổng số bản" error={errors.totalCopies}>
                <input
                  type="number"
                  min="0"
                  placeholder="10"
                  value={formData.totalCopies}
                  onChange={(e) => handleChange("totalCopies", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.totalCopies ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                />
              </Field>

              <Field label="Số bản còn lại" error={errors.availableCopies}>
                <input
                  type="number"
                  min="0"
                  placeholder="10"
                  value={formData.availableCopies}
                  onChange={(e) => handleChange("availableCopies", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.availableCopies ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                />
              </Field>

              <Field label="Giá (VNĐ)" error={errors.price}>
                <input
                  type="number"
                  min="0"
                  placeholder="150000"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.price ? "border-rose-400 bg-rose-50" : "border-gray-200"
                  }`}
                />
              </Field>

              <div />

              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Ảnh bìa
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange(e.dataTransfer.files[0]);
                  }}
                  className="flex items-center gap-4 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition group"
                >
                  {coverPreview ? (
                    <>
                      <img
                        src={coverPreview}
                        alt="preview"
                        className="w-20 h-28 object-cover rounded-lg shadow-sm border flex-shrink-0"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <div className="flex flex-col gap-1 flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {coverImageFile ? coverImageFile.name : "Ảnh hiện tại"}
                        </p>
                        <p className="text-xs text-blue-500 group-hover:underline">Nhấn để đổi ảnh khác</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverImageFile(null);
                          setCoverPreview("");
                          handleChange("coverImageUrl", "");
                        }}
                        className="p-1.5 bg-rose-50 text-rose-400 rounded-lg hover:bg-rose-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 w-full py-3 text-gray-400">
                      <ImagePlus size={28} className="text-gray-300 group-hover:text-blue-400 transition" />
                      <p className="text-sm">Nhấn hoặc kéo thả ảnh vào đây</p>
                      <p className="text-xs">PNG, JPG, WEBP — tối đa 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
                {uploadingImage && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-blue-500">
                    <Loader2 size={13} className="animate-spin" /> Đang tải ảnh lên...
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <Field label="Mô tả">
                  <textarea
                    rows={3}
                    placeholder="Mô tả ngắn về nội dung sách..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 pb-6">
              <p className="text-xs text-gray-400">* Trường bắt buộc</p>
              <div className="flex gap-3">
                <button
                  onClick={closeForm}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || uploadingImage}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {(submitting || uploadingImage) && <Loader2 size={15} className="animate-spin" />}
                  {editingId ? "Cập nhật" : "Thêm sách"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Books;