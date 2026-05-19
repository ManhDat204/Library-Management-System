import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import '../../index.css';
import { Package, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Calendar, Clock, AlertCircle, MapPin, Phone, User } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import wsService from "../../services/websocketService";
import api from "../../services/api";
import { LOAN_STATUS_MAP } from "../../constants/loanStatus";

// ─── CONSTANTS ────────────────────────────────────────────────
const STATUS_CONFIG = {
  CHECK_OUT:      { label: "Chờ lấy hàng", color: "text-violet-500", bg: "bg-violet-50", dot: "#8b5cf6" },
  SHIPPING:       { label: "Đang giao",    color: "text-blue-600",   bg: "bg-blue-50",   dot: "#2563eb" },
  DELIVERED:      { label: "Đang mượn",    color: "text-teal-600",   bg: "bg-teal-50",   dot: "#0d9488" },
  OVERDUE:        { label: "Quá hạn",      color: "text-red-500",    bg: "bg-red-50",    dot: "#ef4444" },
  PENDING_RETURN: { label: "Đang trả",     color: "text-amber-600",  bg: "bg-amber-50",  dot: "#d97706" },
  RETURNED:       { label: "Hoàn thành",   color: "text-green-600",  bg: "bg-green-50",  dot: "#16a34a" },
  CANCELLED:      { label: "Đã hủy",       color: "text-gray-400",   bg: "bg-gray-50",   dot: "#9ca3af" },
  LOST:           { label: "Mất sách",     color: "text-gray-700",   bg: "bg-gray-100",  dot: "#374151" },
  DAMAGED:        { label: "Hỏng sách",    color: "text-orange-600", bg: "bg-orange-50", dot: "#ea580c" },
};

const TABS = [
  { key: "",               label: "Tất cả"    },
  { key: "CHECK_OUT",      label: "Chờ lấy"   },
  { key: "SHIPPING",       label: "Đang giao" },
  { key: "DELIVERED",      label: "Đang mượn" },
  { key: "PENDING_RETURN", label: "Đang trả"  },
  { key: "RETURNED",       label: "Hoàn tất"  },
];

const COVER_COLORS = ["#1a1a2e","#2d1b00","#0d2137","#1a2e1a","#2e1a2e","#2e2200","#1e2e20","#2e1e1e"];

const STEPS = [
  { key: "CHECK_OUT",      label: "Đơn hàng đã được đặt. Chờ giao hàng" },
  { key: "SHIPPING",       label: "Đơn hàng đang được giao"              },
  { key: "DELIVERED",      label: "Giao thành công"                      },
  { key: "PENDING_RETURN", label: "Trả sách"                             },
  { key: "RETURNED",       label: "Hoàn thành"                           },
];

const getStep = (s) => ({
  CHECK_OUT: 0, SHIPPING: 1, DELIVERED: 2, OVERDUE: 2,
  PENDING_RETURN: 3, RETURNED: 4, DAMAGED: 4, LOST: 4, CANCELLED: -1,
}[s] ?? 0);

const fmtDate     = (d) => !d ? "—" : new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const getDiff     = (due) => !due ? null : Math.ceil((new Date(due) - new Date()) / 86400000);
const fmtDateTime = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  const timeStr = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
  const dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });

  return timeStr === "00:00" || timeStr === "07:00" ? dateStr : `${dateStr} ${timeStr}`;
};


const computeDueDate = (loan, subscription) => {
  if (subscription?.maxDaysPerBook && loan?.checkoutDate) {
    return new Date(new Date(loan.checkoutDate).getTime() + subscription.maxDaysPerBook * 86400000);
  }
  return loan?.dueDate ? new Date(loan.dueDate) : null;
};


