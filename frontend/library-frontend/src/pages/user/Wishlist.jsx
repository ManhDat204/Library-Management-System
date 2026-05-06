import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import PageHeader from "../../components/PageHeader"; 

// --- API CONFIG ---
const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const COVER_COLORS = [
  "from-slate-900 to-slate-700",
  "from-orange-950 to-orange-800",
  "from-blue-950 to-blue-800",
  "from-emerald-950 to-emerald-800",
  "from-purple-950 to-purple-800",
];


const BookCover = ({ book }) => {
  const colorGradient = COVER_COLORS[(book?.id || 0) % COVER_COLORS.length];
  const initials = (book?.title || "??").split(" ").slice(0, 2).map(w => w[0]).join("");

  if (book?.coverImageUrl) {
    return (
      <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover rounded-lg"
        onError={e => { e.target.style.display = "none"; }} />
    );
  }

  return (
    <div className={`relative w-full h-full rounded-lg bg-gradient-to-br ${colorGradient} flex flex-col items-center justify-center overflow-hidden shadow-inner`}>
       <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,white_2px,white_4px)]" />
       <span className="font-serif text-4xl font-black text-white/20 tracking-tighter uppercase">{initials}</span>
       <span className="absolute bottom-2 inset-x-0 text-center text-[10px] font-serif text-white/40 uppercase tracking-[0.2em] truncate px-2">
          {book?.genreName || "—"}
       </span>
    </div>
  );
};

const AvailBadge = ({ available, total }) => {
  const ratio = total > 0 ? available / total : 0;
  const status = ratio === 0 ? { bg: "bg-red-50", text: "text-red-600", label: "Hết sách" } 
               : ratio < 0.3 ? { bg: "bg-amber-50", text: "text-amber-600", label: `Còn ${available}/${total}` }
               : { bg: "bg-green-50", text: "text-green-600", label: `Còn ${available}/${total}` };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text} border border-current/10`}>
      {status.label}
    </span>
  );
};

const SkeletonRow = ({ viewMode }) => (
  <div className={`bg-white rounded-2xl p-4 border border-gray-100 animate-pulse ${viewMode === 'grid' ? '' : 'flex gap-4'}`}>
    <div className="bg-gray-200 rounded-xl w-full aspect-[3/4] mb-3" style={viewMode === 'list' ? {width: '80px', height: '110px'} : {}} />
    <div className="flex-1 space-y-2">
      <div className="h-2 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-2 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const Toast = ({ message, type = "success", onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex items-center gap-3 bg-zinc-900 text-zinc-100 px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5">
      <span className={type === "error" ? "text-red-500" : "text-green-500"}>
        {type === "error" ? "✕" : "✓"}
      </span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// --- MAIN PAGE ---
export default function WishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchWishlist = useCallback(async (p = 0) => {
    try {
      setLoading(true);
      const res = await api.get("/wishlist/my-wishlist", { params: { page: p, size: 10 } });
      setItems(res.data.content || []);
      setTotalPage(res.data.totalPage || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải wishlist.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWishlist(page); }, [page, fetchWishlist]);

  const handleRemove = async (bookId) => {
    try {
      await api.delete(`/wishlist/remove/${bookId}`);
      setItems(prev => prev.filter(i => i.book?.id !== bookId));
      setToast({ message: "Đã xoá khỏi wishlist", type: "success" });
    } catch (err) {
      setToast({ message: "Xoá thất bại", type: "error" });
    }
  };

  return (
    <div className="max-w-7xl" >
        <PageHeader title="Sách yêu thích" />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => <SkeletonRow key={i} viewMode="grid" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200">
          <div className="text-6xl mb-4">♡</div>
          <h3 className="text-xl font-bold text-zinc-800">Wishlist đang trống</h3>
          <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Hãy thêm những cuốn sách thú vị để theo dõi tình trạng của chúng.</p>
          <Link to="/home/books" className="inline-flex items-center px-6 py-3 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-all">
            Khám phá ngay →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => (
            <div key={item.id}
              onClick={() => navigate(`/home/books/${item.book?.id}`)}
              className="group bg-white border border-zinc-100 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl p-2 sm:p-3 flex flex-col">

              <div className="w-full aspect-[3/4] mb-4 relative overflow-hidden rounded-lg">
                <BookCover book={item.book} />
                
              </div>

              <div className="flex-1 flex flex-col">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">{item.book?.genreName}</span>
                <h3 className="font-bold text-zinc-900 line-clamp-1 group-hover:text-amber-700 transition-colors text-sm">{item.book?.title}</h3>

                {item.notes && (
                  <div className="mt-1 mb-3 p-2 rounded-lg bg-zinc-50 text-[11px] text-zinc-600 border-l-2 border-zinc-300 line-clamp-2 italic">
                    "{item.notes}"
                  </div>
                )}

                <div className="mt-auto pt-4 flex items-center gap-2 justify-between">
                   <button
                     disabled={item.book?.availableCopies === 0}
                     onClick={(e) => { e.stopPropagation(); navigate(`/home/books/${item.book?.id}`); }}
                     className="flex-1 bg-zinc-900 text-white text-[11px] font-bold py-2 rounded-lg hover:bg-zinc-800 disabled:bg-zinc-200 transition-colors uppercase tracking-tight">
                     {item.book?.availableCopies === 0 ? "Hết sách" : "Mượn ngay"}
                   </button>

                   <button onClick={(e) => { e.stopPropagation(); handleRemove(item.book?.id); }} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPage > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 px-4 rounded-xl border border-zinc-200 text-sm disabled:opacity-30">← Trước</button>
          {[...Array(totalPage)].map((_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === i ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'hover:bg-zinc-100 text-zinc-600'}`}>{i + 1}</button>
          ))}
          <button disabled={page >= totalPage - 1} onClick={() => setPage(p => p + 1)} className="p-2 px-4 rounded-xl border border-zinc-200 text-sm disabled:opacity-30">Tiếp →</button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}