import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";
import { Book, Users, RefreshCw, Tag, TrendingUp, ArrowRight, FileText } from "lucide-react";
import api from "../../services/api";


const MONTH_NAMES = ["Th 1","Th 2","Th 3","Th 4","Th 5","Th 6","Th 7","Th 8","Th 9","Th 10","Th 11","Th 12"];
const DAY_NAMES   = ["CN","T2","T3","T4","T5","T6","T7"];
const fmt = (d) => d.toISOString().split("T")[0];

const buildWeekPeriods = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { label: `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`, startDate: fmt(d), endDate: fmt(d) };
  });
};
const buildMonthPeriods = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { label: MONTH_NAMES[d.getMonth()], startDate: fmt(d), endDate: fmt(end) };
  });
};
const buildYearPeriods = () => {
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const y = now.getFullYear() - (3 - i);
    return { label: `${y}`, startDate: `${y}-01-01`, endDate: `${y}-12-31` };
  });
};
const PERIOD_BUILDERS = { week: buildWeekPeriods, month: buildMonthPeriods, year: buildYearPeriods };


const Sk = ({ w = "100%", h = 24, r = 8 }) => (
  <div style={{
    width: w, height: h, borderRadius: r, flexShrink: 0,
    background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
  }} />
);


const StatCard = ({ label, value, icon: Icon, bg, iconColor, border, loading }) => (
  <div className={`bg-white rounded-2xl border ${border} shadow-sm p-6 flex items-center gap-5`}>
    <div className={`${bg} ${iconColor} w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={26} />
    </div>
    <div style={{ flex: 1 }}>
      <p className="text-base text-black font-semibold leading-tight">{label}</p>
      {loading
        ? <div style={{ marginTop: 10 }}><Sk h={34} w={70} r={6} /></div>
        : <p className="text-2xl font-bold text-gray-800 mt-1">{value ?? "—"}</p>
      }
    </div>
  </div>
);


const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "5px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    border: "none", cursor: "pointer", transition: "all .15s",
    background: active ? "#3b82f6" : "transparent",
    color:      active ? "#fff"    : "#9ca3af",
  }}>
    {children}
  </button>
);


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", fontSize: 13, minWidth: 140 }}>
      <p style={{ fontWeight: 700, color: "#374151", marginBottom: 8 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.stroke, flexShrink: 0 }} />
          <span style={{ color: "#374151" }}>{p.name}</span>
          <span style={{ fontWeight: 700, color: "#111827", marginLeft: "auto" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};


const TopBorrowedRow = ({ rank, book }) => {
  const [imgError, setImgError] = useState(false);
  const medals   = ["#f59e0b", "#9ca3af", "#cd7f32"];
  const isMedal  = rank <= 3;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f9fafb" }} className="last:border-0">
      <span style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700,
        background: isMedal ? medals[rank - 1] + "22" : "#f3f4f6",
        color:      isMedal ? medals[rank - 1]        : "#9ca3af",
      }}>{rank}</span>
      <div style={{ width: 36, height: 50, borderRadius: 6, overflow: "hidden", background: "#f3f4f6", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
        {book.coverImageUrl && !imgError ? (
          <img src={book.coverImageUrl} alt={book.title} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#e0e7ff,#ede9fe)" }}>
            <Book size={13} color="#a5b4fc" />
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</p>
        <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName ?? book.author ?? "—"}</p>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#3b82f6", flexShrink: 0 }}>{book.borrowCount ?? ""}</span>
    </div>
  );
};


const STATUS_MAP = {
  CHECK_OUT: { label: "Đang mượn",       bg: "#eff6ff", color: "#3b82f6" },
  DELIVERED: { label: "Đang giao",       bg: "#f0fdf4", color: "#10b981" },
  RETURNED:  { label: "Đã trả",          bg: "#f0fdf4", color: "#10b981" },
  OVERDUE:   { label: "Quá hạn",         bg: "#fef2f2", color: "#ef4444" },
  SHIPPING:  { label: "Đang vận chuyển", bg: "#fefce8", color: "#f59e0b" },
  PENDING:   { label: "Chờ xử lý",       bg: "#f5f3ff", color: "#8b5cf6" },
};

const RecentLoans = ({ items, loading }) => {
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array(6).fill(0).map((_, i) => <Sk key={i} h={64} r={10} />)}
    </div>
  );
  if (!items?.length) return (
    <p style={{ fontSize: 13, color: "#d1d5db", textAlign: "center", padding: "32px 0" }}>Chưa có đơn mượn</p>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((loan, i) => {
        const st = STATUS_MAP[loan.status] ?? { label: loan.status ?? "—", bg: "#f3f4f6", color: "#6b7280" };
        return (
          <LoanRow key={loan.id ?? i} loan={loan} st={st} isLast={i === items.length - 1} />
        );
      })}
    </div>
  );
};
const RecentSubscriptions = ({ items, loading }) => {
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array(6).fill(0).map((_, i) => <Sk key={i} h={56} r={10} />)}
    </div>
  );
  if (!items?.length) return (
    <p style={{ fontSize: 13, color: "#d1d5db", textAlign: "center", padding: "32px 0" }}>
      Chưa có đăng ký
    </p>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((sub, i) => (
        <div key={sub.id ?? i} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 0",
          borderBottom: i === items.length - 1 ? "none" : "1px solid #f9fafb",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#ede9fe,#e0e7ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: "#8b5cf6",
          }}>
            {(sub.userName ?? "?")[0].toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sub.userName ?? "—"}
            </p>
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sub.userEmail ?? "—"}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
              background: "#f5f3ff", color: "#7c3aed",
            }}>
              {sub.planName}
            </span>
            
          </div>
        </div>
      ))}
    </div>
  );
};

const LoanRow = ({ loan, st, isLast }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = loan.bookCoverImage || null; 
  
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0",
      borderBottom: isLast ? "none" : "1px solid #f9fafb" }}>
      
      <div style={{ width:40, height:56, borderRadius:6, overflow:"hidden",
        background:"#f3f4f6", flexShrink:0, boxShadow:"0 2px 6px rgba(0,0,0,0.08)" }}>
        {imageUrl && !imgError ? (
          <img src={imageUrl} alt={loan.bookTitle}
            onError={() => setImgError(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
            justifyContent:"center", background:"linear-gradient(135deg,#e0e7ff,#ede9fe)" }}>
            <Book size={14} color="#a5b4fc" />
          </div>
        )}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:600, color:"#111827", margin:0,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {loan.bookTitle ?? "—"}
        </p>
        <p style={{ fontSize:11, color:"#6b7280", marginTop:2,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          👤 {loan.userName ?? "—"}
        </p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
        <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:99,
          background:st.bg, color:st.color }}>
          {st.label}
        </span>
        <span style={{ fontSize:10, color:"#9ca3af" }}>
          {loan.checkoutDate ?? loan.createdAt ?? ""}
        </span>
      </div>
    </div>
  );
};


export default function Dashboard({ onNavigateToReports }) {
  const [bookStats,       setBookStats]       = useState(null);
  const [userCount,       setUserCount]       = useState(null);
  const [activeLoanCount, setActiveLoanCount] = useState(null);
  const [chartData,       setChartData]       = useState([]);
  const [topBooks,        setTopBooks]        = useState([]);
  const [recentLoans,     setRecentLoans]     = useState([]);
  const [overdueLoans,    setOverdueLoans]    = useState([]);
  const [recentSubs, setRecentSubs] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingStats,    setLoadingStats]    = useState(true);
  const [loadingChart,    setLoadingChart]    = useState(true);
  const [loadingTop,      setLoadingTop]      = useState(true);
  const [loadingLoans,    setLoadingLoans]    = useState(true);
  const [loadingOverdue,  setLoadingOverdue]  = useState(true);
  const [error,           setError]           = useState(null);
  const [activeTab,       setActiveTab]       = useState("week");

  useEffect(() => {
    fetchStats();
    fetchTopBorrowedBooks();
    fetchRecentLoans();
    fetchOverdueLoans();
    fetchRecentSubscriptions();
  }, []);

  useEffect(() => { fetchChart(activeTab); }, [activeTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [bookRes, userRes, loanRes] = await Promise.allSettled([
        api.get("/books/stats"),
        api.get("/users/list"),
        api.post("/book-loans/search", { status: "DELIVERED", page: 0, size: 1, sortBy: "createdAt", sortDirection: "DESC" }),
      ]);
      if (bookRes.status === "fulfilled") setBookStats(bookRes.value.data);
      else setError("Không tải được thống kê sách.");
      if (userRes.status === "fulfilled") setUserCount(userRes.value.data?.length ?? 0);
      if (loanRes.status === "fulfilled") {
        const d = loanRes.value.data;
        setActiveLoanCount(d?.totalElement ?? d?.totalElements ?? d?.content?.length ?? 0);
      }
    } finally { setLoadingStats(false); }
  };


  const fetchChart = useCallback(async (tab) => {
    setLoadingChart(true);
    setChartData([]);
    try {
      const periods = PERIOD_BUILDERS[tab]();
      const fetchCount = (extra = {}) => periods.map(p =>
        api.post("/book-loans/search", { startDate: p.startDate, endDate: p.endDate, page: 0, size: 1, sortBy: "createdAt", sortDirection: "DESC", ...extra })
          .then(r => r.data?.totalElements ?? r.data?.totalElement ?? r.data?.content?.length ?? 0)
          .catch(() => 0)
      );
      const [loans, returns] = await Promise.all([
        Promise.all(fetchCount()),
        Promise.all(fetchCount({ status: "RETURNED" })),
      ]);
      setChartData(periods.map((p, i) => ({ name: p.label, loans: loans[i], returns: returns[i] })));
    } finally { setLoadingChart(false); }
  }, []);


  const fetchTopBorrowedBooks = async () => {
    setLoadingTop(true);
    try {
      const res = await api.get("/books/top-borrowed", { params: { limit: 5 } });
      setTopBooks(res.data ?? []);
    } catch { setTopBooks([]); }
    finally { setLoadingTop(false); }
  };


    const fetchRecentSubscriptions = async () => {
    setLoadingSubs(true);
    try {
      const res = await api.get("/subscriptions/recent", {
        params: { page: 0, size: 5 }
      });
      setRecentSubs(res.data?.content ?? []);
    } catch { setRecentSubs([]); }
    finally { setLoadingSubs(false); }
  };


  const fetchRecentLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await api.post("/book-loans/search", {
        page: 0, size: 5, sortBy: "createdAt", sortDirection: "DESC",
      });

      setRecentLoans(res.data?.content ?? []);
    } catch { setRecentLoans([]); }
    finally { setLoadingLoans(false); }
  };


  const fetchOverdueLoans = async () => {
    setLoadingOverdue(true);
    try {
      const res = await api.post("/book-loans/search", {
        status: "OVERDUE", page: 0, size: 10,
        sortBy: "createdAt", sortDirection: "ASC",
      });
      setOverdueLoans(res.data?.content ?? []);
    } catch { setOverdueLoans([]); }
    finally { setLoadingOverdue(false); }
  };

  const TAB_LABEL = { week: "7 ngày gần nhất", month: "6 tháng gần nhất", year: "4 năm gần nhất" };

  const stats = [
    { label: "Tổng Sách",       value: bookStats?.totalActiveBooks,    icon: Book,      bg: "bg-blue-50",    iconColor: "text-blue-500",    border: "border-blue-100"    },
    { label: "Sách Có Sẵn",     value: bookStats?.totalAvailableBooks, icon: Book,      bg: "bg-emerald-50", iconColor: "text-emerald-500", border: "border-emerald-100" },
    { label: "Tổng Người Dùng", value: userCount,                      icon: Users,     bg: "bg-violet-50",  iconColor: "text-violet-500",  border: "border-violet-100"  },
    { label: "Sách Đang Mượn",  value: activeLoanCount,                icon: RefreshCw, bg: "bg-amber-50",   iconColor: "text-amber-500",   border: "border-amber-100"   },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .tab-bar { display:flex; align-items:center; background:#f3f4f6; border-radius:10px; padding:3px; gap:2px; }
      `}</style>

      <div className="p-8 w-full">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-base text-gray-400 mt-1">Tổng quan hệ thống Bookify</p>
          </div>

          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 12,
                background: "#1e293b", color: "#fff",
                border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                transition: "background .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#0f172a"}
              onMouseLeave={e => e.currentTarget.style.background = "#1e293b"}
            >
              <TrendingUp size={16} />
              Xem báo cáo chi tiết
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-500 text-sm font-medium">⚠ {error}</div>
        )}

        <div className="grid grid-cols-4 gap-5 mb-6">
          {stats.map((s, i) => <StatCard key={i} {...s} loading={loadingStats} />)}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Thống kê mượn / trả</h3>
                <p className="text-sm text-gray-400 mt-0.5">{TAB_LABEL[activeTab]}</p>
              </div>
              <div className="tab-bar">
                <TabBtn active={activeTab === "week"}  onClick={() => setActiveTab("week")}>Tuần</TabBtn>
                <TabBtn active={activeTab === "month"} onClick={() => setActiveTab("month")}>Tháng</TabBtn>
                <TabBtn active={activeTab === "year"}  onClick={() => setActiveTab("year")}>Năm</TabBtn>
              </div>
            </div>
            {loadingChart
              ? <Sk h={280} r={12} />
              : (
                <div style={{ paddingRight: 16 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false}
                        tick={{ fontSize: activeTab === "week" ? 11 : 13, fill: "#9ca3af" }} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#9ca3af" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13, paddingTop: 16 }} />
                      <Line dataKey="loans"   stroke="#3b82f6" name="Mượn" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} type="monotone" />
                      <Line dataKey="returns" stroke="#10b981" name="Trả"  strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6 }} type="monotone" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )
            }
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div className="bg-blue-50 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                <Book size={18} className="text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-gray-800 leading-tight">Sách mượn nhiều nhất</h3>
            </div>
            {loadingTop ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Array(5).fill(0).map((_, i) => <Sk key={i} h={50} r={10} />)}
              </div>
            ) : topBooks.length === 0 ? (
              <p style={{ fontSize: 13, color: "#d1d5db", textAlign: "center", padding: "40px 0" }}>Không có dữ liệu</p>
            ) : (
              <div>{topBooks.map((book, i) => <TopBorrowedRow key={book.id ?? i} rank={i + 1} book={book} />)}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div className="bg-violet-50 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-violet-500" />
              </div>
              <h3 className="text-base font-bold text-gray-800 leading-tight">
                Đăng ký gói gần đây
              </h3>
            </div>
            <RecentSubscriptions items={recentSubs} loading={loadingSubs} />
          </div>
        </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="bg-blue-50 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-blue-500" />
                </div>
                <h3 className="text-base font-bold text-gray-800 leading-tight">Đơn mượn gần đây</h3>
              </div>
            </div>
            <RecentLoans items={recentLoans} loading={loadingLoans} />
          </div>

        </div>
      </div>
    </>
  );
}