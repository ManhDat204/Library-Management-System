import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeader from "../../components/PageHeader"; 

// ─── API CONFIG ───────────────────────────────────────────────
const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const COVER_COLORS = [
  ["#1a1a2e", "#16213e"],
  ["#2d1b00", "#3d2400"],
  ["#0d2137", "#0a1628"],
  ["#1a2e1a", "#0f1f0f"],
  ["#2e1a2e", "#1f0f1f"],
  ["#2e2200", "#1f1700"],
  ["#1e2e20", "#131f14"],
  ["#2e1e1e", "#1f1414"],
];

const PRICE_RANGES = [
  { label: "0₫ - 150,000₫", min: 0, max: 150000 },
  { label: "150,000₫ - 300,000₫", min: 150000, max: 300000 },
  { label: "300,000₫ - 500,000₫", min: 300000, max: 500000 },
  { label: "500,000₫ - 700,000₫", min: 500000, max: 700000 },
  { label: "700,000₫ - Trở Lên", min: 700000, max: null }, // null nghĩa là không giới hạn trên
];

const PRICE_MAX = 500000;

// ─── BOOK COVER ───────────────────────────────────────────────
const BookCover = ({ book, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const colors = COVER_COLORS[(book?.id || 0) % COVER_COLORS.length];
  const initials = (book?.title || "??").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  if (book?.coverImageUrl && !imgError) {
    return (
      <img
        src={book.coverImageUrl}
        alt={book.title}
        className={`w-full h-full object-cover ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${colors[0]} 0%, ${colors[1]} 60%, #000 100%)` }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,1) 2px,rgba(255,255,255,1) 3px)",
        }}
      />
      <div className="absolute left-3 top-0 bottom-0 w-px bg-white opacity-10" />
      <span
        className="text-5xl font-black select-none"
        style={{ fontFamily: "'Playfair Display',Georgia,serif", color: "rgba(255,255,255,0.13)", letterSpacing: "-0.04em" }}
      >
        {initials}
      </span>
      <span
        className="absolute bottom-3 inset-x-2 text-center text-xs uppercase tracking-widest truncate"
        style={{ fontFamily: "sans-serif", color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}
      >
        {book?.genreName || "—"}
      </span>
    </div>
  );
};

// ─── AVAILABILITY BADGE ───────────────────────────────────────
const AvailBadge = ({ available, total }) => {
  const ratio = total > 0 ? available / total : 0;
  const cls =
    ratio === 0
      ? "text-red-600 bg-red-50 border-red-100"
      : ratio < 0.3
      ? "text-amber-600 bg-amber-50 border-amber-100"
      : "text-green-600 bg-green-50 border-green-100";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {ratio === 0 ? "Hết sách" : `Còn ${available}/${total}`}
    </span>
  );
};

// ─── SKELETON ────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 animate-pulse">
    <div className="bg-zinc-200" style={{ aspectRatio: "3/4" }} />
    <div className="p-3 space-y-2">
      <div className="h-2 bg-zinc-200 rounded w-1/3" />
      <div className="h-3 bg-zinc-200 rounded w-4/5" />
      <div className="h-2 bg-zinc-200 rounded w-1/2" />
      <div className="h-3 bg-zinc-200 rounded w-2/5 mt-2" />
    </div>
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-zinc-900 text-zinc-100 px-5 py-3 rounded-2xl shadow-2xl">
      <span className={type === "error" ? "text-red-400" : "text-rose-400"}>
        {type === "error" ? "✕" : "♥"}
      </span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// ─── HEART BUTTON ─────────────────────────────────────────────
