import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, CheckCircle, Building2 } from "lucide-react";
import axios from "axios";

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "bg-emerald-500", error: "bg-rose-500", info: "bg-blue-500" };
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-2xl text-sm font-medium ${colors[type] || colors.info}`}
      style={{ animation: "slideIn 0.3s ease" }}>
      {type === "success" && <CheckCircle size={18} />}
      {type === "error"   && <AlertCircle  size={18} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
            <AlertCircle size={20} className="text-rose-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">Xác nhận xóa</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Hủy</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition">Xóa</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { name: "", country: "" };

function Publishers() {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [confirm, setConfirm]       = useState(null);
  const [toast, setToast]           = useState(null);

  const showToast = (message, type = "info") => setToast({ message, type });
  const getToken  = () => localStorage.getItem("token");
  const auth      = () => ({ Authorization: `Bearer ${getToken()}` });

  useEffect(() => { fetchPublishers(); }, []);

  const fetchPublishers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/publishers", { headers: auth() });
      setPublishers(res.data || []);
    } catch {
      showToast("Không thể tải danh sách nhà xuất bản", "error");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Tên nhà xuất bản là bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/publishers/${editingId}`, formData, { headers: auth() });
        showToast("Cập nhật nhà xuất bản thành công!", "success");
      } else {
        await axios.post("http://localhost:8080/api/publishers", formData, { headers: auth() });
        showToast("Thêm nhà xuất bản thành công!", "success");
      }
      await fetchPublishers();
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
      await axios.delete(`http://localhost:8080/api/publishers/${confirm.id}`, { headers: auth() });
      showToast(`Đã xóa "${confirm.name}"`, "success");
      await fetchPublishers();
    } catch {
      showToast("Xóa thất bại", "error");
    } finally {
      setConfirm(null);
    }
  };

  const handleEdit = (pub) => {
    setEditingId(pub.id);
    setFormData({ name: pub.name || "", country: pub.country || "" });
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null);
    setFormData(EMPTY_FORM); setErrors({});
  };

  return (
    <>
      <style>{`@keyframes slideIn { from { transform: translateX(120%); opacity:0 } to { transform: translateX(0); opacity:1 } }`}</style>
      {toast   && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog message={`Bạn có chắc muốn xóa "${confirm.name}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setConfirm(null)} />}

      <div style={{ width: "100%", padding: "24px", boxSizing: "border-box" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-800">Quản lý Nhà Xuất Bản</h2>
          </div>
          <button onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setErrors({}); setShowForm(true); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-purple-200">
            Thêm NXB
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                {["ID", "Tên nhà xuất bản", "Quốc gia", "Trạng thái", "Hành động"].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
                  <Loader2 size={30} className="animate-spin mx-auto mb-2" />
                  <p style={{ fontSize: "14px" }}>Đang tải...</p>
                </td></tr>
              ) : publishers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
                  <Building2 size={36} className="mx-auto mb-2 opacity-30" />
                  <p style={{ fontSize: "14px" }}>Chưa có nhà xuất bản nào</p>
                </td></tr>
              ) : publishers.map(pub => (
                <tr key={pub.id} style={{ borderBottom: "1px solid #f9fafb" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(245,243,255,0.5)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px 20px", color: "#6b7280", fontSize: 14 }}>{pub.id}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, fontSize: 15, color: "#1f2937" }}>{pub.name}</td>
                  <td style={{ padding: "16px 20px", color: "#6b7280", fontSize: 14 }}>{pub.country || "—"}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: pub.active ? "#d1fae5" : "#fee2e2",
                      color: pub.active ? "#059669" : "#dc2626"
                    }}>
                      {pub.active ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleEdit(pub)} title="Chỉnh sửa"
                        className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                        <Edit2 size={17} />
                      </button>
                      <button onClick={() => setConfirm({ id: pub.id, name: pub.name })} title="Xóa"
                        className="p-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-800">{editingId ? "Chỉnh sửa NXB" : "Thêm nhà xuất bản"}</h2>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên nhà xuất bản </label>
                <input placeholder="NXB Kim Đồng..." value={formData.name}
                  onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }}
                  className={`border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 ${errors.name ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
                {errors.name && <span className="text-xs text-rose-500">{errors.name}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quốc gia</label>
                <input placeholder="Việt Nam, USA..." value={formData.country}
                  onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={closeForm} disabled={submitting}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50">
                Hủy
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-purple-200 disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {editingId ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Publishers;