const BookCover = ({ loan, size = "md" }) => {
  const [err, setErr] = useState(false);
  const color    = COVER_COLORS[(loan?.bookId || 0) % COVER_COLORS.length];
  const initials = (loan?.bookTitle || "??").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  if (loan?.bookCoverImage && !err)
    return <img src={loan.bookCoverImage} alt={loan.bookTitle} className="w-full h-full object-cover" onError={() => setErr(true)} />;
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${color}, #000)` }}>
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,0.015) 3px,rgba(255,255,255,0.015) 6px)" }} />
      <span className="font-black select-none" style={{ color: "rgba(255,255,255,0.22)", fontSize: size === "lg" ? 26 : 16 }}>{initials}</span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "text-gray-500", bg: "bg-gray-50" };
  return (
    <span className={`text-sm font-bold px-3 py-1 rounded-full ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
};


const TimelineVertical = ({ loan, subscription }) => {
  const status    = loan.bookLoanStatus;
  const step      = getStep(status);
  const dueDate   = computeDueDate(loan, subscription);
  const diff      = getDiff(dueDate);
  const isOverdue = status === "OVERDUE";

  if (status === "CANCELLED") return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
      <span className="text-lg">❌</span>
      <p className="text-sm font-bold text-gray-600">Đơn đã bị huỷ</p>
    </div>
  );

  const reversed = [...STEPS].map((s, i) => ({ ...s, idx: i })).reverse();


  const STEP_DATE_MAP = {
    CHECK_OUT:      loan.checkoutDate,
    SHIPPING:       loan.shippingDate   || loan.shippedAt    || null,
    DELIVERED:      loan.deliveredDate  || loan.deliveredAt  || null,
    PENDING_RETURN: loan.returnRequestDate || loan.pendingReturnAt || null,
    RETURNED:       loan.returnDate     || loan.returnedAt   || null,
  };

  return (
    <div>
      {reversed.map(({ key, label, idx }, ri) => {
        const isDone   = idx < step;
        const isActive = idx === step;
        const isLast   = ri === reversed.length - 1;
        const dotColor  = isActive ? (isOverdue ? "#ef4444" : "#2563eb") : isDone ? "#d1d5db" : "#e5e7eb";
        const textColor = isActive ? (isOverdue ? "#dc2626" : "#1d4ed8") : isDone ? "#6b7280"  : "#9ca3af";
        const stepDate  = STEP_DATE_MAP[key];

        return (
          <div key={key} className="flex gap-4">
            <div className="flex flex-col items-center" style={{ width: 16 }}>
              <div className="rounded-full flex-shrink-0 mt-1" style={{
                width: isActive ? 14 : 10,
                height: isActive ? 14 : 10,
                marginLeft: isActive ? -2 : 0,
                background: dotColor,
                boxShadow: isActive ? `0 0 0 3px ${isOverdue ? "#fee2e2" : "#dbeafe"}` : "none",
              }} />
              {!isLast && (
                <div className="flex-1 w-px my-1" style={{ background: isDone || isActive ? "#d1d5db" : "#f3f4f6", minHeight: 24 }} />
              )}
            </div>
            <div className="pb-4 flex-1">
              <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>
                {label}
                {isActive && isOverdue && diff !== null && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                    Trễ {Math.abs(diff)} ngày
                  </span>
                )}
              </p>
              {(isActive || isDone) && stepDate && (
                <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(stepDate)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};


const ReturnModal = ({ loan, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const handleConfirm = async () => {
    try {
      setLoading(true); setError(null);
      await api.post("/book-loans/my/return-request", { bookLoanId: loan.id, notes: "" });
      onSuccess();
    } catch (e) { setError(e.response?.data?.message || "Không thể gửi yêu cầu."); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
          <h2 className="text-lg font-bold text-gray-900">Yêu cầu trả sách</h2>
          <p className="text-sm text-gray-400 mt-0.5 truncate">{loan.bookTitle}</p>
        </div>
        <div className="px-6 py-5">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-500 text-xs mb-4">⚠ {error}</div>}
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 bg-zinc-100 rounded-2xl py-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-200 transition-colors">Huỷ</button>
            <button onClick={handleConfirm} disabled={loading}
              className={`flex-1 rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${loading ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" : "bg-zinc-900 text-white hover:bg-black active:scale-[0.98]"}`}>
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Gửi yêu cầu trả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewModal = ({ loan, onClose, onSuccess }) => {
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];
  const handleSubmit = async () => {
    if (!comment.trim() || comment.trim().length < 10) { setError("Nhận xét phải ít nhất 10 ký tự."); return; }
    try {
      setLoading(true); setError(null);
      await api.post("/reviews", { bookId: Number(loan.bookId), rating, reviewText: comment.trim() });
      onSuccess();
    } catch (e) { setError(e.response?.data?.message || "Không thể gửi đánh giá."); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-3.5 sm:hidden" />
        <div className="px-5 pt-5 pb-1"><h2 className="text-base font-bold text-gray-900">Đánh giá sách</h2></div>
        <div className="px-5 pb-6 pt-4 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Xếp hạng</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} className="text-xl border-0 bg-transparent cursor-pointer hover:scale-110 transition-transform leading-none"
                  style={{ color: s <= rating ? "#EF9F27" : "#e5e7eb" }}>★</button>
              ))}
              <span className="ml-2 text-sm font-semibold text-amber-600">{LABELS[rating]}</span>
            </div>
          </div>
          <hr className="border-gray-100" />
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Nhận xét của bạn</p>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..." rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 resize-none outline-none focus:border-amber-400 focus:bg-white transition-colors leading-relaxed" />
            <p className="text-xs text-gray-300 mt-1.5">Tối thiểu 10 ký tự</p>
          </div>
          {error && <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-red-500 text-xs">⚠ {error}</div>}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button onClick={onClose} className="py-3.5 rounded-2xl bg-gray-100 border-0 text-sm font-semibold text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors">Huỷ</button>
            <button onClick={handleSubmit} disabled={loading}
              className={`py-3.5 rounded-2xl border-0 text-sm font-bold flex items-center justify-center gap-2 transition-all ${loading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white cursor-pointer hover:bg-black"}`}>
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Gửi đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FineModal = ({ fine, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const handlePay = async () => {
    try {
      setLoading(true); setError(null);
      const r1  = await api.post(`/fines/${fine.id}/pay`, { amount: fine.amount });
      const pid = r1.data?.paymentId ?? r1.data?.data?.paymentId ?? r1.data?.id;
      if (!pid) { setError("Không lấy được paymentId."); return; }
      const r2  = await api.get(`/payments/${pid}/url`);
      const url = r2.data?.message;
      if (url?.startsWith("http")) { window.location.href = url; return; }
      setError("Không thể tạo link thanh toán.");
    } catch (e) { setError(e.response?.data?.message || "Có lỗi xảy ra."); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận thanh toán</h3>
        <p className="text-sm text-gray-500 mb-4">Xác nhận thanh toán khoản phạt?</p>
        {error && <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-red-500 text-xs mb-4">⚠ {error}</div>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">Huỷ</button>
          <button onClick={handlePay} disabled={loading}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>
            {loading ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
};


const LoanDetailPanel = ({ loan: loanSummary, fine, subscription: subProp, onRefresh }) => {
  const [loan, setLoan]       = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const lRes = await api.get(`/book-loans/my/${loanSummary.id}`);
        if (!alive) return;
        const l = lRes.data;
        setLoan(l);
        

        const embedded = l.deliveryAddress || l.address || l.shippingAddress || null;
        if (embedded?.street || embedded?.ward || embedded?.province) { setAddress(embedded); return; }
        const addrId = l.addressId || l.deliveryAddressId || null;
        if (addrId) {
          try {
            const pRes = await api.get("/users/profile");
            const uid  = pRes.data?.id;
            if (uid) {
              const aRes = await api.get(`/users/${uid}/addresses`);
              const list = Array.isArray(aRes.data) ? aRes.data : (aRes.data?.content || []);
              if (alive) setAddress(list.find(a => a.id === addrId) || null);
            }
          } catch {}
        }
      } catch {}
      finally { if (alive) setLoading(false); }
    };
    load();
    return () => { alive = false; };
  }, [loanSummary.id]);

  if (loading) return (
    <div className="flex justify-center py-8 border-t border-gray-100 bg-gray-50">
      <div className="w-7 h-7 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
  if (!loan) return null;

  const status      = loan.bookLoanStatus;
  const isOverdue   = status === "OVERDUE";
  const isDelivered = status === "DELIVERED";
  const canReturn   = isDelivered || isOverdue;
  const isPending   = status === "PENDING_RETURN";
  const isReturned  = status === "RETURNED";
  const isCheckOut  = status === "CHECK_OUT";
  const hasFineAmt  = fine && Number(fine.amount) > 0;


  const dueDate  = computeDueDate(loan, subProp);
  const diff     = getDiff(dueDate);

  const addrLine = address
    ? [address.street, address.ward, address.district, address.province].filter(Boolean).join(", ")
    : null;
  const hasDeliveryInfo = address?.recipientName || address?.phoneNumber || addrLine;

  const handleSuccess = (msg) => {
    setModal(null);
    setToast(msg);
    onRefresh();
    setTimeout(() => setToast(null), 3000);
  };

  const IconCircle = ({ bg, children }) => (
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
      {children}
    </div>
  );

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="px-4 py-4 space-y-3">

        {hasDeliveryInfo && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <p className="text-sm font-bold uppercase tracking-wider px-4 pt-3 pb-2.5 border-b border-gray-50">
              Thông tin giao hàng
            </p>
            <div className="px-4 py-3 space-y-2.5">
              {address?.recipientName && (
                <div className="flex items-center gap-3">
                  <IconCircle bg="#e8eaf6"><User size={14} color="#5c6bc0" /></IconCircle>
                  <span className="text-sm font-medium text-gray-700">{address.recipientName}</span>
                </div>
              )}
              {address?.phoneNumber && (
                <div className="flex items-center gap-3">
                  <IconCircle bg="#e8f5e9"><Phone size={14} color="#43a047" /></IconCircle>
                  <span className="text-sm font-medium text-gray-700">{address.phoneNumber}</span>
                </div>
              )}
              {addrLine && (
                <div className="flex items-center gap-3">
                  <IconCircle bg="#fff3e0"><MapPin size={14} color="#fb8c00" /></IconCircle>
                  <span className="text-sm font-medium text-gray-700">{addrLine}</span>
                </div>
              )}
            </div>
          </div>
        )}


        

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <p className="text-sm font-bold uppercase tracking-wider px-4 pt-3 pb-2.5 border-b border-gray-50">
            Trạng thái đơn hàng
          </p>
          <div className="px-4 py-3">
            <TimelineVertical loan={loan} subscription={subProp} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-1 pb-2">
          {isCheckOut && (
            <div className="flex-1 bg-gray-100 border border-gray-200 text-gray-400 rounded-2xl py-3.5 text-sm font-semibold text-center">
              Chờ xử lý
            </div>
          )}
          {canReturn && (
            <button onClick={() => setModal("return")}
              className="flex-1 bg-gray-900 text-white border-0 rounded-2xl py-3.5 text-sm font-bold cursor-pointer hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm">
              Trả sách
            </button>
          )}
          {isPending && (
            <div className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl py-3.5 text-sm font-bold text-center flex items-center justify-center">
              Chờ xác nhận
            </div>
          )}
          {isReturned && (
            <button onClick={() => setModal("review")}
              className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5 text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              ★ Đánh giá
            </button>
          )}
          {hasFineAmt && (
            <button onClick={() => setModal("fine")}
              className="flex-1 bg-red-600 text-white border-0 rounded-2xl py-3.5 text-sm font-bold cursor-pointer hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
              Thanh toán phạt
            </button>
          )}
        </div>
      </div>

      {modal === "return" && <ReturnModal loan={loan} onClose={() => setModal(null)} onSuccess={() => handleSuccess("Đã gửi yêu cầu trả sách!")} />}
      {modal === "review" && <ReviewModal loan={loan} onClose={() => setModal(null)} onSuccess={() => handleSuccess("Cảm ơn bạn đã đánh giá!")} />}
      {modal === "fine" && fine && <FineModal fine={fine} onClose={() => setModal(null)} />}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm">
          <span className="text-green-400">✓</span>{toast}
        </div>
      )}
    </div>
  );
};


const LoanCard = ({ loan, fine, subscription, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const status  = loan.bookLoanStatus;
  const hasFine = fine && fine.status === "PENDING" && Number(fine.amount) > 0;
  const cfg     = STATUS_CONFIG[status] || {};
  const dueDate = computeDueDate(loan, subscription);
  const diff    = getDiff(dueDate);

  return (
    <div className="bg-white border border-gray-100 overflow-hidden transition-shadow duration-200"
      style={{ borderRadius: 16, boxShadow: open ? "0 4px 20px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)" }}>

      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: cfg.bg || "#f3f4f6" }}>
            <Package size={18} style={{ color: cfg.dot || "#6b7280" }} />
          </div>
          <p className="text-base font-bold leading-none">
            Mã đơn: <span className="text-gray-900">{loan.id}</span>
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex gap-4 px-6 py-4">
        <div className="flex-shrink-0 rounded-xl overflow-hidden shadow-md" style={{ width: 96, height: 132 }}>
          <BookCover loan={loan} size="lg" />
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
            {loan.bookTitle || "—"}
          </h3>
          <p className="text-sm py-4 truncate mb-3">{loan.authorName}</p>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-300 flex-shrink-0" />
              <span className="text-sm w-10">Mượn:</span>
              <span className="text-sm font-semibold text-gray-600">
                {loan.checkoutDate ? new Date(loan.checkoutDate).toLocaleDateString("vi-VN") : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className={`flex-shrink-0 ${status === "OVERDUE" ? "text-red-400" : "text-gray-300"}`} />
              <span className="text-sm w-10">Hạn:</span>
              <span className={`text-sm font-semibold ${status === "OVERDUE" ? "text-red-500" : "text-gray-600"}`}>
                {dueDate ? dueDate.toLocaleDateString("vi-VN") : "—"}
              </span>
              {status === "OVERDUE" && diff !== null && (
                <span className="ml-1 text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold leading-none">
                  Trễ {Math.abs(diff)}n
                </span>
              )}
              {status === "DELIVERED" && diff !== null && diff <= 3 && diff >= 0 && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold leading-none">
                  Còn {diff}n
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasFine && (
        <div className="px-4 py-2.5 border-t border-red-50 bg-red-50 flex items-center justify-between">
          <span className="text-sm text-red-500 flex items-center gap-1.5 font-medium">
            <AlertCircle size={12} /> Phạt chưa thanh toán
          </span>
          <span className="text-sm font-bold text-red-500">
            {Number(fine.amount).toLocaleString("vi-VN")} Đ
          </span>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        style={{ border: "none", borderTop: "1px solid #f9fafb" }}
      >
        <span className="text-sm font-semibold">{open ? "Thu gọn" : "Xem chi tiết"}</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>

      {open && <LoanDetailPanel loan={loan} fine={fine} subscription={subscription} onRefresh={onRefresh} />}
    </div>
  );
};

// ─── SKELETON ─────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-12 bg-gray-50 border-b border-gray-100" />
    <div className="flex gap-4 p-4">
      <div className="flex-shrink-0 bg-gray-100 rounded-xl" style={{ width: 72, height: 96 }} />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
        <div className="h-3.5 bg-gray-100 rounded w-2/4" />
        <div className="h-3 bg-gray-100 rounded w-2/5 mt-3" />
        <div className="h-3 bg-gray-100 rounded w-2/5" />
      </div>
    </div>
    <div className="h-9 bg-gray-50 border-t border-gray-100" />
  </div>
);


export default function MyLoan() {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab]   = useState("");
  const [loading, setLoading]       = useState(true);
  const [loans, setLoans]           = useState([]);
  const [finesMap, setFinesMap]     = useState({});
  const [subscription, setSub]      = useState(null);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, fRes, subRes] = await Promise.all([
        api.get("/book-loans/my", { params: { status: activeTab || undefined, page, size: 8 } }),
        api.get("/fines/my-fines").catch(() => ({ data: [] })),
        api.get("/subscriptions/user/active").catch(() => null),
      ]);
      setLoans(lRes.data.content || []);
      setTotalPages(lRes.data.totalPage || lRes.data.totalPages || 1);
      setSub(subRes?.data || null); // ← thêm
      const map = {};
      (fRes.data || []).forEach(f => { if (f.status === "PENDING") map[f.bookLoanId] = f; });
      setFinesMap(map);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [activeTab, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handleFocus = () => fetchData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchData]);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;
    let unsubscribes = [];
    try {
      wsService.connect(userId);
      unsubscribes = [
        wsService.listen("LOAN_CREATED",        () => fetchData()),
        wsService.listen("LOAN_SHIPPING",        () => fetchData()),
        wsService.listen("LOAN_RETURN_APPROVED", () => fetchData()),
      ];
    } catch (err) { console.warn("WebSocket không khả dụng:", err); }
    return () => {
      try { unsubscribes.forEach(fn => fn()); wsService.disconnect(); } catch {}
    };
  }, [fetchData]);

  return (
    <div className="pb-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      <PageHeader title="Đơn hàng của tôi" />
      <div className="flex gap-0 overflow-x-auto no-scrollbar mb-4 border-b border-gray-100">
        {TABS.map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(0); }}
            className={`flex-shrink-0 px-4 pb-3 pt-1 text-sm font-semibold transition-all relative border-0 bg-transparent cursor-pointer whitespace-nowrap ${
              activeTab === tab.key ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
            }`}>
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900 rounded-t" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}</div>
      ) : loans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Package size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Không có đơn hàng nào</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Khám phá thư viện và mượn sách yêu thích</p>
          <button onClick={() => navigate("/home/books")}
            className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer hover:bg-black transition-colors">
            Xem sách
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map(loan => (
            <LoanCard
              key={loan.id}
              loan={loan}
              fine={finesMap[loan.id] || null}
              subscription={subscription} 
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-500 disabled:opacity-30 cursor-pointer hover:bg-gray-50">
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i)
            .filter(i => Math.abs(i - page) <= 2)
            .map(i => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-xl text-sm cursor-pointer border ${
                  page === i ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}>
                {i + 1}
              </button>
            ))}
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-500 disabled:opacity-30 cursor-pointer hover:bg-gray-50">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}