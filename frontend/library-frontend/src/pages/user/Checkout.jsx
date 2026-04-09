import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const COVER_COLORS = ["#1a1a2e","#2d1b00","#0d2137","#1a2e1a","#2e1a2e","#2e2200","#1e2e20","#2e1e1e"];

const BookCover = ({ book }) => {
  const [err, setErr] = useState(false);
  const color = COVER_COLORS[(book?.id || 0) % COVER_COLORS.length];
  const initials = (book?.title || "??").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (book?.coverImageUrl && !err) return <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" onError={() => setErr(true)} />;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${color} 0%, ${color}99 60%, #000 100%)` }}>
      <span className="font-black select-none" style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", color:"rgba(255,255,255,0.18)" }}>{initials}</span>
    </div>
  );
};

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook]                     = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [checkoutDays, setCheckoutDays]     = useState(7);
  const [notes, setNotes]                   = useState("");
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState(null);
  const [submitError, setSubmitError]       = useState(null);
  const [visible, setVisible]               = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 60); loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      setLoading(true); setError(null);
      const [bookRes, profileRes] = await Promise.all([
        api.get(`/books/${id}`),
        api.get("/users/profile"),          // backend tự đọc token
      ]);
      setBook(bookRes.data);
      const userId = profileRes.data?.id;

      if (userId) {
        const addrRes = await api.get(`/users/${userId}/addresses`).catch(() => ({ data: [] }));
        const raw = addrRes.data;
        const list = Array.isArray(raw) ? raw : (raw?.content || []);
        setDefaultAddress(list.find((a) => a.isDefault) ?? null);  // chỉ lấy mặc định
      }

      try {
        const sub = (await api.get("/subscriptions/my-active")).data;
        setCheckoutDays(sub?.loanDurationDays ?? sub?.checkoutDays ?? sub?.durationDays ?? 7);
      } catch { setCheckoutDays(7); }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải thông tin.");
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true); setSubmitError(null);
      await api.post("/book-loans/checkout", {
        bookId: Number(id), checkoutDays,
        addressId: defaultAddress?.id || undefined,
        notes: notes.trim() || undefined,
      });
      navigate("/home/my-loans?success=1", { replace: true });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Không thể tạo phiếu mượn.");
      setSubmitting(false);
    }
  };

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + checkoutDays);
  const fmt = (d) => d.toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" });
  const addrText = defaultAddress
    ? [defaultAddress.street, defaultAddress.ward, defaultAddress.district, defaultAddress.province].filter(Boolean).join(", ")
    : null;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>;
  if (error || !book) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
      <div><p className="text-4xl mb-4">😕</p><p className="text-red-500 text-sm mb-5">{error || "Không tìm thấy sách"}</p>
        <button onClick={() => navigate(-1)} className="bg-gray-900 text-white border-0 rounded-xl px-5 py-2.5 text-sm font-bold cursor-pointer">← Quay lại</button></div>
    </div>
  );

  return (
    <>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.3s ease both}`}</style>
      <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${visible?"opacity-100":"opacity-0"}`} style={{ fontFamily:"'DM Sans',sans-serif" }}>

        
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
          
        </div>

        
        <div className="max-w-4xl mx-auto px-8 py-6 space-y-4 fade-up">

          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
             <h2 className="text-sm font-bold text-gray-800">Thông tin đơn mượn</h2>
            </div>
            <div className="flex gap-5 px-6 py-5 border-b border-gray-50">
              <div className="flex-shrink-0 w-20 rounded-2xl overflow-hidden shadow-md" style={{ aspectRatio:"3/4" }}><BookCover book={book} /></div>
              <div className="flex-1 min-w-0 py-1">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">{book.genreName}</p>
                <h3 className="text-base font-bold text-gray-900 line-clamp-2" style={{ fontFamily:"'Playfair Display',serif" }}>{book.title}</h3>
                <p className="text-sm text-gray-400 mt-1 italic">bởi {book.authorName || book.author}</p>
              </div>
            </div>
            <div className="px-6 divide-y divide-gray-50">
              <div className="flex justify-between py-3.5"><span className="text-sm text-gray-400">Ngày mượn</span><span className="text-sm font-semibold text-gray-800">{fmt(today)}</span></div>
              <div className="flex justify-between py-3.5"><span className="text-sm text-gray-400">Hạn trả</span><span className="text-sm font-bold text-amber-600">{fmt(dueDate)}</span></div>
              <div className="flex justify-between py-3.5"><span className="text-sm text-gray-400">Thời hạn</span><span className="text-sm font-bold text-gray-800">{checkoutDays} ngày</span></div>
            </div>
          </div>

          {/* Địa chỉ mặc định — chỉ hiển thị, không có nút thay đổi */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-5">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">📍</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Địa chỉ nhận sách</p>
                {defaultAddress ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{defaultAddress.fullName}</span>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-sm text-gray-500">{defaultAddress.phone}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        Mặc định
                    </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{addrText}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Chưa có địa chỉ mặc định —{" "}
                    <span className="text-blue-500 cursor-pointer underline" onClick={() => navigate("/home/profile")}>Thêm địa chỉ</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ghi chú <span className="font-normal normal-case text-gray-300">(tuỳ chọn)</span></p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ví dụ: Giao vào buổi sáng, để tại lễ tân..." rows={2}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:border-gray-400 transition-colors placeholder-gray-300" />
          </div>

          {submitError && <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm text-red-500 flex items-center gap-2"><span>⚠</span> {submitError}</div>}

          {/* 2 nút bằng nhau — đều flex-1 */}
          <div className="flex gap-3 pt-1 pb-8">
            <button onClick={() => navigate(-1)} className="flex-1 bg-white border border-gray-200 rounded-2xl py-4 text-sm font-semibold text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
              ← Quay lại
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className={`flex-1 border-0 rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${submitting?"bg-gray-200 text-gray-400 cursor-not-allowed":"bg-gray-900 text-white cursor-pointer hover:bg-black"}`}>
              {submitting ? <><span className="w-4 h-4 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin" />Đang xử lý...</> : <>✓ Xác nhận mượn sách</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}