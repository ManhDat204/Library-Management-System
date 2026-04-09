import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const COVER_COLORS = ["#1a1a2e","#2d1b00","#0d2137","#1a2e1a","#2e1a2e","#2e2200","#1e2e20","#2e1e1e"];
const FINE_LABEL = {
  OVERDUE:{ label:"Quá hạn" },
  DAMAGED:{ label:"Hư hỏng" },
  LOST:   { label:"Mất sách" },
};

// ─── TRACKING 5 BƯỚC ─────────────────────────────────────────
const STEPS = [
  { key:"CHECK_OUT",      icon:"📋", label:"Đặt đơn"      },
  { key:"SHIPPING",       icon:"🚚", label:"Vận chuyển"    },
  { key:"DELIVERED",      icon:"📦", label:"Đã nhận"       },
  { key:"PENDING_RETURN", icon:"🔄", label:"Chờ xác nhận "       },
  { key:"RETURNED",       icon:"✅", label:"Hoàn thành"    },
];

const getStep = (s) => ({
  CHECK_OUT:0, SHIPPING:1, DELIVERED:2, OVERDUE:2,
  PENDING_RETURN:3, RETURNED:4, DAMAGED:4, LOST:4, CANCELLED:-1
}[s]??0);

const STATUS_UI = {
  CHECK_OUT:      { label:"Chờ vận chuyển",   color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200",   dot:"bg-blue-500"   },
  SHIPPING:       { label:"Đang vận chuyển",  color:"text-indigo-600", bg:"bg-indigo-50", border:"border-indigo-200",  dot:"bg-indigo-500" },
  DELIVERED:      { label:"Đang mượn",        color:"text-teal-600",   bg:"bg-teal-50",   border:"border-teal-200",    dot:"bg-teal-500"   },
  OVERDUE:        { label:"Quá hạn",          color:"text-red-600",    bg:"bg-red-50",    border:"border-red-200",     dot:"bg-red-500"    },
  PENDING_RETURN: { label:"Chờ xác nhận trả", color:"text-amber-600",  bg:"bg-amber-50",  border:"border-amber-200",   dot:"bg-amber-400"  },
  RETURNED:       { label:"Hoàn thành",       color:"text-green-700",  bg:"bg-green-50",  border:"border-green-200",   dot:"bg-green-500"  },
  DAMAGED:        { label:"Hư hỏng",          color:"text-orange-600", bg:"bg-orange-50", border:"border-orange-200",  dot:"bg-orange-500" },
  LOST:           { label:"Mất sách",         color:"text-gray-500",   bg:"bg-gray-100",  border:"border-gray-200",    dot:"bg-gray-400"   },
  CANCELLED:      { label:"Đã huỷ",           color:"text-gray-400",   bg:"bg-gray-50",   border:"border-gray-100",    dot:"bg-gray-300"   },
};

const fmtDate = (d) => !d?"—":new Date(d).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"});
const getDiff = (due) => !due?null:Math.ceil((new Date(due)-new Date())/86400000);

const Cover = ({ loan }) => {
  const [err,setErr] = useState(false);
  const color = COVER_COLORS[(loan?.bookId||0)%COVER_COLORS.length];
  const init  = (loan?.bookTitle||"??").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  if (loan?.bookCoverImage&&!err)
    return <img src={loan.bookCoverImage} alt={loan.bookTitle} className="w-full h-full object-cover" onError={()=>setErr(true)}/>;
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{background:`linear-gradient(160deg,${color},#000)`}}>
      <div className="absolute inset-0" style={{backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,0.015) 3px,rgba(255,255,255,0.015) 6px)"}}/>
      <span className="font-black select-none text-3xl" style={{fontFamily:"'Playfair Display',serif",color:"rgba(255,255,255,0.22)"}}>{init}</span>
    </div>
  );
};

const Badge = ({ status }) => {
  const s = STATUS_UI[status]||STATUS_UI.CHECK_OUT;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
    </span>
  );
};