const HeartBtn = ({ active, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center rounded-xl transition-all duration-200 ${className}
      ${active ? "bg-rose-500 shadow-md" : "bg-black bg-opacity-40 hover:bg-opacity-60 backdrop-blur-sm"}`}
  >
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill={active ? "white" : "none"}
      stroke="white"
      strokeWidth={active ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  </button>
);

// ─── GRID CARD ────────────────────────────────────────────────
const GridCard = ({ book, isWishlisted, onWishlist, onClick }) => (
  <div onClick={onClick} className="group cursor-pointer flex flex-col">
    <div
      className="relative rounded-2xl overflow-hidden shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl"
      style={{ aspectRatio: "3/4" }}
    >
      <BookCover book={book} />
      <HeartBtn
        active={isWishlisted}
        onClick={(e) => { e.stopPropagation(); onWishlist(); }}
        className="absolute top-2.5 left-2.5 w-8 h-8 z-10"
      />
      <div className="absolute top-2.5 right-2.5 z-10">
        <AvailBadge available={book.availableCopies} total={book.totalCopies} />
      </div>
      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="bg-gradient-to-t from-black via-black/70 to-transparent pt-8 pb-3 px-3">
          <button
            disabled={book.availableCopies === 0}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white text-zinc-900 py-2 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-amber-50 transition-colors"
          >
            {book.availableCopies === 0 ? "Hết sách" : "Mượn ngay"}
          </button>
        </div>
      </div>
    </div>
    <div className="mt-3 flex flex-col gap-0.5 px-0.5">
      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest truncate">{book.genreName}</span>
      <h3
        className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors"
        style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
      >
        {book.title}
      </h3>
      <p className="text-xs text-zinc-400 italic truncate">bởi {book.authorName}</p>
      <p className="text-sm font-bold text-zinc-800 mt-1.5">
        {book.price != null ? Number(book.price).toLocaleString("vi-VN") + "₫" : "Miễn phí"}
      </p>
    </div>
  </div>
);

// ─── LIST CARD ────────────────────────────────────────────────
const ListCard = ({ book, isWishlisted, onWishlist, onClick }) => (
  <div
    onClick={onClick}
    className="group flex items-center gap-5 p-4 bg-white rounded-2xl border border-zinc-100 hover:border-amber-200 hover:shadow-lg transition-all cursor-pointer"
  >
    <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden shadow-md" style={{ aspectRatio: "3/4" }}>
      <BookCover book={book} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{book.genreName}</span>
        <AvailBadge available={book.availableCopies} total={book.totalCopies} />
      </div>
      <h3
        className="font-bold text-zinc-900 text-base line-clamp-1 group-hover:text-amber-700 transition-colors"
        style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
      >
        {book.title}
      </h3>
      <p className="text-xs text-zinc-400 italic mt-0.5">bởi {book.authorName}</p>
      {book.description && (
        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-1 italic">"{book.description}"</p>
      )}
    </div>
    <div className="flex-shrink-0 flex flex-col items-end gap-2">
      <span className="text-lg font-bold text-zinc-900">
        {book.price != null ? Number(book.price).toLocaleString("vi-VN") + "₫" : "Miễn phí"}
      </span>
      <div className="flex items-center gap-2">
        <HeartBtn
          active={isWishlisted}
          onClick={(e) => { e.stopPropagation(); onWishlist(); }}
          className="w-9 h-9"
        />
        <button
          disabled={book.availableCopies === 0}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-900 text-white px-5 py-2 rounded-xl text-xs font-bold disabled:bg-zinc-200 disabled:text-zinc-400 hover:bg-black transition-colors"
        >
          {book.availableCopies === 0 ? "Hết" : "Mượn ngay"}
        </button>
      </div>
    </div>
  </div>
);

// ─── PRICE RANGE FILTER ────────────────────────────────────────
const PriceRangeFilter = ({ selectedRanges, onChange, CheckItem }) => {
  return (
    <div className="space-y-0.5">
      {PRICE_RANGES.map((range, idx) => (
        <CheckItem
          key={idx}
          label={range.label}
          checked={selectedRanges.has(idx)}
          onChange={() => onChange(idx)}
        />
      ))}
    </div>
  );
};

// ─── FILTER SIDEBAR ───────────────────────────────────────────
const FilterSidebar = ({
  genres,
  activeGenreId,
  onGenreToggle,
  publishers,
  activePublisherId,
  onPublisherToggle,
  authors,
  activeAuthorId,
  onAuthorToggle,
  selectedPriceRanges,
  onPriceRangeToggle,
  onReset,
  hasActiveFilters,
}) => {
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllPublishers, setShowAllPublishers] = useState(false);

  const visibleGenres = showAllGenres ? genres : genres.slice(0, 6);
  const visiblePublishers = showAllPublishers ? publishers : publishers.slice(0, 5);
  const visibleAuthors = authors; // Hiển thị tất cả tác giả

  const SectionTitle = ({ children }) => (
    <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
      {children}
    </h3>
  );

  const CheckItem = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all border ${
          checked
            ? "bg-amber-500 border-amber-500"
            : "bg-white border-zinc-300 group-hover:border-amber-400"
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth={3} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm transition-colors ${checked ? "text-zinc-900 font-semibold" : "text-zinc-500 group-hover:text-zinc-800"}`}>
        {label}
      </span>
    </label>
  );

  return (
    <div className="w-56 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden sticky top-4">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-50">
          <span className="text-sm font-bold text-zinc-900">Bộ lọc</span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-amber-600 hover:text-amber-800 font-semibold transition-colors"
            >
              Xoá tất cả
            </button>
          )}
        </div>

        <div className="p-4 space-y-5">
          <div>
            <SectionTitle>Giá</SectionTitle>
            <PriceRangeFilter
              selectedRanges={selectedPriceRanges}
              onChange={onPriceRangeToggle}
              CheckItem={CheckItem}
            />
          </div>

          <div className="h-px bg-zinc-100" />

          {/* ── Genres ── */}
          <div>
            <SectionTitle>Thể loại</SectionTitle>
            <div className="space-y-0.5">
              {visibleGenres.map((g) => (
                <CheckItem
                  key={g.id}
                  label={g.name}
                  checked={activeGenreId === g.id}
                  onChange={() => onGenreToggle(g.id)}
                />
              ))}
            </div>
            {genres.length > 6 && (
              <button
                onClick={() => setShowAllGenres(!showAllGenres)}
                className="mt-2 text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 transition-colors"
              >
                {showAllGenres ? "Thu gọn " : `Xem thêm ${genres.length - 6} ▼`}
              </button>
            )}
          </div>

          <div className="h-px bg-zinc-100" />

          {/* ── Authors ── */}
          <div>
            <SectionTitle>Tác giả</SectionTitle>
            {authors.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">Không có dữ liệu</p>
            ) : (
              <div className="space-y-0.5">
                {visibleAuthors.map((a) => (
                  <CheckItem
                    key={a.id}
                    label={a.authorName}
                    checked={activeAuthorId === a.id}
                    onChange={() => onAuthorToggle(a.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-zinc-100" />

          <div>
            <SectionTitle>Nhà cung cấp</SectionTitle>
            {publishers.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">Không có dữ liệu</p>
            ) : (
              <>
                <div className="space-y-0.5">
                  {visiblePublishers.map((p) => (
                    <CheckItem
                      key={p.id}
                      label={p.name}
                      checked={activePublisherId === p.id}
                      onChange={() => onPublisherToggle(p.id)}
                    />
                  ))}
                </div>
                {publishers.length > 5 && (
                  <button
                    onClick={() => setShowAllPublishers(!showAllPublishers)}
                    className="mt-2 text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    {showAllPublishers ? "Thu gọn ▲" : `Xem thêm ${publishers.length - 5} ▼`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function BooksPage() {
  const navigate = useNavigate();

  const [books, setBooks]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [page, setPage]                       = useState(0);
  const [totalPage, setTotalPage]             = useState(0);
  const [genres, setGenres]                   = useState([]);
  const [publishers, setPublishers]           = useState([]);
  const [authors, setAuthors]                 = useState([]);
  const [sortBy, setSortBy]                   = useState("createdAt");
  const [availableOnly, setAvailableOnly]     = useState(false);
  const [searchInput, setSearchInput]         = useState("");
  const [searchQuery, setSearchQuery]         = useState("");
  const [viewMode, setViewMode]               = useState("grid");
  const [wishlistIds, setWishlistIds]         = useState(new Set());
  const [toast, setToast]                     = useState(null);

  // ── Sidebar filter state ──────────────────────────────────
  const [activeGenreId, setActiveGenreId]           = useState(null);
  const [activePublisherId, setActivePublisherId]   = useState(null);
  const [activeAuthorId, setActiveAuthorId]         = useState(null);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState(new Set());

  const searchDebounce = useRef(null);

  const hasActiveFilters =
    activeGenreId ||
    activePublisherId ||
    activeAuthorId ||
    selectedPriceRanges.size > 0;

  // ── Init ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [genRes, wishRes, pubRes, authRes] = await Promise.all([
          api.get("/genres/get", { params: { activeOnly: true } }),
          api.get("/wishlist/my-wishlist", { params: { page: 0, size: 50 } }).catch(() => ({ data: { content: [] } })),
          api.get("/publishers").catch(() => ({ data: [] })),
          api.get("/authors", { params: { page: 0, size: 100 } }).catch(() => ({ data: [] })),
        ]);

        // Genres: trả array trực tiếp hoặc PageResponse
        const genresData = Array.isArray(genRes.data) ? genRes.data : genRes.data.content || [];
        setGenres(genresData);

        // Wishlist
        const wishData = wishRes.data.content || [];
        setWishlistIds(new Set(wishData.map((i) => i.book?.id).filter(Boolean)));

        // Publishers: trả array trực tiếp hoặc PageResponse
        const pubData = Array.isArray(pubRes.data) ? pubRes.data : pubRes.data.content || [];
        setPublishers(pubData);

        // Authors: trả array trực tiếp hoặc PageResponse
        const authData = Array.isArray(authRes.data) ? authRes.data : authRes.data.content || [];
        setAuthors(authData);
      } catch (err) {
        console.error("Init load failed", err);
      }
    };
    fetchInit();
  }, []);

  // ── Fetch books ──────────────────────────────────────────
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate price range from selected ranges
      let minPrice = undefined;
      let maxPrice = undefined;
      if (selectedPriceRanges.size > 0) {
        const ranges = [...selectedPriceRanges].map(idx => PRICE_RANGES[idx]);
        minPrice = Math.min(...ranges.map(r => r.min));
        const maxPrices = ranges.map(r => r.max === null ? 999999999 : r.max);
        maxPrice = Math.max(...maxPrices);
        if (maxPrice === 999999999) maxPrice = undefined;
      }

      const params = {
        genreId: activeGenreId || undefined,
        publisherId: activePublisherId || undefined,
        authorId: activeAuthorId || undefined,
        minPrice,
        maxPrice,
        availableOnly,
        page,
        size: 12,
        sortBy,
        sortDirection: "DESC",
      };
      let res;
      if (searchQuery.trim()) {
        res = await api.post("/books/search", { ...params, searchTerm: searchQuery.trim() });
      } else {
        res = await api.get("/books", { params });
      }
      setBooks(res.data.content || []);
      setTotalPage(res.data.totalPage || 0);
    } catch {
      setError("Không thể tải danh sách sách.");
    } finally {
      setLoading(false);
    }
  }, [page, activeGenreId, activePublisherId, activeAuthorId, selectedPriceRanges, availableOnly, sortBy, searchQuery]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // ── Reset page when filters change (to avoid multiple jumps) ────
  useEffect(() => {
    setPage(0);
  }, [activeGenreId, activePublisherId, activeAuthorId, selectedPriceRanges, availableOnly]);

  // ── Search debounce ──────────────────────────────────────
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQuery(val);
      setPage(0);
    }, 500);
  };

  // ── Genre toggle ──────────────────────────────────────────
  const toggleGenre = (id) => {
    setActiveGenreId(activeGenreId === id ? null : id);
  };

  // ── Publisher toggle ───────────────────────────────────────
  const togglePublisher = (id) => {
    setActivePublisherId(activePublisherId === id ? null : id);
  };

  // ── Author toggle ──────────────────────────────────────────
  const toggleAuthor = (id) => {
    setActiveAuthorId(activeAuthorId === id ? null : id);
  };

  // ── Price range toggle ─────────────────────────────────────
  const togglePriceRange = (idx) => {
    setSelectedPriceRanges((prev) => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });
  };

  // ── Reset all filters ──────────────────────────────────────
  const resetFilters = () => {
    setActiveGenreId(null);
    setActivePublisherId(null);
    setActiveAuthorId(null);
    setSelectedPriceRanges(new Set());
    setAvailableOnly(false);
  };

  // ── Wishlist toggle ──────────────────────────────────────
  const toggleWishlist = async (book) => {
    const isIn = wishlistIds.has(book.id);
    try {
      if (isIn) {
        await api.delete(`/wishlist/remove/${book.id}`);
        setWishlistIds((prev) => { const s = new Set(prev); s.delete(book.id); return s; });
        setToast({ message: "Đã xoá khỏi wishlist", type: "remove" });
      } else {
        await api.post(`/wishlist/add/${book.id}`);
        setWishlistIds((prev) => new Set([...prev, book.id]));
        setToast({ message: "Đã thêm vào wishlist", type: "success" });
      }
    } catch {
      setToast({ message: "Thao tác thất bại", type: "error" });
    }
  };

  // ── Active genre name ────────────────────────────────────
  const activeGenreName = activeGenreId
    ? genres.find((g) => g.id === activeGenreId)?.name
    : null;

  return (
    <div className="max-w-7xl ">

        <PageHeader title={activeGenreName ? `Sách ${activeGenreName}` : "Tất cả sách"} />


      {/* TOOLBAR */}
      <div className="bg-white rounded-3xl p-3 mb-6 border border-zinc-100 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-64 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg pointer-events-none">⌕</span>
          <input
            type="text"
            placeholder="Tìm tiêu đề, tác giả..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-2.5 pl-11 pr-10 text-sm outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearchQuery(""); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-50 border border-zinc-100 rounded-xl py-2.5 px-4 text-xs font-bold text-zinc-600 outline-none cursor-pointer hover:border-zinc-300 transition-colors"
          >
            <option value="createdAt">Mới nhất</option>
            <option value="title">Tên A-Z</option>
            <option value="price">Giá</option>
          </select>

          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              availableOnly
                ? "bg-amber-600 text-white border-amber-600 shadow-md"
                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {availableOnly ? "✓ " : ""}Sẵn có
          </button>

          <div className="h-8 w-px bg-zinc-100" />

          {/* View mode */}
          <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === "grid" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === "list" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: sidebar + content */}
      <div className="flex gap-6 items-start">

        {/* ── SIDEBAR ── */}
        <FilterSidebar
          genres={genres}
          activeGenreId={activeGenreId}
          onGenreToggle={toggleGenre}
          publishers={publishers}
          activePublisherId={activePublisherId}
          onPublisherToggle={togglePublisher}
          authors={authors}
          activeAuthorId={activeAuthorId}
          onAuthorToggle={toggleAuthor}
          selectedPriceRanges={selectedPriceRanges}
          onPriceRangeToggle={togglePriceRange}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* ── CONTENT ── */}
        <div className="flex-1 min-w-0">
          {error ? (
            <div className="py-20 text-center bg-red-50 rounded-3xl border border-red-100">
              <p className="text-red-500 font-medium">{error}</p>
              <button onClick={fetchBooks} className="mt-3 text-sm text-red-400 underline">Thử lại</button>
            </div>
          ) : loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-4 gap-x-6 gap-y-10" : "space-y-3"}>
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : books.length === 0 ? (
            <div className="py-20 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
              <span className="text-5xl block mb-4">🔍</span>
              <h3 className="text-lg font-bold text-zinc-800">Không tìm thấy sách phù hợp</h3>
              <p className="text-zinc-400 text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-4 gap-x-6 gap-y-10">
              {books.map((book) => (
                <GridCard
                  key={book.id}
                  book={book}
                  isWishlisted={wishlistIds.has(book.id)}
                  onWishlist={() => toggleWishlist(book)}
                  onClick={() => navigate(`/home/books/${book.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {books.map((book) => (
                <ListCard
                  key={book.id}
                  book={book}
                  isWishlisted={wishlistIds.has(book.id)}
                  onWishlist={() => toggleWishlist(book)}
                  onClick={() => navigate(`/home/books/${book.id}`)}
                />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPage > 1 && (
            <div className="mt-14 flex justify-center items-center gap-2 flex-wrap">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-6 py-2.5 rounded-2xl border border-zinc-200 text-sm font-bold disabled:opacity-30 hover:bg-zinc-50 transition-all"
              >
                ← Trước
              </button>
              {Array(Math.min(totalPage, 7)).fill(0).map((_, i) => {
                const pageNum = totalPage <= 7 ? i : Math.max(0, Math.min(page - 3, totalPage - 7)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-11 h-11 rounded-2xl text-sm font-bold transition-all ${
                      page === pageNum ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPage - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2.5 rounded-2xl border border-zinc-200 text-sm font-bold disabled:opacity-30 hover:bg-zinc-50 transition-all"
              >
                Tiếp →
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}