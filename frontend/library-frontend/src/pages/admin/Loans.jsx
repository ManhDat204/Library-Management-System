import { useState, useEffect } from "react";
import {
  Search, X, RefreshCw, Loader2, AlertCircle, CheckCircle,
  ChevronLeft, ChevronRight, BookOpen, Eye, Plus,
  ClipboardCheck, ArrowLeft, AlertTriangle, Trash2, Truck
} from "lucide-react";
import axios from "axios";

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "bg-emerald-500", error: "bg-rose-500", info: "bg-blue-500" };
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-2xl text-sm font-medium ${colors[type] || colors.info}`}
      style={{ animation: "slideIn 0.3s ease" }}>
      {type === "success" && <CheckCircle size={18} />}
      {type === "error" && <AlertCircle size={18} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl" style={{ animation: "fadeUp 0.25s ease" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-amber-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 pl-[52px]">{message}</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Hủy</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm rounded-xl text-white font-semibold transition ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
      {children}
      {error && <span className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle size={11} />{error}</span>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    CHECK_OUT:      { label: "Chờ vận chuyển",  cls: "bg-blue-50 text-blue-600" },
    SHIPPING:       { label: "Đang vận chuyển", cls: "bg-indigo-50 text-indigo-600" },
    DELIVERED:      { label: "Đang mượn",       cls: "bg-teal-50 text-teal-600" },
    OVERDUE:        { label: "Quá hạn",         cls: "bg-rose-50 text-rose-600" },
    RETURNED:       { label: "Đã trả",          cls: "bg-emerald-50 text-emerald-600" },
    LOST:           { label: "Mất sách",        cls: "bg-gray-100 text-gray-500" },
    DAMAGED:        { label: "Hư hỏng",         cls: "bg-orange-50 text-orange-600" },
    CANCELLED:      { label: "Đã huỷ",          cls: "bg-gray-100 text-gray-400" },
    PENDING_RETURN: { label: "Chờ duyệt trả",   cls: "bg-violet-50 text-violet-600" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-gray-100 text-gray-500" };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}

const getStatus  = (loan) => loan.bookLoanStatus || loan.status;
const isPending  = (s) => s === "PENDING_RETURN";
const isCheckOut = (s) => s === "CHECK_OUT";
const formatAddress = (loan) => {
  const address = loan.address || loan.deliveryAddress || loan.shippingAddress || null;
  const fields = [];
  if (address && typeof address === "object") {
    fields.push(address.street || "");
    fields.push(address.ward || "");
    fields.push(address.district || "");
    fields.push(address.province || "");
  } else {
    fields.push(loan.ward || "");
    fields.push(loan.district || "");
    fields.push(loan.province || "");
  }
  return fields.filter(Boolean).join(", ");
};
const todayStr   = () => new Date().toISOString().split("T")[0];

function ApproveScreen({ loan, onBack, onDone, showToast }) {
  const [submitting, setSubmitting] = useState(false);
  const [condition, setCondition]   = useState("RETURNED");
  const [notes, setNotes]           = useState("");
  const [returnDate, setReturnDate] = useState(todayStr());

  const getToken   = () => localStorage.getItem("token");
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  const bookPrice    = loan.bookPrice || loan.price || 0;
  const checkoutDate = loan.checkoutDate || loan.loanDate;
  const dueDateObj   = loan.dueDate ? new Date(loan.dueDate) : null;
  const retDateObj   = new Date(returnDate);
  const overdueDays  = dueDateObj && retDateObj > dueDateObj
    ? Math.floor((retDateObj - dueDateObj) / 86400000) : 0;
  const daysBorrowed = checkoutDate
    ? Math.floor((new Date() - new Date(checkoutDate)) / 86400000) : 0;

  const fineAmount =
    condition === "DAMAGED" && bookPrice ? Math.round(bookPrice * 1.5) :
    condition === "LOST"    && bookPrice ? Math.round(bookPrice)       :
    overdueDays > 0 ? overdueDays * 5000 : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(
        "http://localhost:8080/api/book-loans/admin/approve-return",
        { bookLoanId: loan.id, condition, notes: notes || undefined },
        { headers: authHeader() }
      );
      try {
        await axios.post("http://localhost:8080/api/notifications/send", {
          userId:  loan.userId,
          title:   condition === "RETURNED" ? " Trả sách thành công" : " Thông báo vi phạm",
          message: condition === "RETURNED"
            ? `Sách "${loan.bookTitle}" đã được xác nhận trả thành công.`
            : `Sách "${loan.bookTitle}" bị ${condition === "DAMAGED" ? "hư hỏng" : "mất"}. Phí bồi thường: ${fineAmount.toLocaleString("vi-VN")}đ.`,
          type: condition === "RETURNED" ? "RETURN_SUCCESS" : "FINE_NOTICE",
          refId: loan.id,
        }, { headers: authHeader() });
      } catch { }
      showToast("Xử lý phiếu thành công! Thông báo đã gửi đến người dùng.", "success");
      onDone();
    } catch (err) {
      showToast(err?.response?.data?.message || "Xử lý thất bại", "error");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 w-full" style={{ animation: "fadeUp 0.2s ease" }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition">
          <ArrowLeft size={15} /> Quay lại
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <ClipboardCheck size={16} className="text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Xử lý phiếu mượn</h2>
        </div>
      </div>

      <div className="w-full flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-700">Thông tin phiếu mượn</h3>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mã phiếu</p>
                <span className="font-mono font-bold text-gray-800 text-base">{loan.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Độc giả</p>
                <span className="font-semibold text-gray-800">{loan.userName || loan.userFullName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tên sách</p>
                <span className="font-semibold text-gray-800">{loan.bookTitle}</span>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div className="grid grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày mượn</p>
                <span className="font-semibold text-gray-800">
                  {loan.checkoutDateTime ? `${new Date(loan.checkoutDateTime).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})} ${new Date(loan.checkoutDateTime).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}` : checkoutDate}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày hẹn trả</p>
                <span className={`font-semibold ${overdueDays > 0 ? "text-rose-500" : "text-gray-800"}`}>
                  {loan.dueDate}
                  {overdueDays > 0 && <span className="ml-2 text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">Trễ {overdueDays} ngày</span>}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Số ngày đã mượn</p>
                <span className="font-semibold text-gray-800">{daysBorrowed} ngày</span>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div className="grid grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</p>
                <div className="mt-0.5"><StatusBadge status={getStatus(loan)} /></div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày trả</p>
                <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-800 font-semibold w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tình trạng khi trả</p>
                <select value={condition} onChange={e => setCondition(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-800 font-semibold w-full bg-white">
                  <option value="RETURNED">✅ Bình thường</option>
                  <option value="DAMAGED">⚠️ Hư hỏng</option>
                  <option value="LOST">🗑️ Mất sách</option>
                </select>
                <p className="text-xs text-gray-400 mt-0.5">
                  {condition === "RETURNED" && "Không tính phí bồi thường."}
                  {condition === "DAMAGED"  && "Phí bồi thường 1.5× giá sách."}
                  {condition === "LOST"     && "Phí bồi thường 1.0× giá sách."}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <Field label="Ghi chú">
              <textarea rows={2} placeholder="Nhập ghi chú cho người dùng..."
                value={notes} onChange={e => setNotes(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
            </Field>
          </div>
        </div>

        <div className="flex justify-between">
          <button onClick={onBack} disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition disabled:opacity-50">
            <ArrowLeft size={15} /> Quay lại
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-50
              ${condition === "RETURNED" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
              : condition === "DAMAGED"  ? "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
              :                            "bg-rose-500 hover:bg-rose-600 shadow-rose-200"}`}>
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Xác nhận trả sách
          </button>
        </div>
      </div>
    </div>
  );
}


