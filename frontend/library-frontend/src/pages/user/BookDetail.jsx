import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ─── API CONFIG ───────────────────────────────────────────────
const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── CONSTANTS ────────────────────────────────────────────────
const COVER_COLORS = [
  "#1a1a2e","#2d1b00","#0d2137","#1a2e1a",
  "#2e1a2e","#2e2200","#1e2e20","#2e1e1e",
];

const STATUS_CONFIG = {
  ACTIVE:    { label: "Đang mượn",  textClass: "text-blue-500",  bgClass: "bg-blue-50"  },
  OVERDUE:   { label: "Quá hạn",    textClass: "text-red-500",   bgClass: "bg-red-50"   },
  RETURNED:  { label: "Đã trả",     textClass: "text-green-500", bgClass: "bg-green-50" },
  LOST:      { label: "Mất sách",   textClass: "text-gray-400",  bgClass: "bg-gray-100" },
  CANCELLED: { label: "Đã huỷ",     textClass: "text-gray-400",  bgClass: "bg-gray-100" },
  CHECK_OUT: { label: "Đang mượn",  textClass: "text-blue-500",  bgClass: "bg-blue-50"  },
};

const TYPE_CONFIG = {
  PHYSICAL: { label: "Sách vật lý",  icon: "◈" },
  DIGITAL:  { label: "Sách điện tử", icon: "◎" },
  CHECKOUT: { label: "Sách vật lý",  icon: "◈" },
};

// ─── BOOK COVER ───────────────────────────────────────────────
const BookCoverLarge = ({ book }) => {
  const color = COVER_COLORS[book.id % COVER_COLORS.length];
  const initials = book.title.split(" ").slice(0, 2).map((w) => w[0]).join("");

  if (book.coverImageUrl) {
    return (
      <img
        src={book.coverImageUrl}
        alt={book.title}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.style.display = "none"; }}
      />
    );
  }

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(145deg, ${color} 0%, ${color}bb 50%, #000 100%)` }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,0.02) 3px,rgba(255,255,255,0.02) 6px)",
        }}
      />
      <span
        className="font-black leading-none"
        style={{
          fontFamily: "'Playfair Display',Georgia,serif",
          fontSize: "5rem",
          color: "rgba(255,255,255,0.12)",
          letterSpacing: "-0.03em",
        }}
      >
        {initials}
      </span>
      <span
        className="absolute bottom-5 left-5 right-5 text-center uppercase tracking-widest text-xs"
        style={{ fontFamily: "'Playfair Display',Georgia,serif", color: "rgba(255,255,255,0.35)" }}
      >
        {book.genreName || "—"}
      </span>
    </div>
  );
};

