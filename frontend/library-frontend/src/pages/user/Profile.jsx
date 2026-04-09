import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";// 1. Import useAuth

const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── TOAST (Giữ nguyên) ───────────────────────────────────────
const Toast = ({ message, type = "success", onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      background: "#1a1a1a", color: "#f5f0e8",
      padding: "13px 20px", borderRadius: 14,
      fontSize: "0.85rem", fontFamily: "'DM Sans',sans-serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "slideInToast 0.3s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <span style={{ color: type === "success" ? "#22c55e" : "#e85d3f", fontSize: "1rem" }}>
        {type === "success" ? "✓" : "✕"}
      </span>
      {message}
    </div>
  );
};

// ─── ADDRESS TAB & PASSWORD FIELD & PAYMENT (Giữ nguyên logic của Đạt) ────────
const addrInputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.08)",
  marginBottom: 8, fontSize: "0.85rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit"
};

const AddressTab = ({ userId, onToast }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editAddr, setEditAddr] = useState({});
  const [newAddr, setNewAddr] = useState({
    recipientName: "", phoneNumber: "", province: "", district: "", ward: "", isDefault: false
  });

  useEffect(() => { if (userId) fetchAddresses(); }, [userId]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${userId}/addresses`);
      setAddresses(res.data);
    } catch (err) { console.error("Lỗi tải địa chỉ", err); }
    finally { setLoading(false); }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/users/${userId}/addresses/${id}/default`);
      fetchAddresses();
      onToast("Đã đặt làm địa chỉ mặc định");
    } catch { onToast("Lỗi khi cập nhật", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    try {
      await api.delete(`/users/${userId}/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.id !== id));
      onToast("Đã xóa địa chỉ");
    } catch { onToast("Không thể xóa địa chỉ", "error"); }
  };

  const handleAdd = async () => {
    if (!newAddr.recipientName || !newAddr.phoneNumber || !newAddr.province) {
      onToast("Vui lòng điền đủ thông tin bắt buộc", "error");
      return;
    }
    try {
      await api.post(`/users/${userId}/addresses`, newAddr);
      setNewAddr({ recipientName: "", phoneNumber: "", province: "", district: "", ward: "", isDefault: false });
      setIsAdding(false);
      fetchAddresses();
      onToast("Thêm địa chỉ thành công");
    } catch (err) {
      onToast(err.response?.data?.message || "Lỗi khi thêm địa chỉ", "error");
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setEditAddr({
      recipientName: addr.recipientName,
      phoneNumber: addr.phoneNumber,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      isDefault: addr.isDefault,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/users/${userId}/addresses/${id}`, editAddr);
      setEditingId(null);
      fetchAddresses();
      onToast("Cập nhật địa chỉ thành công");
    } catch (err) {
      onToast(err.response?.data?.message || "Lỗi khi cập nhật địa chỉ", "error");
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "2rem", color: "#ccc" }}>Đang tải địa chỉ...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {addresses.map((addr, i) => (
        <div key={addr.id || i} style={{
          background: "#fff", borderRadius: 16, padding: "1.1rem",
          border: addr.isDefault ? "1.5px solid #c8956c" : "1px solid rgba(0,0,0,0.06)",
          position: "relative", animation: "fadeUp 0.3s ease both"
        }}>
          {addr.isDefault && (
            <span style={{ position: "absolute", top: 12, right: 12, fontSize: "0.6rem", background: "#c8956c", color: "#fff", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>MẶC ĐỊNH</span>
          )}

          {editingId === addr.id ? (
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#c8956c", marginBottom: 10, textTransform: "uppercase" }}>Chỉnh sửa địa chỉ</div>
              <input placeholder="Tên người nhận" value={editAddr.recipientName} onChange={e => setEditAddr({...editAddr, recipientName: e.target.value})} style={addrInputStyle} />
              <input placeholder="Số điện thoại" value={editAddr.phoneNumber} onChange={e => setEditAddr({...editAddr, phoneNumber: e.target.value})} style={addrInputStyle} />
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="Tỉnh/Thành" value={editAddr.province} onChange={e => setEditAddr({...editAddr, province: e.target.value})} style={addrInputStyle} />
                <input placeholder="Quận/Huyện" value={editAddr.district} onChange={e => setEditAddr({...editAddr, district: e.target.value})} style={addrInputStyle} />
              </div>
              <input placeholder="Phường/Xã / Số nhà" value={editAddr.ward} onChange={e => setEditAddr({...editAddr, ward: e.target.value})} style={addrInputStyle} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => handleSaveEdit(addr.id)} style={{ flex: 1, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, padding: "9px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>Lưu</button>
                <button onClick={() => setEditingId(null)} style={{ flex: 1, background: "#eee", color: "#666", border: "none", borderRadius: 10, padding: "9px", cursor: "pointer", fontSize: "0.82rem" }}>Hủy</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4, color: "#1a1a1a" }}>
                {addr.recipientName} <span style={{ fontWeight: 400, color: "#999", marginLeft: 8 }}>| {addr.phoneNumber}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.5 }}>
                {addr.fullAddress || `${addr.ward}, ${addr.district}, ${addr.province}`}
              </div>
              <div style={{ display: "flex", gap: 15, marginTop: 12 }}>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} style={{ background: "none", border: "none", color: "black", fontSize: "0.75rem", padding: 0, cursor: "pointer", fontWeight: 700 }}>Thiết lập mặc định</button>
                )}
                <button onClick={() => handleEdit(addr)} style={{ background: "none", border: "none", color: "black", fontSize: "0.75rem", padding: 0, cursor: "pointer", fontWeight: 700 }}>Sửa</button>
                <button onClick={() => handleDelete(addr.id)} style={{ background: "none", border: "none", color: "#e85d3f", fontSize: "0.75rem", padding: 0, cursor: "pointer" }}>Xóa</button>
              </div>
            </>
          )}
        </div>
      ))}

      {isAdding ? (
        <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: 16, padding: "1.25rem", border: "1px dashed #c8956c" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#c8956c", marginBottom: 10, textTransform: "uppercase" }}>Thêm địa chỉ mới</div>
          <input placeholder="Tên người nhận" value={newAddr.recipientName} onChange={e => setNewAddr({...newAddr, recipientName: e.target.value})} style={addrInputStyle} />
          <input placeholder="Số điện thoại" value={newAddr.phoneNumber} onChange={e => setNewAddr({...newAddr, phoneNumber: e.target.value})} style={addrInputStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Tỉnh/Thành" value={newAddr.province} onChange={e => setNewAddr({...newAddr, province: e.target.value})} style={addrInputStyle} />
            <input placeholder="Quận/Huyện" value={newAddr.district} onChange={e => setNewAddr({...newAddr, district: e.target.value})} style={addrInputStyle} />
          </div>
          <input placeholder="Phường/Xã / Số nhà" value={newAddr.ward} onChange={e => setNewAddr({...newAddr, ward: e.target.value})} style={addrInputStyle} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={handleAdd} style={{ flex: 1, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 700, cursor: "pointer" }}>Lưu địa chỉ</button>
            <button onClick={() => setIsAdding(false)} style={{ flex: 1, background: "#eee", color: "#666", border: "none", borderRadius: 10, padding: "10px", cursor: "pointer" }}>Hủy</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} style={{ padding: "14px", borderRadius: 14, border: "1px dashed #c8956c", background: "rgba(200,149,108,0.05)", color: "#c8956c", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "0.2s" }}>
          + Thêm địa chỉ 
        </button>
      )}
    </div>
  );
};

