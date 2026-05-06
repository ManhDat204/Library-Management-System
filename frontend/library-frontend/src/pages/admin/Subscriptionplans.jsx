import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X, CreditCard, Loader2, AlertCircle, CheckCircle } from "lucide-react";

import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Field from "../../components/common/Field";
import { subscriptionPlanService } from "../../services/subscriptionPlanService";

const EMPTY = {
  planCode: "", name: "", description: "",
  price: "", currency: "VND", durationDays: "",
  maxBooksAllowed: "", maxDaysPerBook: "",
  displayOrder: "", badgeText: "", adminNotes: "",
  isActive: true, isFeatured: false,
};

function SubscriptionPlans() {
  const [plans, setPlans]         = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [confirm, setConfirm]     = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = "info") => setToast({ message: msg, type });

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await subscriptionPlanService.getAllPlans();
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || res || []);
      setPlans(data);
    } catch (err) {
      showToast("Không thể tải danh sách gói", "error");
    }
    finally { setLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!formData.planCode?.trim())       e.planCode = "Bắt buộc";
    if (!formData.name?.trim())           e.name = "Bắt buộc";
    if (!formData.price)                  e.price = "Bắt buộc";
    if (!formData.durationDays)           e.durationDays = "Bắt buộc";
    if (!formData.maxBooksAllowed)        e.maxBooksAllowed = "Bắt buộc";
    if (!formData.maxDaysPerBook)         e.maxDaysPerBook = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (f, v) => {
    setFormData(p => ({ ...p, [f]: v }));
    if (errors[f]) setErrors(p => ({ ...p, [f]: "" }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        maxBooksAllowed: Number(formData.maxBooksAllowed),
        maxDaysPerBook: Number(formData.maxDaysPerBook),
        displayOrder: formData.displayOrder ? Number(formData.displayOrder) : null,
      };
      if (editingId) {
        await subscriptionPlanService.updatePlan(editingId, payload);
        showToast("Cập nhật gói thành công!", "success");
      } else {
        await subscriptionPlanService.createPlan(payload);
        showToast("Tạo gói thành công!", "success");
      }
      await fetchPlans();
      closeForm();
    } catch (err) { showToast(err?.response?.data?.message || "Có lỗi xảy ra", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await subscriptionPlanService.deletePlan(confirm.id);
      showToast(`Đã xóa gói "${confirm.name}"`, "success");
      await fetchPlans();
    } catch { showToast("Xóa thất bại", "error"); }
    finally { setConfirm(null); }
  };

  const openEdit = (plan) => {
    setEditingId(plan.id);
    setFormData({
      planCode:        plan.planCode        || "",
      name:            plan.name            || "",
      description:     plan.description     || "",
      price:           plan.price           || "",
      currency:        plan.currency        || "VND",
      durationDays:    plan.durationDays    || "",
      maxBooksAllowed: plan.maxBooksAllowed || "",
      maxDaysPerBook:  plan.maxDaysPerBook  || "",
      displayOrder:    plan.displayOrder    || "",
      badgeText:       plan.badgeText       || "",
      adminNotes:      plan.adminNotes      || "",
      isActive:        plan.isActive        ?? true,
      isFeatured:      plan.isFeatured      ?? false,
    });
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setErrors({}); setFormData(EMPTY); };

  const filtered = plans.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity:0 } to { transform: translateX(0); opacity:1 } }
        @keyframes fadeUp  { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        .modal-enter { animation: fadeUp 0.25s ease; }
      `}</style>

      {toast   && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog title="Xác nhận xóa" message={`Bạn có chắc muốn xóa gói "${confirm.name}"?`} confirmLabel="Xóa" confirmClass="bg-rose-500 hover:bg-rose-600" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}

      <div className="p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Gói Đăng Ký</h2>

            </div>
          </div>
          <button
            onClick={() => { setFormData(EMPTY); setErrors({}); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-teal-200"
          >
             Thêm Gói
          </button>
        </div>
        <div className="mb-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Tìm theo tên gói..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-gray-50" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[ "Id", "Tên gói", "Mô tả", "Giá (đ)", "Thời hạn", "Số sách tối đa", "Trạng thái", "Hành động"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                  <Loader2 size={28} className="animate-spin mx-auto mb-2" /><p className="text-sm">Đang tải...</p>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                  <CreditCard size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">Chưa có gói nào</p>
                </td></tr>
              ) : filtered.map(plan => (
                <tr key={plan.id} className="border-b border-gray-50 hover:bg-teal-50/30 transition">
                  <td className="px-5 py-3.5 text-gray-900 font-mono">{plan.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{plan.name}</td>
                  <td className="px-5 py-3.5 text-gray-900 max-w-[200px]"><span className="line-clamp-2">{plan.description || "—"}</span></td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{Number(plan.price).toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">{plan.durationDays} ngày</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{plan.maxBooksAllowed} quyển</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {plan.isActive !== false
                      ? <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">Đang hoạt động</span>
                      : <span className="px-2.5 py-1 bg-gray-100 text-gray-400 rounded-full text-xs font-semibold">Tạm dừng</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(plan)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"><Edit2 size={15} /></button>
                      <button onClick={() => setConfirm({ id: plan.id, name: plan.name })} className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
              <p className="text-xs text-gray-400">Hiển thị {filtered.length} / {plans.length} gói</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl modal-enter">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
                  <CreditCard size={17} className="text-teal-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{editingId ? "Chỉnh sửa gói" : "Thêm gói mới"}</h2>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">
              <Field label="Mã gói " error={errors.planCode}>
                <input placeholder="VD: PREMIUM_30" value={formData.planCode} onChange={e => handleChange("planCode", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 ${errors.planCode ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
              </Field>
              <Field label="Tên gói " error={errors.name}>
                <input placeholder="VD: Gói Premium" value={formData.name} onChange={e => handleChange("name", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 ${errors.name ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
              </Field>
              <Field label="Giá " error={errors.price}>
                <input type="number" min="0" placeholder="99000" value={formData.price} onChange={e => handleChange("price", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 ${errors.price ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
              </Field>
              <Field label="Đơn vị tiền tệ">
                <select value={formData.currency} onChange={e => handleChange("currency", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white">
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </Field>
              <Field label="Thời hạn (ngày) " error={errors.durationDays}>
                <input type="number" min="1" placeholder="30" value={formData.durationDays} onChange={e => handleChange("durationDays", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 ${errors.durationDays ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
              </Field>
              <Field label="Số sách tối đa " error={errors.maxBooksAllowed}>
                <input type="number" min="1" placeholder="5" value={formData.maxBooksAllowed} onChange={e => handleChange("maxBooksAllowed", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 ${errors.maxBooksAllowed ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
              </Field>
              <Field label="Số ngày mượn tối đa " error={errors.maxDaysPerBook}>
                <input type="number" min="1" placeholder="14" value={formData.maxDaysPerBook} onChange={e => handleChange("maxDaysPerBook", e.target.value)}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 ${errors.maxDaysPerBook ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
              </Field>
              <Field label="Thứ tự hiển thị">
                <input type="number" min="0" placeholder="1" value={formData.displayOrder} onChange={e => handleChange("displayOrder", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </Field>
              <Field label="Badge text">
                <input placeholder="VD: Phổ biến" value={formData.badgeText} onChange={e => handleChange("badgeText", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </Field>
              <Field label="Trạng thái">
                <select value={formData.isActive ? "true" : "false"} onChange={e => handleChange("isActive", e.target.value === "true")}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white">
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tạm dừng</option>
                </select>
              </Field>
              <div className="col-span-2 flex items-center gap-3 px-1">
                <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={e => handleChange("isFeatured", e.target.checked)}
                  className="w-4 h-4 accent-teal-500 cursor-pointer" />
                <label htmlFor="isFeatured" className="text-sm text-gray-600 cursor-pointer select-none">Gói nổi bật </label>
              </div>
              <div className="col-span-2">
                <Field label="Mô tả">
                  <textarea rows={2} placeholder="Mô tả về gói này..." value={formData.description} onChange={e => handleChange("description", e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Ghi chú admin">
                  <textarea rows={2} placeholder="Ghi chú nội bộ..." value={formData.adminNotes} onChange={e => handleChange("adminNotes", e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
                </Field>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 pb-6">
              <p className="text-xs text-gray-400"></p>
              <div className="flex gap-3">
                <button onClick={closeForm} disabled={submitting} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50">Hủy</button>
                <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-teal-200 disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {editingId ? "Cập nhật" : "Tạo gói"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SubscriptionPlans;