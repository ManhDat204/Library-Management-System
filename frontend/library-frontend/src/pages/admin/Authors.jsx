import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Search, X, User, Loader2 } from "lucide-react";

// Import common components
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Field from "../../components/common/Field";
import Pagination from "../../components/common/Pagination";

// Import services
import { authorService } from "../../services/authorService";

const EMPTY = { authorName: "", nationality: "", biography: "" };


function Authors() {
  const [authors, setAuthors]       = useState([]);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isOpen, setIsOpen]         = useState(false);
  const [editing, setEditing]       = useState(false);
  const [currentId, setCurrentId]   = useState(null);
  const [formData, setFormData]     = useState(EMPTY);
  const [errors, setErrors]         = useState({});

  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState(null);
  const searchDebounce = useRef(null);

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 400);
    return () => clearTimeout(searchDebounce.current);
  }, [search]);

  useEffect(() => { fetchAuthors(); }, [page, debouncedSearch]);

  const showToast = (message, type = "info") => setToast({ message, type });

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await authorService.searchAuthors({
        searchTerm: debouncedSearch.trim() || undefined,
        page,
        size: 10,
        sortBy: "id",
        sortDirection: "ASC"
      });
      setAuthors(res.data.content || []);
      setTotalPages(res.data.totalPage || 0);
    } catch {
      showToast("Không thể tải danh sách tác giả", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = () => {
    const e = {};
    if (!formData.authorName?.trim()) e.authorName = "Tên tác giả là bắt buộc";
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
    const payload = {
      authorName:  formData.authorName.trim(),
      nationality: formData.nationality.trim() || null,
      biography:   formData.biography.trim()   || null,
    };
    try {
      if (editing) {
        await authorService.updateAuthor(currentId, payload);
        showToast("Cập nhật tác giả thành công!", "success");
      } else {
        await authorService.createAuthor(payload);
        showToast("Thêm tác giả thành công!", "success");
      }
      await fetchAuthors();
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || "Có lỗi xảy ra", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirm) return;
    try {
      await authorService.softDeleteAuthor(confirm.id);
      showToast(`Đã xóa tác giả "${confirm.name}"`, "success");
      await fetchAuthors();
    } catch {
      showToast("Xóa thất bại", "error");
    } finally {
      setConfirm(null);
    }
  };

  const handleEdit = (author) => {
    setEditing(true);
    setCurrentId(author.id);
    setFormData({
      authorName:  author.authorName  || "",
      nationality: author.nationality || "",
      biography:   author.biography   || "",
    });
    setErrors({});
    setIsOpen(true);
  };

  const openAdd = () => {
    setEditing(false);
    setCurrentId(null);
    setFormData(EMPTY);
    setErrors({});
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditing(false);
    setCurrentId(null);
    setErrors({});
  };

  

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity:0 } to { transform: translateX(0); opacity:1 } }
        @keyframes fadeUp  { from { transform: translateY(16px); opacity:0 } to { transform: translateY(0); opacity:1 } }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc muốn xóa tác giả "${confirm.name}"?`}
          confirmLabel="Xóa"
          confirmClass="bg-rose-500 hover:bg-rose-600"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="p-4 md:p-6 w-full">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý tác giả</h2>
          </div>
          <button onClick={openAdd}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs md:text-sm font-semibold transition shadow-md shadow-blue-200 w-full sm:w-auto">
             <Plus size={16} />
             Thêm Tác Giả
          </button>
        </div>

        <div className="mb-4 md:mb-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" size={16} />
          <input type="text" placeholder="Tìm theo tên tác giả, quốc tịch..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 md:py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm" style={{ minWidth: "600px" }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["ID", "Tên tác giả", "Quốc tịch", "Tiểu sử", "Hành động"].map(h => (
                  <th key={h} className="px-3 md:px-5 py-2 md:py-3.5 text-left font-semibold text-gray-900 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 md:py-16 text-gray-400">
                    <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                    <p className="text-xs md:text-sm">Đang tải...</p>
                  </td>
                </tr>
              ) : authors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 md:py-16 text-gray-400">
                    <User size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs md:text-sm">Không tìm thấy tác giả nào</p>
                  </td>
                </tr>
              ) : (
                authors.map((author) => (
                  <tr key={author.id} className="border-b border-gray-50 hover:bg-amber-50/30 transition">
                    <td className="px-3 md:px-5 py-2 md:py-3.5 text-gray-900 text-xs md:text-sm font-medium">{author.id}</td>
                    <td className="px-3 md:px-5 py-2 md:py-3.5">
                      <span className="font-semibold text-gray-800 line-clamp-1">{author.authorName}</span>
                    </td>
                    <td className="px-3 md:px-5 py-2 md:py-3.5 text-gray-900 text-xs md:text-sm hidden sm:table-cell">
                      {author.nationality
                        ? <span className="flex items-center gap-1.5"><div className="text-gray-400" />{author.nationality}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-3 md:px-5 py-2 md:py-3.5 text-gray-900 text-xs md:text-sm max-w-xs hidden md:table-cell">
                      {author.biography
                        ? <span className="line-clamp-2 leading-relaxed">{author.biography}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-3 md:px-5 py-2 md:py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(author)} title="Chỉnh sửa"
                          className="p-1.5 md:p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition flex-shrink-0">
                          <Edit2 size={13} className="md:w-3.75 md:h-3.75" />
                        </button>
                        <button onClick={() => setConfirm({ id: author.id, name: author.authorName })} title="Xóa"
                          className="p-1.5 md:p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition flex-shrink-0">
                          <Trash2 size={13} className="md:w-3.75 md:h-3.75" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
         </table>
          </div>

        {!loading && authors.length > 0 && (
          <div className="px-4 md:px-5 py-2 md:py-3 border-t border-gray-50 bg-gray-50/50 text-xs text-gray-400">
            Trang {page + 1} / {totalPages}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
    </div>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" style={{ animation: "fadeUp 0.25s ease" }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-gray-800">
                  {editing ? "Chỉnh sửa tác giả" : "Thêm tác giả mới"}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={17} className="text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">

             
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên tác giả </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={e => handleChange("authorName", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 w-full ${errors.authorName ? "border-rose-400 bg-rose-50" : "border-gray-200"}`}
                />
                {errors.authorName && (
                  <span className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.authorName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quốc tịch</label>
                <input
                  type="text"
                  
                  value={formData.nationality}
                  onChange={e => handleChange("nationality", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiểu sử</label>
                <textarea
                  rows={4}

                  value={formData.biography}
                  onChange={e => handleChange("biography", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 w-full resize-none"
                />
              </div>

            </div>

            <div className="flex items-center justify-between px-6 pb-6">
              <p className="text-xs text-gray-400"></p>
              <div className="flex gap-2.5">
                <button onClick={closeModal} disabled={submitting}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50">
                  Hủy
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-amber-200 disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Authors;