// ─── TRACKING NGANG ───────────────────────────────────────────
const TrackingHorizontal = ({ loan }) => {
  const status    = loan.bookLoanStatus;
  const step      = getStep(status);
  const diff      = getDiff(loan.dueDate);
  const isOverdue = status==="OVERDUE";

  if (status==="CANCELLED") return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
      <span className="text-2xl">❌</span>
      <div>
        <p className="text-sm font-bold text-gray-600">Đơn đã bị huỷ</p>
        <p className="text-xs text-gray-400 mt-0.5">Đơn mượn này đã được huỷ bỏ</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Steps row */}
      <div className="flex items-start">
        {STEPS.map((s, i) => {
          const isDone   = i < step;
          const isActive = i === step;
          const isFuture = i > step;
          const isLast   = i === STEPS.length - 1;

          const circleCls = isActive
            ? (isOverdue
                ? "bg-red-500 shadow-lg shadow-red-200 ring-4 ring-red-100"
                : "bg-gray-900 shadow-lg shadow-gray-300 ring-4 ring-gray-100")
            : isDone
              ? "bg-gray-700"
              : "bg-gray-100";

          const lineCls = isDone ? "bg-gray-700" : "bg-gray-100";

          return (
            <div key={s.key} className="flex items-start flex-1 min-w-0">
              {/* Step column */}
              <div className="flex flex-col items-center flex-shrink-0" style={{width:40}}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 transition-all ${circleCls}`}>
                  <span className={isFuture ? "opacity-25" : ""}>{s.icon}</span>
                </div>
                <p className={`text-center mt-1.5 font-semibold leading-tight px-1 ${
                  isActive ? (isOverdue ? "text-red-600" : "text-gray-900") : isDone ? "text-gray-500" : "text-gray-300"
                }`} style={{fontSize:"10px", width:56, marginLeft:-8}}>{s.label}</p>
                {isActive && (
                  <span className={`mt-1 text-center font-bold px-1 py-0.5 rounded-full leading-tight ${
                    isOverdue ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                  }`} style={{fontSize:"9px", width:56, marginLeft:-8}}>
                    {isOverdue && diff !== null ? `Trễ ${Math.abs(diff)}n` : "Hiện tại"}
                  </span>
                )}
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className={`flex-1 h-0.5 mt-4 mx-1 rounded-full ${lineCls}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MODALS ───────────────────────────────────────────────────
const ConfirmReceivedModal = ({ loan, onClose, onSuccess }) => {
  const [loading,setLoading] = useState(false);
  const [error,setError]     = useState(null);
  const handleConfirm = async () => {
    try {
      setLoading(true); setError(null);
      await api.patch(`/book-loans/my/${loan.id}/confirm-received`);
      onSuccess();
    } catch(e){ setError(e.response?.data?.message||"Không thể xác nhận."); setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden"/>
          <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">📦</div>
          <h2 className="text-lg font-bold text-gray-900" style={{fontFamily:"'Playfair Display',serif"}}>Xác nhận đã nhận đơn?</h2>
          <p className="text-sm text-gray-400 mt-1.5">Bạn đã nhận được cuốn sách<br/><span className="font-semibold text-gray-700">"{loan.bookTitle}"</span>?</p>
        </div>
        <div className="mx-6 mb-4 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-start gap-2">
          <span className="flex-shrink-0">⚠️</span>
          <p className="text-xs text-amber-700 leading-relaxed">Sau khi xác nhận, thời hạn mượn bắt đầu tính. Hạn trả: <strong>{fmtDate(loan.dueDate)}</strong></p>
        </div>
        {error&&<div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-500 text-xs">⚠ {error}</div>}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 border-0 rounded-2xl py-3.5 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-200">Chưa nhận</button>
          <button onClick={handleConfirm} disabled={loading}
            className={`flex-[2] border-0 rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 ${loading?"bg-gray-100 text-gray-400 cursor-not-allowed":"bg-green-600 text-white cursor-pointer hover:bg-green-700 shadow-md"}`}>
            {loading&&<span className="w-4 h-4 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin"/>}
            Đã nhận hàng
          </button>
        </div>
      </div>
    </div>
  );
};

const ReturnModal = ({ loan, onClose, onSuccess }) => {
  const [loading,setLoading] = useState(false);
  const [error,setError]     = useState(null);
  const handleConfirm = async () => {
    try {
      setLoading(true); setError(null);
      await api.post("/book-loans/my/return-request",{bookLoanId:loan.id,notes:""});
      onSuccess();
    } catch(e){ setError(e.response?.data?.message||"Không thể gửi yêu cầu."); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden"/>
          <h2 className="text-lg font-bold text-gray-900" style={{fontFamily:"'Playfair Display',serif"}}>Yêu cầu trả sách</h2>
          <p className="text-sm text-gray-400 mt-0.5 truncate">{loan.bookTitle}</p>
        </div>
        <div className="px-6 py-5">
          
          {error&&<div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-500 text-xs mb-4">⚠ {error}</div>}
          <div className="flex gap-3 mt-4">
          <button 
            onClick={onClose} 
            className="flex-1 bg-zinc-100 rounded-2xl py-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-200 transition-colors"
          >
            Huỷ
          </button>
          
          <button 
            onClick={handleConfirm} 
            disabled={loading}
            className={`flex-1 rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all 
              ${loading 
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                : "bg-zinc-900 text-white hover:bg-black active:scale-[0.98]"}`}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>Gửi yêu cầu trả</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

const ReviewModal = ({ loan, onClose, onSuccess }) => {
  const [rating,setRating]   = useState(5);
  const [comment,setComment] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError]     = useState(null);
  const LABELS = ["","Rất tệ","Tệ","Bình thường","Tốt","Xuất sắc"];
  const handleSubmit = async () => {
    if (!comment.trim()||comment.trim().length<10){setError("Nhận xét phải ít nhất 10 ký tự.");return;}
    try {
      setLoading(true); setError(null);
      await api.post("/reviews",{bookId:Number(loan.bookId),rating,reviewText:comment.trim()});
      onSuccess();
    } catch(e){ setError(e.response?.data?.message||"Không thể gửi đánh giá."); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden"/>
          <h2 className="text-lg font-bold text-gray-900" style={{fontFamily:"'Playfair Display',serif"}}>Đánh giá sách</h2>
          <p className="text-sm text-gray-400 mt-0.5 truncate">{loan.bookTitle}</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Xếp hạng</p>
            <div className="flex gap-1">{[1,2,3,4,5].map(s=>(
              <button key={s} onClick={()=>setRating(s)} className={`text-3xl border-0 bg-transparent cursor-pointer hover:scale-110 transition-transform ${s<=rating?"text-yellow-400":"text-gray-200"}`}>★</button>
            ))}</div>
            <p className="text-xs text-amber-600 font-semibold mt-1">{LABELS[rating]}</p>
          </div>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Chia sẻ cảm nhận của bạn..." rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none focus:border-amber-400 transition-colors"/>
          {error&&<div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-500 text-xs">⚠ {error}</div>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-gray-100 border-0 rounded-2xl py-3 text-sm text-gray-500 cursor-pointer hover:bg-gray-200">Huỷ</button>
            <button onClick={handleSubmit} disabled={loading}
              className={`flex-[2] border-0 rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 ${loading?"bg-gray-100 text-gray-400 cursor-not-allowed":"bg-gray-900 text-white cursor-pointer hover:bg-black"}`}>
              {loading&&<span className="w-4 h-4 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin"/>}
              Gửi đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FineModal = ({ fine, loan, onClose }) => {
  const [loading,setLoading] = useState(false);
  const [error,setError]     = useState(null);
  const handlePay = async () => {
    try {
      setLoading(true); setError(null);
      const r1  = await api.post(`/fines/${fine.id}/pay`,{amount:fine.amount});
      const pid = r1.data?.paymentId??r1.data?.data?.paymentId??r1.data?.id;
      if (!pid){setError("Không lấy được paymentId.");return;}
      const r2  = await api.get(`/payments/${pid}/url`);
      const url = r2.data?.message;
      if (url?.startsWith("http")){window.location.href=url;return;}
      setError("Không thể tạo link thanh toán.");
    } catch(e){ setError(e.response?.data?.message||"Có lỗi xảy ra."); }
    finally { setLoading(false); }
  };
  const ti = FINE_LABEL[fine.fineType]||{label:fine.fineType};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="px-6 py-5 bg-red-50 border-b border-red-100">
          <div className="w-10 h-1 bg-red-200 rounded-full mx-auto mb-4 sm:hidden"/>
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Thanh toán tiền phạt</p>
          <h2 className="text-base font-bold text-red-800 truncate" style={{fontFamily:"'Playfair Display',serif"}}>{loan?.bookTitle}</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-red-50 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between text-sm"><span className="text-red-400">Loại phạt</span><span className="font-bold text-red-700">{ti.icon} {ti.label}</span></div>
            {fine.reason&&<div className="flex justify-between text-sm gap-4"><span className="text-red-400 flex-shrink-0">Lý do</span><span className="font-medium text-red-700 text-right">{fine.reason}</span></div>}
            {fine.overdueDays>0&&<div className="flex justify-between text-sm"><span className="text-red-400">Số ngày trễ</span><span className="font-bold text-red-700">{fine.overdueDays} ngày</span></div>}
            <div className="border-t border-red-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-red-700">Tổng phạt</span>
              <span className="text-2xl font-extrabold text-red-600" style={{fontFamily:"'Playfair Display',serif"}}>{Number(fine.amount).toLocaleString("vi-VN")}₫</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
            <span className="text-xl">🏦</span>
            <div><p className="text-sm font-bold text-blue-700">Thanh toán qua VNPay</p><p className="text-xs text-gray-400 mt-0.5">Bạn sẽ được chuyển sang cổng thanh toán an toàn</p></div>
          </div>
          {error&&<div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-500 text-xs">⚠ {error}</div>}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-gray-100 border-0 rounded-2xl py-3 text-sm text-gray-500 cursor-pointer hover:bg-gray-200">Huỷ</button>
            <button onClick={handlePay} disabled={loading}
              className={`flex-[2] border-0 rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 ${loading?"bg-gray-100 text-gray-400 cursor-not-allowed":"bg-red-600 text-white cursor-pointer hover:bg-red-700"}`}>
              {loading&&<span className="w-4 h-4 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin"/>}
              {loading?"Đang xử lý...":`Thanh toán ${Number(fine.amount).toLocaleString("vi-VN")}₫`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────
export default function LoanDetailPage() {
  const { id: loanId } = useParams();
  const navigate   = useNavigate();

  const [loan,setLoan]         = useState(null);
  const [address,setAddress]   = useState(null);
  const [fine,setFine]         = useState(null);
  const [loading,setLoading]   = useState(true);
  const [error,setError]       = useState(null);
  const [visible,setVisible]   = useState(false);
  const [modal,setModal]       = useState(null);
  const [toast,setToast]       = useState(null);

  useEffect(()=>{ setTimeout(()=>setVisible(true),60); loadData(); },[loanId]);

  const loadData = async () => {
    try {
      setLoading(true); setError(null);
      const [lRes,fRes] = await Promise.all([
        api.get(`/book-loans/my/${loanId}`),
        api.get("/fines/my-fines").catch(()=>({data:[]})),
      ]);
      const loan = lRes.data;
      setLoan(loan);
      const f = (fRes.data||[]).find(f=>f.bookLoanId===Number(loanId)&&f.status==="PENDING"&&Number(f.amount)>0)||null;
      setFine(f);

      const embedded = loan.deliveryAddress || loan.address || loan.shippingAddress || null;
      if (embedded?.street || embedded?.ward || embedded?.province) {
        setAddress(embedded); return;
      }
      const addrId = loan.addressId || loan.deliveryAddressId || null;
      if (addrId) {
        try {
          const profileRes = await api.get("/users/profile");
          const userId = profileRes.data?.id;
          if (userId) {
            const addrRes = await api.get(`/users/${userId}/addresses`);
            const list = Array.isArray(addrRes.data)?addrRes.data:(addrRes.data?.content||[]);
            setAddress(list.find(a=>a.id===addrId)||null);
          }
        } catch {}
      }
    } catch(e){ setError(e.response?.data?.message||"Không thể tải thông tin đơn."); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"/>
    </div>
  );
  if (error||!loan) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
      <div>
        <p className="text-4xl mb-4">😕</p>
        <p className="text-red-500 text-sm mb-5">{error||"Không tìm thấy đơn"}</p>
        <button onClick={()=>navigate(-1)} className="bg-gray-900 text-white border-0 rounded-xl px-5 py-2.5 text-sm font-bold cursor-pointer">← Quay lại</button>
      </div>
    </div>
  );

  const status     = loan.bookLoanStatus;
  const diff       = getDiff(loan.dueDate);
  const isOverdue  = status==="OVERDUE";
  const isShipping = status==="SHIPPING";
  const isDelivered= status==="DELIVERED";
  const canReturn  = isDelivered||isOverdue;
  const isPending  = status==="PENDING_RETURN";
  const isReturned = status==="RETURNED";
  const hasFine    = fine&&Number(fine.amount)>0;
  const addrLine   = address
    ? [address.street,address.ward,address.district,address.province].filter(Boolean).join(", ")
    : null;

  const bannerCfg = isOverdue
    ? { bg:"bg-red-50 border border-red-100", tc:"text-red-700",    sc:"text-red-400",
        title:`Quá hạn ${diff!==null?Math.abs(diff)+" ngày":""} — vui lòng trả sách sớm`,
        sub:`Hạn trả: ${fmtDate(loan.dueDate)}` }
    : isPending
    ? { bg:"bg-amber-50 border border-amber-100",  tc:"text-amber-700",  sc:"text-amber-500",
        title:"Đang chờ thư viện xác nhận trả",
        sub:`Hạn trả: ${fmtDate(loan.dueDate)}` }
    : isReturned
    ? { bg:"bg-green-50 border border-green-100",  tc:"text-green-700",  sc:"text-green-500",
        title:"Bạn đã hoàn thành đơn mượn này!"}
    : isShipping
    ? { bg:"bg-indigo-50 border border-indigo-100", tc:"text-indigo-700", sc:"text-indigo-400",
        title:"Sách đang trên đường đến bạn — bấm Đã nhận khi nhận hàng",
        sub:`Hạn trả: ${fmtDate(loan.dueDate)}` }
    : isDelivered
    ? { bg:`${diff!==null&&diff<=3?"bg-amber-50 border border-amber-100":"bg-teal-50 border border-teal-100"}`,
        icon:diff!==null&&diff<=3?"⏰":"📖",
        tc:diff!==null&&diff<=3?"text-amber-700":"text-teal-700",
        sc:diff!==null&&diff<=3?"text-amber-500":"text-teal-500",
        title:diff!==null&&diff<=3?`Sắp đến hạn — còn ${diff} ngày`:"Đang trong thời hạn mượn",
        sub:`Hạn trả: ${fmtDate(loan.dueDate)}` }
    : { bg:"bg-blue-50 border border-blue-100",   icon:"📋", tc:"text-blue-700",   sc:"text-blue-400",
        title:"Đơn đã đặt, chờ thư viện xử lý",
        sub:`Hạn trả dự kiến: ${fmtDate(loan.dueDate)}` };

  return (
    <>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.3s ease both}`}</style>

      <div className={`min-h-screen bg-gray-50 transition-opacity duration-500 ${visible?"opacity-100":"opacity-0"}`} style={{fontFamily:"'DM Sans',sans-serif"}}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
            <button onClick={()=>navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 border-0 cursor-pointer hover:bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">←</button>
            <div className="flex-1 min-w-0">
              <p className="text-base  text-black-400">Chi tiết đơn mượn</p>
            </div>
            <Badge status={status}/>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-3 fade-up">

          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 pt-5 pb-6">
            <p className="text-xs font-bold text-black-400 uppercase tracking-wider mb-5">Trạng thái đơn hàng</p>
            <TrackingHorizontal loan={loan}/>

            
            <div className={`mt-5 rounded-2xl px-4 py-3 flex items-center gap-3 ${bannerCfg.bg}`}>
              <span className="text-xl flex-shrink-0">{bannerCfg.icon}</span>
              <div>
                <p className={`text-sm font-bold ${bannerCfg.tc}`}>{bannerCfg.title}</p>
                <p className={`text-xs mt-0.5 ${bannerCfg.sc}`}>{bannerCfg.sub}</p>
              </div>
            </div>
          </div>

          {/* 2. THÔNG TIN ĐƠN + SÁCH GỘP CHUNG */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header sách */}
            <div className="flex gap-4 p-5 border-b border-gray-50">
              <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden shadow-md" style={{aspectRatio:"3/4"}}>
                <Cover loan={loan}/>
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                {loan.bookGenre&&<p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">{loan.bookGenre}</p>}
                <h2 className="text-base font-extrabold text-gray-900 leading-snug line-clamp-2" style={{fontFamily:"'Playfair Display',serif"}}>{loan.bookTitle||"—"}</h2>
                {loan.bookAuthor&&<p className="text-xs text-gray-400 mt-1 italic">bởi {loan.bookAuthor}</p>}
              </div>
            </div>

            {/* Divider label */}
            <div className="px-5 py-3 border-b border-gray-50">
              <p className="text-xs font-bold text-black-400 uppercase tracking-wider">Thông tin đơn mượn</p>
            </div>

            {/* Chi tiết rows */}
            <div className="px-5 py-1 divide-y divide-gray-50">
              {[
                { label:"Mã đơn",           value:`#${loan.id}` },
                { label:"Ngày đặt",          value:`${fmtDate(loan.checkoutDate)}${loan.checkoutTime ? ` ${loan.checkoutTime}` : ""}` },
                { label:"Hạn trả",           value:fmtDate(loan.dueDate), highlight:isOverdue },
                loan.returnDate&&{ label:"Ngày trả thực tế", value:fmtDate(loan.returnDate), good:true },
                loan.notes&&{ label:"Ghi chú", value:loan.notes },
                address&&{ label:"Địa chỉ", value:addrLine },

              ].filter(Boolean).map(row=>(
                <div key={row.label} className="flex justify-between items-center py-3">
                  <span className="text-sm text-black-400">{row.label}</span>
                  <span className={`text-sm font-semibold text-right max-w-56 ${row.highlight?"text-red-600":row.good?"text-green-600":"text-gray-800"}`}>{row.value}</span>
                </div>
                
              ))}
            </div>
          </div>


          {/* 4. TIỀN PHẠT */}
          {hasFine&&(
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span>{FINE_LABEL[fine.fineType]}</span>
                <p className="text-sm font-bold text-red-700">Tiền phạt {FINE_LABEL[fine.fineType]?.label||fine.fineType}</p>
                <span className="ml-auto text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">Chưa thanh toán</span>
              </div>
              {fine.reason&&<p className="text-xs text-red-500 mb-3">{fine.reason}</p>}
              <div className="flex items-center justify-between">
                <div>
                  
                  <p className="text-xl font-extrabold text-red-600" style={{fontFamily:"'Playfair Display',serif"}}>{Number(fine.amount).toLocaleString("vi-VN")}</p>
                </div>
                <button onClick={()=>setModal("fine")} className="bg-red-600 text-white border-0 rounded-xl px-5 py-2.5 text-sm font-bold cursor-pointer hover:bg-red-700 transition-colors">
                Thanh toán
                </button>
              </div>
            </div>
          )}

       
          <div className="flex gap-3 pb-8 pt-1">
            <button onClick={()=>navigate("/home/my-loans")}
              className="flex-1 bg-white border border-gray-200 text-gray-500 rounded-2xl py-4 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors">
              Quay lại
            </button>

            {isShipping&&(
              <button onClick={()=>setModal("received")}
                className="flex-1 bg-green-600 text-white border-0 rounded-2xl py-4 text-sm font-bold cursor-pointer hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-green-100">
                Đã nhận đơn
              </button>
            )}
            {canReturn&&(
              <button onClick={()=>setModal("return")}
                className="flex-1 bg-gray-900 text-white border-0 rounded-2xl py-4 text-sm font-bold cursor-pointer hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md">
               Trả sách
              </button>
            )}
            {isPending&&(
              <div className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl py-4 text-sm font-bold text-center">
                Chờ xác nhận
              </div>
            )}
            {isReturned&&(
              <button onClick={()=>setModal("review")}
                className="flex-1 bg-gray-900 text-white border-0 rounded-2xl py-4 text-sm font-bold cursor-pointer hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md">
                Đánh giá
              </button>
            )}
            {!isShipping&&!canReturn&&!isPending&&!isReturned&&(
              <div className="flex-1"/>
            )}
          </div>
        </div>
      </div>

      {modal==="received"&&<ConfirmReceivedModal loan={loan} onClose={()=>setModal(null)} onSuccess={()=>{setModal(null);setToast("Đã xác nhận nhận đơn!");loadData();}}/>}
      {modal==="return"&&<ReturnModal loan={loan} onClose={()=>setModal(null)} onSuccess={()=>{setModal(null);setToast("Đã gửi yêu cầu trả sách!");loadData();}}/>}
      {modal==="review"&&<ReviewModal loan={loan} onClose={()=>setModal(null)} onSuccess={()=>{setModal(null);setToast("Cảm ơn bạn đã đánh giá!");}}/>}
      {modal==="fine"&&fine&&<FineModal fine={fine} loan={loan} onClose={()=>setModal(null)}/>}

      {toast&&(
        <div className="fixed bottom-8 right-8 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm">
          <span className="text-green-400">✓</span>{toast}
        </div>
      )}
    </>
  );
}