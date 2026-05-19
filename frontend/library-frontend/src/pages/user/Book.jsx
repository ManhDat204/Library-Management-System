import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
import Toast from "../../components/common/Toast";

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
  { label: "0₫ - 150,000₫",        min: 0,      max: 150000 },
  { label: "150,000₫ - 300,000₫",  min: 150000, max: 300000 },
  { label: "300,000₫ - 500,000₫",  min: 300000, max: 500000 },
  { label: "500,000₫ - 700,000₫",  min: 500000, max: 700000 },
  { label: "700,000₫ - Trở Lên",   min: 700000, max: null   },
];

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
    </div>
    <div className="mt-2 sm:mt-3 flex flex-col gap-0.5 px-0.5">
      <span className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-widest truncate">{book.genreName}</span>
      <h3
        className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors"
        style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
      >
        {book.title}
      </h3>
      <p className="text-[10px] sm:text-xs text-zinc-400 italic truncate">{book.authorName}</p>
      <p className="text-xs sm:text-sm font-bold text-zinc-800 mt-1">
        {book.price != null ? Number(book.price).toLocaleString("vi-VN") + "₫" : "Miễn phí"}
      </p>
    </div>
  </div>
);


const ListCard = ({ book, isWishlisted, onWishlist, onClick }) => (
  <div
    onClick={onClick}
    className="group flex items-center gap-3 sm:gap-5 p-3 sm:p-4 bg-white rounded-2xl border border-zinc-100 hover:border-amber-200 hover:shadow-lg transition-all cursor-pointer"
  >
    <div className="flex-shrink-0 w-12 sm:w-16 rounded-xl overflow-hidden shadow-md" style={{ aspectRatio: "3/4" }}>
      <BookCover book={book} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{book.genreName}</span>
        <AvailBadge available={book.availableCopies} total={book.totalCopies} />
      </div>
      <h3
        className="font-bold text-zinc-900 text-sm sm:text-base line-clamp-1 group-hover:text-amber-700 transition-colors"
        style={{ fontFamily: "'Playfair Display',Georgia,serif" }}
      >
        {book.title}
      </h3>
      <p className="text-xs text-zinc-400 italic mt-0.5">bởi {book.authorName}</p>
      {book.description && (
        <p className="hidden sm:block text-xs text-zinc-400 mt-1.5 line-clamp-1 italic">"{book.description}"</p>
      )}
    </div>
    <div className="flex-shrink-0 flex flex-col items-end gap-2">
      <span className="text-sm sm:text-lg font-bold text-zinc-900">
        {book.price != null ? Number(book.price).toLocaleString("vi-VN") + "₫" : "Miễn phí"}
      </span>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <HeartBtn
          active={isWishlisted}
          onClick={(e) => { e.stopPropagation(); onWishlist(); }}
          className="w-8 h-8 sm:w-9 sm:h-9"
        />
        <button
          disabled={book.availableCopies === 0}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-900 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-bold disabled:bg-zinc-200 disabled:text-zinc-400 hover:bg-black transition-colors whitespace-nowrap"
        >
          {book.availableCopies === 0 ? "Hết" : "Mượn ngay"}
        </button>
      </div>
    </div>
  </div>
);

