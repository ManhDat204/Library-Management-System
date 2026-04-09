import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Detect loại thanh toán từ txnRef ────────────────────────
const detectPaymentType = (txnRef = "") => {
  if (txnRef.startsWith("SUBS")) return "SUBSCRIPTION";
  if (txnRef.startsWith("FINE")) return "FINE";
  return "WALLET";
};

// ─── Config UI + navigation theo từng loại ───────────────────
const TYPE_CONFIG = {
  WALLET: {
    successTitle:  "Nạp tiền thành công!",
    successMsg:    "Số tiền đã được cộng vào ví của bạn.",
    successIcon:   "💳",
    primaryLabel:  "Về ví của tôi →",
    primaryPath:   "/home/wallet",
    failedRetryPath: "/home/wallet",
  },
  SUBSCRIPTION: {
    successTitle:  "Đăng ký thành công!",
    successMsg:    "Gói đăng ký của bạn đã được kích hoạt.",
    successIcon:   "🎉",
    primaryLabel:  "Xem gói đăng ký →",
    primaryPath:   "/home/subscription",
    failedRetryPath: "/home/subscription",
  },
  FINE: {
    successTitle:  "Thanh toán phạt thành công!",
    successMsg:    "Khoản phạt đã được thanh toán. Cảm ơn bạn!",
    successIcon:   "✅",
    primaryLabel:  "Xem lịch sử phạt →",
    primaryPath:   "/home/fines",
    failedRetryPath: "/home/fines",
  },
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const [status,  setStatus]  = useState("loading");
  const [message, setMessage] = useState("");
  const [payType, setPayType] = useState("WALLET");

  // ✅ Chặn React StrictMode gọi 2 lần
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;
    handleVnPayReturn();
  }, []);

  const handleVnPayReturn = async () => {
    try {
      const params = {};
      searchParams.forEach((value, key) => { params[key] = value; });

      const responseCode = params["vnp_ResponseCode"];
      const txnRef       = params["vnp_TxnRef"] || "";
      const type         = detectPaymentType(txnRef);
      setPayType(type);

      // ✅ Chỉ gọi 1 lần duy nhất
      await api.post("/payments/vnpay-verify", params);

      if (responseCode === "00") {
        // Kích hoạt subscription nếu cần
        if (type === "SUBSCRIPTION") {
          const match = txnRef.match(/^SUBS(\d+)-/);
          if (match) {
            try {
              const subscriptionId = match[1];
              const paymentRes = await api.get("/payments", {
                params: { page: 0, size: 10, sortBy: "createdAt", sortDir: "DESC" },
              });
              const payments = paymentRes.data?.content || [];
              const payment  = payments.find((p) => p.txnRef === txnRef);
              if (payment) {
                await api.post("/subscriptions/activate", null, {
                  params: { subscriptionId, paymentId: payment.id },
                });
              }
            } catch (e) {
              console.warn("Activate subscription failed:", e);
            }
          }
        }

        setStatus("success");
      } else {
        setStatus("failed");
        setMessage(`Thanh toán thất bại. Mã lỗi: ${responseCode}`);
      }
    } catch (err) {
      setStatus("failed");
      setMessage(err.response?.data?.message || "Có lỗi xảy ra khi xác nhận thanh toán.");
    }
  };

  const cfg = TYPE_CONFIG[payType];

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
      `}</style>

      <div style={{
        minHeight: "60vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "2rem",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "3rem 2.5rem",
          textAlign: "center", maxWidth: 420, width: "100%",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          animation: "fadeUp 0.4s ease both",
        }}>

          {/* ── Loading ── */}
          {status === "loading" && (
            <>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "3px solid rgba(0,0,0,0.08)", borderTopColor: "#1a1a1a",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1.5rem",
              }} />
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.25rem", color: "#1a1a1a", margin: "0 0 8px",
              }}>
                Đang xác nhận thanh toán...
              </h2>
              <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0 }}>
                Vui lòng không đóng trang này
              </p>
            </>
          )}

          {/* ── Success ── */}
          {status === "success" && (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(34,197,94,0.1)", border: "2px solid #22c55e",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.5rem",
                animation: "checkPop 0.4s cubic-bezier(0.34,1.4,0.64,1) both",
              }}>
                <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{cfg.successIcon}</span>
              </div>

              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.35rem", color: "#1a1a1a", margin: "0 0 10px",
              }}>
                {cfg.successTitle}
              </h2>

              <p style={{ color: "#777", fontSize: "0.88rem", margin: "0 0 2rem", lineHeight: 1.6 }}>
                {cfg.successMsg}
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                {/* Nút chính: về đúng trang theo loại thanh toán */}
                <button
                  onClick={() => navigate(cfg.primaryPath)}
                  style={{
                    flex: 1, background: "#1a1a1a", color: "#f5f0e8",
                    border: "none", borderRadius: 12, padding: "13px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {cfg.primaryLabel}
                </button>

                {/* Nút phụ: luôn về trang chủ */}
                <button
                  onClick={() => navigate("/home")}
                  style={{
                    flex: 1, background: "rgba(0,0,0,0.05)", color: "#555",
                    border: "none", borderRadius: 12, padding: "13px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.88rem", cursor: "pointer",
                  }}
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}

          {/* ── Failed ── */}
          {status === "failed" && (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(232,93,63,0.1)", border: "2px solid #e85d3f",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}>
                <span style={{ color: "#e85d3f", fontSize: "1.75rem", lineHeight: 1 }}>✕</span>
              </div>

              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.35rem", color: "#1a1a1a", margin: "0 0 10px",
              }}>
                Thanh toán thất bại
              </h2>

              <p style={{ color: "#777", fontSize: "0.88rem", margin: "0 0 2rem", lineHeight: 1.6 }}>
                {message}
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                {/* Nút thử lại: về đúng trang để thanh toán lại */}
                <button
                  onClick={() => navigate(cfg.failedRetryPath)}
                  style={{
                    flex: 1, background: "#1a1a1a", color: "#f5f0e8",
                    border: "none", borderRadius: 12, padding: "13px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.88rem", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Thử lại
                </button>

                <button
                  onClick={() => navigate("/home")}
                  style={{
                    flex: 1, background: "rgba(0,0,0,0.05)", color: "#555",
                    border: "none", borderRadius: 12, padding: "13px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.88rem", cursor: "pointer",
                  }}
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}