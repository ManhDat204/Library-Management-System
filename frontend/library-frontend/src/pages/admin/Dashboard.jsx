import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,ResponsiveContainer} from "recharts";
import { Book, Users, RefreshCw, TrendingUp, Star, Tag } from "lucide-react";

//api
const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const MONTH_NAMES = [
  "Th 1","Th 2","Th 3","Th 4","Th 5","Th 6",
  "Th 7","Th 8","Th","Th 10","Th 11","Th 12",
];
const DAY_NAMES = ["CN","T2","T3","T4","T5","T6","T7"];
const fmt = (d) => d.toISOString().split("T")[0];


const buildWeekPeriods = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label: `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
      startDate: fmt(d), endDate: fmt(d),
    };
  });
};

const buildMonthPeriods = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
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
      <p className="text-sm text-gray-900 font-medium leading-tight">{label}</p>
      {loading
        ? <div style={{ marginTop: 10 }}><Sk h={34} w={70} r={6} /></div>
        : <p className="text-4xl font-bold text-gray-900 mt-1">{value ?? "—"}</p>
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
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill, flexShrink: 0 }} />
          <span style={{ color: "#000000" }}>{p.name}</span>
          <span style={{ fontWeight: 700, color: "#000000", marginLeft: "auto" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};


const TopBorrowedRow = ({ rank, book }) => {
  const [imgError, setImgError] = useState(false);
  const medals = ["#f59e0b", "#9ca3af", "#cd7f32"];
  const isMedal = rank <= 3;
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f9fafb" }}
      className="last:border-0">
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
        <p style={{ fontSize: 13, fontWeight: 600, color: "#000000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</p>
        <p style={{ fontSize: 11, color: "#000000", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName ?? book.author ?? "—"}</p>
      </div>

      
    </div>
  );
};

const TopRatedRow = ({ rank, book }) => {
  const [imgError, setImgError] = useState(false);
  const medals = ["#f59e0b", "#9ca3af", "#cd7f32"];
  const isMedal = rank <= 3;
  const averageRating = Number(book.averageRating ?? 0);
  const totalReviews = Number(book.totalReviews ?? 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f9fafb" }}
      className="last:border-0">
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
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#fef3c7,#fde68a)" }}>
            <Star size={13} color="#f59e0b" />
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#000000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</p>
        <p style={{ fontSize: 11, color: "#000000", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.authorName ?? book.author ?? "?"}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
        <Star size={14} fill="#f59e0b" color="#f59e0b" />
        <span>{averageRating.toFixed(1)}</span>
      </div>
    </div>
  );
};


const PlaceholderSection = ({ icon: Icon, iconBg, iconColor, title, subtitle, note }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <div className={`${iconBg} w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-800 leading-tight">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
    <div style={{ border: "2px dashed #e5e7eb", borderRadius: 16, padding: "40px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={24} color="#d1d5db" />
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", marginTop: 4 }}>Chưa có dữ liệu</p>
      <p style={{ fontSize: 12, color: "#d1d5db", maxWidth: 240, lineHeight: 1.6 }}>{note}</p>
    </div>
  </div>
);
// thanh phan main
export default function Dashboard() {
  const [bookStats,       setBookStats]       = useState(null);
  const [userCount,       setUserCount]       = useState(null);
  const [activeLoanCount, setActiveLoanCount] = useState(null);
  const [chartData,       setChartData]       = useState([]);
  const [topBooks,        setTopBooks]        = useState([]);
  const [topGenres,      setTopGenres]      = useState([]);
  const [topRatedBooks,  setTopRatedBooks]  = useState([]);
  const [loadingGenres,  setLoadingGenres]  = useState(true);
  const [loadingStats,    setLoadingStats]    = useState(true);
  const [loadingChart,    setLoadingChart]    = useState(true);
  const [loadingTop,      setLoadingTop]      = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [error,           setError]           = useState(null);
  const [activeTab,       setActiveTab]       = useState("week");

  useEffect(() => { fetchStats(); fetchTopBorrowedBooks(); fetchTopGenres(); fetchTopRatedBooks(); }, []);
  useEffect(() => { fetchChart(activeTab); }, [activeTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [bookRes, userRes, loanRes] = await Promise.allSettled([
        api.get("/books/stats"),
        api.get("/users/list"),
        api.post("/book-loans/search", { 
          status: "DELIVERED",  // đổi từ CHECK_OUT sang DELIVERED
          page: 0, size: 1, 
          sortBy: "createdAt", sortDirection: "DESC" 
        }),
      ]);
      if (bookRes.status === "fulfilled") setBookStats(bookRes.value.data);
      else setError("Không tải được thống kê sách.");
      if (userRes.status === "fulfilled") setUserCount(userRes.value.data?.length ?? 0);
      if (loanRes.status === "fulfilled") {
        const d = loanRes.value.data;
        setActiveLoanCount(d?.totalPage != null 
          ? d.totalElement 
          : d?.content?.length ?? 0);
      }
    } finally { setLoadingStats(false); }
};

  const fetchChart = useCallback(async (tab) => {
    setLoadingChart(true);
    setChartData([]);
    try {
      const periods = PERIOD_BUILDERS[tab]();

      console.log("Period sample:", periods[0]);
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
      } catch (err) { 
        setTopBooks([]); 
      }
      finally { setLoadingTop(false); }
    };

    const fetchTopGenres = async () => {
      setLoadingGenres(true);
      try {
        const res = await api.get("/genres/top-borrowed", { params: { limit: 5 } });
        setTopGenres(res.data ?? []);
      } catch { setTopGenres([]); }
      finally { setLoadingGenres(false); }
    };

    const fetchTopRatedBooks = async () => {
      setLoadingTopRated(true);
      try {
        const res = await api.get("/books/top-rated", { params: { limit: 5 } });
        setTopRatedBooks(res.data ?? []);
      } catch {
        setTopRatedBooks([]);
      } finally {
        setLoadingTopRated(false);
      }
    };

  const totalLoans   = chartData.reduce((s, d) => s + d.loans,   0);
  const totalReturns = chartData.reduce((s, d) => s + d.returns, 0);
  const TAB_LABEL = { week: "7 ngày gần nhất", month: "6 tháng gần nhất", year: "4 năm gần nhất" };

  const stats = [
    { label: "Tổng Sách",       value: bookStats?.totalActiveBooks,    icon: Book,      bg: "bg-blue-50",    iconColor: "text-blue-500",    border: "border-blue-100" },
    { label: "Sách Có Sẵn",     value: bookStats?.totalAvailableBooks, icon: Book,      bg: "bg-emerald-50", iconColor: "text-emerald-500", border: "border-emerald-100" },
    { label: "Tổng Người Dùng", value: userCount,                      icon: Users,     bg: "bg-violet-50",  iconColor: "text-violet-500",  border: "border-violet-100" },
    { label: "Sách Đang Mượn",  value: activeLoanCount,                icon: RefreshCw, bg: "bg-amber-50",   iconColor: "text-amber-500",   border: "border-amber-100" },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .tab-bar { display:flex; align-items:center; background:#f3f4f6; border-radius:10px; padding:3px; gap:2px; }
      `}</style>

      <div className="p-8 w-full">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-base text-gray-400 mt-1">Tổng quan hệ thống thư viện</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-500 text-sm font-medium">⚠ {error}</div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {stats.map((s, i) => <StatCard key={i} {...s} loading={loadingStats} />)}
        </div>

        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Thống kê</h3>
                <p className="text-sm text-gray-400 mt-0.5">{TAB_LABEL[activeTab]}</p>
              </div>
              <div className="tab-bar">
                <TabBtn active={activeTab === "week"}  onClick={() => setActiveTab("week")}>Tuần</TabBtn>
                <TabBtn active={activeTab === "month"} onClick={() => setActiveTab("month")}>Tháng</TabBtn>
                <TabBtn active={activeTab === "year"}  onClick={() => setActiveTab("year")}>Năm</TabBtn>
              </div>
            </div>

            {!loadingChart && chartData.length > 0 && (
              <div style={{ display: "flex", gap: 12, marginBottom: 20, marginTop: 12 }}>
                
              </div>
            )}

            {loadingChart
              ? <Sk h={280} r={12} />
              : (
                <div style={{ paddingRight: 16 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fontSize: activeTab === "week" ? 11 : 13, fill: "#9ca3af" }} 
                      interval={0} />
                    <YAxis axisLine={false} tickLine={false} 
                      tick={{ fontSize: 13, fill: "#9ca3af" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13, paddingTop: 16 }} />
                    <Line dataKey="loans" stroke="#3b82f6" name="Mượn" 
                      strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} 
                      activeDot={{ r: 6 }} type="monotone" />
                    <Line dataKey="returns" stroke="#10b981" name="Trả" 
                      strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} 
                      activeDot={{ r: 6 }} type="monotone" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              )
            }
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              
              <div>
                <h3 className="text-base font-bold text-gray-800 leading-tight"> Sách được mượn nhiều nhất</h3>
              </div>
            </div>

            {loadingTop ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Array(5).fill(0).map((_, i) => <Sk key={i} h={50} r={10} />)}
              </div>
            ) : topBooks.length === 0 ? (
              <p style={{ fontSize: 13, color: "#d1d5db", textAlign: "center", padding: "40px 0" }}>Không có dữ liệu</p>
            ) : (
              <div>
                {topBooks.map((book, i) => (
                  <TopBorrowedRow key={book.id ?? i} rank={i + 1} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>


        <div className="grid grid-cols-2 gap-6 items-stretch">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div className="bg-amber-50 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star size={18} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 leading-tight">Sách được đánh giá cao nhất</h3>

              </div>
            </div>

            {loadingTopRated ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Array(5).fill(0).map((_, i) => <Sk key={i} h={50} r={10} />)}
              </div>
            ) : topRatedBooks.length === 0 ? (
              <p style={{ fontSize: 13, color: "#d1d5db", textAlign: "center", padding: "40px 0" }}>Chưa có dữ liệu</p>
            ) : (
              <div>
                {topRatedBooks.slice(0, 5).map((book, i) => (
                  <TopRatedRow key={book.id ?? i} rank={i + 1} book={book} />
                ))}
              </div>
            )}
          </div>
        
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div>
                <h3 className="text-base font-bold text-gray-800 leading-tight">Thể Loại Mượn Nhiều Nhất</h3>
              </div>
            </div>

            {loadingGenres ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array(5).fill(0).map((_, i) => <Sk key={i} h={40} r={10} />)}
              </div>
            ) : topGenres.length === 0 ? (
              <p style={{ fontSize: 13, color: "#d1d5db", textAlign: "center", padding: "40px 0" }}>Không có dữ liệu</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topGenres.map((genre, i) => (
                  <div key={genre.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 70, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ width: 20, fontSize: 13, fontWeight: 700, color: "#9ca3af", flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{genre.name}</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{genre.borrowCount} lượt</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