// ─── PAGINATION (style like HomePage) ─────────────────────────
const Pagination = ({ page, totalPage, onChange }) => {
  if (totalPage <= 1) return null;
  const pages = [];
  for (let i = 0; i < totalPage; i++) {
    if (i === 0 || i === totalPage - 1 || (i >= page - 2 && i <= page + 2))
      pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return (
    <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-10 flex-wrap">
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="px-3 sm:px-4 py-2 rounded-full bg-black/5 text-sm text-gray-500 disabled:opacity-30 hover:bg-black/10 transition-all flex items-center gap-1"
      >
        <ChevronLeft size={15} /> Trước
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="text-gray-300 px-1">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-sm font-semibold transition-all ${
              p === page ? "bg-gray-900 text-amber-50" : "bg-black/5 text-gray-500 hover:bg-black/10"
            }`}
          >
            {p + 1}
          </button>
        )
      )}
      <button
        disabled={page >= totalPage - 1}
        onClick={() => onChange(page + 1)}
        className="px-3 sm:px-4 py-2 rounded-full bg-black/5 text-sm text-gray-500 disabled:opacity-30 hover:bg-black/10 transition-all flex items-center gap-1"
      >
        Tiếp <ChevronRight size={15} />
      </button>
    </div>
  );
};

// ─── SHARED CHECKITEM ─────────────────────────────────────────
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
    <span className={`text-sm transition-colors truncate ${checked ? "text-zinc-900 font-semibold" : "text-zinc-500 group-hover:text-zinc-800"}`}>
      {label}
    </span>
  </label>
);

// ─── FILTER SIDEBAR CONTENT ───────────────────────────────────
const FilterContent = ({
  genres, activeGenreId, onGenreToggle,
  publishers, activePublisherId, onPublisherToggle,
  authors, activeAuthorId, onAuthorToggle,
  selectedPriceRanges, onPriceRangeToggle,
  onReset, hasActiveFilters,
}) => {
  const [showAllGenres, setShowAllGenres]         = useState(false);
  const [showAllPublishers, setShowAllPublishers] = useState(false);
  const [showAllAuthors, setShowAllAuthors]       = useState(false);

  const GENRE_LIMIT     = 6;
  const PUBLISHER_LIMIT = 5;
  const AUTHOR_LIMIT    = 5;

  const visibleGenres     = showAllGenres     ? genres     : genres.slice(0, GENRE_LIMIT);
  const visiblePublishers = showAllPublishers ? publishers : publishers.slice(0, PUBLISHER_LIMIT);
  const visibleAuthors    = showAllAuthors    ? authors    : authors.slice(0, AUTHOR_LIMIT);

  const SectionTitle = ({ children }) => (
    <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
      {children}
    </h3>
  );

  const ShowMoreBtn = ({ expanded, onToggle, total, limit }) =>
    total > limit ? (
      <button
        onClick={onToggle}
        className="mt-2 text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 transition-colors"
      >
        {expanded ? "Thu gọn ▲" : `Xem thêm ${total - limit} ▼`}
      </button>
    ) : null;

  return (
    <div className="p-4 space-y-5">
      {/* Giá */}
      <div>
        <SectionTitle>Giá</SectionTitle>
        <div className="space-y-0.5">
          {PRICE_RANGES.map((range, idx) => (
            <CheckItem
              key={idx}
              label={range.label}
              checked={selectedPriceRanges.has(idx)}
              onChange={() => onPriceRangeToggle(idx)}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      {/* Thể loại */}
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
        <ShowMoreBtn
          expanded={showAllGenres}
          onToggle={() => setShowAllGenres(!showAllGenres)}
          total={genres.length}
          limit={GENRE_LIMIT}
        />
      </div>

      <div className="h-px bg-zinc-100" />

      {/* Tác giả */}
      <div>
        <SectionTitle>Tác giả</SectionTitle>
        {authors.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">Không có dữ liệu</p>
        ) : (
          <>
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
            <ShowMoreBtn
              expanded={showAllAuthors}
              onToggle={() => setShowAllAuthors(!showAllAuthors)}
              total={authors.length}
              limit={AUTHOR_LIMIT}
            />
          </>
        )}
      </div>

      <div className="h-px bg-zinc-100" />

      {/* Nhà cung cấp */}
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
            <ShowMoreBtn
              expanded={showAllPublishers}
              onToggle={() => setShowAllPublishers(!showAllPublishers)}
              total={publishers.length}
              limit={PUBLISHER_LIMIT}
            />
          </>
        )}
      </div>
    </div>
  );
};

// ─── DESKTOP SIDEBAR ──────────────────────────────────────────
const FilterSidebar = (props) => (
  <div className="hidden lg:block w-52 xl:w-56 flex-shrink-0">
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden sticky top-20">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-50">
        <span className="text-sm font-bold text-zinc-900">Bộ lọc</span>
        {props.hasActiveFilters && (
          <button
            onClick={props.onReset}
            className="text-xs text-amber-600 hover:text-amber-800 font-semibold transition-colors"
          >
            Xoá tất cả
          </button>
        )}
      </div>
      <FilterContent {...props} />
    </div>
  </div>
);

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────
const MobileFilterDrawer = ({ open, onClose, activeFilterCount, onReset, ...filterProps }) => (
  <>
    {/* Backdrop */}
    <div
      className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    />
    {/* Drawer */}
    <div
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Drawer header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-900">Bộ lọc</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button onClick={onReset} className="text-xs text-amber-600 font-semibold">Xoá tất cả</button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors text-zinc-500"
          >
            ✕
          </button>
        </div>
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <FilterContent {...filterProps} onReset={onReset} />
      </div>
      {/* Apply button */}
      <div className="flex-shrink-0 p-4 border-t border-zinc-100">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-amber-600 transition-colors"
        >
          Áp dụng bộ lọc
        </button>
      </div>
    </div>
  </>
);

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function BooksPage() {
  const navigate = useNavigate();

  const [books, setBooks]                             = useState([]);
  const [loading, setLoading]                         = useState(true);
  const [error, setError]                             = useState(null);
  const [page, setPage]                               = useState(0);
  const [totalPage, setTotalPage]                     = useState(0);
  const [genres, setGenres]                           = useState([]);
  const [publishers, setPublishers]                   = useState([]);
  const [authors, setAuthors]                         = useState([]);
  const [sortBy, setSortBy]                           = useState("createdAt");
  const [availableOnly, setAvailableOnly]             = useState(false);
  const [searchInput, setSearchInput]                 = useState("");
  const [searchQuery, setSearchQuery]                 = useState("");
  const [viewMode, setViewMode]                       = useState("grid");
  const [wishlistIds, setWishlistIds]                 = useState(new Set());
  const [toast, setToast]                             = useState(null);
  const [showMobileFilter, setShowMobileFilter]       = useState(false);

  const [activeGenreId, setActiveGenreId]             = useState(null);
  const [activePublisherId, setActivePublisherId]     = useState(null);
  const [activeAuthorId, setActiveAuthorId]           = useState(null);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState(new Set());

  const searchDebounce = useRef(null);

  const hasActiveFilters = !!(activeGenreId || activePublisherId || activeAuthorId || selectedPriceRanges.size > 0 || availableOnly);

  const activeFilterCount = [
    activeGenreId,
    activePublisherId,
    activeAuthorId,
    availableOnly,
  ].filter(Boolean).length + selectedPriceRanges.size;

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
        setGenres(Array.isArray(genRes.data) ? genRes.data : genRes.data.content || []);
        setWishlistIds(new Set((wishRes.data.content || []).map((i) => i.book?.id).filter(Boolean)));
        setPublishers(Array.isArray(pubRes.data) ? pubRes.data : pubRes.data.content || []);
        setAuthors(Array.isArray(authRes.data) ? authRes.data : authRes.data.content || []);
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
      let minPrice, maxPrice;
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

  useEffect(() => { setPage(0); }, [activeGenreId, activePublisherId, activeAuthorId, selectedPriceRanges, availableOnly]);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => { setSearchQuery(val); setPage(0); }, 500);
  };

  const toggleGenre     = (id) => setActiveGenreId(activeGenreId === id ? null : id);
  const togglePublisher = (id) => setActivePublisherId(activePublisherId === id ? null : id);
  const toggleAuthor    = (id) => setActiveAuthorId(activeAuthorId === id ? null : id);
  const togglePriceRange = (idx) => {
    setSelectedPriceRanges((prev) => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });
  };
  const resetFilters = () => {
    setActiveGenreId(null);
    setActivePublisherId(null);
    setActiveAuthorId(null);
    setSelectedPriceRanges(new Set());
    setAvailableOnly(false);
  };

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
        setToast({ message: "Đã thêm vào yêu thích", type: "success" });
      }
    } catch {
      setToast({ message: "Thao tác thất bại", type: "error" });
    }
  };

  const activeGenreName = activeGenreId ? genres.find((g) => g.id === activeGenreId)?.name : null;

  const filterProps = {
    genres, activeGenreId, onGenreToggle: toggleGenre,
    publishers, activePublisherId, onPublisherToggle: togglePublisher,
    authors, activeAuthorId, onAuthorToggle: toggleAuthor,
    selectedPriceRanges, onPriceRangeToggle: togglePriceRange,
    onReset: resetFilters, hasActiveFilters,
  };

  return (
    <div className="max-w-7xl">
      <PageHeader title={activeGenreName ? `Sách ${activeGenreName}` : "Tất cả sách"} />

      {/* ── TOOLBAR ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 mb-4 sm:mb-6 border border-zinc-100 shadow-sm flex flex-wrap items-center gap-2 sm:gap-3">

        {/* Mobile filter button */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all relative"
          style={{
            background: hasActiveFilters ? "#d97706" : "white",
            color: hasActiveFilters ? "white" : "#52525b",
            borderColor: hasActiveFilters ? "#d97706" : "#e4e4e7",
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-amber-600 text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Search */}
        <div className="flex-1 min-w-0 sm:min-w-48 relative">
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-base sm:text-lg pointer-events-none">⌕</span>
          <input
            type="text"
            placeholder="Tìm tiêu đề, tác giả..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl sm:rounded-2xl py-2 sm:py-2.5 pl-8 sm:pl-11 pr-8 sm:pr-10 text-sm outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearchQuery(""); }}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-50 border border-zinc-100 rounded-xl py-2 sm:py-2.5 px-2.5 sm:px-4 text-xs font-bold text-zinc-600 outline-none cursor-pointer hover:border-zinc-300 transition-colors"
          >
            <option value="createdAt">Mới nhất</option>
            <option value="title">Tên A-Z</option>
            <option value="price">Giá</option>
          </select>

          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all border ${
              availableOnly
                ? "bg-amber-600 text-white border-amber-600 shadow-md"
                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {availableOnly ? "✓ " : ""}Sẵn có
          </button>

          <div className="hidden sm:block h-8 w-px bg-zinc-100" />

          {/* View mode */}
          <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === "grid" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === "list" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* ── ACTIVE FILTER CHIPS (mobile quick view) ── */}
      {hasActiveFilters && (
        <div className="lg:hidden flex flex-wrap gap-2 mb-4">
          {activeGenreId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              {genres.find(g => g.id === activeGenreId)?.name}
              <button onClick={() => setActiveGenreId(null)} className="text-amber-600 hover:text-amber-900 ml-0.5">✕</button>
            </span>
          )}
          {activeAuthorId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              {authors.find(a => a.id === activeAuthorId)?.authorName}
              <button onClick={() => setActiveAuthorId(null)} className="text-amber-600 hover:text-amber-900 ml-0.5">✕</button>
            </span>
          )}
          {activePublisherId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              {publishers.find(p => p.id === activePublisherId)?.name}
              <button onClick={() => setActivePublisherId(null)} className="text-amber-600 hover:text-amber-900 ml-0.5">✕</button>
            </span>
          )}
          {[...selectedPriceRanges].map(idx => (
            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              {PRICE_RANGES[idx].label}
              <button onClick={() => togglePriceRange(idx)} className="text-amber-600 hover:text-amber-900 ml-0.5">✕</button>
            </span>
          ))}
          <button onClick={resetFilters} className="text-xs text-zinc-400 hover:text-zinc-700 underline">Xoá tất cả</button>
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div className="flex gap-5 xl:gap-6 items-start">

        {/* Desktop sidebar */}
        <FilterSidebar {...filterProps} />

        {/* Mobile drawer */}
        <MobileFilterDrawer
          open={showMobileFilter}
          onClose={() => setShowMobileFilter(false)}
          activeFilterCount={activeFilterCount}
          {...filterProps}
        />

        {/* ── CONTENT ── */}
        <div className="flex-1 min-w-0">
          {error ? (
            <div className="py-20 text-center bg-red-50 rounded-3xl border border-red-100">
              <p className="text-red-500 font-medium">{error}</p>
              <button onClick={fetchBooks} className="mt-3 text-sm text-red-400 underline">Thử lại</button>
            </div>
          ) : loading ? (
            <div className={viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
              : "space-y-3"
            }>
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : books.length === 0 ? (
            <div className="py-16 sm:py-20 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
              <span className="text-4xl sm:text-5xl block mb-4">🔍</span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-800">Không tìm thấy sách phù hợp</h3>
              <p className="text-zinc-400 text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-x-6 lg:gap-y-10">
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
            <div className="space-y-2.5 sm:space-y-3">
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

          <Pagination
            page={page}
            totalPage={totalPage}
            onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          position="bottom"
          timeout={2500}
        />
      )}
    </div>
  );
}