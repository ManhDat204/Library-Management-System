import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const COVER_COLORS = ["#1a1a2e","#2d1b00","#0d2137","#1a2e1a","#2e1a2e","#2e2200","#1e2e20","#2e1e1e"];

const STATUS = {
  CHECK_OUT:      { label:"Chờ vận chuyển",  color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-100",   dot:"bg-blue-500"   },
  SHIPPING:       { label:"Đang vận chuyển", color:"text-indigo-600", bg:"bg-indigo-50", border:"border-indigo-100",  dot:"bg-indigo-500" },
  DELIVERED:      { label:"Đang mượn",       color:"text-teal-600",   bg:"bg-teal-50",   border:"border-teal-100",    dot:"bg-teal-500"   },
  OVERDUE:        { label:"Quá hạn",         color:"text-red-600",    bg:"bg-red-50",    border:"border-red-100",     dot:"bg-red-500"    },
  PENDING_RETURN: { label:"Chờ xác nhận trả",color:"text-amber-600",  bg:"bg-amber-50",  border:"border-amber-100",   dot:"bg-amber-400"  },
  RETURNED:       { label:"Hoàn thành",      color:"text-green-700",  bg:"bg-green-50",  border:"border-green-100",   dot:"bg-green-500"  },
  DAMAGED:        { label:"Hư hỏng",         color:"text-orange-600", bg:"bg-orange-50", border:"border-orange-100",  dot:"bg-orange-500" },
  LOST:           { label:"Mất sách",        color:"text-gray-500",   bg:"bg-gray-100",  border:"border-gray-200",    dot:"bg-gray-400"   },
  CANCELLED:      { label:"Đã huỷ",          color:"text-gray-400",   bg:"bg-gray-50",   border:"border-gray-100",    dot:"bg-gray-300"   },
};

const TABS = [
  { key:"",               label:"Tất cả"         },
  { key:"CHECK_OUT",      label:"Chờ vận chuyển"  },
  { key:"SHIPPING",       label:"Đang giao"       },
  { key:"DELIVERED",      label:"Đang mượn"       },
  { key:"OVERDUE",        label:"Quá hạn"         },
  { key:"PENDING_RETURN", label:"Chờ xác nhận"    },
  { key:"RETURNED",       label:"Đã hoàn thành"   },
];

const fmtDate = (d) => !d ? "—" : new Date(d).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"});
const fmtDateTime = (d, t) => {
  if (!d) return "—";
  return `${new Date(d).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}${t ? ` ${t}` : ""}`;
};
const getDiff = (due) => !due ? null : Math.ceil((new Date(due)-new Date())/86400000);

const Cover = ({ loan }) => {
  const [err,setErr] = useState(false);
  const color = COVER_COLORS[(loan?.bookId||0)%COVER_COLORS.length];
  const initials = (loan?.bookTitle||"??").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  if (loan?.bookCoverImage && !err)
    return <img src={loan.bookCoverImage} alt={loan.bookTitle} className="w-full h-full object-cover" onError={()=>setErr(true)}/>;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{background:`linear-gradient(160deg,${color},#000)`}}>
      <span className="font-black text-lg select-none" style={{fontFamily:"'Playfair Display',serif",color:"rgba(255,255,255,0.22)"}}>{initials}</span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status]||STATUS.CHECK_OUT;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${s.color} ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`}/>{s.label}
    </span>
  );
};

const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-12 bg-gray-50 border-b border-gray-100"/>
    <div className="flex gap-4 p-4">
      <div className="w-16 bg-gray-100 rounded-xl flex-shrink-0" style={{aspectRatio:"3/4"}}/>
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-3.5 bg-gray-100 rounded-lg w-4/5"/>
        <div className="h-2.5 bg-gray-100 rounded-lg w-2/5"/>
        <div className="h-2.5 bg-gray-100 rounded-lg w-3/5"/>
      </div>
    </div>
  </div>
);

const LoanCard = ({ loan, fine, onClick }) => {
  const status    = loan.bookLoanStatus;
  const s         = STATUS[status]||STATUS.CHECK_OUT;
  const hasFine   = fine && fine.status==="PENDING" && Number(fine.amount)>0;
  const diff      = getDiff(loan.dueDate);
  const isOverdue = status==="OVERDUE";
  const isShipping= status==="SHIPPING";

  return (
    <div onClick={onClick} className="bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer overflow-hidden group">
      <div className={`px-4 py-2.5 flex items-center justify-between ${s.bg} border-b ${s.border}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Đơn #{loan.id}</span>
          {hasFine && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">⚡ Có phạt</span>}
        </div>
        <StatusBadge status={status}/>
      </div>
      <div className="flex gap-4 p-4">
        <div className="w-16 flex-shrink-0 rounded-xl overflow-hidden shadow-sm" style={{aspectRatio:"3/4"}}>
          <Cover loan={loan}/>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors" style={{fontFamily:"'Playfair Display',serif"}}>
            {loan.bookTitle||"—"}
          </h3>
          {loan.bookAuthor && <p className="text-xs text-gray-400 mt-0.5 italic truncate">bởi {loan.bookAuthor}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
            <span className="text-xs text-gray-400">Đặt: <span className="text-gray-600 font-medium">{fmtDateTime(loan.checkoutDate, loan.checkoutTime)}</span></span>
            <span className="text-xs text-gray-400">Hạn: <span className={`font-semibold ${isOverdue?"text-red-500":"text-gray-600"}`}>{fmtDate(loan.dueDate)}</span></span>
          </div>
          <div className="mt-2">
            {isShipping && (
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">🚚 Đang trên đường đến bạn</span>
            )}
            {status==="DELIVERED" && diff!==null && (
              diff<0  ? <span className="text-xs font-bold text-red-600   bg-red-50   border border-red-100   px-2 py-0.5 rounded-full">⚠ Quá {Math.abs(diff)} ngày</span>
              :diff===0 ? <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">⏰ Hết hạn hôm nay</span>
              :diff<=3  ? <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">◷ Còn {diff} ngày</span>
              :           <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">◷ Còn {diff} ngày</span>
            )}
            {isOverdue && <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">⚠ Quá {diff!==null?Math.abs(diff)+" ngày":""}</span>}
            {status==="RETURNED" && loan.returnDate && <p className="text-xs text-green-600 font-medium">✓ Đã trả {fmtDate(loan.returnDate)}</p>}
          </div>
        </div>
        <div className="flex items-center text-gray-300 pl-1 flex-shrink-0 text-lg">›</div>
      </div>
      {hasFine && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-red-600">⚡ Phạt chưa thanh toán: {Number(fine.amount).toLocaleString("vi-VN")}₫</span>
          <span className="text-xs text-red-400 font-medium">Xem chi tiết →</span>
        </div>
      )}
      {isShipping && (
        <div className="border-t border-indigo-100 bg-indigo-50 px-4 py-2 text-center">
          <span className="text-xs text-indigo-600 font-medium">Bấm vào để xác nhận đã nhận hàng 📦</span>
        </div>
      )}
    </div>
  );
};

