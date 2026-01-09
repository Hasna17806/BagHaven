import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart3,
  LogOut,
  Shield,
  Package,
  Settings,
  Bell,
  ChevronRight,
  Zap,
  Menu,
  X
} from "lucide-react";

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminEmail, setAdminEmail] = useState("admin@example.com");

  useEffect(() => {
    try {
      const token = localStorage.getItem("adminToken");
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        if (decoded.email) {
          setAdminEmail(decoded.email);
        }
      }
    } catch (e) {
      console.log("Could not decode admin token");
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    navigate("/admin/login");
  };

  const menuItems = [
    { 
      path: "/admin/dashboard", 
      label: "Dashboard", 
      icon: <LayoutDashboard size={20} />,
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      path: "/admin/users", 
      label: "Users", 
      icon: <Users size={20} />,
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      path: "/admin/products", 
      label: "Products", 
      icon: <Package size={20} />,
      gradient: "from-orange-500 to-amber-500"
    },
    { 
      path: "/admin/orders", 
      label: "Orders", 
      icon: <ShoppingCart size={20} />,
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      path: "/admin/revenue", 
      label: "Analytics", 
      icon: <BarChart3 size={20} />,
      gradient: "from-indigo-500 to-purple-500"
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 min-h-screen shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="h-20 flex items-center px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">AdminPro</h1>
                <p className="text-xs text-gray-500 font-medium">Control Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r " + item.gradient + " text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className={`transition-transform duration-300 ${isActive(item.path) ? "scale-110" : "group-hover:scale-110"}`}>
                    {item.icon}
                  </div>
                  <span className="flex-1">{item.label}</span>
                  
                  <ChevronRight 
                    size={16} 
                    className={`transition-all duration-300 ${
                      isActive(item.path) 
                        ? "opacity-100 translate-x-0" 
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </p>
              <div className="space-y-2">
                <Link
                  to="/admin/settings"
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
                >
                  <Settings size={20} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="flex-1">Settings</span>
                </Link>
                <Link
                  to="/admin/notifications"
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
                >
                  <Bell size={20} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="flex-1">Notifications</span>
                  {/* <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full shadow-md">
                    3
                  </span> */}
                </Link>
              </div>
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 p-4">
            {/* Admin Profile */}
            <div className="mb-3 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md">
                    {adminEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{adminEmail}</p>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    <Zap size={12} className="text-green-500" />
                    Active Now
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logoutHandler}
              className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg"
            >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 shadow-lg ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="h-20 flex items-center px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">AdminPro</h1>
                <p className="text-xs text-gray-500 font-medium">Control Panel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-auto p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r " + item.gradient + " text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className={`transition-transform duration-300 ${isActive(item.path) ? "scale-110" : "group-hover:scale-110"}`}>
                    {item.icon}
                  </div>
                  <span className="flex-1">{item.label}</span>
                  
                  <ChevronRight 
                    size={16} 
                    className={`transition-all duration-300 ${
                      isActive(item.path) 
                        ? "opacity-100 translate-x-0" 
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </p>
              <div className="space-y-2">
                <Link
                  to="/admin/settings"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
                >
                  <Settings size={20} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="flex-1">Settings</span>
                </Link>
                <Link
                  to="/admin/notifications"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
                >
                  <Bell size={20} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="flex-1">Notifications</span>
                  {/* <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full shadow-md">
                    3
                  </span> */}
                </Link>
              </div>
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 p-4">
            {/* Admin Profile */}
            <div className="mb-3 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md">
                    {adminEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{adminEmail}</p>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    <Zap size={12} className="text-green-500" />
                    Active Now
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logoutHandler();
                onClose();
              }}
              className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg"
            >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;