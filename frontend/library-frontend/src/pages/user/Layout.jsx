import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ChatBox from "../../pages/user/ChatBot";

const navLinks = [
  { to: "/home",            label: "Trang chủ"  },
  { to: "/home/books",      label: "Sách"        },
  { to: "/home/wishlist",   label: "Wishlist"    },
  { to: "/home/my-loans",   label: "Đơn hàng"   },
  { to: "/home/subscription", label: "Gói đăng ký" },
];

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    const role = user?.role;
    logout();
    navigate(role === "ROLE_ADMIN" ? "/login" : "/home");
  };

  const closeMobileMenu = () => setShowMobileMenu(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">

      <header
        className="sticky top-0 z-50"
        style={{
          background: "linear-gradient(135deg, #fffdf8 0%, #fff8ee 50%, #fdf6f0 100%)",
          boxShadow: "0 2px 20px rgba(180,110,20,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          <Link to="/home" className="flex items-baseline gap-0.5 flex-shrink-0 no-underline">
            <span
              className="font-black text-2xl sm:text-3xl tracking-tight text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Book<em className="italic text-amber-600 not-italic">ify</em>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center font-bold">
            {navLinks.map(({ to, label }) => {
              const isActive =
                to === "/home"
                  ? location.pathname === "/home"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 xl:px-4 h-9 flex items-center text-sm xl:text-base font-bold transition-all no-underline rounded-full whitespace-nowrap
                    ${isActive
                      ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-semibold shadow-sm"
                      : "text-stone-500 hover:bg-amber-50 hover:text-amber-800"
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>


          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
  
                <Link
                  to="/home/wallet"
                  className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-gray-500 hover:bg-black/5 transition-all"
                  title="Ví của tôi"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a2 2 0 100 4h5v-4h-5z" />
                  </svg>
                </Link>

    
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 focus:outline-none group"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-black/10 group-hover:border-amber-600 transition-colors">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 text-white text-xs flex items-center justify-center">
                          {user?.fullName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-black/5 z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                        </div>
                        <div className="p-1.5">
                          <Link to="/home/profile" onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg no-underline transition-colors group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Hồ sơ cá nhân
                          </Link>

                          <Link to="/home/wallet" onClick={() => setShowUserMenu(false)}
                            className="flex sm:hidden items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg no-underline transition-colors group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a2 2 0 100 4h5v-4h-5z" />
                            </svg>
                            Ví của tôi
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
                          <button
                            onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
                          >
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
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 no-underline">Đăng nhập</Link>
                <Link to="/register" className="px-4 py-1.5 rounded-full text-sm font-medium hover:text-gray-900 no-underline transition-all">Đăng ký</Link>
              </div>
            )}


            <button
              className="lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-amber-50 transition-colors gap-[5px]"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Mở menu"
            >
              <span className={`block h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 ${showMobileMenu ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 ${showMobileMenu ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 ${showMobileMenu ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>


        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${showMobileMenu ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
          style={{ background: "linear-gradient(180deg, #fff8ee 0%, #fdf6f0 100%)" }}
        >
          <div className="px-4 pb-4 pt-2 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => {
              const isActive =
                to === "/home"
                  ? location.pathname === "/home"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMobileMenu}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all
                    ${isActive
                      ? "bg-amber-100 text-amber-900"
                      : "text-stone-600 hover:bg-amber-50 hover:text-amber-800"
                    }`}
                >
                  {label}
                </Link>
              );
            })}

  
            {!user && (
              <div className="flex gap-2 mt-2 pt-3 border-t border-amber-100">
                <Link to="/login" onClick={closeMobileMenu}
                  className="flex-1 text-center py-2 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 no-underline">
                  Đăng nhập
                </Link>
                <Link to="/register" onClick={closeMobileMenu}
                  className="flex-1 text-center py-2 rounded-xl text-sm font-semibold text-white bg-amber-500 no-underline">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>


      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>


      <footer className="bg-[#1A1C1E] border-t border-white/5">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">

            <div className="col-span-2 md:col-span-1">
              <span className="text-white font-bold text-xl tracking-tight">
                Book<em className="text-amber-500 not-italic">ify</em>
              </span>
              <p className="text-gray-500 text-xs leading-relaxed mt-3">
                Nền tảng thư viện số - kết nối tri thức, kiến tạo tương lai từ những trang sách.
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-semibold mb-3 sm:mb-4">Khám phá</p>
              <ul className="space-y-2">
                {["Sách mới nhất", "Sách hot", "Thể loại", "Tác giả"].map(item => (
                  <li key={item} className="text-gray-500 text-xs hover:text-amber-400 transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-semibold mb-3 sm:mb-4">Tài khoản</p>
              <ul className="space-y-2">
                {["Đơn mượn", "Wishlist", "Ví của tôi", "Hồ sơ"].map(item => (
                  <li key={item} className="text-gray-500 text-xs hover:text-amber-400 transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-semibold mb-3 sm:mb-4">Hỗ trợ</p>
              <ul className="space-y-2">
                {["Hướng dẫn mượn sách", "Chính sách phạt", "Liên hệ", "FAQ"].map(item => (
                  <li key={item} className="text-gray-500 text-xs hover:text-amber-400 transition-colors cursor-pointer">{item}</li>
                ))}
              </ul>
            </div>
          </div>


          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs text-center sm:text-left">
              
            </p>
            <div className="flex items-center gap-4">
              {["Điều khoản", "Riêng tư", "Cookie"].map(item => (
                <span key={item} className="text-gray-600 text-xs hover:text-amber-400 transition-colors cursor-pointer">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>


      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-xs text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3
              className="text-xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Đăng xuất?
            </h3>
            <p className="text-sm text-gray-500 mb-6">Xác nhận đăng xuất tài khoản?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-red-600 transition-all"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {user && <ChatBox />}
    </div>
  );
}