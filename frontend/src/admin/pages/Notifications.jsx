import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Filter, 
  Calendar,
  Search,
  Eye,
  EyeOff,
  Check,
  X,
  Clock,
  RefreshCw,
  Package,
  ShoppingCart,
  User,
  AlertCircle,
  Sparkles,
  Trash2,
  ArrowRight,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Hash,
  TrendingUp
} from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const response = await API.get('/admin/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/admin/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/admin/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (search && !notification.message.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order': return <ShoppingCart size={20} className="text-white" />;
      case 'user': return <User size={20} className="text-white" />;
      case 'product': return <Package size={20} className="text-white" />;
      default: return <Bell size={20} className="text-white" />;
    }
  };

  const getNotificationGradient = (type) => {
    switch(type) {
      case 'order': return 'from-green-500 to-emerald-500';
      case 'user': return 'from-blue-500 to-cyan-500';
      case 'product': return 'from-orange-500 to-amber-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getNotificationBadgeColor = (type) => {
    switch(type) {
      case 'order': return 'bg-green-100 text-green-700 border-green-300';
      case 'user': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'product': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString('en-IN');
  };

  // Render notification details in a human-readable format
  const renderNotificationDetails = (notification) => {
    const data = notification.data;
    
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    // Order notifications
    if (notification.type === 'order' && data.orderId) {
      return (
        <div className="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Hash size={16} className="text-green-600" />
            <span className="font-bold text-gray-700">Order ID:</span>
            <span className="text-gray-900 font-mono">{data.orderId}</span>
          </div>
          
          {data.total && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={16} className="text-green-600" />
              <span className="font-bold text-gray-700">Total Amount:</span>
              <span className="text-gray-900 font-bold">₹{parseFloat(data.total).toFixed(2)}</span>
            </div>
          )}
          
          {data.status && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-green-600" />
              <span className="font-bold text-gray-700">Status:</span>
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                {data.status.toUpperCase()}
              </span>
            </div>
          )}
          
          {data.customerName && (
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-green-600" />
              <span className="font-bold text-gray-700">Customer:</span>
              <span className="text-gray-900">{data.customerName}</span>
            </div>
          )}
        </div>
      );
    }

    // User notifications
    if (notification.type === 'user' && data.userId) {
      return (
        <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl space-y-2">
          {data.userName && (
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-blue-600" />
              <span className="font-bold text-gray-700">Name:</span>
              <span className="text-gray-900">{data.userName}</span>
            </div>
          )}
          
          {data.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-blue-600" />
              <span className="font-bold text-gray-700">Email:</span>
              <span className="text-gray-900">{data.email}</span>
            </div>
          )}
          
          {data.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-blue-600" />
              <span className="font-bold text-gray-700">Phone:</span>
              <span className="text-gray-900">{data.phone}</span>
            </div>
          )}
          
          {data.userId && (
            <div className="flex items-center gap-2 text-sm">
              <Hash size={16} className="text-blue-600" />
              <span className="font-bold text-gray-700">User ID:</span>
              <span className="text-gray-900 font-mono text-xs">{data.userId}</span>
            </div>
          )}
        </div>
      );
    }

    // Product notifications
    if (notification.type === 'product' && data.productId) {
      return (
        <div className="mt-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl space-y-2">
          {data.productName && (
            <div className="flex items-center gap-2 text-sm">
              <Package size={16} className="text-orange-600" />
              <span className="font-bold text-gray-700">Product:</span>
              <span className="text-gray-900">{data.productName}</span>
            </div>
          )}
          
          {data.price && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={16} className="text-orange-600" />
              <span className="font-bold text-gray-700">Price:</span>
              <span className="text-gray-900 font-bold">₹{parseFloat(data.price).toFixed(2)}</span>
            </div>
          )}
          
          {data.stock !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-orange-600" />
              <span className="font-bold text-gray-700">Stock:</span>
              <span className={`font-bold ${data.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                {data.stock} units
              </span>
            </div>
          )}
          
          {data.productId && (
            <div className="flex items-center gap-2 text-sm">
              <Hash size={16} className="text-orange-600" />
              <span className="font-bold text-gray-700">Product ID:</span>
              <span className="text-gray-900 font-mono text-xs">{data.productId}</span>
            </div>
          )}
        </div>
      );
    }

    // Generic data display for other types
    return (
      <div className="mt-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2 text-sm">
            <span className="font-bold text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
            <span className="text-gray-900 break-all">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <Bell className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">Loading Notifications...</p>
          <p className="text-gray-600 text-sm">Fetching your updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 lg:mb-8 gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 md:ring-4 ring-amber-100 relative">
              <Bell className="text-white" size={24} />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                  <span className="text-white text-xs font-black">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                Notifications
              </h1>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 font-medium flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                {unreadCount} unread notifications
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={fetchNotifications}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all disabled:opacity-50 font-semibold shadow-sm hover:shadow-md text-sm"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <CheckCircle size={16} />
              <span className="hidden sm:inline">Mark All Read</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white border-2 border-purple-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-purple-200">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl shadow-lg">
                <Bell className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">{notifications.length}</p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-red-200">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 md:p-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg md:rounded-xl shadow-lg">
                <AlertCircle className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">{unreadCount}</p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Unread</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-green-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-green-200">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 md:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg md:rounded-xl shadow-lg">
                <CheckCircle className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">{notifications.length - unreadCount}</p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Read</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-blue-200">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl shadow-lg">
                <Calendar className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
                  {notifications.filter(n => {
                    const today = new Date();
                    const notifDate = new Date(n.createdAt);
                    return notifDate.toDateString() === today.toDateString();
                  }).length}
                </p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm font-medium"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm font-bold appearance-none cursor-pointer bg-white"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 md:p-6 hover:bg-gray-50 transition-all duration-200 ${
                    !notification.read ? 'bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-l-4 border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${getNotificationGradient(notification.type)} rounded-xl flex items-center justify-center shadow-lg`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="font-semibold text-gray-900 text-sm md:text-base leading-relaxed">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <span className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getNotificationBadgeColor(notification.type)}`}>
                          {notification.type.toUpperCase()}
                        </span>
                        
                        <span className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 font-medium">
                          <Clock size={14} className="text-gray-400" />
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      
                      {/* Render formatted notification details */}
                      {renderNotificationDetails(notification)}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col md:flex-row gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 md:p-2.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-all hover:scale-110 flex items-center justify-center"
                          title="Mark as read"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 md:p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all hover:scale-110 flex items-center justify-center"
                        title="Delete notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 lg:p-20 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bell className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600 font-medium">
                {search || filter !== 'all' 
                  ? 'No notifications match your filters' 
                  : 'You\'re all caught up!'}
              </p>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-gray-700">
              Showing <span className="text-amber-600">{filteredNotifications.length}</span> of{" "}
              <span className="text-amber-600">{notifications.length}</span> notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;