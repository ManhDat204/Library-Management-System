import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, LogOut, Home, Book, Users, Tag, RefreshCw, AlertCircle, CreditCard, Star } from "lucide-react";

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
    { label: "Quản Lý Người Dùng",  path: "/dashboard/users",              icon: Users },
    { label: "Quản Lý Tác Giả",      path: "/dashboard/authors",            icon: Users },
    { label: "Quản Lý Thể Loại",    path: "/dashboard/genres",             icon: Tag },
    { label: "Quản Lý NXB",         path: "/dashboard/publishers",        icon: Tag },
    { label: "Quản Lý Đơn Hàng",   path: "/dashboard/loans",              icon: RefreshCw },
    { label: "Quản Lý Phạt",        path: "/dashboard/fines",              icon: AlertCircle },
    { label: "Gói Đăng Ký",         path: "/dashboard/subscription-plans", icon: CreditCard },
    { label: "Quản Lý Đăng Ký",     path: "/dashboard/subscriptions",      icon: Star },
  ];

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition text-gray-600"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              📚 <span>Library Management</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.fullName || user.username}</p>

              </div>
            )}
            {user?.profileImage && (
              <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 text-red-600 rounded-xl hover:bg-gray-100 transition text-base font-semibold"
            >
              <LogOut size={18} />
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0 overflow-y-auto ${sidebarOpen ? "w-56" : "w-0"}
          }`}
        >
          <nav className="p-4 flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition font-medium mb-0.5
                    ${active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto text-base">
          <Outlet />
        </main>

      </div>

      <footer className="bg-white border-t border-gray-100 text-center py-3 text-gray-400 text-xs">
        © 2026 Library Management System. All rights reserved.
      </footer>

    </div>
  );
}

export default AdminLayout;