// ─── HEART BUTTON (top-left of cover) ────────────────────────
const HeartButton = ({ isInWishlist, busy, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    disabled={busy}
    className={`absolute top-2 left-2 z-10 w-9 h-9 rounded-xl flex items-center justify-center border-0 cursor-pointer transition-all duration-200 backdrop-blur-sm
      ${busy ? "opacity-60 cursor-not-allowed" : "hover:scale-110 active:scale-95"}
      ${isInWishlist
        ? "bg-rose-500 bg-opacity-90 shadow-lg"
        : "bg-black bg-opacity-50 hover:bg-opacity-70"
      }`}
    title={isInWishlist ? "Bỏ khỏi wishlist" : "Thêm vào wishlist"}
  >
    {busy ? (
      <span className="w-3.5 h-3.5 border-2 border-white border-opacity-40 border-t-white rounded-full animate-spin" />
    ) : (
      <svg
        viewBox="0 0 24 24"
        className={`w-4 h-4 transition-all duration-200 ${
          isInWishlist ? "text-white fill-current" : "text-white"
        }`}
        fill={isInWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={isInWishlist ? "0" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )}
  </button>
);

// ─── RATING OVERLAY (top-right of cover) ─────────────────────
const RatingOverlay = ({ rating }) => {
  if (!rating || rating.totalReviews === 0) return null;
  return (
    <div className="absolute top-2 right-2 z-10 bg-black bg-opacity-60 backdrop-blur-sm rounded-xl px-2 py-1 flex items-center gap-1">
      <span className="text-xs font-bold text-white leading-none">
        {rating.averageRating.toFixed(1)}
      </span>
      <span className="text-yellow-400 text-xs">★</span>
    </div>
  );
};

// ─── INFO ROW ─────────────────────────────────────────────────
const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-sm text-gray-700 font-semibold text-right max-w-xs">{value}</span>
    </div>
  );
};

// ─── LOAN CARD ────────────────────────────────────────────────
const LoanCard = ({ loan }) => {
  const status = STATUS_CONFIG[loan.bookLoanStatus] || STATUS_CONFIG[loan.status] || STATUS_CONFIG.ACTIVE;
  const type   = TYPE_CONFIG[loan.bookLoanType] || TYPE_CONFIG.PHYSICAL;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.textClass} ${status.bgClass}`}>
          {status.label}
        </span>
        <span className="text-xs text-gray-400">{type.icon} {type.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
        <div><span className="text-gray-300">Mượn: </span>{loan.checkoutDate ? `${loan.checkoutDate}${loan.checkoutTime ? ` ${loan.checkoutTime}` : ""}` : "—"}</div>
        <div>
          <span className="text-gray-300">Hạn: </span>
          <span className={loan.isOverdue ? "text-red-500" : ""}>{loan.dueDate || "—"}</span>
        </div>
        {loan.returnDate && (
          <div><span className="text-gray-300">Trả: </span>{loan.returnDate}</div>
        )}
        {loan.remainingDays != null && !loan.returnDate && (
          <div>
            <span className="text-gray-300">Còn: </span>
            <span className={`font-bold ${loan.isOverdue ? "text-red-500" : "text-green-500"}`}>
              {loan.isOverdue
                ? `Quá ${Math.abs(loan.overdueDays)} ngày`
                : `${loan.remainingDays} ngày`}
            </span>
          </div>
        )}
        {loan.renewalCount > 0 && (
          <div><span className="text-gray-300">Gia hạn: </span>{loan.renewalCount}/{loan.maxRenewals} lần</div>
        )}
        {loan.fineAmount > 0 && (
          <div className="col-span-2">
            <span className="text-gray-300">Phạt: </span>
            <span className="text-red-500 font-bold">
              {Number(loan.fineAmount).toLocaleString("vi-VN")}₫
              {loan.finePaid ? " (đã trả)" : " (chưa trả)"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── TOAST ────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);

  const iconClass =
    type === "error"  ? "text-red-400"  :
    type === "remove" ? "text-gray-400" : "text-green-400";
  const icon =
    type === "error"  ? "✕" :
    type === "remove" ? "♡" : "✓";

  return (
    <div className="fixed bottom-8 right-8 z-50 bg-gray-900 text-amber-50 px-5 py-3 rounded-2xl text-sm shadow-2xl flex items-center gap-3 max-w-xs animate-fadeDown">
      <span className={`text-lg ${iconClass}`}>{icon}</span>
      <span>{message}</span>
    </div>
  );
};

// ─── LOAN MODAL ───────────────────────────────────────────────
const LoanModal = ({ book, onClose, onSuccess }) => {
  const [notes, setNotes]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [checkoutDays, setCheckoutDays] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await api.get("/subscriptions/my-active");
        const days =
          res.data?.loanDurationDays ??
          res.data?.checkoutDays ??
          res.data?.durationDays ??
          res.data?.plan?.loanDurationDays ??
          7;
        setCheckoutDays(days);
      } catch {
        setCheckoutDays(7);
      } finally {
        setSubLoading(false);
      }
    };
    fetchSub();
  }, []);

  const today   = new Date();
  const dueDate = new Date(today);
  if (checkoutDays) dueDate.setDate(today.getDate() + checkoutDays);
  const fmt = (d) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const handleConfirm = async () => {
    try {
      setLoading(true); setError(null);
      await api.post("/book-loans/checkout", {
        bookId: book.id,
        checkoutDays,
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tạo phiếu mượn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative px-7 py-6"
          style={{ background: "linear-gradient(135deg, #1a1a2e, #2d1b00)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white bg-opacity-10 border-0 text-white cursor-pointer text-sm hover:bg-opacity-20 transition-all"
          >
            ✕
          </button>
          <p className="text-white text-opacity-50 text-xs uppercase tracking-widest mb-1">
            Xác nhận mượn sách
          </p>
          <h2
            className="text-white text-xl font-bold leading-tight m-0"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            {book.title}
          </h2>
          <p className="text-white text-opacity-50 text-sm mt-1 mb-0">{book.authorName}</p>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {subLoading ? (
            <div className="bg-gray-50 rounded-xl px-5 py-4 mb-5 flex items-center justify-center gap-2 text-gray-400 text-sm">
              <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
              Đang tải thông tin gói...
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Ngày mượn</div>
                  <div className="text-sm font-bold text-gray-900">{fmt(today)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Hạn trả</div>
                  <div className="text-sm font-bold text-amber-600">{fmt(dueDate)}</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs text-blue-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1">
                ◷ Thời hạn: <strong className="ml-1">{checkoutDays} ngày</strong>
                <span className="mx-1 text-blue-300">·</span>
                theo gói của bạn
              </div>
            </div>
          )}

          <div className="mb-5">
            <div className="text-xs text-gray-400 font-semibold mb-2">Ghi chú (tuỳ chọn)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thêm ghi chú cho nhân viên thư viện..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-y outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-500 text-xs mb-4">
              ⚠ {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 border-0 rounded-xl py-3 cursor-pointer text-sm text-gray-500 hover:bg-gray-200 transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || subLoading}
              className={`flex-1 border-0 rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                loading || subLoading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-amber-50 cursor-pointer hover:bg-black"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : "Xác nhận mượn sách"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── RELATED BOOKS ────────────────────────────────────────────
const RelatedBooks = ({ genreId, currentBookId }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    if (!genreId) return;
    api
      .get("/books", { params: { genreId, activeOnly: true, page: 0, size: 6 } })
      .then((res) =>
        setBooks((res.data.content || []).filter((b) => b.id !== currentBookId).slice(0, 5))
      )
      .catch(() => {});
  }, [genreId, currentBookId]);

  if (!books.length) return null;

  return (
    <div className="mt-10">
      <h3
        className="text-lg font-bold text-gray-900 mb-4"
        style={{ fontFamily: "'Playfair Display',serif" }}
      >
        Sách cùng thể loại
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => navigate(`/home/books/${book.id}`)}
            className="flex-shrink-0 w-32 cursor-pointer transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="h-44 rounded-xl overflow-hidden shadow-md mb-2">
              {book.coverImageUrl ? (
                <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${COVER_COLORS[book.id % COVER_COLORS.length]}, #000)` }}
                >
                  <span
                    className="text-3xl font-black"
                    style={{ fontFamily: "'Playfair Display',serif", color: "rgba(255,255,255,0.15)" }}
                  >
                    {book.title.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </span>
                </div>
              )}
            </div>
            <div
              className="text-xs font-bold text-gray-900 leading-tight line-clamp-2"
              style={{ fontFamily: "'Playfair Display',serif" }}
            >
              {book.title}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{book.authorName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── STAR RATING ─────────────────────────────────────────────
const StarRating = ({ value, onChange, size = 22 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        onClick={() => onChange?.(s)}
        className={`leading-none transition-colors duration-150 select-none ${
          s <= value ? "text-yellow-400" : "text-gray-200"
        } ${onChange ? "cursor-pointer" : "cursor-default"}`}
        style={{ fontSize: size }}
      >
        ★
      </span>
    ))}
  </div>
);

