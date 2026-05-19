import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertCircle, DollarSign, FileText, Users, Download, X, FileDown,
} from "lucide-react";
import { fineService } from "../../services/fineService";



const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const COLORS = ["#378ADD", "#1D9E75", "#BA7517", "#D4537E", "#534AB7", "#D85A30"];
const AVAILABLE_YEARS = [2025, 2026];

const revenueChart = [
  { month: "T1", subscription: 8200000, fines: 1200000 },
  { month: "T2", subscription: 9100000, fines: 1400000 },
  { month: "T3", subscription: 7800000, fines: 980000 },
  { month: "T4", subscription: 9800000, fines: 1600000 },
  { month: "T5", subscription: 10200000, fines: 1800000 },
  { month: "T6", subscription: 9800000, fines: 1600000 },
];

const defaultGenreChart = [
  { name: "Văn học", value: 420 },
  { name: "KHKT", value: 280 },
  { name: "Kỹ năng", value: 310 },
  { name: "Ngoại ngữ", value: 210 },
  { name: "Thiếu nhi", value: 185 },
  { name: "Lịch sử", value: 120 },
];

const fallbackLoanHeatmap = [
  { day: "Thứ 2", count: 82 },
  { day: "Thứ 3", count: 64 },
  { day: "Thứ 4", count: 71 },
  { day: "Thứ 5", count: 55 },
  { day: "Thứ 6", count: 90 },
  { day: "Thứ 7", count: 110 },
  { day: "CN", count: 98 },
];

const fineReasons = [
  { name: "Quá hạn", value: 65, fill: "#E24B4A" },
  { name: "Hư sách", value: 22, fill: "#BA7517" },
  { name: "Mất sách", value: 13, fill: "#378ADD" },
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
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  return `${Number(value).toLocaleString("vi-VN")}`;
};

const getDateRangeForYear = (year) => ({
  start: `${year}-01-01`,
  end: `${year}-12-31`,
});

const DOW_LABELS = {
  1: "Thứ 2", 2: "Thứ 3", 3: "Thứ 4",
  4: "Thứ 5", 5: "Thứ 6", 6: "Thứ 7", 7: "CN",
};

const normalizeLoanHeatmap = (raw) => {
  if (!raw || raw.length === 0) return fallbackLoanHeatmap;
  if (raw[0]?.dayOfWeek != null) {
    return Object.entries(DOW_LABELS).map(([key, label]) => {
      const found = raw.find((r) => String(r.dayOfWeek) === key);
      return { day: label, count: found?.count ?? 0 };
    });
  }
  if (raw[0]?.day != null) return raw;
  if (typeof raw[0] === "number") {
    return Object.values(DOW_LABELS).map((label, i) => ({ day: label, count: raw[i] ?? 0 }));
  }
  return fallbackLoanHeatmap;
};

const Skeleton = ({ w = "100%", h = 24, r = 8 }) => (
  <div style={{
    width: w, height: h, borderRadius: r, flexShrink: 0,
    background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
  }} />
);


