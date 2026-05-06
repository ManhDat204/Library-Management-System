import { useEffect, useState } from "react";
import axios from "axios";
import { Area,AreaChart, Bar, BarChart, CartesianGrid,Cell, Pie,PieChart,ResponsiveContainer,Tooltip, XAxis,YAxis,
} from "recharts";
import { AlertCircle,ArrowDownRight,ArrowUpRight,Bell,Book,DollarSign, FileText, Users,
} from "lucide-react";

const api = axios.create({ baseURL: "http://localhost:8080/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const COLORS = ["#378ADD", "#1D9E75", "#BA7517", "#D4537E", "#534AB7", "#D85A30"];
const AVAILABLE_YEARS = [2025, 2026];
const REPORT_TABS = [
  { id: "revenue", label: "Doanh thu" },
  { id: "users", label: "Nguoi dung" },
  { id: "books", label: "Sach" },
  { id: "loans", label: "Muon / tra" },
  { id: "fines", label: "Tien phat" },
  { id: "subscriptions", label: "Goi dang ky" },
];

const revenueCompareChart = [
  { month: "T1", current: 9400000, prev: 8600000 },
  { month: "T2", current: 10500000, prev: 9200000 },
  { month: "T3", current: 8780000, prev: 9100000 },
  { month: "T4", current: 11400000, prev: 9800000 },
  { month: "T5", current: 12000000, prev: 10200000 },
  { month: "T6", current: 11400000, prev: 9800000 },
];

const revenueChart = [
  { month: "T1", subscription: 8200000, fines: 1200000 },
  { month: "T2", subscription: 9100000, fines: 1400000 },
  { month: "T3", subscription: 7800000, fines: 980000 },
  { month: "T4", subscription: 9800000, fines: 1600000 },
  { month: "T5", subscription: 10200000, fines: 1800000 },
  { month: "T6", subscription: 9800000, fines: 1600000 },
];

const genderDistribution = [
  { name: "Nam", value: 45, fill: "#3B82F6" },
  { name: "Nu", value: 55, fill: "#EC4899" },
];

const defaultGenreChart = [
  { name: "Van hoc", value: 420 },
  { name: "KHKT", value: 280 },
  { name: "Ky nang", value: 310 },
  { name: "Ngoai ngu", value: 210 },
  { name: "Thieu nhi", value: 185 },
  { name: "Lich su", value: 120 },
];

const topBooks = [
  { id: 1, rank: 1, title: "Dac Nhan Tam", author: "Dale Carnegie", borrows: 87, available: 2, total: 5 },
  { id: 2, rank: 2, title: "Nha Gia Kim", author: "Paulo Coelho", borrows: 74, available: 1, total: 4 },
  { id: 3, rank: 3, title: "Sapiens", author: "Yuval Noah Harari", borrows: 68, available: 3, total: 5 },
  { id: 4, rank: 4, title: "Harry Potter T1", author: "J.K. Rowling", borrows: 62, available: 0, total: 6 },
  { id: 5, rank: 5, title: "Atomic Habits", author: "James Clear", borrows: 54, available: 2, total: 4 },
];

const loanHeatmap = [
  { day: "Thu 2", count: 82, level: 3 },
  { day: "Thu 3", count: 64, level: 2 },
  { day: "Thu 4", count: 71, level: 2 },
  { day: "Thu 5", count: 55, level: 1 },
  { day: "Thu 6", count: 90, level: 4 },
  { day: "Thu 7", count: 110, level: 5 },
  { day: "CN", count: 98, level: 4 },
];

const overdueLoaners = [
  { id: 1, name: "Nguyen Van A", book: "Dac Nhan Tam", dueDate: "10/04/2026", days: 15, fine: 75000, contacted: false },
  { id: 2, name: "Tran Thi B", book: "Harry Potter T1", dueDate: "17/04/2026", days: 8, fine: 40000, contacted: true },
  { id: 3, name: "Le Van C", book: "Tu Duy Nhanh va Cham", dueDate: "20/04/2026", days: 5, fine: 25000, contacted: false },
  { id: 4, name: "Pham Thi D", book: "Sapiens", dueDate: "08/04/2026", days: 17, fine: 85000, contacted: false },
  { id: 5, name: "Hoang Van E", book: "Nha Gia Kim", dueDate: "15/04/2026", days: 10, fine: 50000, contacted: true },
];

const fineReasons = [
  { name: "Qua han", value: 65, fill: "#E24B4A" },
  { name: "Hu sach", value: 22, fill: "#BA7517" },
  { name: "Mat sach", value: 13, fill: "#378ADD" },
];

const finesAging = [
  { label: "0-7 ngay", count: 18, amount: 180000, color: "#BA7517" },
  { label: "8-30 ngay", count: 15, amount: 220000, color: "#E24B4A" },
  { label: "> 30 ngay", count: 9, amount: 80000, color: "#791F1F" },
];

const finesTrend = [
  { month: "T1", collected: 1200000, pending: 300000 },
  { month: "T2", collected: 1400000, pending: 400000 },
  { month: "T3", collected: 980000, pending: 200000 },
  { month: "T4", collected: 1600000, pending: 350000 },
  { month: "T5", collected: 1800000, pending: 450000 },
  { month: "T6", collected: 1600000, pending: 480000 },
];

const formatVND = (value) =>
  value != null ? `${Number(value).toLocaleString("vi-VN")} VND` : "--";

const formatCompactMoney = (value) => {
  if (value == null) return "--";
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B `;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M `;
  return `${Number(value).toLocaleString("vi-VN")} `;
};

const sumByKey = (items, key) => items.reduce((sum, item) => sum + (item[key] ?? 0), 0);

const maxBy = (items, getter) =>
  items.reduce((currentMax, item) => {
    if (!currentMax) {
      return item;
    }
    return getter(item) > getter(currentMax) ? item : currentMax;
  }, null);

const getDateRangeForYear = (year) => {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
};

const Skeleton = ({ w = "100%", h = 24, r = 8 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: r,
      flexShrink: 0,
      background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }}
  />
);

const KpiCard = ({ label, value, icon: Icon, iconBg, delta, deltaPositive, loading }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-start justify-between gap-3 mb-3">
      <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
      <div className={`${iconBg} w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    {loading ? (
      <Skeleton h={30} w={120} r={8} />
    ) : (
      <p className="text-[1.8rem] leading-none font-bold text-slate-950 truncate">{value}</p>
    )}
    {!loading && delta ? (
      <div
        className={`flex items-center gap-1 mt-3 text-xs font-medium ${
          deltaPositive ? "text-emerald-600" : "text-red-500"
        }`}
      >
        {deltaPositive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
        <span>{delta}</span>
      </div>
    ) : null}
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 text-xs">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((item, index) => (
        <p key={`${item.name}-${index}`} style={{ color: item.color ?? item.fill }}>
          {item.name}:{" "}
          <strong>
            {typeof item.value === "number" && item.value > 10000 ? formatVND(item.value) : item.value}
          </strong>
        </p>
      ))}
    </div>
  );
};

const ChartLegend = ({ items }) => (
  <div className="flex flex-wrap gap-3 mb-3">
    {items.map((item) => (
      <span key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
        {item.label}
      </span>
    ))}
  </div>
);

const ChartCard = ({ title, legend, loading, height = 260, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
    {legend ? <ChartLegend items={legend} /> : null}
    {loading ? <Skeleton h={height} r={12} /> : <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>}
  </div>
);

const Badge = ({ children, color = "gray" }) => {
  const map = {
    red: "bg-red-100 text-red-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-gray-100 text-gray-600",
    purple: "bg-purple-100 text-purple-700",
  };
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[color]}`}>{children}</span>;
};

const DataTable = ({ columns, rows, loading, emptyText = "Khong co du lieu" }) => (
  <div className="overflow-x-auto">
    {loading ? (
      <Skeleton h={220} r={12} />
    ) : rows.length === 0 ? (
      <p className="text-xs text-gray-400 text-center py-8">{emptyText}</p>
    ) : (
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((column, index) => (
              <th
                key={column.label ?? column.key ?? index}
                className={`px-3 py-2.5 font-semibold text-gray-600 ${
                  column.align === "right" ? "text-right" : "text-left"
                } ${index === 0 ? "rounded-tl-lg" : ""} ${index === columns.length - 1 ? "rounded-tr-lg" : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} className="border-t border-gray-50 hover:bg-gray-50">
              {columns.map((column, columnIndex) => (
                <td
                  key={`${column.label ?? column.key}-${columnIndex}`}
                  className={`px-3 py-3 ${
                    column.align === "right" ? "text-right" : ""
                  } ${column.bold ? "font-medium text-gray-900" : "text-gray-600"}`}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const DonutWithLegend = ({ data, loading, height = 180 }) => (
  <div className="flex items-center gap-6">
    <div style={{ width: 140, height, flexShrink: 0 }}>
      {loading ? (
        <Skeleton h={height} w={140} r={70} />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={entry.fill ?? COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
    <div className="flex-1 space-y-2.5">
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{item.name}</span>
            <span className="font-semibold text-gray-900">{item.value}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${item.value}%`, background: item.fill ?? COLORS[index % COLORS.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AgingBar = ({ label, count, total, amount, color }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-500 w-24 flex-shrink-0">{label}</span>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${total ? Math.round((count / total) * 100) : 0}%`, background: color }}
      />
    </div>
    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{count}</span>
    <span className="text-xs text-gray-400 w-24 text-right">{formatVND(amount)}</span>
  </div>
);

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
      active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
    }`}
  >
    {children}
  </button>
);
const TopBookRow = ({ rank, book }) => {
  const [imgError, setImgError] = useState(false);
  const medals = ["#f59e0b", "#9ca3af", "#cd7f32"];
  const isMedal = rank <= 3;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #f9fafb",
      }}
      className="last:border-0"
    >
      {/* Hạng */}
      <span
        style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700,
          background: isMedal ? medals[rank - 1] + "22" : "#f3f4f6",
          color: isMedal ? medals[rank - 1] : "#9ca3af",
        }}
      >
        {rank}
      </span>

      {/* Ảnh bìa */}
      <div
        style={{
          width: 36, height: 50, borderRadius: 6, overflow: "hidden",
          background: "#f3f4f6", flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        }}
      >
        {book.coverImageUrl && !imgError ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg,#e0e7ff,#ede9fe)",
          }}>
            <Book size={13} color="#a5b4fc" />
          </div>
        )}
      </div>

      {/* Tên + tác giả */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: "#111827",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {book.title}
        </p>
        <p style={{
          fontSize: 11, color: "#6b7280", marginTop: 2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {book.authorName ?? book.author ?? "—"}
        </p>
      </div>

      <Badge color="blue">
        {book.totalLoans ?? book.totalLoans ?? 0} lượt
      </Badge>
    </div>
  );
};


export default function Reports() {
  const currentYear = new Date().getFullYear();
  const defaultYear = AVAILABLE_YEARS.includes(currentYear)
    ? currentYear
    : AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
  const [activeTab, setActiveTab] = useState("revenue");
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [startDate, setStartDate] = useState(() => getDateRangeForYear(defaultYear).start);
  const [endDate, setEndDate] = useState(() => getDateRangeForYear(defaultYear).end);
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState("");
  const [subscriptionsReport, setSubscriptionsReport] = useState(null);
  const [loadingSubscriptionsReport, setLoadingSubscriptionsReport] = useState(false);
  const [topBooksData, setTopBooksData] = useState([]);
  const [loadingTopBooks, setLoadingTopBooks] = useState(true);


  useEffect(() => {
    const fetchOverview = async () => {
      setLoadingOverview(true);
      setOverviewError("");
      try {
        const response = await api.get("/admin/reports/overview", {
          params: { startDate, endDate },
        });
        setOverview(response.data);
      } catch (error) {
        setOverview(null);
        setOverviewError("Khong tai duoc thong ke tu backend.");
      } finally {
        setLoadingOverview(false);
      }
    };
    const fetchTopBorrowedBooks = async () => {
    setLoadingTopBooks(true);
    try {
      const res = await api.get("/books/top-borrowed", { params: { limit: 5 } });
      setTopBooksData(res.data ?? []);
    } catch {
      setTopBooksData([]);
    } finally {
      setLoadingTopBooks(false);
    }
  };

    fetchOverview();
    fetchTopBorrowedBooks();
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchSubscriptionsReport = async () => {
      setLoadingSubscriptionsReport(true);
      try {
        const response = await api.get("/admin/reports/subscriptions", {
          params: { startDate, endDate },
        });
        setSubscriptionsReport(response.data);
      } catch {
        setSubscriptionsReport(null);
      } finally {
        setLoadingSubscriptionsReport(false);
      }
    };

    fetchSubscriptionsReport();
  }, [startDate, endDate]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    const range = getDateRangeForYear(year);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const safeOverview = overview ?? {
    totalRevenue: 0,
    subscriptionRevenue: 0,
    fineRevenue: 0,
    monthlyRevenue: [],
    activeUsers: 0,
    totalUsers: 0,
    totalLoans: 0,
    onTimeRate: 0,
    totalFines: 0,
    usersWithPendingFines: 0,
    activeSubscriptions: 0,
    activeSubscriptionRate: 0,
    maleUsersCount: 0,
    femaleUsersCount: 0,
    activeLoans: 0,
    recentBorrows: [],
    recentReturns: [],
    topFineUsers: [],
  };
  const safeSubscriptionsReport = subscriptionsReport ?? {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    expiringSoonCount: 0,
    activeSubscriptionRate: 0,
    renewalExpectedRevenue: 0,
    monthlyStats: [],
    planDistribution: [],
    expiringSoonSubscriptions: [],
  };

  
  const finesAgingTotal = finesAging.reduce((sum, item) => sum + item.count, 0);
  const monthlyRevenueData = safeOverview.monthlyRevenue && safeOverview.monthlyRevenue.length > 0
    ? safeOverview.monthlyRevenue.map(item => ({
        month: item.month,
        subscription: item.subscription || 0,
        fines: item.fines || 0
      }))
    : revenueChart;
    const totalSubscriptionRevenue = sumByKey(monthlyRevenueData, "subscription");
  const totalFineRevenue = sumByKey(monthlyRevenueData, "fines");
  const averageMonthlyRevenue = revenueChart.length
    ? Math.round((totalSubscriptionRevenue + totalFineRevenue) / revenueChart.length)
    : 0;
  const bestRevenueMonth = maxBy(
    revenueChart,
    (item) => (item.subscription ?? 0) + (item.fines ?? 0),
  );

  // Use topBorrowers from API or fallback to empty array
  const dynamicTopBorrowers = safeOverview.topBorrowers && safeOverview.topBorrowers.length > 0 
    ? safeOverview.topBorrowers 
    : [];

  const averageBorrowerOnTime = dynamicTopBorrowers.length
    ? Math.round(
        dynamicTopBorrowers.reduce(
          (sum, item) => sum + Number.parseInt(item.onTime, 10),
          0,
        ) / dynamicTopBorrowers.length,
      )
    : 0;
  const premiumBorrowers = dynamicTopBorrowers.filter((item) => item.plan === "Premium").length;
  
  // Use genreStats from API or fallback to default
  const dynamicGenreChart = safeOverview.genreStats && safeOverview.genreStats.length > 0
    ? safeOverview.genreStats.map(item => ({
        name: item.genreName,
        value: item.loanCount,
        percentage: item.percentage
      }))
    : defaultGenreChart;
  
  const totalTrackedBorrows = sumByKey(topBooks, "borrows");
  const lowStockTitles = topBooks.filter((item) => item.available <= 1).length;
  const outOfStockTitles = topBooks.filter((item) => item.available === 0).length;
  const leadingGenre = maxBy(dynamicGenreChart, (item) => item.value ?? 0);
  const totalOverdueFine = sumByKey(overdueLoaners, "fine");
  const pendingContacts = overdueLoaners.filter((item) => !item.contacted).length;
  const busiestLoanDay = maxBy(loanHeatmap, (item) => item.count ?? 0);
  const outstandingFines = finesAging.reduce((sum, item) => sum + item.amount, 0);
  const topFineReason = maxBy(fineReasons, (item) => item.value ?? 0);
  const topDebtor = safeOverview.topFineUsers?.[0];

  // Calculate gender distribution
  const totalUsersForGender = safeOverview.totalUsers ?? 1;
  const malePercentage = totalUsersForGender > 0 
    ? Math.round((safeOverview.maleUsersCount / totalUsersForGender) * 100) 
    : 0;
  const femalePercentage = totalUsersForGender > 0 
    ? Math.round((safeOverview.femaleUsersCount / totalUsersForGender) * 100) 
    : 0;
  
  const dynamicGenderDistribution = [
    { name: "Nam", value: malePercentage, fill: "#3B82F6" },
    { name: "Nu", value: femalePercentage, fill: "#EC4899" },
  ];

  const tabSummaryCards = {
    revenue: [
      {
        label: "Doanh thu",
        value: formatCompactMoney(safeOverview.totalRevenue),
        icon: DollarSign,
        iconBg: "bg-blue-500",
        deltaPositive: true,
        loading: loadingOverview,
      },
      {
        label: "Gói đăng ký",
        value: formatCompactMoney(safeOverview.subscriptionRevenue),
        icon: FileText,
        iconBg: "bg-emerald-500",
        deltaPositive: true,
        loading: loadingOverview,
      },
      {
        label: "Tiền phạt",
        value: formatCompactMoney(safeOverview.fineRevenue),
        icon: AlertCircle,
        iconBg: "bg-red-500",
        deltaPositive: false,
        loading: loadingOverview,
      },
      {
        label: "Doanh thu nam",
        value: formatCompactMoney(safeOverview.totalRevenue),
        icon: DollarSign,
        iconBg: "bg-emerald-500",
        deltaPositive: true,
        loading: loadingOverview,
      },
    ],
    users: [
      {
        label: "Nguoi dung hoat dong",
        value: safeOverview.activeUsers,
        icon: Users,
        iconBg: "bg-emerald-500",
        deltaPositive: true,
        loading: loadingOverview,
      },
      {
        label: "Tong tai khoan",
        value: safeOverview.totalUsers,
        icon: FileText,
        iconBg: "bg-blue-500",
        deltaPositive: Math.max(safeOverview.totalUsers - safeOverview.activeUsers, 0) === 0,
        loading: loadingOverview,
      },
      {
        label: "Tai khoan dang ky goi",
        value: premiumBorrowers,
        icon: FileText,
        iconBg: "bg-purple-500",
        deltaPositive: true,
        loading: false,
      },
      {
        label: "Tài khoản nợ phạt",
        value: safeOverview.usersWithPendingFines,
        icon: AlertCircle,
        iconBg: "bg-red-500",
        deltaPositive: safeOverview.usersWithPendingFines === 0,
        loading: loadingOverview,
      },
    ],
    books: [
      {
        label: "Sách nổi bật",
        value: topBooks[0]?.borrows ?? 0,
        icon: Book,
        iconBg: "bg-blue-500",
        deltaPositive: true,
        loading: false,
      },
      {
        label: "Sắp hết sách",
        value: lowStockTitles,
        icon: AlertCircle,
        iconBg: "bg-red-500",
        deltaPositive: lowStockTitles === 0,
        loading: false,
      },
      {
        label: "Hết sách",
        value: outOfStockTitles,
        icon: FileText,
        iconBg: "bg-purple-500",
        deltaPositive: outOfStockTitles === 0,
        loading: false,
      },
    ],
    loans: [
      {
        label: "Lượt mượn",
        value: safeOverview.totalLoans,
        icon: Book,
        iconBg: "bg-amber-500",
        deltaPositive: true,
        loading: loadingOverview,
      },
      {
        label: "Quá hạn",
        value: overdueLoaners.length,
        icon: AlertCircle,
        iconBg: "bg-red-500",
        deltaPositive: false,
        loading: false,
      },
      {
        label: "Đang mượn",
        value: safeOverview.activeLoans,
        icon: Book,
        iconBg: "bg-blue-500",
        deltaPositive: true,
        loading: loadingOverview,
      },
      {
        label: "Đúng hạn",
        value: `${safeOverview.onTimeRate}%`,
        icon: FileText,
        iconBg: "bg-purple-500",
        deltaPositive: safeOverview.onTimeRate >= 90,
        loading: loadingOverview,
      },
    ],
    fines: [
      {
        label: "Phiếu phạt",
        value: safeOverview.totalFines,
        icon: AlertCircle,
        iconBg: "bg-red-500",
        deltaPositive: false,
        loading: loadingOverview,
      },
      {
        label: "Người đang nợ",
        value: safeOverview.usersWithPendingFines,
        icon: Users,
        iconBg: "bg-blue-500",
        deltaPositive: false,
        loading: loadingOverview,
      },
      {
        label: "Tổng nợ",
        value: formatCompactMoney(outstandingFines),
        icon: DollarSign,
        iconBg: "bg-amber-500",
        deltaPositive: false,
        loading: false,
      },
    ],
    subscriptions: [
      {
        label: "Lượt đăng ký gói",
        value: safeSubscriptionsReport.totalSubscriptions,
        icon: Book,
        iconBg: "bg-blue-500",
        deltaPositive: true,
        loading: loadingSubscriptionsReport,
      },
      {
        label: "Gói đang ký hoạt động",
        value: safeSubscriptionsReport.activeSubscriptions,
        icon: FileText,
        iconBg: "bg-purple-500",
        deltaPositive: true,
        loading: loadingSubscriptionsReport,
      },
      {
        label: "Sắp hết hạn",
        value: safeSubscriptionsReport.expiringSoonCount,
        icon: AlertCircle,
        iconBg: "bg-red-500",
        deltaPositive: false,
        loading: loadingSubscriptionsReport,
      },
      {
        label: "Doanh thu gói",
        value: formatCompactMoney(safeOverview.subscriptionRevenue),
        icon: DollarSign,
        iconBg: "bg-emerald-500",
        deltaPositive: true,
        loading: loadingSubscriptionsReport,
      },
    ],
  };

  const renderTabSummary = () => (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${
        (tabSummaryCards[activeTab] ?? []).length >= 5 ? "xl:grid-cols-5" : "xl:grid-cols-4"
      } mb-8`}
    >
      {(tabSummaryCards[activeTab] ?? []).map((card) => (
        <KpiCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          iconBg={card.iconBg}
          delta={card.delta}
          deltaPositive={card.deltaPositive}
          loading={card.loading}
        />
      ))}
    </div>
  );

  const renderRevenueTab = () => (
  <div className="grid grid-cols-1 gap-5 xl:grid-cols-1">
    <ChartCard
      title="Doanh thu theo thang"
      legend={[
        { color: "#3B82F6", label: "Goi dang ky" },
        { color: "#EF4444", label: "Tien phat" },
      ]}
      loading={loadingOverview}
      height={300}
    >
      <BarChart data={monthlyRevenueData} barGap={4} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#888780" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#888780" }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "#f3f4f6", radius: 6 }}
        />
        <Bar dataKey="subscription" fill="#3B82F6" name="Doanh thu goi dang ky" radius={[6, 6, 0, 0]} maxBarSize={50} />
        <Bar dataKey="fines" fill="#EF4444" name="Doanh thu tien phat" radius={[6, 6, 0, 0]} maxBarSize={50} />
      </BarChart>
    </ChartCard>
  </div>
);

  const renderUsersTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Ty le gioi tinh</h3>
          <DonutWithLegend data={dynamicGenderDistribution} loading={loadingOverview} />
        </div>

        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Top nguoi dung muon sach nhieu</h3>
              <p className="text-xs text-gray-400 mt-1">Giu lai thong tin hien tai va dua vao tab de gon hon.</p>
            </div>
          </div>
      <DataTable
        loading={false}
        columns={[
          {
            key: "rank",
            label: "#",
            render: (row) => (
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 mx-auto">
                {row.rank}
              </span>
            ),
          },
          { key: "name", label: "Nguoi dung", bold: true },
          {
            key: "total",
            label: "Tong luot muon",
            align: "right",
            render: (row) => <span className="font-semibold text-blue-600">{row.total}</span>,
          },
          {
            key: "onTime",
            label: "Dung han",
            align: "right",
            render: (row) => (
              <Badge color={parseInt(row.onTime, 10) >= 90 ? "green" : "amber"}>{row.onTime}</Badge>
            ),
          },
          {
            key: "plan",
            label: "Goi",
            render: (row) => (
              <Badge color={row.plan === "Premium" ? "purple" : row.plan === "Standard" ? "blue" : "gray"}>
                {row.plan}
              </Badge>
            ),
          },
        ]}
        rows={dynamicTopBorrowers}
      />
        </div>
      </div>
    </div>
  );

  const renderBooksTab = () => (
  <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
    <div className="xl:col-span-2">
      <ChartCard title="Thể loại được mượn nhiều" loading={false} height={280}>
        <BarChart data={dynamicGenreChart} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={72} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" name="Lượt mượn" radius={[0, 4, 4, 0]}>
            {dynamicGenreChart.map((item, index) => (
              <Cell key={`${item.name}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>
    </div>

    <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Top đầu sách được mượn nhiều
      </h3>

      {/* ---- Thay DataTable cũ bằng phần này ---- */}
      {loadingTopBooks ? (
        <div className="flex flex-col gap-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : topBooksData.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">Không có dữ liệu</p>
      ) : (
        <div>
          {topBooksData.map((book, i) => (
            <TopBookRow key={book.id ?? i} rank={i + 1} book={book} />
          ))}
        </div>
      )}
    </div>
  </div>
);

  const renderLoansTab = () => (
    <div className="space-y-5">
      <ChartCard
        title="Luot muon theo ngay trong tuan"
        loading={false}
        height={280}
      >
        <BarChart data={loanHeatmap} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#888780" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#888780" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "#f3f4f6", radius: 6 }}
          />
          <Bar dataKey="count" fill="#378ADD" name="So luot muon" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Muon gan day</h3>
        </div>
        <DataTable
          loading={false}
          columns={[
            { key: "userName", label: "Nguoi muon", bold: true },
            { key: "bookTitle", label: "Ten sach" },
            { key: "authorName", label: "Tac gia" },
            { key: "checkoutDate", label: "Ngay muon" },
            {
              key: "dueDate",
              label: "Han tra",
              render: (row) => {
                const today = new Date();
                const dueDate = new Date(row.dueDate);
                const isOverdue = dueDate < today;
                return (
                  <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                    {row.dueDate}
                  </span>
                );
              },
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (row) => {
                const statusMap = {
                  CHECK_OUT: { label: "Đang mượn", color: "blue" },
                  OVERDUE: { label: "Quá hạn", color: "red" },
                  SHIPPING: { label: "Đang vận chuyển", color: "amber" },
                  DELIVERED: { label: "Đã giao", color: "green" },
                };
                const status = statusMap[row.status] || { label: row.status, color: "gray" };
                return <Badge color={status.color}>{status.label}</Badge>;
              },
            },
          ]}
          rows={safeOverview.recentBorrows}
          emptyText="Khong co du lieu muon gan day"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Tra gan day</h3>
        </div>
        <DataTable
          loading={false}
          columns={[
            { key: "userName", label: "Nguoi tra", bold: true },
            { key: "bookTitle", label: "Ten sach" },
            { key: "authorName", label: "Tac gia" },
            { key: "checkoutDate", label: "Ngay muon" },
            { key: "returnDate", label: "Ngay tra" },
            {
              key: "overdueDays",
              label: "Qua han",
              render: (row) =>
                row.overdueDays > 0 ? (
                  <Badge color="red">{row.overdueDays} ngay</Badge>
                ) : (
                  <Badge color="green">Dung han</Badge>
                ),
            },
          ]}
          rows={safeOverview.recentReturns}
          emptyText="Khong co du lieu tra gan day"
        />
      </div>

      
    </div>
  );

const renderFinesTab = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      <div className="xl:col-span-3">
        <ChartCard
          title="Xu huong thu phat theo thang"
          legend={[
            { color: "#1D9E75", label: "Da thu" },
            { color: "#E24B4A", label: "Con ton" },
          ]}
          loading={false}
          height={260}
        >
          <BarChart data={finesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="collected" fill="#1D9E75" name="Da thu" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="#E24B4A" name="Con ton" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Tỉ lệ lý do phạt</h3>
        <DonutWithLegend data={fineReasons} loading={false} />
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Danh sach nguoi no phat nhieu</h3>
        </div>
      </div>
      <DataTable
        loading={loadingOverview}
        columns={[
          { key: "userName", label: "Nguoi no", bold: true },
          {
            key: "reason",
            label: "Ly do",
            render: (row) => (
              <Badge color={row.reason === "Qua han" ? "red" : row.reason === "Hu sach" ? "amber" : "blue"}>
                {row.reason || row.fineType || "—"}
              </Badge>
            ),
          },
          { key: "createdAt", label: "Tu ngay", render: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN') },
          {
            key: "amount",
            label: "So tien no",
            align: "right",
            render: (row) => <span className="font-bold text-red-600">{formatVND(row.amount)}</span>,
          },
        ]}
        rows={safeOverview.topFineUsers || []}
        emptyText="Khong co du lieu ve phat"
      />
    </div>
  </div>
);

const renderSubscriptionsTab = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ChartCard
            title="So luong dang ky goi theo thang"
            legend={[
              { color: "#378ADD", label: "Dang ky goi" },
            ]}
            loading={loadingSubscriptionsReport}
          >
            <BarChart data={safeSubscriptionsReport.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="newCount" fill="#378ADD" name="Dang ky goi" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
        </div>
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Ty le dang ky theo loai goi</h3>
          <DonutWithLegend data={safeSubscriptionsReport.planDistribution} loading={loadingSubscriptionsReport} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Danh sach goi sap het han</h3>
          </div>
          <button className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5">
            <Bell size={12} /> Nhac nho tat ca
          </button>
        </div>
        <DataTable
          loading={loadingSubscriptionsReport}
          columns={[
            { key: "name", label: "Ten nguoi dung", bold: true },
            {
              key: "plan",
              label: "Goi",
              render: (row) => (
                <Badge color={row.plan === "Premium" ? "purple" : row.plan === "Standard" ? "blue" : "gray"}>
                  {row.plan}
                </Badge>
              ),
            },
            { key: "expiry", label: "Ngay het han" },
            {
              key: "revenue",
              label: "Gia gia han",
              align: "right",
              render: (row) => <span className="font-medium text-emerald-600">{formatVND(row.revenue)}</span>,
            },
          ]}
          rows={safeSubscriptionsReport.expiringSoonSubscriptions}
        />
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "revenue":
        return renderRevenueTab();
      case "users":
        return renderUsersTab();
      case "books":
        return renderBooksTab();
      case "loans":
        return renderLoansTab();
      case "fines":
        return renderFinesTab();
      case "subscriptions":
        return renderSubscriptionsTab();
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="p-6 w-full bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-950">Thống kê và báo cáo</h1>
          
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {REPORT_TABS.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </TabButton>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-600 font-medium">Nam bao cao:</span>
            <div className="flex gap-2">
              {AVAILABLE_YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedYear === year
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400 md:ml-auto">
              Tu {startDate} den {endDate}
            </div>
          </div>
          {overviewError ? <p className="text-xs text-red-500 mt-3">{overviewError}</p> : null}
        </div>

        {renderTabSummary()}
        {renderActiveTab()}
      </div>
    </>
  );
}
