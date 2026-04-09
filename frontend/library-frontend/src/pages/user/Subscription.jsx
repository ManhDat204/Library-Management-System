import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── HELPERS ──────────────────────────────────────────────────
const fmtPrice = (price, currency) => {
  if (!price || price <= 0) return "Miễn phí";
  return Number(price).toLocaleString("vi-VN") + (currency ? ` ${currency}` : "₫");
};

const fmtDuration = (days) => {
  if (!days) return "—";
  if (days % 365 === 0) return `${days / 365} năm`;
  if (days % 30 === 0)  return `${days / 30} tháng`;
  return `${days} ngày`;
};

// ─── TOAST ────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      background: "#1a1a1a", color: "#f5f0e8", padding: "12px 20px",
      borderRadius: 12, fontSize: "0.85rem", fontFamily: "'DM Sans',sans-serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "slideUp 0.3s ease",
    }}>
      <span style={{ color: type === "error" ? "#e85d3f" : "#22c55e" }}>
        {type === "error" ? "✕" : "✓"}
      </span>
      {message}
    </div>
  );
};

// ─── CANCEL CONFIRM MODAL ─────────────────────────────────────
const CancelModal = ({ planName, onConfirm, onClose, cancelling }) => {
  const [reason, setReason] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, padding: "2rem",
        maxWidth: 420, width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        fontFamily: "'DM Sans',sans-serif",
        animation: "slideUp 0.25s ease",
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⚠️</div>
        <h3 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "1.15rem", fontWeight: 800, color: "#1a1a1a",
          margin: "0 0 8px",
        }}>Hủy gói "{planName}"?</h3>
        <p style={{ color: "#888", fontSize: "0.83rem", margin: "0 0 1.25rem", lineHeight: 1.6 }}>
          Sau khi hủy, bạn sẽ mất quyền mượn sách từ gói này. Hành động không thể hoàn tác.
        </p>

        <textarea
          placeholder="Lý do hủy (không bắt buộc)..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          style={{
            width: "100%", boxSizing: "border-box",
            border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10,
            padding: "10px 12px", fontSize: "0.83rem",
            fontFamily: "'DM Sans',sans-serif", color: "#1a1a1a",
            resize: "none", outline: "none", marginBottom: "1.25rem",
            background: "#fafafa",
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            disabled={cancelling}
            style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)",
              background: "#fff", color: "#1a1a1a", fontSize: "0.85rem", fontWeight: 600,
              cursor: cancelling ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Giữ lại
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={cancelling}
            style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "none",
              background: "#e85d3f", color: "#fff", fontSize: "0.85rem", fontWeight: 700,
              cursor: cancelling ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: cancelling ? 0.7 : 1,
            }}
          >
            {cancelling ? (
              <>
                <span style={{
                  width: 12, height: 12,
                  border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  borderRadius: "50%", display: "inline-block",
                  animation: "spin 0.6s linear infinite",
                }} />
                Đang hủy...
              </>
            ) : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PLAN CARD ────────────────────────────────────────────────
const PlanCard = ({ plan, isCurrent, onSubscribe, onCancelRequest, subscribingId }) => {
  const busy = subscribingId === plan.id;

  const rows = [
    ["Thời hạn",             fmtDuration(plan.durationDays)],
    ["Số sách được mượn",    plan.maxBooksAllowed != null ? `${plan.maxBooksAllowed} cuốn` : "—"],
    ["Thời hạn mỗi cuốn",   plan.maxDaysPerBook  != null ? `${plan.maxDaysPerBook} ngày`  : "—"],
  ].filter(([, v]) => v && v !== "—");

  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: isCurrent ? "2px solid #1a1a1a" : "1px solid rgba(0,0,0,0.08)",
      padding: "1.5rem", display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans',sans-serif", position: "relative",
    }}>
      {/* Featured / badge text */}
      {(plan.isFeatured || plan.badgeText) && (
        <div style={{
          position: "absolute", top: -1, right: 18,
          background: "#1a1a1a", color: "#f5f0e8",
          fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em",
          textTransform: "uppercase", padding: "4px 12px",
          borderRadius: "0 0 10px 10px",
        }}>
          {plan.badgeText || "Nổi bật"}
        </div>
      )}

      {/* Name + current badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <h3 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "1.1rem", fontWeight: 800, color: "#1a1a1a", margin: 0,
        }}>{plan.name}</h3>
        
      </div>

      {/* Plan code */}
      {plan.planCode && (
        <div style={{ fontSize: "0.7rem", color: "#ccc", marginBottom: 10, letterSpacing: "0.05em" }}>
          #{plan.planCode}
        </div>
      )}

      {/* Price */}
      <div style={{ marginBottom: "1.25rem" }}>
        <span style={{
          fontSize: "1.7rem", fontWeight: 800, color: "#c8956c",
          fontFamily: "'Playfair Display',serif", lineHeight: 1,
        }}>{fmtPrice(plan.price, plan.currency)}</span>
        {plan.durationDays >= 30 && plan.price > 0 && (
          <span style={{ fontSize: "0.75rem", color: "#bbb", marginLeft: 8 }}>
            /{fmtDuration(plan.durationDays)}
          </span>
        )}
      </div>

      {/* Info rows */}
      <div style={{ flex: 1, borderTop: "1px solid rgba(0,0,0,0.06)", marginBottom: "1.25rem" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)",
            fontSize: "0.83rem",
          }}>
            <span style={{ color: "#999" }}>{label}</span>
            <span style={{ color: "#1a1a1a", fontWeight: 600 }}>{value}</span>
          </div>
        ))}
        {plan.description && (
          <p style={{ fontSize: "0.78rem", color: "#aaa", margin: "10px 0 0", lineHeight: 1.6 }}>
            {plan.description}
          </p>
        )}
      </div>

      {/* Subscribe / Cancel buttons */}
      {isCurrent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Đang sử dụng — disabled */}
          <button disabled style={{
            width: "100%", border: "none", borderRadius: 10, padding: "11px",
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", fontWeight: 700,
            cursor: "not-allowed",
            background: "rgba(0,0,0,0.05)", color: "#aaa",
          }}>
            ✓ Đang sử dụng
          </button>
          {/* Nút hủy gói */}
          <button
            onClick={() => onCancelRequest(plan)}
            style={{
              width: "100%", border: "1px solid rgba(232,93,63,0.25)", borderRadius: 10,
              padding: "9px",
              fontFamily: "'DM Sans',sans-serif", fontSize: "0.83rem", fontWeight: 600,
              cursor: "pointer",
              background: "rgba(232,93,63,0.05)", color: "#e85d3f",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(232,93,63,0.12)";
              e.currentTarget.style.borderColor = "rgba(232,93,63,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(232,93,63,0.05)";
              e.currentTarget.style.borderColor = "rgba(232,93,63,0.25)";
            }}
          >
            Hủy gói
          </button>
        </div>
      ) : (
        <button
          disabled={busy || plan.isActive === false}
          onClick={() => onSubscribe(plan)}
          style={{
            width: "100%", border: "none", borderRadius: 10, padding: "11px",
            fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", fontWeight: 700,
            cursor: (busy || plan.isActive === false) ? "not-allowed" : "pointer",
            background: plan.isActive === false ? "rgba(0,0,0,0.04)" : "#1a1a1a",
            color: plan.isActive === false ? "#aaa" : "#f5f0e8",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.2s",
          }}
        >
          {busy ? (
            <>
              <span style={{
                width: 13, height: 13,
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                borderRadius: "50%", display: "inline-block",
                animation: "spin 0.6s linear infinite",
              }} />
              Đang xử lý...
            </>
          ) : plan.isActive === false ? "Không khả dụng" : "Đăng ký"}
        </button>
      )}
    </div>
  );
};