const PasswordField = ({ value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} placeholder="Để trống nếu không muốn đổi"
        style={{ width: "100%", border: "1.5px solid rgba(0,0,0,0.09)", borderRadius: 10, padding: "7px 36px 7px 11px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", outline: "none", background: "rgba(0,0,0,0.02)", boxSizing: "border-box" }} />
      <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: "1rem", padding: 4 }}>
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
};

const fmtMoney = (n) => n ? Number(n).toLocaleString("vi-VN") + "₫" : "—";
const fmtDate  = (s) => s ? new Date(s).toLocaleDateString("vi-VN") : "—";
const statusConfig = {
  SUCCESS: { label: "Thành công", color: "#16a34a" },
  PENDING: { label: "Chờ xử lý", color: "#d97706" },
};

const PaymentHistoryTab = () => {
  const [payments, setPayments] = useState([]);
  useEffect(() => {
    api.get("/payments/history").then(res => setPayments(res.data.content || res.data)).catch(() => {});
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {payments.length === 0 && <div style={{ textAlign: "center", color: "#ccc", padding: 20 }}>Chưa có giao dịch</div>}
      {payments.map((p, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: "1rem", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{p.description || "Giao dịch"}</div>
            <div style={{ fontSize: "0.7rem", color: "#bbb" }}>{fmtDate(p.createdAt)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800 }}>{fmtMoney(p.amount)}</div>
            <div style={{ fontSize: "0.6rem", color: (statusConfig[p.paymentStatus] || {}).color }}>{(statusConfig[p.paymentStatus] || {}).label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TABS = [
  { key: "info",    label: "Thông tin" },
  { key: "address", label: "Địa chỉ"   },
  { key: "payment", label: "Thanh toán" },
];

// ─── MAIN PROFILE (VỊ TRÍ CẦN SỬA) ──────────────────────────────
export default function Profile() {
  const { updateUser } = useAuth(); // 2. Lấy updateUser ra
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [toast, setToast]         = useState(null);
  const [form, setForm]           = useState({ fullName: "", email: "", phone: "", gender: "", password: "" });
  const [dirty, setDirty]         = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/profile");
      setUser(res.data);
      setForm({ 
        fullName: res.data.fullName || "", 
        email: res.data.email || "", 
        phone: res.data.phone || "", 
        gender: res.data.gender || "", 
        password: "" 
      });
      
      // Đồng bộ thông tin lần đầu vào Context (đề phòng)
      updateUser({ 
        fullName: res.data.fullName, 
        profileImage: res.data.profileImage 
      });

    } catch { console.error("Lỗi profile"); }
    finally { setLoading(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast({ message: "Vui lòng chọn file ảnh", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "Ảnh không được vượt quá 5MB", type: "error" });
      return;
    }
    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await api.post("/users/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res.data; 
      updateUser({ profileImage: newUrl });

      setToast({ message: "Cập nhật ảnh đại diện thành công", type: "success" });
      fetchProfile();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Lỗi khi upload ảnh", type: "error" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveInfo = async () => {
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        ...(form.password ? { password: form.password } : {}),
      };

      await api.put("/users/profile", payload);
      updateUser({ fullName: form.fullName });
      setDirty(false);
      setToast({ message: "Lưu thông tin thành công", type: "success" });
      fetchProfile();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Lỗi khi lưu thông tin", type: "error" });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInToast { from{transform:translateX(100%)} to{transform:translateX(0)} }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 2rem", fontFamily: "'DM Sans', sans-serif" }}>

        {loading ? (
          <div style={{ color: "#ccc" }}>Đang tải...</div>
        ) : user && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            <div style={{
              position: "sticky", top: 64, zIndex: 10,
              background: "rgba(251,248,243,0.95)", backdropFilter: "blur(8px)",
              paddingTop: 8, paddingBottom: 8,
            }}>
              <div style={{ display: "flex", gap: 6, background: "rgba(0,0,0,0.04)", borderRadius: 14, padding: 5 }}>
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                    flex: 1, border: "none", borderRadius: 10, padding: "10px", cursor: "pointer",
                    fontSize: "0.82rem", fontWeight: 700,
                    background: activeTab === tab.key ? "#fff" : "transparent",
                    color: activeTab === tab.key ? "#1a1a1a" : "#999",
                    transition: "0.2s",
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vùng chứa nội dung các Tab */}
<div className="mt-4 min-h-[450px]"> 
  {activeTab === "info" && (
    <div className="animate-fadeUp">
      <div className="bg-white rounded-[20px] p-6 border border-black/5 shadow-sm">
        {/* Header Avatar */}
        <div className="flex items-center gap-4 pb-5 mb-2 border-b border-black/5">
          {user.profileImage ? (
            <img src={user.profileImage} alt="avatar" className="w-[72px] h-[72px] rounded-full object-cover border-2 border-black/10 shrink-0" />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full shrink-0 bg-zinc-900 text-white flex items-center justify-center text-2xl font-black uppercase font-display">
              {user.fullName?.charAt(0)}
            </div>
          )}
          
          <label htmlFor="avatar-upload" className={`text-xs font-bold underline underline-offset-4 cursor-pointer hover:text-amber-600 transition-colors ${avatarUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {avatarUploading ? "Đang tải lên..." : "Thay đổi"}
          </label>
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarUploading} />
        </div>

        {/* Form Fields */}
        {[
          { label: "Họ và tên", key: "fullName" },
          { label: "Email",     key: "email"    },
          { label: "Số điện thoại", key: "phone" },
        ].map(({ label, key }) => (
          <div key={key} className="flex items-center py-3 border-b border-black-[0.05]">
            <span className="w-[130px] text-sm text-zinc-500 font-semibold shrink-0">{label}</span>
            <input
              value={form[key]}
              onChange={e => { setForm({...form, [key]: e.target.value}); setDirty(true); }}
              className="flex-1 border-1.5 border-black/10 rounded-xl px-3 py-2 text-[0.88rem] outline-none bg-black/[0.02] focus:border-zinc-900 transition-all font-sans"
            />
          </div>
        ))}

        {/* Giới tính */}
        <div className="flex items-center py-3 border-b border-black-[0.05]">
          <span className="w-[130px] text-sm text-zinc-500 font-semibold shrink-0">Giới tính</span>
          <div className="flex gap-2">
            {[{ value: "MALE", label: "Nam" }, { value: "FEMALE", label: "Nữ" }].map(opt => (
              <button key={opt.value} type="button"
                onClick={() => { setForm({...form, gender: opt.value}); setDirty(true); }}
                className={`px-6 py-1.5 rounded-xl text-[0.82rem] font-bold border-1.5 transition-all
                  ${form.gender === opt.value ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-transparent border-black/10 text-zinc-400'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mật khẩu */}
        <div className="flex items-center py-3">
          <span className="w-[130px] text-sm text-zinc-500 font-semibold shrink-0">Mật khẩu</span>
          <div className="flex-1">
             <PasswordField value={form.password} onChange={v => { setForm({...form, password: v}); setDirty(true); }} />
          </div>
        </div>

        {dirty && (
          <div className="flex justify-center mt-5 animate-fadeIn">
            <button onClick={handleSaveInfo} className="bg-zinc-900 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:-translate-y-1 transition-all shadow-lg shadow-zinc-200">
              Lưu thay đổi
            </button>
          </div>
        )}
      </div>
    </div>
  )}

  {activeTab === "address" && (
    <div className="animate-fadeUp">
       <AddressTab userId={user.id} onToast={(m, t) => setToast({ message: m, type: t })} />
    </div>
  )}

  {activeTab === "payment" && (
    <div className="animate-fadeUp">
       <PaymentHistoryTab />
    </div>
  )}
</div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}