import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

// ─── API CONFIG ────────────────────────────────────────────────
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── CONSTANTS ─────────────────────────────────────────────────
const PRESETS = [50000, 100000, 200000, 500000];

const TX_STYLE = {
  DEPOSIT:        { label: "Nạp tiền",  color: "text-emerald-600" },
  WALLET_DEPOSIT: { label: "Nạp tiền",  color: "text-emerald-600" },
  SUBSCRIPTION:   { label: "Đăng ký",   color: "text-amber-600"   },
  LOAN:           { label: "Thuê sách", color: "text-gray-500"    },
  REFUND:         { label: "Hoàn tiền", color: "text-sky-600"     },
  LOCK:           { label: "Khóa cọc",  color: "text-rose-600"    }, 
  UNLOCK:         { label: "Hoàn cọc",  color: "text-emerald-600" },
  PENALTY:        { label: "Chi phi thuê",   color: "text-rose-600"    },
};
const DEFAULT_TX_STYLE = { label: "Giao dịch", color: "text-gray-400" };

// ─── HELPERS ───────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Math.abs(n ?? 0));

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

// ─── TOAST ─────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-zinc-900 text-zinc-100 px-5 py-3 rounded-2xl shadow-2xl">
      <span className={type === "error" ? "text-red-400" : "text-emerald-400"}>
        {type === "error" ? "✕" : "✓"}
      </span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// ─── SKELETON ──────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-48 bg-zinc-100 rounded" />
      <div className="h-3 w-24 bg-zinc-100 rounded" />
    </div>
    <div className="h-4 w-20 bg-zinc-100 rounded" />
  </div>
);

