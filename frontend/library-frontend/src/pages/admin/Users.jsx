import { useState, useEffect } from "react";
import { Edit2, Trash2, Search, Eye, X, Users as UsersIcon, Loader2, AlertCircle, CheckCircle, ShieldCheck, ShieldOff, User, Plus } from "lucide-react";

// Import common components
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Field from "../../components/common/Field";

// Import services
import { userService } from "../../services/userService";

const EMPTY_EDIT = { fullName: "", email: "", password: "", role: "ROLE_USER", active: true };

// ── Main ──────────────────────────────────────────────────────────────────────
function Users() {
  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail]     = useState(false);
  const [confirm, setConfirm]   = useState(null);
  const [toast, setToast]       = useState(null);

  const [formData, setFormData] = useState(EMPTY_EDIT);
  const [errors, setErrors]     = useState({});

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg, type = "info") => setToast({ message: msg, type });


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers();
      setUsers(res.data || res || []);
    } catch {
      showToast("Không thể tải danh sách người dùng", "error");
    } finally {
      setLoading(false);
    }
  };


  const validate = () => {
    const e = {};
    if (!formData.fullName?.trim()) e.fullName = "Trường này là bắt buộc";
    if (!formData.email?.trim())    e.email    = "Trường này là bắt buộc";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Email không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };


  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      fullName: user.fullName || "",
      email:    user.email    || "",
      phone:    user.phone    || "",
      gender:   user.gender   || "",
      role:     user.role     || "ROLE_USER",
      active:   user.active   ?? true,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      if (editingId) {
        await userService.updateUser(editingId, payload);
      } else {
        await userService.createUser(payload);
      }
      showToast(editingId ? "Cập nhật người dùng thành công!" : "Thêm người dùng thành công!", "success");
      await fetchUsers();
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
      await userService.deleteUser(confirm.id);
      showToast(`Đã xóa người dùng "${confirm.name}"`, "success");
      await fetchUsers();
    } catch {
      showToast("Xóa người dùng thất bại", "error");
    } finally {
      setConfirm(null);
    }
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setErrors({}); };

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => {
    const map = {
      ROLE_ADMIN: "text-gray-700",
      ROLE_STAFF: "text-gray-700",
      ROLE_USER:  "text-gray-700",
    };
    return map[role] || "text-gray-500";
  };

  const getRoleLabel = (role) => {
    if (role === "ROLE_ADMIN") return "Admin";
    if (role === "ROLE_STAFF") return "Nhân viên";
    return "Người dùng";
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
          message={`Bạn có chắc muốn xóa người dùng "${confirm.name}"?.`}
          confirmLabel="Xóa"
          confirmClass="bg-rose-500 hover:bg-rose-600"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="p-4 md:p-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý tài khoản</h2>
          <button
            onClick={() => { setEditingId(null); setFormData(EMPTY_EDIT); setShowForm(true); }}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-blue-500 text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-blue-600 transition w-full sm:w-auto"
          >
            <Plus size={16} />
            Thêm tài khoản
          </button>
        </div>
        <div className="mb-4 md:mb-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 md:py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm" style={{ minWidth: "900px" }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ID ", "Tên", "Email", "Số điện thoại","Giới tính", "Vai Trò", "Trạng Thái", "Hành Động"].map(h => (
                    <th key={h} className="px-3 md:px-5 py-2 md:py-3.5 text-left font-semibold text-gray-900 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 md:py-16 text-gray-400">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                      <p className="text-xs md:text-sm">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 md:py-16 text-gray-400">
                      <User size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs md:text-sm">Chưa có người dùng nào</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(user => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition">
                      <td className="px-3 md:px-5 py-2 md:py-3.5 text-gray-900 text-xs md:text-sm font-medium">{user.id}</td>
                      <td className="px-3 md:px-5 py-2 md:py-3.5">
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="font-semibold text-gray-800 line-clamp-1 text-xs md:text-sm">{user.fullName}</span>
                        </div>
                      </td>

                      <td className="px-3 md:px-5 py-2 md:py-3.5 text-gray-900 text-xs md:text-sm hidden sm:table-cell">{user.email}</td>
                      <td className="px-3 md:px-5 py-2 md:py-3.5 text-gray-900 text-xs md:text-sm hidden md:table-cell">{user.phone}</td>
                      <td className="px-3 md:px-5 py-2 md:py-3.5 text-gray-900 text-xs md:text-sm hidden lg:table-cell">
                      {user.gender === "MALE" ? "Nam" : user.gender === "FEMALE" ? "Nữ" : ""}
                    </td>

                      <td className="px-3 md:px-5 py-2 md:py-3.5">
                        <span className={`text-xs md:text-sm inline-block ${roleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      <td className="px-3 md:px-5 py-2 md:py-3.5">
                        <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-semibold ${user.active !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {user.active !== false ? "Hoạt động" : "Dừng"}
                        </span>
                      </td>

                      <td className="px-3 md:px-5 py-2 md:py-3.5">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(user)}
                            title="Chỉnh sửa"
                            className="p-1.5 md:p-2 text-gray-900 hover:text-blue-600 transition flex-shrink-0"
                          >
                            <Edit2 size={14} className="md:w-4 md:h-4" />
                          </button>
                          <button
                            onClick={() => setConfirm({ id: user.id, name: user.fullName })}
                            title="Xóa"
                            className="p-1.5 md:p-2 text-gray-900 hover:text-rose-500 transition flex-shrink-0"
                          >
                            <Trash2 size={14} className="md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-4 md:px-5 py-2 md:py-3 border-t border-gray-50 bg-gray-50/50 text-xs text-gray-400">
            
            </div>
          )}
        </div>
      </div>

      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-3 md:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl modal-enter my-4">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Chi tiết người dùng</h2>
              <button onClick={() => setShowDetail(false)} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"><X size={18} /></button>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 md:w-16 h-14 md:h-16 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-500">
                    {selectedUser.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{selectedUser.fullName}</p>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["ID", selectedUser.id],
                  ["Vai trò", getRoleLabel(selectedUser.role)],
                  ["Ngày tạo", selectedUser.createdAt || "—"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">{label}</p>
                    <p className="text-gray-800 font-medium">{val}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => { setShowDetail(false); handleEdit(selectedUser); }}
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition flex items-center gap-2"
              >
                <Edit2 size={15} /> Chỉnh sửa
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl modal-enter">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <UsersIcon size={17} className="text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">{editingId ? "Chỉnh sửa người dùng" : "Thêm tài khoản"}</h2>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Họ và tên *" error={errors.fullName}>
                  <input
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={e => handleChange("fullName", e.target.value)}
                    className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.fullName ? "border-rose-400 bg-rose-50" : "border-gray-200"}`}
                  />
                </Field>
              </div>

              <div className="col-span-2">
                <Field label="Email *" error={errors.email}>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={e => handleChange("email", e.target.value)}
                    className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.email ? "border-rose-400 bg-rose-50" : "border-gray-200"}`}
                  />
                </Field>
              </div>

              <div className="col-span-2">
                <Field label="Mật khẩu" error={errors.password}>
                  <input
                    type="password"
                    placeholder={editingId ? "Để trống nếu không đổi" : "••••••••"}
                    value={formData.password || ""}
                    onChange={e => handleChange("password", e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </Field>
              </div>

              <Field label="Số điện thoại">
                <input
                  type="text"
                  placeholder="0123456789"
                  value={formData.phone || ""}
                  onChange={e => handleChange("phone", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </Field>

              <Field label="Giới tính">
                <select
                  value={formData.gender || ""}
                  onChange={e => handleChange("gender", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="">-- Chọn --</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </Field>

              <Field label="Vai trò">
                <select
                  value={formData.role}
                  onChange={e => handleChange("role", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="ROLE_USER">Người dùng</option>
                  <option value="ROLE_STAFF">Nhân viên</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </Field>

              <Field label="Trạng thái">
                <select
                  value={formData.active ? "true" : "false"}
                  onChange={e => handleChange("active", e.target.value === "true")}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Bị khóa</option>
                </select>
              </Field>
            </div>

            <div className="flex items-center justify-between px-6 pb-6">
              <p className="text-xs text-gray-400"></p>
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
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {editingId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Users;