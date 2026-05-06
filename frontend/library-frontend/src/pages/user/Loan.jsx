import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Package, ChevronRight, Calendar, Clock, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import wsService from "../../services/websocketService";

const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const STATUS_CONFIG = {
  CHECK_OUT:      { label: "Chờ lấy hàng" },
  SHIPPING:       { label: "Đang giao" },
  DELIVERED:      { label: "Đang mượn" },
  OVERDUE:        { label: "Quá hạn" },
  PENDING_RETURN: { label: "Đang trả" },
  RETURNED:       { label: "Đã trả" },
  CANCELLED:      { label: "Đã hủy" },
};

const TABS = [
  { key: "",               label: "Tất cả" },
  { key: "CHECK_OUT",      label: "Chờ lấy" },
  { key: "SHIPPING",       label: "Đang giao" },
  { key: "DELIVERED",      label: "Đang mượn" },
  { key: "PENDING_RETURN", label: "Đang trả" },
  { key: "RETURNED",       label: "Hoàn tất" },
];

const COVER_COLORS = ["#1a1a2e","#2d1b00","#0d2137","#1a2e1a","#2e1a2e","#2e2200","#1e2e20","#2e1e1e"];

const BookCover = ({ loan }) => {
  const [err, setErr] = useState(false);
  const color = COVER_COLORS[(loan?.bookId || 0) % COVER_COLORS.length];
  const initials = (loan?.bookTitle || "??").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  if (loan?.bookCoverImage && !err)
    return <img src={loan.bookCoverImage} alt={loan.bookTitle} className="w-full h-full object-cover" onError={() => setErr(true)} />;
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${color}, #000)` }}>
      <span className="text-white/20 font-bold text-sm">{initials}</span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const label = STATUS_CONFIG[status]?.label || status;
  const isOverdue = status === "OVERDUE";
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
      isOverdue
        ? "bg-red-50 text-red-500 border-red-100"
        : "bg-gray-100 text-gray-500 border-gray-200"
    }`}>
      {label}
    </span>
  );
};

const LoanCard = ({ loan, fine, onClick }) => {
  const status = loan.bookLoanStatus;
  const hasFine = fine && fine.status === "PENDING" && Number(fine.amount) > 0;

  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden">

      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
        <span className="text-xs text-gray-400">Đơn #{loan.id}</span>
        <StatusBadge status={status} />
      </div>

      <div className="flex gap-4 p-4">
        <div className="w-14 flex-shrink-0 rounded-lg overflow-hidden" style={{ aspectRatio: "3/4" }}>
          <BookCover loan={loan} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
            {loan.bookTitle || "—"}
          </h3>
          <p className="text-xs text-gray-400 mb-3 truncate">{loan.authorName || "Đang cập nhật"}</p>

          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar size={11} className="text-gray-300" />
              <span className="text-xs text-gray-400">
                {loan.checkoutDate ? new Date(loan.checkoutDate).toLocaleDateString("vi-VN") : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-gray-300" />
              <span className={`text-xs font-medium ${status === "OVERDUE" ? "text-red-500" : "text-gray-400"}`}>
                {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString("vi-VN") : "—"}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight size={16} className="text-gray-200 self-center flex-shrink-0" />
      </div>

      {hasFine && (
        <div className="px-4 py-2.5 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-red-500 flex items-center gap-1.5">
            <AlertCircle size={12} /> Phạt chưa thanh toán
          </span>
          <span className="text-xs font-semibold text-red-500">
            {Number(fine.amount).toLocaleString("vi-VN")}₫
          </span>
        </div>
      )}
    </div>
  );
};

const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-10 bg-gray-50 border-b border-gray-50" />
    <div className="flex gap-4 p-4">
      <div className="w-14 bg-gray-100 rounded-lg flex-shrink-0" style={{ aspectRatio: "3/4" }} />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/5 mt-3" />
      </div>
    </div>
  </div>
);

export default function MyLoan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [finesMap, setFinesMap] = useState({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, fRes] = await Promise.all([
        api.get("/book-loans/my", { params: { status: activeTab || undefined, page, size: 8 } }),
        api.get("/fines/my-fines").catch(() => ({ data: [] }))
      ]);


      console.log("API response:", lRes.data);
      console.log("totalPages:", lRes.data.totalPages, "content length:", lRes.data.content?.length);
      setLoans(lRes.data.content || []);
      setTotalPages(lRes.data.totalPage || lRes.data.totalPages || 1);
      const map = {};
      (fRes.data || []).forEach(f => { if (f.status === "PENDING") map[f.bookLoanId] = f; });
      setFinesMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  // ✅ fetch khi tab/page thay đổi
  useEffect(() => { fetchData(); }, [fetchData]);

  // ✅ WebSocket SAU fetchData
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    let unsubscribes = [];
    try {
      wsService.connect(userId);
      unsubscribes = [
        wsService.listen("LOAN_CREATED",          () => fetchData()),
        wsService.listen("LOAN_SHIPPING",          () => fetchData()),
        wsService.listen("LOAN_RETURN_APPROVED",   () => fetchData()),
      ];
    } catch (err) {
      console.warn("WebSocket không khả dụng:", err);
    }
    return () => {
      try {
        unsubscribes.forEach(fn => fn());
        wsService.disconnect();
      } catch {}
    };
  }, [fetchData]);

  return (
    <div className="pb-10">
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>


      <PageHeader title="Đơn mượn của tôi"  />
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-5 border-b border-gray-100">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(0); }}
            className={`flex-shrink-0 px-4 pb-2.5 text-sm transition-all relative border-0 bg-transparent cursor-pointer ${
              activeTab === tab.key ? "text-gray-900 " : "text-gray-900 hover:text-gray-900"
            }`}>
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-t" />
            )}
          </button>
        ))}
      </div>


      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}</div>
      ) : loans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Package size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Không có đơn hàng nào</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Khám phá thư viện và mượn sách yêu thích</p>
          <button onClick={() => navigate("/home/books")}
            className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium border-0 cursor-pointer hover:bg-black transition-colors">
            Xem sách
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map(loan => (
            <LoanCard key={loan.id} loan={loan} fine={finesMap[loan.id] || null}
              onClick={() => navigate(`/home/my-loans/${loan.id}`)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-500 disabled:opacity-30 cursor-pointer hover:bg-gray-50">
            ← Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i).filter(i => Math.abs(i - page) <= 2).map(i => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-xl text-sm cursor-pointer border ${
                page === i ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}>
              {i + 1}
            </button>
          ))}
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-500 disabled:opacity-30 cursor-pointer hover:bg-gray-50">
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}