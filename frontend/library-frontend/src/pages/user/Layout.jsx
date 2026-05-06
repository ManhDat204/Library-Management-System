import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ChatBox from "../../components/ChatBox";

const navLinks = [
  { to: "/home",            label: "Trang chủ"  },
  { to: "/home/books",        label: "Sách"       },
  { to: "/home/wishlist",     label: "Wishlist"   },
  { to: "/home/my-loans",     label: "Đơn hàng"  },
  { to: "/home/subscription", label: "Gói đăng ký"},
];

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false); 

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    const role = user?.role;
    logout();
    navigate(role === "ROLE_ADMIN" ? "/login" : "/home");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ══ HEADER ══ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link to="/home" className="flex items-baseline gap-0.5 flex-shrink-0 no-underline">
            <span className="font-black text-2xl tracking-tight text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Sách<em className="italic text-amber-600 not-italic">Hay</em>
            </span>
            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mb-1 ml-0.5" />
          </Link>

          {/* Search Bar - Tối giản hơn */}
          <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => {
            const isActive = to === "/home" ? location.pathname === "/home" : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to}
                className={`px-4 h-10 flex items-center text-[12px] uppercase tracking-[0.08em] transition-all no-underline relative
                  ${isActive ? "text-gray-900 font-bold" : "text-gray-400 hover:text-gray-600 font-medium"}`}>
                {label}
                {isActive && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-t" />}
              </Link>
            );
          })}
        </nav>

          {/* Right Section — Chỉ giữ lại Ví và Avatar */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Nút Ví - Giữ lại vì là tính năng nạp tiền nhanh */}
                <Link to="/home/wallet"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-black/5 transition-all"
                  title="Ví của tôi">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a2 2 0 100 4h5v-4h-5z" />
                  </svg>
                </Link>

                {/* Dropdown Menu Custom */}
                {/* Dropdown Menu Custom */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-black/10 group-hover:border-amber-600 transition-colors">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-800 text-white text-xs flex items-center justify-center">
                        {user?.fullName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-black/5 z-20 overflow-hidden animate-in fade-in zoom-in duration-150">
     
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="p-1.5">
                        <Link to="/home/profile" onClick={() => setShowUserMenu(false)} 
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg no-underline transition-colors group">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Hồ sơ cá nhân
                        </Link>

                        <Link to="/home/wishlist" onClick={() => setShowUserMenu(false)} 
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg no-underline transition-colors group">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                          </svg>
                          Danh sách yêu thích
                        </Link>

                        <Link to="/home/my-loans" onClick={() => setShowUserMenu(false)} 
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg no-underline transition-colors group">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Đơn mượn
                        </Link>

                        <div className="h-px bg-gray-100 my-1.5 mx-2" />

                        <button onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }} 
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors group">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 no-underline">Đăng nhập</Link>
                <Link to="/register" className="  px-4 py-1.5 rounded-full text-sm font-medium hover:text-gray-900 no-underline  transition-all">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </header>




      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      <footer className="bg-[#1A1C1E] border-t border-white/5">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="text-white font-bold text-xl tracking-tight">
                Sách<em className="text-amber-500 not-italic">Hay</em>
              </span>
              <p className="text-gray-500 text-xs leading-relaxed mt-3">
                Nền tảng thư viện số — kết nối tri thức, kiến tạo tương lai từ những trang sách.
              </p>
            </div>

            {/* Khám phá */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-semibold mb-4">Khám phá</p>
              <ul className="space-y-2">
                {["Sách mới nhất", "Sách hot", "Thể loại", "Tác giả"].map(item => (
                  <li key={item} className="text-gray-500 text-xs hover:text-amber-400 transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>

            {/* Tài khoản */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-semibold mb-4">Tài khoản</p>
              <ul className="space-y-2">
                {["Đơn mượn", "Wishlist", "Ví của tôi", "Hồ sơ"].map(item => (
                  <li key={item} className="text-gray-500 text-xs hover:text-amber-400 transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-semibold mb-4">Hỗ trợ</p>
              <ul className="space-y-2">
                {["Hướng dẫn mượn sách", "Chính sách phạt", "Liên hệ", "FAQ"].map(item => (
                  <li key={item} className="text-gray-500 text-xs hover:text-amber-400 transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          
        </div>
      </footer>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-2xl p-8 w-80 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Đăng xuất?</h3>
            <p className="text-sm text-gray-500 mb-6">Bạn có muốn kết thúc phiên làm việc không?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">Hủy</button>
              <button onClick={handleLogout} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-red-600 transition-all">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
      {user && <ChatBox />}
    </div>
  );
}
