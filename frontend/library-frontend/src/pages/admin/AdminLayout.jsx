import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, LogOut, Home, Book, Users, Tag, RefreshCw, AlertCircle, CreditCard, Star, BarChart3 } from "lucide-react";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleLabel = (role) => {
    if (role === "ROLE_ADMIN") return "Quản trị viên";
    if (role === "ROLE_STAFF") return "Nhân viên";
    return role;
  };

  const menuItems = [
    { label: "Dashboard",           path: "/dashboard",                    icon: Home },
    { label: "Quản Lý Sách",        path: "/dashboard/books",              icon: Book },
    { label: "Quản Lý Tài Khoản",  path: "/dashboard/users",              icon: Users },
    { label: "Quản Lý Tác Giả",      path: "/dashboard/authors",            icon: Users },
    { label: "Quản Lý Thể Loại",    path: "/dashboard/genres",             icon: Tag },
    { label: "Quản Lý NXB",         path: "/dashboard/publishers",        icon: Tag },
    { label: "Quản Lý Đơn Hàng",   path: "/dashboard/loans",              icon: RefreshCw },
    { label: "Quản Lý Phạt",        path: "/dashboard/fines",              icon: AlertCircle },
    { label: "Gói Đăng Ký",         path: "/dashboard/subscription-plans", icon: CreditCard },
    { label: "Quản Lý Đăng Ký",     path: "/dashboard/subscriptions",      icon: Star },
    { label: "Thống Kê & Báo Cáo",  path: "/dashboard/reports",            icon: BarChart3 },
  ];

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-5">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 md:p-2.5 hover:bg-gray-100 rounded-xl transition text-gray-600 flex-shrink-0"
            >
              <Menu size={20} className="md:w-6 md:h-6" />
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-1.5 md:gap-2.5 whitespace-nowrap md:whitespace-normal">
              📚 <span className="hidden sm:inline">Library Management</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-xs">{user.fullName || user.username}</p>
              </div>
            )}
            {user?.profileImage && (
              <img src={user.profileImage} alt="Profile" className="w-8 md:w-10 h-8 md:h-10 rounded-full object-cover flex-shrink-0" />
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-5 py-2 md:py-2.5 text-red-600 rounded-xl hover:bg-gray-100 transition text-xs md:text-base font-semibold flex-shrink-0"
            >
              <LogOut size={16} className="md:w-4.5 md:h-4.5" />
              <span className="hidden md:inline">Đăng Xuất</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile/Tablet Sidebar with Overlay */}
        {sidebarOpen && (
          <div
            className="fixed md:hidden inset-0 bg-black/40 z-30 top-[60px]"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <aside
          className={`fixed md:static bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0 overflow-y-auto z-40 top-[60px] left-0 h-[calc(100vh-60px)] md:h-auto
            ${sidebarOpen ? "w-56" : "w-0 md:w-56"}
          }`}
        >
          <nav className="p-3 md:p-4 flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition font-medium mb-0.5 text-sm md:text-base
                    ${active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <Icon size={16} className="flex-shrink-0 md:w-4 md:h-4" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto text-sm md:text-base px-3 md:px-6 py-3 md:py-6">
          <Outlet />
        </main>

      </div>

      <footer className="bg-white border-t border-gray-100 text-center py-2 md:py-3 text-gray-700 text-xs px-4">
        
      </footer>

    </div>
  );
}

export default AdminLayout;