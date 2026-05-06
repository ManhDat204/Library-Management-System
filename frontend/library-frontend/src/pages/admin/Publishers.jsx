import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Loader2, Building2, Search } from "lucide-react";

import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import { publisherService } from "../../services/publisherService";

const EMPTY_FORM = { name: "", country: "", address: "", phone: "", email: "", active: true };

function Publishers() {
  const [publishers, setPublishers]         = useState([]);
  const [allPublishers, setAllPublishers]   = useState([]);
  const [search, setSearch]                 = useState("");
  const [address, setAddress]               = useState("");
  const [page, setPage]                     = useState(0);
  const [totalPages, setTotalPages]         = useState(0);
  const [totalElements, setTotalElements]   = useState(0);
  const [loading, setLoading]               = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [showForm, setShowForm]             = useState(false);
  const [editingId, setEditingId]           = useState(null);
  const [formData, setFormData]             = useState(EMPTY_FORM);
  const [errors, setErrors]                 = useState({});
  const [confirm, setConfirm]               = useState(null);
  const [toast, setToast]                   = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchDebounce                      = useRef(null);

  const showToast = (message, type = "info") => setToast({ message, type });

  const getUniqueAddresses = () =>
    [...new Set(allPublishers.map(p => p.address).filter(Boolean))].sort();

  // Debounce search
  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(searchDebounce.current);
  }, [search]);

  useEffect(() => { fetchAllPublishers(); }, []);
  useEffect(() => { fetchPublishers(); }, [page, debouncedSearch, address]);

  const fetchAllPublishers = async () => {
    try {
      const res = await publisherService.getAllPublishers();
      setAllPublishers(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch (err) {
      console.error("Error fetching all publishers:", err);
    }
  };

  const fetchPublishers = async () => {
    setLoading(true);
    try {
      const res = await publisherService.searchPublishers({
        ...(debouncedSearch.trim() && { searchTerm: debouncedSearch.trim() }),
        ...(address.trim()         && { address: address.trim() }),
        page,
        size: 10,
      });
      const data = res.data;
      
      setPublishers(data.content || []);
      setTotalPages(data.totalPage || 0);
      setTotalElements(data.totalElement || 0);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Không thể tải danh sách";
      showToast(String(msg).slice(0, 120), "error");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Tên nhà xuất bản là bắt buộc";
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Email không hợp lệ";
    if (formData.phone.trim() && !/^\d{9,11}$/.test(formData.phone.replace(/\s/g, "")))
      e.phone = "Số điện thoại không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editingId) {

        const payload = {
          name:    formData.name.trim(),
          country: formData.country.trim(),
          address: formData.address.trim(),
          phone:   formData.phone.trim(),
          email:   formData.email.trim(),
      
        };
        console.log("Update payload:", payload);
        await publisherService.updatePublisher(editingId, payload);
        showToast("Cập nhật nhà xuất bản thành công!", "success");
      } else {
        // Create - không gửi active (backend sẽ set true)
        const payload = {
          name:    formData.name.trim(),
          country: formData.country.trim(),
          address: formData.address.trim(),
          phone:   formData.phone.trim(),
          email:   formData.email.trim(),
        };
        console.log("Create payload:", payload);
        await publisherService.createPublisher(payload);
        showToast("Thêm nhà xuất bản thành công!", "success");
      }
      await fetchAllPublishers();
      setPage(0);
      await fetchPublishers();
      closeForm();
    } catch (err) {
      console.error("Submit error:", err);
      const msg = err?.response?.data?.message || err?.response?.data || "Có lỗi xảy ra";
      showToast(String(msg), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirm) return;
    try {
      console.log("Deleting publisher ID:", confirm.id);
      await publisherService.deletePublisher(confirm.id);
      showToast(`Đã xóa "${confirm.name}"`, "success");
      await fetchAllPublishers();
      setPage(0);
      await fetchPublishers();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Xóa thất bại: " + (err?.response?.data?.message || err.message), "error");
    } finally {
      setConfirm(null);
    }
  };

  const handleEdit = (pub) => {
    setEditingId(pub.id);
    setFormData({
      name:    pub.name    || "",
      country: pub.country || "",
      address: pub.address || "",
      phone:   pub.phone   || "",
      email:   pub.email   || "",
      active:  pub.active !== undefined ? pub.active : true,
    });
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setErrors({});
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc muốn xóa "${confirm.name}"?`}
          confirmLabel="Xóa"
          confirmClass="bg-rose-500 hover:bg-rose-600"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div style={{ width: "100%", padding: "16px", boxSizing: "border-box" }} className="md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý nhà xuất bản</h2>
          <button
            onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setErrors({}); setShowForm(true); }}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs md:text-sm font-semibold transition shadow-md shadow-purple-200 w-full sm:w-auto"
          >
            <Plus size={16} /> Thêm NXB
          </button>
        </div>

        {/* ✅ Filter: thanh tìm kiếm dài, chỉ 1 filter địa chỉ */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4 mb-4">
          <div className="flex flex-row gap-3 items-end">
  
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-gray-600">Tìm kiếm</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nhập tên nhà xuất bản..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>

            
            <div className="flex flex-col gap-1.5 w-56">
            <label className="text-xs font-semibold text-gray-600">Địa chỉ</label>
            <select
              value={address}
              onChange={e => { setAddress(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            >
              <option value="">Tất cả</option>
              {getUniqueAddresses().map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

           
          </div>
        </div>

        

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["ID", "Tên nhà xuất bản", "Địa chỉ", "Số điện thoại", "Email", "Quốc gia", "Trạng thái", "Hành động"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
                  <Loader2 size={30} className="animate-spin mx-auto mb-2" />
                  <p style={{ fontSize: "14px" }}>Đang tải...</p>
                </td></tr>
              ) : publishers.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
                  <Building2 size={36} className="mx-auto mb-2 opacity-30" />
                  <p style={{ fontSize: "14px" }}>Chưa có nhà xuất bản nào</p>
                </td></tr>
              ) : publishers.map(pub => (
                <tr key={pub.id} style={{ borderBottom: "1px solid #f9fafb" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(245,243,255,0.5)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px 20px", color: "#000000", fontSize: 16 }}>{pub.id}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, fontSize: 16, color: "#000000" }}>{pub.name}</td>
                  <td style={{ padding: "16px 20px", color: "#000000", fontSize: 16 }}>{pub.address || "—"}</td>
                  <td style={{ padding: "16px 20px", color: "#000000", fontSize: 16 }}>{pub.phone || "—"}</td>
                  <td style={{ padding: "16px 20px", color: "#000000", fontSize: 16 }}>{pub.email || "—"}</td>
                  <td style={{ padding: "16px 20px", color: "#000000", fontSize: 16 }}>{pub.country || "—"}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600,
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

        {publishers.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? "Chỉnh sửa NXB" : "Thêm nhà xuất bản"}
              </h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {[
                { key: "name",    label: "Tên nhà xuất bản", placeholder: "NXB Kim Đồng...", required: true },
                { key: "country", label: "Quốc gia",          placeholder: "VD: Việt Nam..." },
                { key: "address", label: "Địa chỉ",           placeholder: "VD: Hà Nội, TP.HCM..." },
                { key: "phone",   label: "Số điện thoại",     placeholder: "0123456789..." },
                { key: "email",   label: "Email",              placeholder: "contact@publisher.com..." },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {label} {required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    placeholder={placeholder}
                    value={formData[key]}
                    onChange={e => {
                      setFormData(p => ({ ...p, [key]: e.target.value }));
                      setErrors(p => ({ ...p, [key]: "" }));
                    }}
                    className={`border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 ${errors[key] ? "border-rose-400 bg-rose-50" : "border-gray-200"}`}
                  />
                  {errors[key] && <span className="text-xs text-rose-500">{errors[key]}</span>}
                </div>
              ))}

        
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100">
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