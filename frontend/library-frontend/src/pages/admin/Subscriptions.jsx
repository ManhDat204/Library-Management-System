import { useState, useEffect } from "react";
import { X, Star, Loader2, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Eye } from "lucide-react";

// Import common components
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// Import services
import { subscriptionService } from "../../services/subscriptionService";

function SubBadge({ sub }) {
  if (sub.isExpired === true)  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">Hết hạn</span>;
  if (sub.isActive === true)   return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">Đang hoạt động</span>;
  if (sub.isActive === false)  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Chưa kích hoạt</span>;
  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">—</span>;
}

function Subscriptions() {
  const [subs, setSubs]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast]           = useState(null);
  const [confirm, setConfirm]       = useState(null);
  const [detail, setDetail]         = useState(null);

  const showToast = (msg, type = "info") => setToast({ message: msg, type });
  const pageSize  = 10;

  const fetchSubs = async (p = page) => {
    setLoading(true);
    try {
      const res = await subscriptionService.searchSubscriptions({ page: p, size: pageSize });
      const data = res.data || res;
      if (Array.isArray(data)) {
        setSubs(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else if (data?.content) {
        setSubs(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else {
        setSubs(data ? [data] : []);
        setTotalPages(1);
        setTotalElements(data ? 1 : 0);
      }
    } catch { showToast("Không thể tải danh sách đăng ký", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubs(); }, [page]);

  const handleDeactivateExpired = async () => {
    setConfirm(null);
    try {
      await subscriptionService.deactivateExpired();
      showToast("Đã cập nhật các gói hết hạn!", "success");
      fetchSubs();
    } catch { showToast("Thao tác thất bại", "error"); }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity:0 } to { transform: translateX(0); opacity:1 } }
        @keyframes fadeUp  { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        .modal-enter { animation: fadeUp 0.25s ease; }
      `}</style>

      {toast   && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          title={confirm.title} message={confirm.message}
          confirmLabel={confirm.confirmLabel} confirmClass={confirm.confirmClass}
          onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)}
        />
      )}

      <div className="p-6 w-full">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Quản lý đăng ký</h2>
            </div>
          </div>
          
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ID", "Người dùng", "Gói đăng ký", "Ngày bắt đầu", "Ngày kết thúc", "Giá", "Trạng thái", ""].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                    <Loader2 size={28} className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">Đang tải...</p>
                  </td></tr>
                ) : subs.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                    <Star size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Chưa có đăng ký nào</p>
                  </td></tr>
                ) : subs.map(sub => (
                  <tr key={sub.id} className="border-b border-gray-50 hover:bg-amber-50/20 transition">
                    <td className="px-5 py-3.5 font-mono text-sm text-gray-900">{sub.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900">{sub.userName || sub.userFullName || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold">
                        {sub.planName || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">{sub.startDate || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">{sub.endDate || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">{sub.price ? Number(sub.price).toLocaleString() + " " + (sub.currency || "VND") : "—"}</td>
                    <td className="px-5 py-3.5"><SubBadge sub={sub} /></td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setDetail(sub)} title="Chi tiết"
                        className="p-2 bg-gray-50 text-gray-900 rounded-lg hover:bg-gray-100 transition">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-sm text-gray-500">Trang {page + 1} / {totalPages} · {totalElements} đăng ký</p>
              <div className="flex gap-1.5">
                <button onClick={() => setPage(0)} disabled={page === 0} className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition">«</button>
                <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0} className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition flex items-center gap-1"><ChevronLeft size={14}/> Trước</button>
                {Array.from({ length: totalPages }, (_, i) => i).filter(i => Math.abs(i - page) <= 2).map(i => (
                  <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${i === page ? "bg-amber-500 text-white" : "border border-gray-200 hover:bg-white text-gray-600"}`}>{i+1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1} className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition flex items-center gap-1">Sau <ChevronRight size={14}/></button>
                <button onClick={() => setPage(totalPages-1)} disabled={page >= totalPages-1} className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-white transition">»</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl modal-enter">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Chi tiết đăng ký -  {detail.id}</h2>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              {[
                ["Người dùng",    detail.userName || detail.userFullName],
                ["Gói đăng ký",   detail.planName],
                ["Mã gói",        detail.planCode],
                ["Giá",           detail.price ? Number(detail.price).toLocaleString() + " " + (detail.currency || "VND") : "—"],
                ["Ngày bắt đầu",  detail.startDate  || "—"],
                ["Ngày kết thúc", detail.endDate    || "—"],
                ["Còn lại",       detail.daysRemaining != null ? detail.daysRemaining + " ngày" : "—"],
                ["Số sách tối đa",detail.maxBooksAllowed != null ? detail.maxBooksAllowed + " quyển" : "—"],
                ["Ngày mượn tối đa/quyển", detail.maxDaysPerBook != null ? detail.maxDaysPerBook + " ngày" : "—"],
                ["Ghi chú",       detail.notes || "—"],
              ].filter(([, v]) => v !== undefined && v !== null).map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">{label}</p>
                  <p className="text-gray-900 font-medium">{val}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">Trạng thái</p>
                <SubBadge sub={detail} />
              </div>
            </div>
            <div className="flex justify-end px-6 pb-6">
              <button onClick={() => setDetail(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Subscriptions;