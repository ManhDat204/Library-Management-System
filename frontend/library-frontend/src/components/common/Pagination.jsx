import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;

  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - delta && i <= page + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition flex items-center gap-1"
      >
        <ChevronLeft size={14} /> Trước
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots${i}`} className="text-gray-300 px-1">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
              p === page
                ? "bg-sky-500 text-white shadow-sm"
                : "border border-gray-200 hover:bg-white text-gray-600"
            }`}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition flex items-center gap-1"
      >
        Tiếp <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default Pagination;
