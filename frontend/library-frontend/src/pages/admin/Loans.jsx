import { useState, useEffect } from "react";
import { Search, X, Loader2, ChevronLeft, ChevronRight, BookOpen, Eye, ChevronDown, Trash2 } from "lucide-react";

// Import common components
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusBadge from "../../components/common/StatusBadge";
import Field from "../../components/common/Field";
import Pagination from "../../components/common/Pagination";

// Import services
import { loanService } from "../../services/loanService";
import { notificationService } from "../../services/notificationService";
import wsService from "../../services/websocketService";

// Import utilities
import { getStatus, isPending, isCheckOut } from "../../utils/statusHelpers";
import { formatAddress } from "../../utils/formatters";
import { todayStr, calculateOverdueDays, calculateDaysBorrowed } from "../../utils/dateHelpers";

// ApproveScreen component
function ApproveScreen({ loan, onBack, onDone, showToast }) {
  const [submitting, setSubmitting] = useState(false);
  const [condition, setCondition] = useState("RETURNED");
  const [notes, setNotes] = useState("");
  const [returnDate, setReturnDate] = useState(todayStr());

  const bookPrice = loan.bookPrice || loan.price || 0;
  const checkoutDate = loan.checkoutDate || loan.loanDate;
  const overdueDays = calculateOverdueDays(loan.dueDate, returnDate);
  const daysBorrowed = calculateDaysBorrowed(checkoutDate);

  const fineAmount =
    condition === "DAMAGED" && bookPrice ? Math.round(bookPrice * 1.5) :
    condition === "LOST" && bookPrice ? Math.round(bookPrice) :
    overdueDays > 0 ? overdueDays * 5000 : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await loanService.approveReturn({
        bookLoanId: loan.id,
        condition,
        notes: notes || undefined,
      });

      try {
        await notificationService.send({
          userId: loan.userId,
          title: condition === "RETURNED" ? " Trả sách thành công" : " Thông báo vi phạm",
          message: condition === "RETURNED"
            ? `Sách "${loan.bookTitle}" đã được xác nhận trả thành công.`
            : `Sách "${loan.bookTitle}" bị ${condition === "DAMAGED" ? "hư hỏng" : "mất"}. Phí bồi thường: ${fineAmount.toLocaleString("vi-VN")}đ.`,
          type: condition === "RETURNED" ? "RETURN_SUCCESS" : "FINE_NOTICE",
          refId: loan.id,
        });
      } catch { }

      showToast("Xử lý phiếu thành công! Thông báo đã gửi đến người dùng.", "success");
      onDone();
    } catch (err) {
      showToast(err?.response?.data?.message || "Xử lý thất bại", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 w-full" style={{ animation: "fadeUp 0.2s ease" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Xử lý phiếu mượn</h2>
        </div>
      </div>

      <div className="w-full flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-700">Thông tin phiếu mượn</h3>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mã phiếu</p>
                <span className="font-mono font-bold text-gray-900 text-base">{loan.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Độc giả</p>
                <span className="font-semibold text-gray-900">{loan.userName || loan.userFullName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tên sách</p>
                <span className="font-semibold text-gray-900">{loan.bookTitle}</span>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div className="grid grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày mượn</p>
                <span className="font-semibold text-gray-800">
                  {loan.checkoutDateTime
                    ? `${new Date(loan.checkoutDateTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })} ${new Date(loan.checkoutDateTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                    : checkoutDate}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày hẹn trả</p>
                <span className={`font-semibold ${overdueDays > 0 ? "text-rose-500" : "text-gray-800"}`}>
                  {loan.dueDate}
                  {overdueDays > 0 && (
                    <span className="ml-2 text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">
                      Trễ {overdueDays} ngày
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Số ngày đã mượn</p>
                <span className="font-semibold text-gray-900">{daysBorrowed} ngày</span>
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
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-900 font-semibold w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tình trạng khi trả</p>
                <select value={condition} onChange={e => setCondition(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-900 font-semibold w-full bg-white">
                  <option value="RETURNED"> Bình thường</option>
                  <option value="DAMAGED"> Hư hỏng</option>
                  <option value="LOST">Mất sách</option>
                </select>
                <p className="text-xs text-gray-400 mt-0.5">
                  {condition === "RETURNED" && "Không tính phí bồi thường."}
                  {condition === "DAMAGED" && "Phí bồi thường 1.5× giá sách."}
                  {condition === "LOST" && "Phí bồi thường 1.0× giá sách."}
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
            <ChevronLeft size={15} /> Quay lại
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-50
              ${condition === "RETURNED" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
              : condition === "DAMAGED" ? "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
              : "bg-rose-500 hover:bg-rose-600 shadow-rose-200"}`}>
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
            Xác nhận trả sách
          </button>
        </div>
      </div>
    </div>
  );
}

// CheckoutModal component
function CheckoutModal({ show, onClose, onSuccess, showToast, form, setForm, errors, setErrors }) {
  const submitting = form.submitting;

  const validateCheckout = () => {
    const e = {};
    if (!form.userId) e.userId = "Bắt buộc";
    if (!form.bookId) e.bookId = "Bắt buộc";
    if (!form.checkoutDays || form.checkoutDays < 1) e.checkoutDays = "Ít nhất 1 ngày";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateCheckout()) return;
    setForm(p => ({ ...p, submitting: true }));
    try {
      await loanService.checkout(form.userId, {
        bookId: Number(form.bookId),
        checkoutDays: Number(form.checkoutDays),
      });
      showToast("Tạo phiếu mượn thành công!", "success");
      onClose();
      onSuccess();
    } catch (err) {
      showToast(err?.response?.data?.message || "Tạo phiếu mượn thất bại", "error");
    } finally {
      setForm(p => ({ ...p, submitting: false }));
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" style={{ animation: "fadeUp 0.25s ease" }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center">
              <Search size={17} className="text-sky-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Tạo Phiếu Mượn</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <Field label="ID Người Dùng *" error={errors.userId}>
            <input type="number" placeholder="VD: 5" value={form.userId}
              onChange={e => { setForm(p => ({ ...p, userId: e.target.value })); setErrors(p => ({ ...p, userId: "" })); }}
              className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-300 ${errors.userId ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
          </Field>
          <Field label="ID Sách *" error={errors.bookId}>
            <input type="number" placeholder="VD: 12" value={form.bookId}
              onChange={e => { setForm(p => ({ ...p, bookId: e.target.value })); setErrors(p => ({ ...p, bookId: "" })); }}
              className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-300 ${errors.bookId ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
          </Field>
          <Field label="Số ngày mượn *" error={errors.checkoutDays}>
            <input type="number" placeholder="VD: 14" min={1} value={form.checkoutDays}
              onChange={e => { setForm(p => ({ ...p, checkoutDays: e.target.value })); setErrors(p => ({ ...p, checkoutDays: "" })); }}
              className={`border rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-300 ${errors.checkoutDays ? "border-rose-400 bg-rose-50" : "border-gray-200"}`} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={submitting} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50">Hủy</button>
          <button onClick={handleCheckout} disabled={submitting} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-sky-200 disabled:opacity-50 flex items-center gap-2">
            {submitting && <Loader2 size={15} className="animate-spin" />} Tạo phiếu
          </button>
        </div>
      </div>
    </div>
  );
}

// LoanDetailModal component
function LoanDetailModal({ loan, onClose, onMarkShipping, onApprove }) {
  if (!loan) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" style={{ animation: "fadeUp 0.25s ease" }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Chi tiết phiếu mượn</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 text-sm">
          {[
            ["Mã phiếu", loan.id],
            ["Người mượn", loan.userName || loan.userFullName],
            ["Email", loan.userEmail],
            ["Tên sách", loan.bookTitle],
            ["Ngày mượn", loan.checkoutDateTime
              ? `${new Date(loan.checkoutDateTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })} ${new Date(loan.checkoutDateTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
              : (loan.checkoutDate || loan.loanDate)],
            ["Hạn trả", loan.dueDate],
            ["Địa chỉ giao", formatAddress(loan) || "Chưa có"],
            ["Ngày trả thực", loan.returnDate || "—"],
            ["Nhân viên xử lý", loan.handledBy || "Chưa xử lý"],
            ["Trạng thái", <StatusBadge status={getStatus(loan)} />],
          ].filter(([, v]) => v !== undefined && v !== null).map(([label, val]) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">{label}</p>
              <p className="text-gray-800 font-medium">{val}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 px-6 pb-6">
          {isCheckOut(getStatus(loan)) && (
            <button onClick={() => onMarkShipping(loan)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition">
              <ChevronRight size={15} /> Giao hàng
            </button>
          )}
          {isPending(getStatus(loan)) && (
            <button onClick={() => onApprove(loan)}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600 transition">
              <ChevronDown size={15} /> Xử lý phiếu
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">Đóng</button>
        </div>
      </div>
    </div>
  );
}

function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [detail, setDetail] = useState(null);
  const [approveView, setApproveView] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ userId: "", bookId: "", checkoutDays: 14, submitting: false });
  const [checkoutErrors, setCheckoutErrors] = useState({});

  const pageSize = 10;

  const showToast = (msg, type = "info") => setToast({ message: msg, type });

  const fetchLoans = async (overridePage = page) => {
    setLoading(true);
    try {
      const res = await loanService.searchLoans({
        status: statusFilter || undefined,
        page: overridePage,
        size: pageSize,
        sortBy: "createdAt",
        sortDirection: "DESC",
      });
      setLoans(res.data.content || []);
      setTotalPages(res.data.totalPage || 0);
      setTotalElements(res.data.totalElement || 0);
    } catch {
      showToast("Không thể tải danh sách mượn sách", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans(page);
  }, [page, statusFilter]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    wsService.connect(userId);

    const unsubscribeLoanCreated = wsService.listen("LOAN_CREATED", () => {
      showToast("Có phiếu mượn mới!", "info");
      fetchLoans(0);
    });
    const unsubscribeLoanShipping = wsService.listen("LOAN_SHIPPING", () => {
      showToast("Có đơn hàng đang vận chuyển!", "info");
      fetchLoans();
    });
    const unsubscribeLoanReturn = wsService.listen("LOAN_RETURN_APPROVED", () => {
      showToast("Sách đã được xác nhận trả!", "success");
      fetchLoans();
    });

    return () => {
      unsubscribeLoanCreated();
      unsubscribeLoanShipping();
      unsubscribeLoanReturn();
      wsService.disconnect();
    };
  }, []);

  const handleSearch = () => {
    setPage(0);
    fetchLoans(0);
  };

  const handleMarkShipping = async (loan) => {
    setConfirm(null);
    try {
      await loanService.markShipping(loan.id);
      try {
        await notificationService.send({
          userId: loan.userId,
          title: "🚚 Sách đang được vận chuyển",
          message: `Sách "${loan.bookTitle}" đang trên đường đến bạn. Vui lòng xác nhận khi nhận được.`,
          type: "SHIPPING",
          refId: loan.id,
        });
      } catch { }
      showToast(`Đã giao hàng phiếu #${loan.id}!`, "success");
      fetchLoans();
    } catch (err) {
      showToast(err?.response?.data?.message || "Giao hàng thất bại", "error");
    }
  };

  const handleMarkDelivered = async (loan) => {
    setConfirm(null);
    try {
      await loanService.markDelivered(loan.id);
      try {
        await notificationService.send({
          userId: loan.userId,
          title: "📦 Giao hàng thành công",
          message: `Sách "${loan.bookTitle}" đã giao thành công. Vui lòng kiểm tra tài liệu của bạn.`,
          type: "DELIVERED",
          refId: loan.id,
        });
      } catch { }
      showToast(`Xác nhận giao hàng thành công cho phiếu #${loan.id}!`, "success");
      fetchLoans();
    } catch (err) {
      showToast(err?.response?.data?.message || "Xác nhận giao hàng thất bại", "error");
    }
  };

  const handleUpdateOverdue = async () => {
    setConfirm(null);
    try {
      await loanService.updateOverdue();
      showToast("Đã cập nhật trạng thái quá hạn!", "success");
      fetchLoans();
    } catch {
      showToast("Cập nhật thất bại", "error");
    }
  };

  // ✅ handleDelete đặt đúng vị trí trong Loans
  const handleDelete = async (loan) => {
    setConfirm(null);
    try {
      await loanService.deleteLoan(loan.id);
      showToast(`Đã xóa phiếu mượn #${loan.id}!`, "success");
      fetchLoans();
    } catch (err) {
      showToast(err?.response?.data?.message || "Xóa thất bại", "error");
    }
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
          onDone={() => {
            setApproveView(null);
            fetchLoans();
          }}
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}

      <div className="p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Quản lý đơn hàng</h2>
          
        </div>

        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên người dùng, tên sách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-gray-50"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(0); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-gray-50 text-gray-600 min-w-[180px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="CHECK_OUT">Chờ vận chuyển</option>
            <option value="SHIPPING">Đang vận chuyển</option>
            <option value="DELIVERED">Đang mượn</option>
            <option value="OVERDUE">Quá hạn</option>
            <option value="PENDING_RETURN">Chờ duyệt trả</option>
            <option value="RETURNED">Đã trả</option>
          </select>
          <button onClick={handleSearch} className="px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 transition">
            Tìm kiếm
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ID", "Người mượn", "Tên Sách", "Địa chỉ giao", "Trạng Thái", "Nhân viên xử lý", "Hành Động"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <Loader2 size={28} className="animate-spin mx-auto mb-2" />
                      <p className="text-sm">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Không có phiếu mượn nào</p>
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => {
                    const status = getStatus(loan);
                    return (
                      <tr key={loan.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition">
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-mono font-semibold text-gray-900">{loan.id}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-800">{loan.userName || loan.userFullName}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-700 line-clamp-2 max-w-[220px]">{loan.bookTitle}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-gray-700 line-clamp-2 max-w-[240px]">
                            {formatAddress(loan) || <span className="text-gray-300">Chưa có</span>}
                          </p>
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
                            {/* Nút chi tiết */}
                            <button
                              onClick={() => setDetail(loan)}
                              title="Chi tiết"
                              className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition"
                            >
                              <Eye size={15} />
                            </button>

                            {/* ✅ Nút xóa — chỉ hiện khi RETURNED */}
                            {(status === "RETURNED" || status === "LOST" || status === "DAMAGED") && (
                              <button
                                onClick={() =>
                                  setConfirm({
                                    title: "Xác nhận xóa phiếu",
                                    message: `Bạn có chắc muốn xóa phiếu mượn #${loan.id} của "${loan.userName || loan.userFullName}"? Hành động này không thể hoàn tác.`,
                                    confirmLabel: "Xóa",
                                    confirmClass: "bg-rose-500 hover:bg-rose-600",
                                    onConfirm: () => handleDelete(loan),
                                  })
                                }
                                title="Xóa phiếu"
                                className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}

                            {isCheckOut(status) && (
                              <button
                                onClick={() =>
                                  setConfirm({
                                    title: "Xác nhận giao hàng",
                                    message: `Giao sách "${loan.bookTitle}" cho ${loan.userName || loan.userFullName}?`,
                                    confirmLabel: "Giao hàng",
                                    confirmClass: "bg-indigo-500 hover:bg-indigo-600",
                                    onConfirm: () => handleMarkShipping(loan),
                                  })
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition shadow-sm shadow-indigo-200"
                              >
                                Giao hàng
                              </button>
                            )}
                            {status === "SHIPPING" && (
                              <button
                                onClick={() =>
                                  setConfirm({
                                    title: "Xác nhận giao hàng thành công",
                                    message: `Giao hàng "${loan.bookTitle}" cho ${loan.userName || loan.userFullName} đã hoàn thành?`,
                                    confirmLabel: "Giao thành công",
                                    confirmClass: "bg-green-500 hover:bg-green-600",
                                    onConfirm: () => handleMarkDelivered(loan),
                                  })
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition shadow-sm shadow-green-200"
                              >
                                Giao thành công
                              </button>
                            )}
                            {isPending(status) && (
                              <button
                                onClick={() => setApproveView(loan)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-xs font-semibold transition shadow-sm shadow-violet-200"
                              >
                                Duyệt trả
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </div>

      <LoanDetailModal
        loan={detail}
        onClose={() => setDetail(null)}
        onMarkShipping={(loan) => {
          setDetail(null);
          setConfirm({
            title: "Xác nhận giao hàng",
            message: `Giao sách "${loan.bookTitle}" cho ${loan.userName || loan.userFullName}?`,
            confirmLabel: "Giao hàng",
            confirmClass: "bg-indigo-500 hover:bg-indigo-600",
            onConfirm: () => handleMarkShipping(loan),
          });
        }}
        onApprove={(loan) => {
          setDetail(null);
          setApproveView(loan);
        }}
      />

      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => fetchLoans(0)}
        showToast={showToast}
        form={checkoutForm}
        setForm={setCheckoutForm}
        errors={checkoutErrors}
        setErrors={setCheckoutErrors}
      />
    </>
  );
}

export default Loans;