const getUserIdFromStorage = () => {
  return localStorage.getItem("userId") ?? null;
};

// ─── MAIN ─────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const [plans, setPlans]                         = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [currentPlanId, setCurrentPlanId]         = useState(null);
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState(null); // ← MỚI
  const [subscribingId, setSubscribingId]         = useState(null);
  const [toast, setToast]                         = useState(null);
  const [cancelTarget, setCancelTarget]           = useState(null); // plan đang chờ xác nhận hủy
  const [cancelling, setCancelling]               = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const res = await api.get("/subscriptions/user/active");
      setCurrentPlanId(res.data?.planId ?? null);
      setCurrentSubscriptionId(res.data?.id ?? null); // ← lưu subscriptionId
    } catch {
      setCurrentPlanId(null);
      setCurrentSubscriptionId(null);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get("/subscription-plans");
      const data = res.data || [];
      const sorted = [...data].sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
      setPlans(sorted);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách gói.");
    } finally { setLoading(false); }
  };

  // ─── HỦY GÓI ────────────────────────────────────────────────
  const handleCancelRequest = (plan) => {
    setCancelTarget(plan);
  };

  const handleCancelConfirm = async (reason) => {
    if (!currentSubscriptionId) return;
    setCancelling(true);
    try {
      await api.post(
        `/subscriptions/cancel/${currentSubscriptionId}`,
        null,
        { params: reason ? { reason } : {} }
      );
      setCurrentPlanId(null);
      setCurrentSubscriptionId(null);
      setCancelTarget(null);
      setToast({ message: "Đã hủy gói thành công.", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Hủy gói thất bại.", type: "error" });
    } finally { setCancelling(false); }
  };

  // ─── ĐĂNG KÝ GÓI ────────────────────────────────────────────
  const handleSubscribe = async (plan) => {
    if (subscribingId !== null) return;

    const userId = getUserIdFromStorage();
    if (!userId) {
      setToast({ message: "Vui lòng đăng nhập lại.", type: "error" });
      return;
    }

    setSubscribingId(plan.id);
    try {
      const subRes = await api.post("/subscriptions/subscribe", {
        userId: Number(userId),
        planId: plan.id,
      });

      const notes = subRes.data?.notes ?? "";
      const match = notes.match(/paymentId=(\d+)/);
      if (!match) {
        const directPaymentId = subRes.data?.paymentId;
        if (!directPaymentId) {
          setToast({ message: "Không lấy được paymentId. Kiểm tra backend trả về notes.", type: "error" });
          return;
        }
        const urlRes2 = await api.get(`/payments/${directPaymentId}/url`);
        const url2 = urlRes2.data?.message;
        if (url2 && url2.startsWith("http")) { window.location.href = url2; return; }
        setToast({ message: "Không thể tạo link thanh toán.", type: "error" });
        return;
      }
      const paymentId = match[1];

      const urlRes = await api.get(`/payments/${paymentId}/url`);
      const paymentUrl = urlRes.data?.message;

      if (paymentUrl && paymentUrl.startsWith("http")) {
        window.location.href = paymentUrl;
        return;
      }

      setToast({ message: "Không thể tạo link thanh toán.", type: "error" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Đăng ký thất bại.", type: "error" });
    } finally { setSubscribingId(null); }
  };

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        .skeleton {
          background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 12px;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem",
        fontFamily: "'DM Sans',sans-serif",
      }}>

        {/* Header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.65rem", fontWeight: 800, color: "#1a1a1a", margin: "0 0 5px",
          }}>Gói đăng ký</h1>
          <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0 }}>
            Chọn gói phù hợp để bắt đầu mượn sách
          </p>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "1.25rem" }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 300 }} />
            ))}
          </div>
        ) : error ? (
          <div style={{
            background: "#fff", borderRadius: 14, padding: "2.5rem",
            textAlign: "center", border: "1px solid rgba(0,0,0,0.06)",
          }}>
            <p style={{ color: "#e85d3f", marginBottom: "1rem", fontSize: "0.88rem" }}>⚠ {error}</p>
            <button onClick={fetchPlans} style={{
              background: "#1a1a1a", color: "#f5f0e8", border: "none",
              borderRadius: 10, padding: "9px 22px", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.85rem",
            }}>Thử lại</button>
          </div>
        ) : plans.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 14, padding: "3rem",
            textAlign: "center", border: "1px solid rgba(0,0,0,0.06)",
            color: "#ccc", fontSize: "0.88rem",
          }}>Hiện chưa có gói nào.</div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
            gap: "1.25rem",
          }}>
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={currentPlanId === plan.id}
                onSubscribe={handleSubscribe}
                onCancelRequest={handleCancelRequest}
                subscribingId={subscribingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal xác nhận hủy */}
      {cancelTarget && (
        <CancelModal
          planName={cancelTarget.name}
          onConfirm={handleCancelConfirm}
          onClose={() => !cancelling && setCancelTarget(null)}
          cancelling={cancelling}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}