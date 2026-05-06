// src/components/RecommendationSection.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { aiService } from "../services/aiService";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const COVER_COLORS = [
  "#1a1a2e","#2d1b00","#0d2137","#1a2e1a",
  "#2e1a2e","#2e2200","#1e2e20","#2e1e1e",
];

const BookCover = ({ book }) => {
  const color = COVER_COLORS[book.id % COVER_COLORS.length];
  const initials = book.title.split(" ").slice(0, 2).map(w => w[0]).join("");
  return (
    <div className="w-full h-full relative group overflow-hidden bg-gray-100">
      {book.coverImageUrl ? (
        <img src={book.coverImageUrl} alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center transition-transform duration-500 group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${color}ee 0%, ${color} 100%)` }}>
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20">
            <span className="text-2xl font-bold text-white/90 uppercase">{initials}</span>
          </div>
          <p className="text-[10px] text-white/60 font-medium px-2 line-clamp-3 leading-relaxed uppercase tracking-wider">
            {book.title}
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};

const AvailBadge = ({ available, total }) => {
  const ratio = total > 0 ? available / total : 0;
  const cls = ratio === 0 ? "bg-red-100 text-red-500" : ratio < 0.3 ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>
      {ratio === 0 ? "Hết sách" : `Còn ${available}/${total}`}
    </span>
  );
};

const WishlistBtn = ({ bookId, isInWishlist, onToggle }) => {
  const [busy, setBusy] = useState(false);
  const handleClick = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try { await onToggle(bookId); } catch {} finally { setBusy(false); }
  };
  return (
    <button onClick={handleClick}
      className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all hover:scale-110"
      title={isInWishlist ? "Bỏ khỏi wishlist" : "Thêm vào wishlist"}>
      {busy
        ? <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        : <span className={`text-base ${isInWishlist ? "text-red-500" : "text-gray-400"}`}>
            {isInWishlist ? "♥" : "♡"}
          </span>
      }
    </button>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-black/5 animate-pulse">
    <div className="h-72 bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-2/5" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded-full w-2/5" />
      </div>
    </div>
  </div>
);

export default function RecommendationSection() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchRecommendations(userId);
      fetchWishlistIds();
    }
  }, []);

  const fetchRecommendations = async (userId) => {
    setLoading(true);
    try {
      const data = await aiService.getRecommendations(userId, 6);
      setRecommendations(Array.isArray(data) ? data : data.content || []);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistIds = async () => {
    try {
      const res = await api.get("/wishlist/my-wishlist", { params: { page: 0, size: 100 } });
      setWishlistIds(new Set((res.data.content || []).map(i => i.book?.id).filter(Boolean)));
    } catch {}
  };

  const toggleWishlist = async (bookId) => {
    const isIn = wishlistIds.has(bookId);
    try {
      if (isIn) {
        await api.delete(`/wishlist/remove/${bookId}`);
        setWishlistIds(prev => { const s = new Set(prev); s.delete(bookId); return s; });
      } else {
        await api.post(`/wishlist/add/${bookId}`);
        setWishlistIds(prev => new Set([...prev, bookId]));
      }
    } catch {}
  };

  if (!loading && recommendations.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500" size={18} />
          <h2 className="text-lg font-bold text-gray-900">Gợi ý cho bạn</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {loading
          ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : recommendations.map((book) => (
              <div key={book.id}
                className="bg-white rounded-2xl overflow-hidden border border-black/5 cursor-pointer group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/10 flex flex-col"
                onClick={() => navigate(`/home/books/${book.id}`)}>

                <div className="h-72 relative overflow-hidden">
                  <BookCover book={book} />

                  

                  

                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                    <button onClick={e => { e.stopPropagation(); navigate(`/home/books/${book.id}`); }}
                      className="bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-full hover:bg-amber-500 hover:text-white transition-colors">
                      Chi tiết
                    </button>
                    <WishlistBtn bookId={book.id} isInWishlist={wishlistIds.has(book.id)} onToggle={toggleWishlist} />
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1 truncate">
                    {book.genreName || "—"}
                  </div>
                  <div className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                    {book.title}
                  </div>
                  <div className="text-xs text-gray-400 mb-3 truncate">
                    {book.authorName || book.author}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {book.price != null ? Number(book.price).toLocaleString("vi-VN") + "₫" : "Miễn phí"}
                    </span>
                    <button
                      disabled={book.availableCopies === 0}
                      onClick={e => { e.stopPropagation(); navigate(`/home/books/${book.id}`); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed bg-gray-900 text-amber-50 hover:bg-amber-500 whitespace-nowrap">
                      {book.availableCopies === 0 ? "Hết sách" : "Mượn ngay"}
                    </button>
                  </div>
                </div>
              </div>
            ))
        }
      </div>
    </section>
  );
}