const Toast = ({ message, onDone }) => {
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[]);
  return <div className="fixed bottom-8 right-8 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm"><span className="text-green-400">✓</span>{message}</div>;
};

export default function MyLoan() {
  const navigate = useNavigate();
  const tabsRef  = useRef(null);

  const [loans,setLoans]           = useState([]);
  const [finesMap,setFinesMap]     = useState({});
  const [loading,setLoading]       = useState(true);
  const [error,setError]           = useState(null);
  const [activeTab,setActiveTab]   = useState("");
  const [page,setPage]             = useState(0);
  const [totalPages,setTotalPages] = useState(0);
  const [toast,setToast]           = useState(null);

  // ── Đếm TOÀN BỘ đơn (không filter tab) để banner luôn hiển thị ──
  const [globalCounts,setGlobalCounts] = useState({ shipping:0, overdue:0 });

  // Fetch counts một lần duy nhất khi mount
  useEffect(()=>{
    api.get("/book-loans/my",{params:{size:200}})
      .then(r=>{
        const all = r.data.content||[];
        setGlobalCounts({
          shipping: all.filter(l=>l.bookLoanStatus==="SHIPPING").length,
          overdue:  all.filter(l=>l.bookLoanStatus==="OVERDUE").length,
        });
      }).catch(()=>{});
  },[]);

  useEffect(()=>{fetchLoans();},[activeTab,page]);

  const fetchLoans = async () => {
    try {
      setLoading(true); setError(null);
      const [lRes,fRes] = await Promise.all([
        api.get("/book-loans/my",{params:{status:activeTab||undefined,page,size:8}}),
        api.get("/fines/my-fines").catch(()=>({data:[]})),
      ]);
      setLoans(lRes.data.content||[]);
      setTotalPages(lRes.data.totalPages||0);
      const map={};
      (fRes.data||[]).forEach(f=>{if(f.status==="PENDING"&&f.bookLoanId)map[f.bookLoanId]=f;});
      setFinesMap(map);
    } catch { setError("Không thể tải danh sách."); }
    finally { setLoading(false); }
  };

  const handleTabClick = (key, idx) => {
    setActiveTab(key);
    setPage(0);
    // Scroll tab đang chọn vào giữa màn hình
    if (tabsRef.current) {
      const btn = tabsRef.current.children[idx];
      if (btn) btn.scrollIntoView({ behavior:"smooth", block:"nearest", inline:"center" });
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.3s ease both}
        .tabs-scroll::-webkit-scrollbar{display:none}
        .tabs-scroll{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="min-h-screen bg-gray-50" style={{fontFamily:"'DM Sans',sans-serif"}}>
        <div className="max-w-2xl mx-auto px-4 py-6">


          <div className="mb-5 fade-up">
            <h1 className="text-2xl font-extrabold text-gray-900" style={{fontFamily:"'Playfair Display',serif"}}>Danh sách đơn hàng</h1>
            <p className="text-sm text-gray-400 mt-0.5">Theo dõi trạng thái đơn mượn sách</p>
          </div>

       
          {(globalCounts.shipping > 0 || globalCounts.overdue > 0) && (
            <div className="space-y-2 mb-4 fade-up">
              {globalCounts.shipping > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">🚚</span>
                  <p className="text-sm text-indigo-700 font-semibold">
                    Có <strong>{globalCounts.shipping}</strong> đơn đang được vận chuyển đến bạn
                  </p>
                </div>
              )}
              {globalCounts.overdue > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">⚠️</span>
                  <p className="text-sm text-red-700 font-semibold">
                    Có <strong>{globalCounts.overdue}</strong> đơn quá hạn — vui lòng trả sách sớm
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Tabs — cuộn ngang, không bị cắt ── */}
          <div className="relative mb-4 fade-up" style={{animationDelay:"0.05s"}}>
            {/* Fade trái */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"/>
            {/* Fade phải */}
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"/>

            <div
              ref={tabsRef}
              className="tabs-scroll flex gap-1.5 overflow-x-auto pb-1"
              style={{paddingLeft:4, paddingRight:4}}
            >
              {TABS.map((tab, idx) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key, idx)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    activeTab === tab.key
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {error ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">😕</p>
              <p className="text-sm mb-4">{error}</p>
              <button onClick={fetchLoans} className="bg-gray-900 text-white border-0 rounded-xl px-5 py-2 text-sm cursor-pointer">Thử lại</button>
            </div>
          ) : loading ? (
            <div className="space-y-3">{Array(4).fill(0).map((_,i)=><Skeleton key={i}/>)}</div>
          ) : loans.length===0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">

              <p className="text-base font-semibold text-gray-700">{activeTab?"Không có đơn nào":"Bạn chưa mượn sách nào"}</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Khám phá thư viện và mượn sách yêu thích!</p>
              <button onClick={()=>navigate("/home/books")} className="bg-gray-900 text-white border-0 rounded-xl px-5 py-2 text-sm font-bold cursor-pointer hover:bg-black transition-colors">Xem sách </button>
            </div>
          ) : (
            <div className="space-y-3 fade-up" style={{animationDelay:"0.1s"}}>
              {loans.map(loan=>(
                <LoanCard key={loan.id} loan={loan} fine={finesMap[loan.id]||null}
                  onClick={()=>navigate(`/home/my-loans/${loan.id}`)}/>
              ))}
            </div>
          )}

  
          {totalPages>1 && (
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
              <button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="px-5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold disabled:opacity-30 hover:bg-gray-50 cursor-pointer">← Trước</button>
              {Array.from({length:totalPages},(_,i)=>i).filter(i=>Math.abs(i-page)<=2).map(i=>(
                <button key={i} onClick={()=>setPage(i)} className={`w-10 h-10 rounded-xl text-sm font-bold cursor-pointer ${page===i?"bg-gray-900 text-white":"bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{i+1}</button>
              ))}
              <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)} className="px-5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold disabled:opacity-30 hover:bg-gray-50 cursor-pointer">Sau →</button>
            </div>
          )}
        </div>
      </div>

      {toast&&<Toast message={toast} onDone={()=>setToast(null)}/>}
    </>
  );
}