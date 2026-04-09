import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Search, X, Tag, Loader2, AlertCircle, CheckCircle, Hash, AlignLeft } from "lucide-react";
import axios from "axios";

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const cfg = {
    success: { bg: "bg-emerald-500", icon: <CheckCircle size={16} /> },
    error:   { bg: "bg-rose-500",    icon: <AlertCircle  size={16} /> },
    info:    { bg: "bg-blue-500",    icon: null },
  };
  const { bg, icon } = cfg[type] || cfg.info;

  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl text-white shadow-2xl text-sm font-medium ${bg}`}
      style={{ animation: "slideIn 0.3s ease" }}>
      {icon}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={13} /></button>
    </div>
  );
}

function ConfirmDialog({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[380px] shadow-2xl" style={{ animation: "fadeUp 0.25s ease" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-rose-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">Xác nhận xóa</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 pl-[52px]">
          Bạn có chắc muốn xóa thể loại <span className="font-semibold text-gray-700">"{name}"</span>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Hủy</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition font-semibold">Xóa</button>
        </div>
      </div>
    </div>
  );
}


function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const delta = 2;
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - delta && i <= page + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  const btnBase = {
    border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10,
    padding: "7px 14px", cursor: "pointer", fontSize: "0.83rem",
    transition: "all 0.18s", background: "#fff", color: "#555",
  };
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: "2rem" }}>
      <button style={{ ...btnBase, opacity: page === 0 ? 0.35 : 1 }}
        disabled={page === 0} onClick={() => onChange(page - 1)}>← Trước</button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} style={{ color: "#aaa", padding: "0 4px", fontSize: "0.85rem" }}>…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)} style={{
            ...btnBase,
            background: p === page ? "#1a1a1a" : "#fff",
            color: p === page ? "#f5f0e8" : "#555",
            border: p === page ? "1px solid #1a1a1a" : "1px solid rgba(0,0,0,0.1)",
            fontWeight: p === page ? 700 : 400,
            minWidth: 36, padding: "7px 10px", textAlign: "center",
          }}>{p + 1}</button>
        )
      )}
      <button style={{ ...btnBase, opacity: page >= totalPages - 1 ? 0.35 : 1 }}
        disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Tiếp →</button>
    </div>
  );
}

const EMPTY = { code: "", name: "", description: "" };


function Genres() {
  const [genres, setGenres]   = useState([]);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isOpen, setIsOpen]   = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData]   = useState(EMPTY);
  const [errors, setErrors]       = useState({});

  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState(null);
  const searchDebounce = useRef(null);

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 400);
    return () => clearTimeout(searchDebounce.current);
  }, [search]);

  useEffect(() => { fetchGenres(); }, [page, debouncedSearch]);

  const showToast = (message, type = "info") => setToast({ message, type });
  const getToken = () => localStorage.getItem("token");

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        sortBy: 'createdAt',
        sortDirection: 'DESC',
        ...(debouncedSearch.trim() && { searchTerm: debouncedSearch.trim() }),
      });
      const res = await axios.get(`http://localhost:8080/api/genres/get?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = res.data;
      const list = Array.isArray(data) ? data : data.content || [];

      const withCounts = await Promise.all(
        list.map(async (genre) => {
          try {
            const countRes = await axios.get(
              `http://localhost:8080/api/genres/${genre.id}/book-count`,
              { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            return { ...genre, bookCount: countRes.data ?? 0 };
          } catch {
            return { ...genre, bookCount: 0 };
          }
        })
      );

      setGenres(withCounts);
      setTotalPages(data.totalPage || Math.ceil((data.totalElement || withCounts.length) / 10));
      setTotalElements(data.totalElement || withCounts.length);
    } catch {
      showToast("Không thể tải danh sách thể loại", "error");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.code?.trim()) e.code = "Mã thể loại là bắt buộc";
    if (!formData.name?.trim()) e.name = "Tên thể loại là bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      code:        formData.code.trim(),
      name:        formData.name.trim(),
      description: formData.description.trim() || null,
    };
    try {
      if (editing) {
        await axios.put(`http://localhost:8080/api/genres/${currentId}`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        showToast("Cập nhật thể loại thành công!", "success");
      } else {
        await axios.post("http://localhost:8080/api/genres/create", payload, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        showToast("Thêm thể loại thành công!", "success");
      }
      await fetchGenres();
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirm) return;
    try {
      await axios.delete(`http://localhost:8080/api/genres/${confirm.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast(`Đã xóa thể loại "${confirm.name}"`, "success");
      if (genres.length === 1 && page > 0) setPage(p => p - 1);
      else await fetchGenres();
    } catch {
      showToast("Xóa thất bại", "error");
    } finally {
      setConfirm(null);
    }
  };

  const handleEdit = (genre) => {
    setEditing(true);
    setCurrentId(genre.id);
    setFormData({
      code:        genre.code        || "",
      name:        genre.name        || "",
      description: genre.description || "",
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
      {confirm && <ConfirmDialog name={confirm.name} onConfirm={handleDeleteConfirm} onCancel={() => setConfirm(null)} />}

      <div className="p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-800">Quản Lý Thể Loại</h2>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-violet-200">
             Thêm Thể Loại
          </button>
        </div>
        <div className="mb-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input type="text" placeholder="Tìm theo tên hoặc mã thể loại..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-gray-50" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["ID", "Mã thể loại", "Tên thể loại", "Mô tả", "Số sách", "Hành động"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Loader2 size={26} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">Đang tải</p>
                  </td>
                </tr>
              ) : genres.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Tag size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Không tìm thấy thể loại </p>
                  </td>
                </tr>
              ) : (
                genres.map((genre) => (
                  <tr key={genre.id} className="border-b border-gray-50 hover:bg-violet-50/30 transition">
                    <td className="px-5 py-3.5 text-gray-900">{genre.id}</td>
                    <td className="px-5 py-3.5 text-gray-900 font-mono">{genre.code}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{genre.name}</td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-[260px]">
                      <span className="line-clamp-2">{genre.description || <span className="text-gray-300 italic">—</span>}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-900" align="center">
                      {genre.bookCount || 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleEdit(genre)} title="Chỉnh sửa" className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition"><Edit2 size={15} /></button>
                        <button onClick={() => setConfirm({ id: genre.id, name: genre.name })} title="Xóa" className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" style={{ animation: "fadeUp 0.25s ease" }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Tag size={17} className="text-violet-600" />
                </div>
                <h3 className="text-base font-bold text-gray-800">
                  {editing ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={17} className="text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <Field label="Mã thể loại " error={errors.code}>
                <input type="text" placeholder="VD: FICTION" value={formData.code}
                  onChange={e => handleChange("code", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 w-full font-mono ${errors.code ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
              </Field>

              <Field label="Tên thể loại"  error={errors.name}>
                <input type="text" placeholder="VD: Khoa học viễn tưởng" value={formData.name}
                  onChange={e => handleChange("name", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 w-full ${errors.name ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
              </Field>

              <Field label="Mô tả"  error={errors.description} >
                <textarea rows={3} placeholder="Mô tả ngắn về thể loại này..."
                  value={formData.description} onChange={e => handleChange("description", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none w-full" />
              </Field>
            </div>

            <div className="flex items-center justify-between px-6 pb-6">
              <p className="text-xs text-gray-400"></p>
              <div className="flex gap-2.5">
                <button onClick={closeModal} disabled={submitting}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50">
                  Hủy
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-violet-200 disabled:opacity-50 flex items-center gap-2">
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

export default Genres;