import { useState, useEffect } from 'react';
import { 
  Bell, 
  HelpCircle,
  LogOut,
  User,
  Settings,
  CheckCircle,
  ExternalLink,
  Mail,
  Package,
  ShoppingBag,
  Users as UsersIcon,
  Menu,
  Zap,
  Sparkles,
  Activity,
  ChevronDown,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const AdminNavbar = ({ onMenuClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const adminName = localStorage.getItem('adminName') || 'Administrator';
  const adminEmail = localStorage.getItem('adminEmail') || 'admin@baghaven.com';

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/notifications');
      
      if (response.data.success) {
        const formattedNotifications = response.data.notifications.map(notif => ({
          ...notif,
          _id: notif._id || `temp-${Date.now()}-${Math.random()}`,
          read: notif.read || false,
          data: notif.data || {},
          createdAt: notif.createdAt ? new Date(notif.createdAt) : new Date()
        }));
        
        setNotifications(formattedNotifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await API.put(`/admin/notifications/${id}/read`);
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, read: true } : notif
      ));
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, read: true } : notif
      ));
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await API.put('/admin/notifications/read-all');
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setShowNotifications(false);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    }
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification._id);
    
    if (notification.type === 'order' && notification.data?.orderId) {
      navigate(`/admin/orders/${notification.data.orderId}`);
    } else if (notification.type === 'user' && notification.data?.userId) {
      navigate(`/admin/users/${notification.data.userId}`);
    } else {
      setShowNotifications(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order': return <ShoppingBag className="text-green-600" size={18} />;
      case 'user': return <UsersIcon className="text-blue-600" size={18} />;
      case 'product': return <Package className="text-purple-600" size={18} />;
      default: return <Bell className="text-gray-600" size={18} />;
    }
  };

  const getNotificationTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md">
      <div className="px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          {/* Left: Mobile menu button + Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-all text-gray-700 lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                <Activity size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Admin</h1>
            </div>

            {/* Search Bar for Desktop */}
            <div className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm w-64"
                />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Help */}
            <button
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-all relative group text-gray-700"
              aria-label="Help"
              onClick={() => navigate('/admin/help')}
              title="Help Center"
            >
              <HelpCircle size={20} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-lg hover:bg-gray-100 transition-all relative group text-gray-700"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-slide-down overflow-hidden">
                    <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm">
                          <Bell size={20} className="text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <>
                            <span className="text-xs bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1 rounded-full font-bold shadow-sm">
                              {unreadCount} new
                            </span>
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="text-xs text-purple-600 hover:text-purple-700 font-bold hover:underline"
                            >
                              Mark all
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent mx-auto"></div>
                          <p className="text-gray-600 font-bold mt-3">Loading notifications...</p>
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all group ${
                              !notification.read ? 'bg-purple-50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 p-2.5 rounded-lg ${
                                notification.type === 'order' ? 'bg-green-100' :
                                notification.type === 'user' ? 'bg-blue-100' :
                                'bg-purple-100'
                              }`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-bold text-gray-900">{notification.message}</p>
                                  {!notification.read && (
                                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-full animate-pulse shadow-sm"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 font-bold mt-1 flex items-center gap-1">
                                  <Zap size={12} className="text-green-500" />
                                  {getNotificationTime(notification.createdAt)}
                                </p>
                                {notification.data && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold">
                                      {notification.type}
                                    </span>
                                    <ExternalLink size={12} className="text-purple-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-purple-400" />
                          </div>
                          <p className="text-gray-600 font-bold">No notifications yet</p>
                          <p className="text-gray-500 text-sm mt-1 font-bold">You're all caught up!</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button 
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/admin/notifications');
                          }}
                          className="w-full text-sm text-purple-600 hover:text-purple-700 font-bold hover:underline flex items-center justify-center gap-2"
                        >
                          <span>View all notifications</span>
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-3 border-l border-gray-300 hover:bg-gray-100 rounded-lg pr-2 py-2 transition-all group"
                title="Admin Profile"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{adminName}</p>
                  <p className="text-xs text-gray-600 font-bold flex items-center gap-1 justify-end">
                    <Sparkles size={12} className="text-purple-600" />
                    Administrator
                  </p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 animate-slide-down overflow-hidden">
                    {/* Profile Info */}
                    <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                          {adminName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{adminName}</p>
                          <p className="text-xs text-gray-600 font-bold flex items-center gap-1 mt-0.5">
                            <Mail size={12} />
                            {adminEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full font-bold shadow-sm">
                          Admin
                        </span>
                        <span className="text-xs text-gray-600 font-bold flex items-center gap-1">
                          <Zap size={12} className="text-green-500" />
                          Online
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/admin/profile');
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-all text-left group text-gray-700"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-bold">My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/admin/settings');
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-all text-left group text-gray-700"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                        <Settings className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-bold">Settings</span>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 transition-all text-left group"
                    >
                      <div className="p-2 bg-red-100 rounded-lg group-hover:scale-110 transition-transform">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <span className="font-bold">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add animations */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default AdminNavbar;