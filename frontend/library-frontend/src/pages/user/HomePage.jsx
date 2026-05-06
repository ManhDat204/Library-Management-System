import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeader from "../../components/PageHeader";

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
        <img 
          src={book.coverImageUrl} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      ) : (
        <div 
          className="w-full h-full flex flex-col items-center justify-center p-4 text-center transition-transform duration-500 group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${color}ee 0%, ${color} 100%)` }}
        >
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


const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-black/5 animate-pulse">
    <div className="h-52 bg-gray-200" />
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
        : <span className={`text-base ${isInWishlist ? "text-red-500" : "text-gray-400"}`}>{isInWishlist ? "♥" : "♡"}</span>
      }
    </button>
  );
};


const Pagination = ({ page, totalPage, onChange }) => {
  if (totalPage <= 1) return null;
  const pages = [];
  for (let i = 0; i < totalPage; i++) {
    if (i === 0 || i === totalPage - 1 || (i >= page - 2 && i <= page + 2))
      pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      <button disabled={page === 0} onClick={() => onChange(page - 1)}
        className="px-4 py-2 rounded-full bg-black/5 text-sm text-gray-500 disabled:opacity-30 hover:bg-black/10 transition-all">
        ← Trước
      </button>
      {pages.map((p, i) =>
        p === "..." ? <span key={`e${i}`} className="text-gray-300 px-1">…</span> : (
          <button key={p} onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${p === page ? "bg-gray-900 text-amber-50" : "bg-black/5 text-gray-500 hover:bg-black/10"}`}>
            {p + 1}
          </button>
        )
      )}
      <button disabled={page >= totalPage - 1} onClick={() => onChange(page + 1)}
        className="px-4 py-2 rounded-full bg-black/5 text-sm text-gray-500 disabled:opacity-30 hover:bg-black/10 transition-all">
        Tiếp →
      </button>
    </div>
  );
};


const Toast = ({ message, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-8 right-8 z-50 bg-gray-900 text-amber-50 px-5 py-3 rounded-xl text-sm shadow-2xl flex items-center gap-3 max-w-xs animate-bounce-once">
      <span className={type === "error" ? "text-red-400" : type === "remove" ? "text-gray-400" : "text-red-400"}>
        {type === "error" ? "✕" : type === "remove" ? "♡" : "♥"}
      </span>
      {message}
    </div>
  );
};


export default function HomePage() {
  const navigate = useNavigate();

  const [books, setBooks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [page, setPage]                 = useState(0);
  const [totalPage, setTotalPage]       = useState(0);
  const [totalElement, setTotalElement] = useState(0);
  const [genres, setGenres]             = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [activeGenreId, setActiveGenreId]     = useState(null);
  const [activeGenreName, setActiveGenreName] = useState(null);
  const [sortBy, setSortBy]   = useState("createdAt");
  const [visible, setVisible] = useState(false);
  const [toast, setToast]     = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [hotBooks, setHotBooks] = useState([]);
  const [hotLoading, setHotLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    fetchGenres();
    fetchWishlistIds();
    fetchHotBooks();
  }, []);

  const fetchWishlistIds = async () => {
    try {
      const res = await api.get("/wishlist/my-wishlist", { params: { page: 0, size: 100 } });
      setWishlistIds(new Set((res.data.content || []).map(i => i.book?.id).filter(Boolean)));
    } catch {}
  };

  const fetchHotBooks = async () => {
  try {
    setHotLoading(true);
    const res = await api.get("/books/top-borrowed", {
      params: { limit: 10 },
    });
    setHotBooks(res.data || []);
  } catch {
    setHotBooks([]);
  } finally {
    setHotLoading(false);
  }
};

  const toggleWishlist = async (bookId) => {
    const isIn = wishlistIds.has(bookId);
    const title = books.find(b => b.id === bookId)?.title || "sách này";
    try {
      if (isIn) {
        await api.delete(`/wishlist/remove/${bookId}`);
        setWishlistIds(prev => { const s = new Set(prev); s.delete(bookId); return s; });
        setToast({ message: `Đã xoá "${title}" khỏi wishlist`, type: "remove" });
      } else {
        await api.post(`/wishlist/add/${bookId}`);
        setWishlistIds(prev => new Set([...prev, bookId]));
        setToast({ message: `Đã thêm "${title}" vào wishlist`, type: "success" });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Thao tác thất bại", type: "error" });
    }
  };

  const fetchGenres = async () => {
    try {
      setGenresLoading(true);
      const res = await api.get("/genres/get", { params: { activeOnly: true } });
      setGenres(Array.isArray(res.data) ? res.data : (res.data.content || []));
    } catch { setGenres([]); }
    finally { setGenresLoading(false); }
  };

  const fetchBooks = useCallback(async (p = page) => {
    try {
      setLoading(true); setError(null);
      const res = await api.get("/books", {
        params: { genreId: activeGenreId || undefined, activeOnly: true, page: p, size: 10, sortBy, sortDirection: "DESC" },
      });
      setBooks(res.data.content || []);
      setTotalPage(res.data.totalPage || 0);
      setTotalElement(res.data.totalElement || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách sách.");
      setBooks([]);
    } finally { setLoading(false); }
  }, [page, activeGenreId, sortBy]);

  useEffect(() => { fetchBooks(page); }, [page, activeGenreId, sortBy]);

  


  return (
    <div className={`min-h-screen bg-white transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
      <style>{`
        @keyframes slideInToast { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      

      <div className="px-4 md:px-6">
        {(hotLoading || hotBooks.length > 0) && (
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <h2 className="text-lg font-bold text-gray-900">Sách hot</h2>
              </div>
              <button onClick={() => navigate("/home/books")}
                className="text-xs text-amber-600 font-medium uppercase tracking-wider hover:text-amber-500 transition-colors">
                Xem tất cả →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {hotLoading
                ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : hotBooks.map((book) => (
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
                        <div className="text-xs text-gray-400 mb-3 truncate">{book.authorName || book.author}</div>
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
        )}

        {/* SECTION: GỢI Ý SÁCH DỰA TRÊN LỊCH SỬ MƯỢN */}

        {/* SECTION: SÁCH MỚI NHẤT (GIỮ NGUYÊN NHƯ CŨ) */}
        <section id="books-section" className="mb-12">
          <div className="flex items-baseline justify-between mb-5">
            <PageHeader title={activeGenreName ? `Sách ${activeGenreName}` : "Sách mới nhất"} />
            <button onClick={() => navigate("/home/books")}
              className="text-xs text-amber-600 font-medium uppercase tracking-wider hover:text-amber-500 transition-colors flex items-center gap-1">
              Xem tất cả →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {loading ? (
              Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : books.map((book, i) => (
              <div key={book.id}
                className="bg-white rounded-2xl overflow-hidden border border-black/5 cursor-pointer group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/10 flex flex-col"
                style={{ animationDelay: `${i * 0.06}s` }}
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
                  <div className="text-xs text-gray-400 mb-3 truncate">{book.authorName || book.author}</div>
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
            ))}
          </div>
        </section>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
