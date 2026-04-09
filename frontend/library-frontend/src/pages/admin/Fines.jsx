import { useState, useEffect, useCallback } from "react";
import {
  Search, Eye, CheckCircle, Ban, RefreshCw,
  ChevronLeft, ChevronRight, Filter, X, AlertCircle,
  Clock, DollarSign, Loader2
} from "lucide-react";
import axios from "axios";


const BASE = "http://localhost:8080";

const STATUS_META = {
  PENDING: { label: "Chưa thanh toán", color: "bg-amber-100 text-amber-700 border-amber-200",       icon: Clock },
  PAID:    { label: "Đã thanh toán",   color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  WAIVED:  { label: "Đã miễn phí",     color: "bg-sky-100 text-sky-700 border-sky-200",             icon: Ban },
};

const TYPE_META = {
  OVERDUE:    { label: "Quá hạn",     color: "bg-red-50 text-red-600" },
  PROCESSING: { label: "Xử lý chậm", color: "bg-orange-50 text-orange-600" },
  LOST:       { label: "Mất sách",    color: "bg-purple-50 text-purple-600" },
  DAMAGE:     { label: "Hư hỏng",     color: "bg-pink-50 text-pink-600" },
};

const fmt     = (n) => n != null ? new Intl.NumberFormat("vi-VN").format(n) + "đ" : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, color: "bg-gray-100 text-gray-600 border-gray-200", icon: AlertCircle };
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${m.color}`}>
      <Icon size={11} />
      {m.label}
    </span>
  );
}


function TypeBadge({ type }) {
  const m = TYPE_META[type] || { label: type, color: "bg-gray-50 text-gray-500" };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${m.color}`}>
      {m.label}
    </span>
  );
}


function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
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


function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ animation: "fadeUp 0.25s ease" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}


function DetailModal({ fine, onClose }) {
  const rows = [
    ["ID phiếu phạt",   fine.id],
    ["Mã mượn sách",    fine.bookLoanId],
    ["Tên sách",        fine.bookTitle],
    ["Người dùng",      fine.userName],
    ["Loại phạt",       <TypeBadge key="t" type={fine.fineType} />],
    ["Trạng thái",      <StatusBadge key="s" status={fine.status} />],
    ["Số ngày quá hạn", fine.overdueDays != null ? `${fine.overdueDays} ngày` : "—"],
    ["Số tiền phạt",    <span key="a" className="font-semibold text-red-600">{fmt(fine.amount)}</span>],
    ["Lý do",           fine.reason || "—"],
    ["Ghi chú",         fine.notes || "—"],
    ["Lý do miễn phí",  fine.waiverReason || "—"],
    ["Ngày thanh toán", fmtDate(fine.paidAt)],
    ["Ngày tạo",        fmtDate(fine.createdAt)],
  ];
  return (
    <Modal title="Chi tiết phiếu phạt" onClose={onClose}>
      <dl className="divide-y divide-gray-100 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2.5 gap-4">
            <dt className="text-gray-500 whitespace-nowrap">{k}</dt>
            <dd className="text-gray-800 text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition">
          Đóng
        </button>
      </div>
    </Modal>
  );
}