// ─── MAIN PAGE ─────────────────────────────────────────────────
export default function WalletPage() {
  const [balance,       setBalance]       = useState(null);
  const [transactions,  setTransactions]  = useState([]);
  const [txPage,        setTxPage]        = useState(0);
  const [txTotalPages,  setTxTotalPages]  = useState(1);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTx,     setLoadingTx]     = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);

  const [preset,     setPreset]     = useState(null);
  const [custom,     setCustom]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [toast,      setToast]      = useState(null);

  // ✅ Chặn StrictMode double-invoke
  const hasFetched = useRef(false);

  const amount = preset ?? (custom ? Number(custom) : null);

  // ── Fetch balance ─────────────────────────────────────────
  const fetchWallet = useCallback(async () => {
    setLoadingWallet(true);
    try {
      const res = await api.get("/wallet/me");
      setBalance(res.data.balance ?? 0);
    } catch (err) {
      console.error("fetchWallet error:", err);
      setToast({ message: "Không tải được số dư", type: "error" });
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  // ── Fetch transactions ────────────────────────────────────
  const fetchTransactions = useCallback(async (page = 0, append = false) => {
    append ? setLoadingMore(true) : setLoadingTx(true);
    try {
      const res = await api.get("/wallet/me/transactions", {
        params: { page, size: 10 },
      });
      const data = res.data;
      const list = data.content ?? data;
      setTransactions((prev) => append ? [...prev, ...list] : list);
      setTxTotalPages(data.totalPages ?? 1);
      setTxPage(data.number ?? page);
    } catch (err) {
      console.error("fetchTransactions error:", err);
      setToast({ message: "Không tải được lịch sử giao dịch", type: "error" });
    } finally {
      append ? setLoadingMore(false) : setLoadingTx(false);
    }
  }, []);

  // ✅ Chỉ chạy 1 lần duy nhất, kể cả khi StrictMode
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchWallet();
    fetchTransactions(0);
  }, [fetchWallet, fetchTransactions]);

  // ── Deposit ───────────────────────────────────────────────
  const handleDeposit = () => {
    if (!amount || amount < 10000) {
      setToast({ message: "Số tiền tối thiểu là 10.000 ₫", type: "error" });
      return;
    }
    setShowModal(true);
  };

  const confirmDeposit = async () => {
    setDepositing(true);
    try {
      const res = await api.post("/wallet/deposit", { amount });
      const vnpayUrl = res.data.message ?? res.data.url;
      setShowModal(false);
      setPreset(null);
      setCustom("");
      window.location.href = vnpayUrl;
    } catch (err) {
      console.error("deposit error:", err.response ?? err);
      setShowModal(false);
      setToast({ message: "Tạo lệnh nạp tiền thất bại, thử lại sau", type: "error" });
    } finally {
      setDepositing(false);
    }
  };

  const loadMore = () => fetchTransactions(txPage + 1, true);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="py-10 max-w-2xl mx-auto px-2">

      {/* Title */}
      <h1 className="text-2xl font-black text-gray-900 mb-6"
        style={{ fontFamily: "'Playfair Display', serif" }}>
        Ví của tôi
      </h1>

      {/* Balance */}
      <div className="rounded-2xl border border-zinc-100 bg-white px-6 py-5 mb-6 flex items-center justify-between shadow-sm">
        <p className="text-sm text-zinc-400">Số dư</p>
        {loadingWallet
          ? <div className="h-7 w-32 bg-zinc-100 rounded-lg animate-pulse" />
          : <p className="text-2xl font-bold text-zinc-900"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {fmt(balance)}
            </p>
        }
      </div>

      {/* Deposit */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 mb-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Nạp tiền</p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {PRESETS.map((p) => (
            <button key={p}
              onClick={() => { setPreset(p); setCustom(""); }}
              className={`py-2 rounded-xl text-sm font-semibold border transition-all
                ${preset === p
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"}`}>
              {fmt(p)}
            </button>
          ))}
        </div>

        <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 mb-4 transition-all
          ${custom ? "border-zinc-900" : "border-zinc-200"}"}`}>
          <span className="text-sm text-zinc-400">₫</span>
          <input
            type="number"
            placeholder="Nhập số tiền khác..."
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setPreset(null); }}
            className="flex-1 bg-transparent outline-none text-sm text-zinc-800 placeholder-zinc-300"
          />
        </div>

        <button onClick={handleDeposit}
          className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all
            ${amount
              ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:-translate-y-0.5 shadow-md shadow-zinc-100"
              : "bg-zinc-100 text-zinc-300 cursor-not-allowed"}`}>
          Nạp tiền qua VNPay →
        </button>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-zinc-100 bg-white overflow-hidden shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-6 pt-5 pb-4 border-b border-zinc-100">
          Lịch sử giao dịch
        </p>

        <div className="divide-y divide-zinc-50">
          {loadingTx
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            : transactions.length === 0
              ? <p className="text-sm text-zinc-300 text-center py-12">Chưa có giao dịch nào.</p>
              : transactions.map((tx) => {
                  const type = tx.type ?? tx.transactionType ?? tx.paymentType ?? "";
                  const rawDesc = tx.description ?? tx.desc ?? tx.note ?? "—";
                  const desc = rawDesc.replace(/\s*-\s*TxnRef:\s*\S+/i, "").trim();
                  const amt  = tx.amount ?? 0;
                  const date = fmtDate(tx.createdAt ?? tx.date);
                  const isNegative = amt < 0 || type === "LOCK" || type === "PENALTY" || type === "SUBSCRIPTION";
                  const s    = TX_STYLE[type] ?? DEFAULT_TX_STYLE;
                  return (
                    <div key={tx.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">{desc}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[11px] font-semibold ${s.color}`}>{s.label}</span>
                          <span className="text-zinc-200 text-xs">•</span>
                          <span className="text-[11px] text-zinc-400">{date}</span>
                        </div>
                      </div>
                      <p className={`text-base font-black flex-shrink-0
                          ${isNegative ? "text-zinc-700" : "text-emerald-600"}`}
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        {isNegative ? "−" : "+"}{fmt(amt)} 
                      </p>
                    </div>
                  );
                })
          }
        </div>

        {!loadingTx && txPage + 1 < txTotalPages && (
          <div className="px-6 py-4 border-t border-zinc-50 text-center">
            <button onClick={loadMore} disabled={loadingMore}
              className="text-xs font-bold text-zinc-400 hover:text-amber-600 uppercase tracking-wider transition-colors disabled:opacity-40">
              {loadingMore ? "Đang tải…" : "Xem thêm →"}
            </button>
          </div>
        )}
      </div>

      
      {showModal && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => !depositing && setShowModal(false)}>
          <div className="bg-white rounded-2xl p-9 w-80 shadow-2xl text-center"
            style={{ animation: "slideUp .2s ease" }}
            onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-black text-zinc-900 mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Xác nhận nạp tiền
            </p>
            <p className="text-2xl text-black my-4">{fmt(amount)}</p>
            <p className="text-xs text-zinc-400 mb-6">Bạn sẽ được chuyển đến cổng thanh toán VNPay.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} disabled={depositing}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-sm font-medium py-2.5 rounded-full transition-all disabled:opacity-40">
                Huỷ
              </button>
              <button onClick={confirmDeposit} disabled={depositing}
                className="flex-1 bg-zinc-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5 rounded-full transition-all hover:-translate-y-0.5 disabled:opacity-60">
                {depositing ? "Đang xử lý…" : "Tiếp tục"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}