// ─── REVIEWS TAB ─────────────────────────────────────────────
const ReviewsTab = ({ bookId }) => {
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [ratingData, setRatingData] = useState(null);

  const fetchReviews = async (p = 0) => {
    if (!bookId) return;
    try {
      setLoading(true); setFetchError(null);
      const [reviewRes, ratingRes] = await Promise.all([
        api.get(`/reviews/book/${bookId}`, { params: { page: p, size: 5 } }),
        api.get(`/reviews/book/${bookId}/rating`),
      ]);
      setReviews(reviewRes.data.content || []);
      setTotalPages(reviewRes.data.totalPages || 0);
      setRatingData(ratingRes.data);
      setPage(p);
    } catch (err) {
      setFetchError(err.response?.data?.message || "Không thể tải đánh giá.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (bookId) fetchReviews(0); }, [bookId]);

  return (
    <div>
      {ratingData && ratingData.totalReviews > 0 && (
        <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4 mb-5">
          <div className="text-center min-w-16">
            <div
              className="text-4xl font-black text-gray-900 leading-none"
              style={{ fontFamily: "'Playfair Display',serif" }}
            >
              {ratingData.averageRating.toFixed(1)}
            </div>
            <StarRating value={Math.round(ratingData.averageRating)} size={14} />
            <div className="text-xs text-gray-400 mt-1">{ratingData.totalReviews} đánh giá</div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((s) => {
              const count = reviews.filter((r) => r.rating === s).length;
              const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs text-gray-400 w-2">{s}</span>
                  <span className="text-xs text-yellow-400">★</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-300 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3 text-xs text-red-500 flex items-center justify-between">
          <span>⚠ {fetchError}</span>
          <button
            onClick={() => fetchReviews(0)}
            className="text-xs text-red-500 bg-transparent border border-red-200 rounded-md px-2 py-1 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-20 rounded-xl mb-2 bg-gray-100 animate-pulse" />
        ))
      ) : reviews.length === 0 && !fetchError ? (
        <div className="text-center py-10 text-gray-300">
          <div className="text-4xl mb-2">★</div>
          <p className="text-sm">Chưa có đánh giá nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #1a1a2e, #2d1b00)" }}
                >
                  {(review.userName || review.userFullName || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">
                        {review.userName || review.userFullName || "Ẩn danh"}
                      </span>
                      <span className="text-xs text-gray-300">
                        {review.createdAt?.substring(0, 10) || ""}
                      </span>
                    </div>
                    <StarRating value={review.rating} size={13} />
                  </div>
                  {review.reviewText && (
                    <p className="text-sm text-gray-500 leading-relaxed m-0 whitespace-pre-wrap">
                      {review.reviewText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => fetchReviews(page - 1)}
            disabled={page === 0}
            className={`px-3 py-1 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-500 transition-opacity ${
              page === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
            }`}
          >
            ← Trước
          </button>
          <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
          <button
            onClick={() => fetchReviews(page + 1)}
            disabled={page >= totalPages - 1}
            className={`px-3 py-1 rounded-lg border border-gray-200 bg-transparent text-xs text-gray-500 transition-opacity ${
              page >= totalPages - 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
            }`}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

// ─── SKELETON ────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
);

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function BookDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [book, setBook]                 = useState(null);
  const [loans, setLoans]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loansLoading, setLoansLoading] = useState(false);
  const [error, setError]               = useState(null);
  const [rating, setRating]             = useState(null);

  const [isInWishlist, setIsInWishlist]   = useState(false);
  const [wishlistBusy, setWishlistBusy]   = useState(false);
  const [reserveBusy, setReserveBusy]     = useState(false);

  const [toast, setToast]               = useState(null);
  const [visible, setVisible]           = useState(false);
  const [activeTab, setActiveTab]       = useState("info");

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    fetchBook();
    fetchWishlistStatus();
    fetchRating();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get(`/books/${id}`);
      setBook(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải thông tin sách.");
    } finally { setLoading(false); }
  };

  const fetchRating = async () => {
    try {
      const res = await api.get(`/reviews/book/${id}/rating`);
      setRating(res.data);
    } catch { setRating(null); }
  };

  const fetchWishlistStatus = async () => {
    try {
      const res = await api.get("/wishlist/my-wishlist", { params: { page: 0, size: 100 } });
      const items = res.data.content || [];
      setIsInWishlist(items.some((i) => i.book?.id === Number(id)));
    } catch {}
  };

  const fetchMyLoans = async () => {
    try {
      setLoansLoading(true);
      const res = await api.get("/book-loans/my-loans", { params: { bookId: id, page: 0, size: 10 } });
      setLoans(res.data.content || []);
    } catch { setLoans([]); }
    finally { setLoansLoading(false); }
  };

  const toggleWishlist = async () => {
    if (wishlistBusy) return;
    setWishlistBusy(true);
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/remove/${id}`);
        setIsInWishlist(false);
        setToast({ message: `Đã xoá "${book?.title}" khỏi wishlist`, type: "remove" });
      } else {
        await api.post(`/wishlist/add/${id}`);
        setIsInWishlist(true);
        setToast({ message: `Đã thêm "${book?.title}" vào wishlist`, type: "success" });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Thao tác thất bại", type: "error" });
    } finally { setWishlistBusy(false); }
  };

  const handleReserve = async () => {
    if (reserveBusy) return;
    setReserveBusy(true);
    try {
      await api.post("/reservations", { bookId: Number(id) });
      setToast({ message: "Đặt trước thành công! Chúng tôi sẽ thông báo khi sách có sẵn.", type: "success" });
      fetchBook();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Không thể đặt trước.", type: "error" });
    } finally { setReserveBusy(false); }
  };

  const handleLoanSuccess = () => {
    setShowLoanModal(false);
    setToast({ message: "Tạo phiếu mượn thành công!", type: "success" });
    fetchBook();
    if (activeTab === "loans") fetchMyLoans();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "loans" && loans.length === 0) fetchMyLoans();
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex gap-10 flex-wrap">
          <Skeleton className="w-64 h-96 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="px-8 py-16 text-center">
        <div className="text-5xl mb-4">◈</div>
        <p className="text-red-500 mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-900 text-amber-50 border-0 rounded-xl px-6 py-2 cursor-pointer text-sm hover:bg-black transition-colors"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  if (!book) return null;

  const avail     = book.availableCopies ?? 0;
  const total     = book.totalCopies ?? 0;
  const ratio     = total > 0 ? avail / total : 0;
  const canBorrow = avail > 0 && !book.alreadyHaveLoan;

  const availBarColor  = ratio === 0 ? "#ef4444" : ratio < 0.3 ? "#f59e0b" : "#22c55e";
  const availTextClass = ratio === 0 ? "text-red-500" : ratio < 0.3 ? "text-yellow-500" : "text-green-500";

  const TABS = [
    { key: "info",    label: "Thông tin" },
    { key: "desc",    label: "Mô tả" },
    { key: "loans",   label: "Lịch sử mượn" },
    { key: "reviews", label: "Đánh giá" },
  ];

  return (
    <>
      <div
        className={`px-8 py-8 max-w-5xl mx-auto transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-400 bg-transparent border-0 cursor-pointer mb-6 p-0 hover:text-gray-600 transition-colors"
        >
          ← Quay lại
        </button>

        <div className="flex gap-10 flex-wrap">

          
          <div className="flex-shrink-0 w-64">

           
            <div className="h-96 rounded-2xl overflow-hidden shadow-2xl mb-5 relative">
              <BookCoverLarge book={book} />

              
              <HeartButton
                isInWishlist={isInWishlist}
                busy={wishlistBusy}
                onToggle={toggleWishlist}
              />

             
              <RatingOverlay rating={rating} />
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 font-medium">Trạng thái</span>
                <span className={`text-xs font-bold ${availTextClass}`}>
                  {avail === 0 ? "Hết sách" : `Còn ${avail}/${total} cuốn`}
                </span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${ratio * 100}%`, background: availBarColor }}
                />
              </div>
              {book.alreadyHaveLoan && (
                <div className="mt-2 text-xs text-blue-500 bg-blue-50 rounded-lg py-1 px-2 text-center">
                  Bạn đang mượn sách này
                </div>
              )}
              {book.alreadyHaveReservation && (
                <div className="mt-1 text-xs text-yellow-600 bg-yellow-50 rounded-lg py-1 px-2 text-center">
                  Bạn đang đặt trước sách này
                </div>
              )}
            </div>

            {/* Nút Mượn ngay → chuyển sang trang checkout */}
            <button
              disabled={!canBorrow}
              onClick={() => canBorrow && navigate(`/home/books/${book.id}/checkout`)}
              className={`w-full py-3 rounded-xl text-sm font-bold border-0 transition-all ${
                canBorrow
                  ? "bg-gray-900 text-amber-50 cursor-pointer hover:bg-black shadow-md"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {!canBorrow ? (avail === 0 ? "Hết sách" : "Đang mượn") : "◈ Mượn ngay"}
            </button>
          </div>

          {/* ── INFO COLUMN ── */}
          <div className="flex-1 min-w-72">

            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1
                className="text-3xl font-extrabold text-gray-900 m-0 leading-tight"
                style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
              >
                {book.title}
              </h1>

              {avail === 0 && !book.alreadyHaveReservation && (
                <button
                  onClick={handleReserve}
                  disabled={reserveBusy}
                  className={`flex-shrink-0 mt-1 flex items-center gap-1 whitespace-nowrap border-0 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    reserveBusy
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 text-amber-50 cursor-pointer hover:bg-black shadow-md"
                  }`}
                >
                  {reserveBusy ? (
                    <>
                      <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-400 rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : "⏳ Đặt trước"}
                </button>
              )}

              {avail === 0 && book.alreadyHaveReservation && (
                <span className="flex-shrink-0 mt-1 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1 font-semibold whitespace-nowrap">
                  ⏳ Đã đặt trước
                </span>
              )}
            </div>

            {/* Author */}
            <p className="text-base text-gray-400 mb-4">
              {book.author}
              {book.publisher && <span className="text-gray-300"> · {book.publisher}</span>}
            </p>

            {/* Price */}
            <div className="mb-6">
              <span
                className="text-3xl font-extrabold text-amber-600"
                style={{ fontFamily: "'Playfair Display',serif" }}
              >
                {book.price != null
                  ? Number(book.price).toLocaleString("vi-VN") +""
                  : "Miễn phí"}
              </span>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 mb-6 flex">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2 text-sm font-semibold border-0 bg-transparent cursor-pointer transition-all border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-400 border-transparent hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "info" && (
              <div>
                <InfoRow label="ISBN"            value={book.isbn} />
                <InfoRow label="Thể loại"        value={book.genreName} />
                <InfoRow label="Tác giả"         value={book.authorName} />
                <InfoRow label="Nhà xuất bản"    value={book.publisherName} />
                <InfoRow label="Ngôn ngữ"        value={book.language} />
                <InfoRow label="Số trang"        value={book.pages ? `${book.pages} trang` : null} />
                <InfoRow label="Ngày xuất bản"   value={book.publicationDate} />
                <InfoRow label="Tổng số bản"     value={book.totalCopies != null ? `${book.totalCopies} cuốn` : null} />
                <InfoRow label="Còn có thể mượn" value={book.availableCopies != null ? `${book.availableCopies} cuốn` : null} />
              </div>
            )}

            {activeTab === "desc" && (
              <div>
                {book.description ? (
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap m-0">
                    {book.description}
                  </p>
                ) : (
                  <div className="text-center py-10 text-gray-300">
                    <div className="text-4xl mb-2">◈</div>
                    <p className="text-sm">Chưa có mô tả</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && <ReviewsTab bookId={book.id} />}

            {activeTab === "loans" && (
              <div>
                {loansLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl mb-2 bg-gray-100 animate-pulse" />
                  ))
                ) : loans.length === 0 ? (
                  <div className="text-center py-10 text-gray-300">
                    <div className="text-4xl mb-2">◎</div>
                    <p className="text-sm">Bạn chưa mượn sách này</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {loans.map((loan) => <LoanCard key={loan.id} loan={loan} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <RelatedBooks genreId={book.genreId} currentBookId={book.id} />
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </>
  );
}