function WaiveModal({ fine, onClose, onSuccess, showToast }) {
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const getToken = () => localStorage.getItem("token");
  const auth     = () => ({ Authorization: `Bearer ${getToken()}` });

  const handleSubmit = async () => {
    if (!reason.trim()) { setError("Vui lòng nhập lý do miễn phí."); return; }
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE}/api/fines/${fine.id}/waive`,
        { fineId: fine.id, waiverReason: reason.trim() },
        { headers: auth() }
      );
      onSuccess(res.data);
      showToast("Miễn phí thành công!", "success");
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Miễn phí tiền phạt" onClose={onClose}>
      <p className="text-sm text-gray-600 mb-4">
        Miễn phí <span className="font-semibold text-red-600">{fmt(fine.amount)}</span> cho{" "}
        <span className="font-semibold">{fine.userName}</span>?
      </p>
      <label className="block text-sm font-medium text-gray-700 mb-1">Lý do miễn phí *</label>
      <textarea
        rows={3}
        value={reason}
        onChange={(e) => { setReason(e.target.value); setError(""); }}
        placeholder="Nhập lý do miễn phí..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition">Hủy</button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition flex items-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Xác nhận miễn phí
        </button>
      </div>
    </Modal>
  );
}


function PayModal({ fine, onClose, onSuccess, showToast }) {
  const [amount,  setAmount]  = useState(fine.amount ?? "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const getToken = () => localStorage.getItem("token");
  const auth     = () => ({ Authorization: `Bearer ${getToken()}` });

  const handleSubmit = async () => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) { setError("Số tiền không hợp lệ."); return; }
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE}/api/fines/${fine.id}/pay`,
        { amount: parsed },
        { headers: auth() }
      );
      onSuccess(res.data);
      showToast("Thanh toán thành công!", "success");
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Thanh toán tiền phạt" onClose={onClose}>
      <p className="text-sm text-gray-600 mb-4">
        Thanh toán phiếu phạt của <span className="font-semibold">{fine.userName}</span> (
        <span className="font-semibold text-red-600">{fmt(fine.amount)}</span>)?
      </p>
      <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán *</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => { setAmount(e.target.value); setError(""); }}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition">Hủy</button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition flex items-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Xác nhận thanh toán
        </button>
      </div>
    </Modal>
  );
}