function Loans() {
  const [loans, setLoans]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [toast,       setToast]       = useState(null);
  const [confirm,     setConfirm]     = useState(null);
  const [detail,      setDetail]      = useState(null);
  const [approveView, setApproveView] = useState(null);

  const [showCheckout,   setShowCheckout]   = useState(false);
  const [checkoutForm,   setCheckoutForm]   = useState({ userId: "", bookId: "", checkoutDays: 14 });
  const [checkoutErrors, setCheckoutErrors] = useState({});

  const showToast  = (msg, type = "info") => setToast({ message: msg, type });
  const getToken   = () => localStorage.getItem("token");
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  const fetchLoans = async (overridePage = page) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/book-loans/search", {
        status:        statusFilter || undefined,
        page:          overridePage,
        size:          pageSize,
        sortBy:        "createdAt",
        sortDirection: "DESC",
      }, { headers: authHeader() });
      const data = res.data;
      setLoans(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch { showToast("Không thể tải danh sách mượn sách", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLoans(page); }, [page, statusFilter]);
  const handleSearch = () => { setPage(0); fetchLoans(0); };

  {/* check_out -> shipping */}
  const handleMarkShipping = async (loan) => {
    setConfirm(null);
    try {
      await axios.patch(
        `http://localhost:8080/api/book-loans/${loan.id}/shipping`,
        {},
        { headers: authHeader() }
      );
      try {
        await axios.post("http://localhost:8080/api/notifications/send", {
          userId:  loan.userId,
          title:   "🚚 Sách đang được vận chuyển",
          message: `Sách "${loan.bookTitle}" đang trên đường đến bạn. Vui lòng xác nhận khi nhận được.`,
          type:    "SHIPPING",
          refId:   loan.id,
        }, { headers: authHeader() });
      } catch {  }
      showToast(`Đã giao hàng phiếu #${loan.id}!`, "success");
      fetchLoans();
    } catch (err) {
      showToast(err?.response?.data?.message || "Giao hàng thất bại", "error");
    }
  };

  const validateCheckout = () => {
    const e = {};
    if (!checkoutForm.userId) e.userId = "Bắt buộc";
    if (!checkoutForm.bookId) e.bookId = "Bắt buộc";
    if (!checkoutForm.checkoutDays || checkoutForm.checkoutDays < 1) e.checkoutDays = "Ít nhất 1 ngày";
    setCheckoutErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateCheckout()) return;
    setSubmitting(true);
    try {
      await axios.post(
        `http://localhost:8080/api/book-loans/checkout/user/${checkoutForm.userId}`,
        { bookId: Number(checkoutForm.bookId), checkoutDays: Number(checkoutForm.checkoutDays) },
        { headers: authHeader() }
      );
      showToast("Tạo phiếu mượn thành công!", "success");
      setShowCheckout(false);
      setCheckoutForm({ userId: "", bookId: "", checkoutDays: 14 });
      fetchLoans(0);
    } catch (err) {
      showToast(err?.response?.data?.message || "Tạo phiếu mượn thất bại", "error");
    } finally { setSubmitting(false); }
  };

  const handleUpdateOverdue = async () => {
    setConfirm(null);
    try {
      await axios.post("http://localhost:8080/api/book-loans/admin/update-overdue", {}, { headers: authHeader() });
      showToast("Đã cập nhật trạng thái quá hạn!", "success");
      fetchLoans();
    } catch { showToast("Cập nhật thất bại", "error"); }
  };

  if (approveView) {
    return (
      <>
        <style>{`
          @keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
          @keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        `}</style>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <ApproveScreen
          loan={approveView}
          onBack={() => setApproveView(null)}
          onDone={() => { setApproveView(null); fetchLoans(); }}
          showToast={showToast}
        />
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        .modal-enter{animation:fadeUp 0.25s ease;}
      `}</style>

      {toast   && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}

      <div className="p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-800">Quản Lý Đơn Hàng</h2>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setConfirm({
                title: "Cập nhật quá hạn",
                message: "Hệ thống sẽ tự động cập nhật tất cả phiếu mượn đã quá hạn. Tiếp tục?",
                confirmLabel: "Cập nhật", confirmClass: "bg-amber-500 hover:bg-amber-600",
                onConfirm: handleUpdateOverdue,
              })}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-sm font-semibold hover:bg-amber-100 transition">
               Cập nhật quá hạn
            </button>
            <button onClick={() => { setCheckoutForm({ userId: "", bookId: "", checkoutDays: 14 }); setCheckoutErrors({}); setShowCheckout(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-sky-200">
               Tạo Phiếu Mượn
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Tìm theo tên người dùng, tên sách..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-gray-50" />
            {search && (
              <button onClick={() => { setSearch(""); setPage(0); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
            )}
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-gray-50 text-gray-600 min-w-[180px]">
            <option value="">Tất cả trạng thái</option>
            <option value="CHECK_OUT">Chờ vận chuyển</option>
            <option value="SHIPPING">Đang vận chuyển</option>
            <option value="DELIVERED">Đang mượn</option>
            <option value="OVERDUE">Quá hạn</option>
            <option value="PENDING_RETURN">Chờ duyệt trả</option>
            <option value="RETURNED">Đã trả</option>
          </select>
          <button onClick={handleSearch} className="px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 transition">Tìm kiếm</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ID ", "Người mượn", "Tên Sách", "Địa chỉ giao", "Trạng Thái", "Người xử lý", "Hành Động"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                    <Loader2 size={28} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">Đang tải dữ liệu...</p>
                  </td></tr>
                ) : loans.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Không có phiếu mượn nào</p>
                  </td></tr>
                ) : loans.map(loan => {
                  const status = getStatus(loan);
                  return (
                    <tr key={loan.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition">
                      <td className="px-5 py-3.5"><span className="text-sm font-mono font-semibold text-gray-900">{loan.id}</span></td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-800">{loan.userName || loan.userFullName}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-700 line-clamp-2 max-w-[220px]">{loan.bookTitle}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-700 line-clamp-2 max-w-[240px]">{formatAddress(loan) || <span className="text-gray-300">Chưa có</span>}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-700 font-medium">
                          {loan.handledBy || <span className="text-gray-300">—</span>}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => setDetail(loan)} title="Chi tiết"
                            className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition">
                            <Eye size={15} />
                          </button>
                          {isCheckOut(status) && (
                            <button onClick={() => setConfirm({
                                title: "Xác nhận giao hàng",
                                message: `Giao sách "${loan.bookTitle}" cho ${loan.userName || loan.userFullName}?`,
                                confirmLabel: "Giao hàng",
                                confirmClass: "bg-indigo-500 hover:bg-indigo-600",
                                onConfirm: () => handleMarkShipping(loan),
                              })}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition shadow-sm shadow-indigo-200">
                               Giao hàng
                            </button>
                          )}

                          {/* PENDING_RETURN → RETURNED/DAMAGED/LOST */}
                          {isPending(status) && (
                            <button onClick={() => setApproveView(loan)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-xs font-semibold transition shadow-sm shadow-violet-200">
                              Duyệt trả
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-sm text-gray-500">Trang {page + 1} / {totalPages} &nbsp;·&nbsp; {totalElements} kết quả</p>
              <div className="flex gap-1.5">
                <button onClick={() => setPage(0)} disabled={page === 0} className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition">«</button>
                <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0} className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition flex items-center gap-1"><ChevronLeft size={14}/> Trước</button>
                {Array.from({length:totalPages},(_,i)=>i).filter(i=>Math.abs(i-page)<=2).map(i=>(
                  <button key={i} onClick={()=>setPage(i)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${i===page?"bg-sky-500 text-white shadow-sm":"border border-gray-200 hover:bg-white text-gray-600"}`}>{i+1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition flex items-center gap-1">Sau <ChevronRight size={14}/></button>
                <button onClick={() => setPage(totalPages-1)} disabled={page>=totalPages-1} className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition">»</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl modal-enter">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Chi tiết phiếu mượn</h2>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              {[
                ["Mã phiếu",       detail.id],
                ["Người mượn",     detail.userName || detail.userFullName],
                ["Email",          detail.userEmail],
                ["Tên sách",       detail.bookTitle],
                ["Ngày mượn",      detail.checkoutDateTime ? `${new Date(detail.checkoutDateTime).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})} ${new Date(detail.checkoutDateTime).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}` : (detail.checkoutDate || detail.loanDate)],
                ["Hạn trả",        detail.dueDate],
                ["Địa chỉ giao",   formatAddress(detail) || "Chưa có"],
                ["Ngày trả thực",  detail.returnDate || "—"],
                ["Người xử lý",    detail.handledBy || "Chưa xử lý"],
               ["Trạng thái",     <StatusBadge status={getStatus(detail)} />],
              ].filter(([,v]) => v !== undefined && v !== null).map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">{label}</p>
                  <p className="text-gray-800 font-medium">{val}</p>
                </div>
              ))}
              
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6">
              {isCheckOut(getStatus(detail)) && (
                <button onClick={() => {
                    setDetail(null);
                    setConfirm({
                      title: "Xác nhận giao hàng",
                      message: `Giao sách "${detail.bookTitle}" cho ${detail.userName || detail.userFullName}?`,
                      confirmLabel: "Giao hàng",
                      confirmClass: "bg-indigo-500 hover:bg-indigo-600",
                      onConfirm: () => handleMarkShipping(detail),
                    });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition">
                  <Truck size={15} /> Giao hàng
                </button>
              )}
              {isPending(getStatus(detail)) && (
                <button onClick={() => { setDetail(null); setApproveView(detail); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600 transition">
                  <ClipboardCheck size={15} /> Xử lý phiếu
                </button>
              )}
              <button onClick={() => setDetail(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl modal-enter">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Plus size={17} className="text-sky-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Tạo Phiếu Mượn</h2>
              </div>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <Field label="ID Người Dùng *" error={checkoutErrors.userId}>
                <input type="number" placeholder="VD: 5" value={checkoutForm.userId}
                  onChange={e => { setCheckoutForm(p=>({...p,userId:e.target.value})); setCheckoutErrors(p=>({...p,userId:""})); }}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-300 ${checkoutErrors.userId?"border-rose-400 bg-rose-50":"border-gray-200"}`} />
              </Field>
              <Field label="ID Sách *" error={checkoutErrors.bookId}>
                <input type="number" placeholder="VD: 12" value={checkoutForm.bookId}
                  onChange={e => { setCheckoutForm(p=>({...p,bookId:e.target.value})); setCheckoutErrors(p=>({...p,bookId:""})); }}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-300 ${checkoutErrors.bookId?"border-rose-400 bg-rose-50":"border-gray-200"}`} />
              </Field>
              <Field label="Số ngày mượn *" error={checkoutErrors.checkoutDays}>
                <input type="number" placeholder="VD: 14" min={1} value={checkoutForm.checkoutDays}
                  onChange={e => { setCheckoutForm(p=>({...p,checkoutDays:e.target.value})); setCheckoutErrors(p=>({...p,checkoutDays:""})); }}
                  className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-300 ${checkoutErrors.checkoutDays?"border-rose-400 bg-rose-50":"border-gray-200"}`} />
              </Field>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowCheckout(false)} disabled={submitting} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50">Hủy</button>
              <button onClick={handleCheckout} disabled={submitting} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-sky-200 disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 size={15} className="animate-spin" />} Tạo phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Loans;