const KpiCard = ({ label, value, icon: Icon, iconBg, loading }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-start justify-between gap-3 mb-3">
      <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
      <div className={`${iconBg} w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    {loading
      ? <Skeleton h={30} w={120} r={8} />
      : <p className="text-[1.8rem] leading-none font-bold text-slate-950 truncate">{value}</p>
    }
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 text-xs">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} style={{ color: item.color ?? item.stroke ?? item.fill }}>
          {item.name}:{" "}
          <strong>
            {typeof item.value === "number" && item.value > 10000
              ? formatVND(item.value)
              : item.value}
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

const ChartCard = ({ title, legend, loading, height = 260, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
    {title && <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>}
    {legend ? <ChartLegend items={legend} /> : null}
    {loading
      ? <Skeleton h={height} r={12} />
      : (
        <div style={{ width: "100%", minHeight: height }}>
          <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
        </div>
      )}
  </div>
);

const DonutWithLegend = ({ data, loading, height = 180 }) => {
  const donutH = Math.round(height * 0.72);
  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ width: "100%", height: donutH }}>
        {loading ? (
          <Skeleton h={donutH} w="100%" r={donutH / 2} />
        ) : (
          <ResponsiveContainer width="100%" height={donutH}>
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie data={data} cx="50%" cy="50%" innerRadius="42%" outerRadius="72%" dataKey="value" paddingAngle={2}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill ?? COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {data.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: item.fill ?? COLORS[i % COLORS.length] }}
            />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const DataTable = ({ columns, rows, loading, emptyText = "Không có dữ liệu" }) => (
  <div className="overflow-x-auto">
    {loading ? <Skeleton h={220} r={12} /> : rows.length === 0 ? (
      <p className="text-xs text-gray-400 text-center py-8">{emptyText}</p>
    ) : (
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((col, i) => (
              <th key={i} className={`px-3 py-2.5 font-semibold text-gray-600 ${col.align === "right" ? "text-right" : "text-left"} ${i === 0 ? "rounded-tl-lg" : ""} ${i === columns.length - 1 ? "rounded-tr-lg" : ""}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.id ?? ri} className="border-t border-gray-50 hover:bg-gray-50">
              {columns.map((col, ci) => (
                <td key={ci} className={`px-3 py-3 ${col.align === "right" ? "text-right" : ""} ${col.bold ? "font-medium text-gray-900" : "text-gray-600"}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);


const ReportPreview = ({
  selectedYear, startDate, endDate,
  overview, subscriptionsReport,
  loanHeatmap, fineReasonData,
  dynamicGenreChart, malePercentage, femalePercentage,
}) => {
  const now = new Date();
  const o = overview ?? {};
  const s = subscriptionsReport ?? {};

  const fmtNum = (v) => (v != null ? Number(v).toLocaleString("vi-VN") : "0");
  const fmtMoney = (v) => (v != null ? `${Number(v).toLocaleString("vi-VN")} VND` : "0 VND");

  const revenueRows = o.monthlyRevenue?.length > 0
    ? o.monthlyRevenue.slice(0, 12).map((r) => ({
        month: r.month,
        sub: Number(r.subscription || 0).toLocaleString("vi-VN"),
        fine: Number(r.fines || 0).toLocaleString("vi-VN"),
        total: Number((r.subscription || 0) + (r.fines || 0)).toLocaleString("vi-VN"),
      }))
    : [
        { month: "T1", sub: "8.200.000", fine: "1.200.000", total: "9.400.000" },
        { month: "T2", sub: "9.100.000", fine: "1.400.000", total: "10.500.000" },
        { month: "T3", sub: "7.800.000", fine: "980.000", total: "8.780.000" },
        { month: "T4", sub: "9.800.000", fine: "1.600.000", total: "11.400.000" },
        { month: "T5", sub: "10.200.000", fine: "1.800.000", total: "12.000.000" },
        { month: "T6", sub: "9.800.000", fine: "1.600.000", total: "11.400.000" },
      ];

  const topFines = o.topFineUsers?.slice(0, 5) ?? [];
  const recentBorrows = o.recentBorrows?.slice(0, 8) ?? [];
  const recentReturns = o.recentReturns?.slice(0, 8) ?? [];

  const planDist = s.planDistribution?.length > 0
    ? s.planDistribution
    : [
        { name: "Premium", value: 60 },
        { name: "Standard", value: 30 },
        { name: "Basic", value: 10 },
      ];

  const sec = {
    fontSize: "12px", fontWeight: "700", textTransform: "uppercase",
    letterSpacing: "0.06em", borderBottom: "2px solid #000",
    paddingBottom: "4px", marginBottom: "10px", marginTop: "20px",
  };

  const tbl = { width: "100%", borderCollapse: "collapse", fontSize: "11px" };
  const th = { border: "1px solid #bbb", padding: "5px 8px", background: "#ececec", fontWeight: "700", textAlign: "left" };
  const td = (align = "left") => ({ border: "1px solid #bbb", padding: "5px 8px", textAlign: align });
  const stripe = (i) => ({ background: i % 2 === 0 ? "#fafafa" : "#fff" });

  return (
    <div
      id="report-print-content"
      style={{
        width: "100%", fontFamily: "'Times New Roman', serif",
        fontSize: "12px", color: "#000", background: "#fff", lineHeight: 1.5,
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "12px", marginBottom: "10px" }}>
        <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Hệ thống Thư viện</div>
        <div style={{ fontSize: "20px", fontWeight: "800", margin: "6px 0 4px" }}>BÁO CÁO THỐNG KÊ THƯ VIỆN</div>
        <div style={{ fontSize: "12px" }}>Năm {selectedYear} &nbsp;·&nbsp; Từ {startDate} đến {endDate}</div>
        <div style={{ fontSize: "10px", color: "#555", marginTop: "4px" }}>
          Xuất ngày: {now.toLocaleDateString("vi-VN")} &nbsp;|&nbsp;
          Mã BC: BC-{selectedYear}-{String(now.getMonth() + 1).padStart(2, "0")}
        </div>
      </div>


      <table style={tbl}>
        <tbody>
          <tr>
            <td style={td()}>Đơn vị báo cáo: <strong> Phòng Thư viện, Hà Nội</strong></td>
            <td style={td()}>Người lập: <strong>Ban Quản trị Thư viện</strong></td>
            <td style={td()}>Phê duyệt: <strong>Ban Giám đốc</strong></td>
          </tr>
        </tbody>
      </table>

      <div style={sec}>1. Tổng quan chỉ số hoạt động</div>
      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>Chỉ số</th>
            <th style={{ ...th, textAlign: "right" }}>Giá trị</th>
            <th style={th}>Chỉ số</th>
            <th style={{ ...th, textAlign: "right" }}>Giá trị</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Tổng doanh thu", fmtMoney(o.totalRevenue), "Tổng người dùng", fmtNum(o.totalUsers)],
            ["Doanh thu đăng ký", fmtMoney(o.subscriptionRevenue), "Người dùng hoạt động", fmtNum(o.activeUsers)],
            ["Doanh thu tiền phạt", fmtMoney(o.fineRevenue), "Tổng lượt mượn", fmtNum(o.totalLoans)],
            ["Gói đang hoạt động", fmtNum(s.activeSubscriptions), "Đang mượn", fmtNum(o.activeLoans)],
            ["Tỉ lệ giới tính – Nam", `${malePercentage}%`, "Tỉ lệ giới tính – Nữ", `${femalePercentage}%`],
            ["Người nợ phạt chưa TT", fmtNum(o.usersWithPendingFines) + " người", "Tỉ lệ trả đúng hạn", o.onTimeRate ? `${o.onTimeRate}%` : "—"],
          ].map(([k1, v1, k2, v2], i) => (
            <tr key={i} style={stripe(i)}>
              <td style={td()}>{k1}</td>
              <td style={td("right")}><strong>{v1}</strong></td>
              <td style={td()}>{k2}</td>
              <td style={td("right")}><strong>{v2}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={sec}>2. Doanh thu theo tháng (VND)</div>
      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>Tháng</th>
            <th style={{ ...th, textAlign: "right" }}>Gói đăng ký</th>
            <th style={{ ...th, textAlign: "right" }}>Tiền phạt</th>
            <th style={{ ...th, textAlign: "right" }}>Tổng cộng</th>
          </tr>
        </thead>
        <tbody>
          {revenueRows.map((r, i) => (
            <tr key={i} style={stripe(i)}>
              <td style={td()}>{r.month}</td>
              <td style={td("right")}>{r.sub}</td>
              <td style={td("right")}>{r.fine}</td>
              <td style={td("right")}><strong>{r.total}</strong></td>
            </tr>
          ))}
          <tr style={{ fontWeight: "700", background: "#ececec" }}>
            <td style={td()}>Tổng cộng</td>
            <td style={td("right")}>{fmtNum(o.subscriptionRevenue)}</td>
            <td style={td("right")}>{fmtNum(o.fineRevenue)}</td>
            <td style={td("right")}>{fmtNum(o.totalRevenue)}</td>
          </tr>
        </tbody>
      </table>

      <div style={sec}>3. Thống kê tiền phạt</div>
      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>Lý do phạt</th>
            <th style={{ ...th, textAlign: "right" }}>Tỉ lệ (%)</th>
          </tr>
        </thead>
        <tbody>
          {(fineReasonData?.length > 0
            ? fineReasonData
            : [{ name: "Quá hạn", value: 65 }, { name: "Hư sách", value: 22 }, { name: "Mất sách", value: 13 }]
          ).map((item, i) => (
            <tr key={i} style={stripe(i)}>
              <td style={td()}>{item.name}</td>
              <td style={td("right")}>{item.value}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {topFines.length > 0 && (
        <>
          <div style={{ fontSize: "11px", fontWeight: "700", margin: "10px 0 6px" }}>Danh sách nợ phạt cao nhất:</div>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={th}>Người dùng</th>
                <th style={th}>Lý do</th>
                <th style={{ ...th, textAlign: "right" }}>Số tiền (VND)</th>
              </tr>
            </thead>
            <tbody>
              {topFines.map((r, i) => (
                <tr key={i} style={stripe(i)}>
                  <td style={td()}>{r.userName || "—"}</td>
                  <td style={td()}>{r.reason || r.fineType || "—"}</td>
                  <td style={td("right")}>{Number(r.amount || 0).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div style={sec}>4. Lượt mượn theo ngày trong tuần</div>
      <table style={tbl}>
        <thead>
          <tr>
            {loanHeatmap.map((h, i) => (
              <th key={i} style={{ ...th, textAlign: "center" }}>{h.day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {loanHeatmap.map((h, i) => (
              <td key={i} style={{ ...td("center"), fontWeight: "700" }}>{h.count}</td>
            ))}
          </tr>
        </tbody>
      </table>


      <div style={sec}>5. Thể loại sách được mượn nhiều</div>
      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>Thể loại</th>
            <th style={{ ...th, textAlign: "right" }}>Số lượt mượn</th>
            <th style={{ ...th, textAlign: "right" }}>Tỉ lệ (%)</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const total = dynamicGenreChart.reduce((s, d) => s + d.value, 0);
            return dynamicGenreChart.map((g, i) => {
              const pct = g.percentage ?? (total > 0 ? Math.round((g.value / total) * 100) : 0);
              return (
                <tr key={i} style={stripe(i)}>
                  <td style={td()}>{g.name}</td>
                  <td style={td("right")}>{g.value}</td>
                  <td style={td("right")}>{pct}%</td>
                </tr>
              );
            });
          })()}
        </tbody>
      </table>

      {/* ── 6. Subscriptions ── */}
      <div style={sec}>6. Thống kê gói đăng ký</div>
      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>Chỉ số</th>
            <th style={{ ...th, textAlign: "right" }}>Giá trị</th>
            <th style={th}>Loại gói</th>
            <th style={{ ...th, textAlign: "right" }}>Tỉ lệ (%)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Tổng gói đã đăng ký", fmtNum(s.totalSubscriptions)],
            ["Gói đang hoạt động", fmtNum(s.activeSubscriptions)],
            ["Sắp hết hạn (7 ngày)", fmtNum(s.expiringSoonCount)],
          ].map(([k, v], i) => (
            <tr key={i} style={stripe(i)}>
              <td style={td()}>{k}</td>
              <td style={td("right")}><strong>{v}</strong></td>
              <td style={td()}>{planDist[i]?.name ?? "—"}</td>
              <td style={td("right")}>{planDist[i]?.value ?? "—"}{planDist[i] ? "%" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── 7. Recent Borrows ── */}
      {recentBorrows.length > 0 && (
        <>
          <div style={sec}>7. Chi tiết mượn gần đây</div>
          <table style={tbl}>
            <thead>
              <tr>
                {["Người mượn", "Tên sách", "Ngày mượn", "Trạng thái"].map((h, i) => (
                  <th key={i} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBorrows.map((r, i) => (
                <tr key={i} style={stripe(i)}>
                  <td style={td()}>{r.userName || "—"}</td>
                  <td style={td()}>{r.bookTitle || "—"}</td>
                  <td style={td()}>{r.checkoutDate || "—"}</td>
                  <td style={td()}>
                    {r.status === "CHECK_OUT" ? "Đang mượn"
                      : r.status === "OVERDUE" ? "Quá hạn"
                      : r.status === "SHIPPING" ? "Đang vận chuyển"
                      : r.status || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── 8. Recent Returns ── */}
      {recentReturns.length > 0 && (
        <>
          <div style={sec}>8. Chi tiết trả gần đây</div>
          <table style={tbl}>
            <thead>
              <tr>
                {["Người trả", "Tên sách", "Ngày trả", "Tình trạng"].map((h, i) => (
                  <th key={i} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentReturns.map((r, i) => (
                <tr key={i} style={stripe(i)}>
                  <td style={td()}>{r.userName || "—"}</td>
                  <td style={td()}>{r.bookTitle || "—"}</td>
                  <td style={td()}>{r.returnDate || "—"}</td>
                  <td style={td()}>{r.overdueDays > 0 ? `Trễ ${r.overdueDays} ngày` : "Đúng hạn"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Footer */}
      <div style={{
        marginTop: "24px", borderTop: "1px solid #ccc", paddingTop: "8px",
        fontSize: "10px", color: "#555",
        display: "flex", justifyContent: "space-between",
      }}>
        <span>Hệ thống Thư viện – Báo cáo năm {selectedYear}</span>
        <span>Xuất ngày: {now.toLocaleDateString("vi-VN")}</span>
      </div>
    </div>
  );
};

// ── ExportModal – with live A4 preview ───────────────────────────────────────
const ExportModal = ({
  isOpen, onClose, onConfirm, exportLoading,
  selectedYear, startDate, endDate,
  overview, subscriptionsReport,
  loanHeatmap, fineReasonData,
  dynamicGenreChart, malePercentage, femalePercentage,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !exportLoading) onClose(); }}
    >
      <div style={{
        width: "900px", maxWidth: "95vw", maxHeight: "90vh",
        background: "#fff", borderRadius: "12px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileDown size={16} color="#374151" />
            <span style={{ fontWeight: "700", fontSize: "15px", color: "#111" }}>
              Xem trước báo cáo – Năm {selectedYear}
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={exportLoading}
            style={{
              width: "28px", height: "28px", borderRadius: "6px",
              border: "1px solid #e5e7eb", background: "#fff",
              cursor: exportLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: exportLoading ? 0.4 : 1,
            }}
          >
            <X size={14} color="#6b7280" />
          </button>
        </div>

        {/* Preview scrollable area */}
        <div style={{ flex: 1, overflowY: "auto", background: "#d1d5db", padding: "24px" }}>
          {/* A4 paper */}
          <div style={{
            margin: "0 auto",
            width: "794px",
            maxWidth: "100%",
            background: "#fff",
            boxShadow: "0 2px 20px rgba(0,0,0,0.18)",
            padding: "48px 56px",
            boxSizing: "border-box",
            minHeight: "1123px",
          }}>
            <ReportPreview
              selectedYear={selectedYear}
              startDate={startDate}
              endDate={endDate}
              overview={overview}
              subscriptionsReport={subscriptionsReport}
              loanHeatmap={loanHeatmap}
              fineReasonData={fineReasonData}
              dynamicGenreChart={dynamicGenreChart}
              malePercentage={malePercentage}
              femalePercentage={femalePercentage}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid #e5e7eb",
          display: "flex", gap: "10px", justifyContent: "flex-end",
          flexShrink: 0, background: "#f9fafb",
        }}>
          <button
            onClick={onClose}
            disabled={exportLoading}
            style={{
              padding: "9px 22px", borderRadius: "7px",
              border: "1px solid #d1d5db", background: "#fff",
              fontSize: "13px", fontWeight: "500", color: "#374151",
              cursor: exportLoading ? "not-allowed" : "pointer",
              opacity: exportLoading ? 0.5 : 1,
            }}
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={exportLoading}
            style={{
              padding: "9px 24px", borderRadius: "7px", border: "none",
              background: exportLoading ? "#9ca3af" : "#111827",
              fontSize: "13px", fontWeight: "600", color: "#fff",
              cursor: exportLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "7px",
            }}
          >
            {exportLoading ? (
              <>
                <span style={{
                  width: "13px", height: "13px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid #fff", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite", display: "inline-block",
                }} />
                Đang xuất...
              </>
            ) : (
              <><Download size={14} />Xuất PDF</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Reports Component ────────────────────────────────────────────────────
export default function Reports() {
  const currentYear = new Date().getFullYear();
  const defaultYear = AVAILABLE_YEARS.includes(currentYear) ? currentYear : AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [startDate, setStartDate] = useState(() => getDateRangeForYear(defaultYear).start);
  const [endDate, setEndDate] = useState(() => getDateRangeForYear(defaultYear).end);
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState("");
  const [subscriptionsReport, setSubscriptionsReport] = useState(null);
  const [loadingSubscriptionsReport, setLoadingSubscriptionsReport] = useState(false);
  const [loanHeatmap, setLoanHeatmap] = useState(fallbackLoanHeatmap);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [fineReasonData, setFineReasonData] = useState(fineReasons);
  const [loadingFineReasons, setLoadingFineReasons] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoadingOverview(true);
      setLoadingHeatmap(true);
      setOverviewError("");
      try {
        const res = await api.get("/admin/reports/overview", { params: { startDate, endDate } });
        setOverview(res.data);
        if (res.data?.loansByDayOfWeek) setLoanHeatmap(normalizeLoanHeatmap(res.data.loansByDayOfWeek));
      } catch {
        setOverview(null);
        setOverviewError("Không tải được thống kê từ backend.");
      } finally {
        setLoadingOverview(false);
        setLoadingHeatmap(false);
      }
    };
    fetch();
  }, [startDate, endDate]);

  useEffect(() => {
    const fetch = async () => {
      setLoadingFineReasons(true);
      try {
        const res = await fineService.getFineTypeRatios();
        const FINE_TYPE_MAP = {
          OVERDUE: { name: "Quá hạn", fill: "#E24B4A" },
          DAMAGE: { name: "Hư sách", fill: "#BA7517" },
          LOST: { name: "Mất sách", fill: "#378ADD" },
        };
        const mapped = res.data.map((item, i) => ({
          name: FINE_TYPE_MAP[item.fineType]?.name ?? item.fineType,
          fill: FINE_TYPE_MAP[item.fineType]?.fill ?? COLORS[i % COLORS.length],
          value: item.percentage,
        }));
        if (mapped.length > 0) setFineReasonData(mapped);
      } catch { }
      finally { setLoadingFineReasons(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoadingSubscriptionsReport(true);
      try {
        const res = await api.get("/admin/reports/subscriptions", { params: { startDate, endDate } });
        setSubscriptionsReport(res.data);
      } catch { setSubscriptionsReport(null); }
      finally { setLoadingSubscriptionsReport(false); }
    };
    fetch();
  }, [startDate, endDate]);

  useEffect(() => {
    const fetch = async () => {
      setLoadingHeatmap(true);
      try {
        const res = await api.get("/book-loans/stats/loans-by-day", { params: { startDate, endDate } });
        const n = normalizeLoanHeatmap(res.data);
        if (n !== fallbackLoanHeatmap) setLoanHeatmap(n);
      } catch { }
      finally { setLoadingHeatmap(false); }
    };
    fetch();
  }, [startDate, endDate]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    const range = getDateRangeForYear(year);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const safeOverview = overview ?? {
    totalRevenue: 0, subscriptionRevenue: 0, fineRevenue: 0, monthlyRevenue: [],
    activeUsers: 0, totalUsers: 0, totalLoans: 0, onTimeRate: 0, totalFines: 0,
    usersWithPendingFines: 0, activeLoans: 0,
    userRoleMaleCount: 0, userRoleFemaleCount: 0,
    maleUsersCount: 0, femaleUsersCount: 0,
    recentBorrows: [], recentReturns: [], topFineUsers: [], genreStats: [],
  };

  const safeSubscriptionsReport = subscriptionsReport ?? {
    totalSubscriptions: 0, activeSubscriptions: 0, expiringSoonCount: 0,
    monthlyStats: [], planDistribution: [],
  };

  const monthlyRevenueData = safeOverview.monthlyRevenue?.length > 0
    ? safeOverview.monthlyRevenue.map((item) => ({
        month: item.month, subscription: item.subscription || 0, fines: item.fines || 0,
      }))
    : revenueChart;

  const dynamicGenreChart = safeOverview.genreStats?.length > 0
    ? safeOverview.genreStats.map((item) => ({
        name: item.genreName, value: item.loanCount, percentage: item.percentage,
      }))
    : defaultGenreChart;

  const userMaleCount = safeOverview.userRoleMaleCount || safeOverview.maleUsersCount || 0;
  const userFemaleCount = safeOverview.userRoleFemaleCount || safeOverview.femaleUsersCount || 0;
  const userRoleTotal = (userMaleCount + userFemaleCount) || 1;
  const malePercentage = Math.round((userMaleCount / userRoleTotal) * 100);
  const femalePercentage = Math.round((userFemaleCount / userRoleTotal) * 100);
  const dynamicGenderDistribution = [
    { name: "Nam", value: malePercentage, fill: "#3B82F6" },
    { name: "Nữ", value: femalePercentage, fill: "#EC4899" },
  ];

  const fallbackPlanDistribution = [
    { name: "Premium", value: 60, fill: "#534AB7" },
    { name: "Standard", value: 30, fill: "#378ADD" },
    { name: "Basic", value: 10, fill: "#9ca3af" },
  ];

  // ── PDF Export: capture the ReportPreview already visible in modal ─────────
  const handleExportConfirm = async () => {
    setExportLoading(true);
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;

      // The ReportPreview inside the modal has id="report-print-content"
      const el = document.getElementById("report-print-content");
      if (!el) throw new Error("Không tìm thấy nội dung preview");

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pdfWidth = 210;
      const pageHeightMm = 297;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeightPx = (pageHeightMm / pdfWidth) * canvas.width;

      if (pdfHeight <= pageHeightMm) {
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      } else {
        let yOffset = 0;
        while (yOffset < canvas.height) {
          const sliceH = Math.min(pageHeightPx, canvas.height - yOffset);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          const sliceImg = sliceCanvas.toDataURL("image/jpeg", 0.95);
          const slicePdfH = (sliceH * pdfWidth) / canvas.width;
          if (yOffset > 0) pdf.addPage();
          pdf.addImage(sliceImg, "JPEG", 0, 0, pdfWidth, slicePdfH);
          yOffset += pageHeightPx;
        }
      }

      const now = new Date();
      pdf.save(`bao_cao_thu_vien_${selectedYear}_${now.toLocaleDateString("vi-VN").replace(/\//g, "-")}.pdf`);
      setShowExportModal(false);
    } catch (err) {
      console.error("PDF export error:", err);
      alert(`Không thể xuất PDF: ${err.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.97) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-in { animation: fadeIn 0.22s cubic-bezier(0.16,1,0.3,1); }
      `}</style>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => !exportLoading && setShowExportModal(false)}
        onConfirm={handleExportConfirm}
        exportLoading={exportLoading}
        selectedYear={selectedYear}
        startDate={startDate}
        endDate={endDate}
        overview={safeOverview}
        subscriptionsReport={safeSubscriptionsReport}
        loanHeatmap={loanHeatmap}
        fineReasonData={fineReasonData}
        dynamicGenreChart={dynamicGenreChart}
        malePercentage={malePercentage}
        femalePercentage={femalePercentage}
      />

      <div className="p-6 w-full bg-gray-50 min-h-screen">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-950">Thống kê và báo cáo</h1>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
          >
            <Download size={16} />Xuất PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-600 font-medium">Năm báo cáo:</span>
            <div className="flex gap-2">
              {AVAILABLE_YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedYear === year ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {year}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400 md:ml-auto">Từ {startDate} đến {endDate}</div>
          </div>
          {overviewError && <p className="text-xs text-red-500 mt-3">{overviewError}</p>}
        </div>

    
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 mb-8">
          <KpiCard label="Tổng doanh thu" value={formatCompactMoney(safeOverview.totalRevenue)} icon={DollarSign} iconBg="bg-blue-500" loading={loadingOverview} />
          <KpiCard label="Gói đăng ký" value={formatCompactMoney(safeOverview.subscriptionRevenue)} icon={FileText} iconBg="bg-emerald-500" loading={loadingOverview} />
          <KpiCard label="Tiền phạt" value={formatCompactMoney(safeOverview.fineRevenue)} icon={AlertCircle} iconBg="bg-red-500" loading={loadingOverview} />
          <KpiCard label="Gói đang hoạt động" value={safeSubscriptionsReport.activeSubscriptions} icon={Users} iconBg="bg-purple-500" loading={loadingSubscriptionsReport} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 mb-5">
          <div className="xl:col-span-2">
            <ChartCard
              title="Doanh thu theo tháng"
              legend={[{ color: "#3B82F6", label: "Gói đăng ký" }, { color: "#EF4444", label: "Tiền phạt" }]}
              loading={loadingOverview}
              height={280}
            >
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="gradFine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888780" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888780" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} width={42} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="subscription" name="Gói đăng ký" stroke="#3B82F6" strokeWidth={2} fill="url(#gradSub)" dot={{ r: 3, fill: "#3B82F6", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="fines" name="Tiền phạt" stroke="#EF4444" strokeWidth={2} fill="url(#gradFine)" dot={{ r: 3, fill: "#EF4444", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ChartCard>
          </div>
          <ChartCard
            title="Xu hướng thu phạt"
            legend={[{ color: "#1D9E75", label: "Đã thu" }, { color: "#E24B4A", label: "Còn tồn" }]}
            loading={false}
            height={280}
          >
            <BarChart data={finesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="collected" fill="#1D9E75" name="Đã thu" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="pending" fill="#E24B4A" name="Còn tồn" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ChartCard>
        </div>


        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 mb-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tỉ lệ mượn sách theo thể loại</h3>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={dynamicGenreChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2}>
                    {dynamicGenreChart.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [`${v} lượt`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              {(() => {
                const total = dynamicGenreChart.reduce((s, d) => s + d.value, 0);
                return dynamicGenreChart.map((item, i) => {
                  const pct = item.percentage ?? (total > 0 ? Math.round((item.value / total) * 100) : 0);
                  return (
                    <div key={i} className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-600 truncate">{item.name}</span>
                      <span className="text-xs font-semibold text-gray-800 ml-auto flex-shrink-0">{pct}%</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Tỉ lệ giới tính người dùng
                
              </h3>
              <DonutWithLegend data={dynamicGenderDistribution} loading={loadingOverview} height={220} />
            </div>
            <ChartCard title="Lượt mượn theo ngày trong tuần" loading={loadingHeatmap} height={150} className="flex-1">
              <AreaChart data={loanHeatmap} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradDay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#378ADD" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#378ADD" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" name="Số lượt mượn" stroke="#378ADD" strokeWidth={2} fill="url(#gradDay)" dot={{ r: 3, fill: "#378ADD", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ChartCard>
          </div>
        </div>


        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 mb-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tỉ lệ lý do phạt</h3>
            <DonutWithLegend data={fineReasonData} loading={loadingFineReasons} height={240} />
          </div>
          <ChartCard
            title="Số lượng đăng ký gói theo tháng"
            legend={[{ color: "#378ADD", label: "Đăng ký mới" }]}
            loading={loadingSubscriptionsReport}
            height={240}
          >
            <AreaChart data={safeSubscriptionsReport.monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#378ADD" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#378ADD" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="newCount" name="Đăng ký mới" stroke="#378ADD" strokeWidth={2} fill="url(#gradSubs)" dot={{ r: 3, fill: "#378ADD", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ChartCard>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tỉ lệ đăng ký theo loại gói</h3>
            <DonutWithLegend
              data={safeSubscriptionsReport.planDistribution?.length > 0 ? safeSubscriptionsReport.planDistribution : fallbackPlanDistribution}
              loading={loadingSubscriptionsReport}
              height={240}
            />
          </div>
        </div>
      </div>
    </>
  );
}