function Fines() {
  const [fines,        setFines]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [toast,        setToast]        = useState(null);

  // pagination
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  // filters
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType,   setFilterType]   = useState("");
  const [showFilter,   setShowFilter]   = useState(false);

  // modals
  const [detailFine,    setDetailFine]    = useState(null);
  const [waivingFine,   setWaivingFine]   = useState(null);
  const [payingFine,    setPayingFine]    = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(null);

  const getToken  = () => localStorage.getItem("token");
  const auth      = () => ({ Authorization: `Bearer ${getToken()}` });
  const showToast = (message, type = "info") => setToast({ message, type });

  // ── fetch ─────────────────────────────────────────────────────────────────

  const fetchFines = useCallback(async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const params = { page: p, size: PAGE_SIZE };
      if (filterStatus) params.status = filterStatus;
      if (filterType)   params.type   = filterType;

      const res  = await axios.get(`${BASE}/api/fines`, { params, headers: auth() });
      const data = res.data.data || res.data;

      setFines(data.content || []);
      setTotalPages(data.totalPage || data.totalPages || 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => { fetchFines(page); }, [page, filterStatus, filterType]);

  // ── search (client-side) ──────────────────────────────────────────────────

  const displayed = fines.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(f.id).includes(q) ||
      (f.userName  || "").toLowerCase().includes(q) ||
      (f.bookTitle || "").toLowerCase().includes(q)
    );
  });

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleViewDetail = async (id) => {
    setLoadingDetail(id);
    try {
      const res = await axios.get(`${BASE}/api/fines/${id}`, { headers: auth() });
      setDetailFine(res.data);
    } catch (err) {
      showToast(err?.response?.data?.message || "Không thể tải chi tiết.", "error");
    } finally {
      setLoadingDetail(null);
    }
  };

  const handleWaiveSuccess = (updated) => setFines((prev) => prev.map((f) => f.id === updated.id ? updated : f));
  const handlePaySuccess   = (updated) => setFines((prev) => prev.map((f) => f.id === updated.id ? updated : f));

  const clearFilters = () => { setFilterStatus(""); setFilterType(""); setPage(0); };
  const hasFilters   = filterStatus || filterType;

  const stats = {
    total:   fines.length,
    pending: fines.filter((f) => f.status === "PENDING").length,
    paid:    fines.filter((f) => f.status === "PAID").length,
    waived:  fines.filter((f) => f.status === "WAIVED").length,
  };


  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity:0 } to { transform: translateX(0); opacity:1 } }
        @keyframes fadeUp  { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ width: "100%", padding: "24px", boxSizing: "border-box" }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Quản Lý Tiền Phạt</h2>
             
            </div>
          </div>
          <button
            onClick={() => fetchFines(page)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm theo tên, sách, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                hasFilters ? "bg-blue-50 border-blue-300 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter size={14} />
              Lọc
              {hasFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {[filterStatus, filterType].filter(Boolean).length}
                </span>
              )}
            </button>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition">
                <X size={12} /> Xóa lọc
              </button>
            )}
          </div>

          {showFilter && (
            <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Trạng thái</label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                  className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Tất cả</option>
                  <option value="PENDING">Chưa thanh toán</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="WAIVED">Đã miễn phí</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Loại phạt</label>
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
                  className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Tất cả</option>
                  <option value="OVERDUE">Quá hạn</option>
                  <option value="PROCESSING">Xử lý chậm</option>
                  <option value="LOST">Mất sách</option>
                  <option value="DAMAGE">Hư hỏng</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                  {["ID", "Người dùng", "Tên sách", "Loại phạt", "Số tiền", "Trạng thái", "Ngày tạo", "Hành động"].map((h) => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
                    <Loader2 size={30} className="animate-spin mx-auto mb-2" />
                    <p style={{ fontSize: "14px" }}>Đang tải dữ liệu...</p>
                  </td></tr>
                ) : displayed.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
                    <DollarSign size={36} className="mx-auto mb-2 opacity-30" />
                    <p style={{ fontSize: "14px" }}>Không có phiếu phạt nào.</p>
                  </td></tr>
                ) : displayed.map((fine) => (
                  <tr key={fine.id} style={{ borderBottom: "1px solid #f9fafb" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,246,255,0.4)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px 20px", color: "#9ca3af", fontFamily: "monospace", fontSize: 12 }}>{fine.id}</td>
                    <td style={{ padding: "16px 20px", fontWeight: 600, fontSize: 15, color: "#1f2937" }}>{fine.userName || "—"}</td>
                    <td style={{ padding: "16px 20px", color: "#6b7280", fontSize: 14, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={fine.bookTitle}>{fine.bookTitle || "—"}</td>
                    <td style={{ padding: "16px 20px" }}><TypeBadge type={fine.fineType} /></td>
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: "#dc2626", whiteSpace: "nowrap" }}>{fmt(fine.amount)}</td>
                    <td style={{ padding: "16px 20px" }}><StatusBadge status={fine.status} /></td>
                    <td style={{ padding: "16px 20px", color: "#6b7280", fontSize: 13, whiteSpace: "nowrap" }}>{fmtDate(fine.createdAt)}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleViewDetail(fine.id)}
                          disabled={loadingDetail === fine.id}
                          title="Xem chi tiết"
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                        >
                          {loadingDetail === fine.id ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                        </button>

                        {fine.status === "PENDING" && (
                          <button onClick={() => setPayingFine(fine)} title="Thanh toán"
                            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition">
                            <CheckCircle size={15} />
                          </button>
                        )}

                        {fine.status === "PENDING" && (
                          <button onClick={() => setWaivingFine(fine)} title="Miễn phí"
                            className="p-2.5 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition">
                            <Ban size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-sm text-gray-500">Trang {page + 1} / {totalPages}</p>
              <div className="flex gap-1.5">
                <button onClick={() => setPage(0)} disabled={page === 0}
                  className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition">«</button>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition flex items-center gap-1">
                  <ChevronLeft size={14} /> Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).filter(i => Math.abs(i - page) <= 2).map(i => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${i === page ? "bg-blue-500 text-white" : "border border-gray-200 hover:bg-white text-gray-600"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition flex items-center gap-1">
                  Sau <ChevronRight size={14} />
                </button>
                <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
                  className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition">»</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {detailFine  && <DetailModal fine={detailFine}  onClose={() => setDetailFine(null)} />}
      {waivingFine && <WaiveModal  fine={waivingFine} onClose={() => setWaivingFine(null)} onSuccess={handleWaiveSuccess} showToast={showToast} />}
      {payingFine  && <PayModal    fine={payingFine}  onClose={() => setPayingFine(null)}  onSuccess={handlePaySuccess}   showToast={showToast} />}
    </>
  );
}

export default Fines;