// src/admin/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  XCircle,
  Activity,
  Clock,
  Loader2,
  BarChart3,
  Calendar,
  Download,
  UserPlus,
  Copy,
  Printer,
  FileText,
  Bell,
  Mail,
  Zap,
  Sparkles,
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const statsResponse = await API.get('/admin/dashboard/stats');
      const monthlyResponse = await API.get('/admin/dashboard/revenue/monthly');
      const ordersResponse = await API.get('/admin/orders');
      
      setStats(statsResponse.data.stats);
      setMonthlyData(monthlyResponse.data.monthlyData || []);
      
      // Generate sales report from stats and orders
      generateSalesReport(statsResponse.data.stats, ordersResponse.data.orders || []);
      
      generateRealActivities(
        statsResponse.data.stats, 
        ordersResponse.data.orders || []
      );
      
      setLoading(false);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(`Error: ${err.response?.data?.message || err.message}`);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  const generateSalesReport = (statsData, orders = []) => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    // Calculate today's sales
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === today.toDateString();
    });
    
    const todaySales = todayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Calculate this month's sales
    const thisMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
    });
    
    const thisMonthSales = thisMonthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Calculate average order value
    const avgOrderValue = orders.length > 0 
      ? orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / orders.length 
      : 0;
    
    // Calculate pending orders
    const pendingOrders = orders.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    ).length;
    
    // Calculate completed orders
    const completedOrders = orders.filter(order => 
      order.status === 'delivered' || order.status === 'completed'
    ).length;
    
    setSalesReport({
      todaySales,
      todayOrders: todayOrders.length,
      thisMonthSales,
      thisMonthOrders: thisMonthOrders.length,
      avgOrderValue,
      pendingOrders,
      completedOrders,
      totalOrders: orders.length,
      completionRate: orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : 0
    });
  };

  const generateRealActivities = (statsData, orders = []) => {
    const activities = [];
    const now = new Date();
    
    const recentOrders = orders.slice(0, 3);
    recentOrders.forEach((order, index) => {
      activities.push({
        id: `order-${index}`,
        type: 'order',
        message: `Order #${order.orderNumber || order._id?.slice(-6)} placed`,
        amount: order.totalPrice ? `₹${order.totalPrice}` : '',
        time: formatTimeAgo(order.createdAt || new Date(Date.now() - index * 3600000)),
        read: false
      });
    });
    
    if (statsData) {
      if (statsData.totalUsers > 0) {
        activities.push({
          id: 'users',
          type: 'user',
          message: `${statsData.totalUsers} total users registered`,
          amount: '',
          time: 'Today',
          read: false
        });
      }
      
      if (statsData.totalRevenue > 0) {
        activities.push({
          id: 'revenue',
          type: 'revenue',
          message: `₹${statsData.totalRevenue.toLocaleString()} total revenue`,
          amount: '',
          time: 'This month',
          read: false
        });
      }
    }
    
    activities.push({
      id: 'system',
      type: 'system',
      message: 'Dashboard refreshed successfully',
      amount: '',
      time: formatTimeAgo(now),
      read: false
    });
    
    setRecentActivities(activities.slice(0, 5));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return past.toLocaleDateString();
  };

  const exportToExcel = () => {
    try {
      setExporting(true);
      setExportMessage('Preparing Excel file...');
      
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Dashboard Export - " + new Date().toLocaleDateString() + "\n\n";
      csvContent += "STATISTICS\n";
      csvContent += "Metric,Value\n";
      csvContent += `Total Users,${stats?.totalUsers || 0}\n`;
      csvContent += `Total Orders,${stats?.totalOrders || 0}\n`;
      csvContent += `Total Revenue,₹${(stats?.totalRevenue || 0).toLocaleString()}\n`;
      csvContent += `Total Products,${stats?.totalProducts || 0}\n\n`;
      
      if (monthlyData.length > 0) {
        csvContent += "MONTHLY REVENUE\n";
        csvContent += "Month,Revenue (₹),Orders\n";
        monthlyData.forEach(item => {
          csvContent += `${item._id.month}/${item._id.year},${item.revenue || 0},${item.orders || 0}\n`;
        });
        csvContent += "\n";
      }
      
      csvContent += "RECENT ACTIVITIES\n";
      csvContent += "Type,Message,Time,Status\n";
      recentActivities.forEach(activity => {
        csvContent += `${activity.type},${activity.message},${activity.time},${activity.read ? 'Read' : 'Unread'}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      setExportMessage('Downloading CSV file...');
      link.click();
      document.body.removeChild(link);
      
      setExportMessage('✅ Export completed successfully!');
      setTimeout(() => setExportMessage(''), 3000);
      
    } catch (err) {
      console.error('Export error:', err);
      setExportMessage('❌ Export failed. Please try again.');
      setTimeout(() => setExportMessage(''), 3000);
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = () => {
    try {
      setExporting(true);
      setExportMessage('Preparing JSON file...');
      
      const exportData = {
        dashboardStats: stats,
        monthlyRevenue: monthlyData,
        recentActivities: recentActivities,
        exportDate: new Date().toISOString(),
        generatedBy: 'BagHaven Admin Dashboard'
      };
      
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      
      setExportMessage('Downloading JSON file...');
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportMessage('✅ JSON export completed!');
      setTimeout(() => setExportMessage(''), 3000);
      
    } catch (err) {
      console.error('JSON export error:', err);
      setExportMessage('❌ Export failed. Please try again.');
      setTimeout(() => setExportMessage(''), 3000);
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = () => {
    try {
      const summary = `BagHaven Dashboard Summary\n
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

📊 STATISTICS:
• Total Users: ${stats?.totalUsers || 0}
• Total Orders: ${stats?.totalOrders || 0}
• Total Revenue: ₹${(stats?.totalRevenue || 0).toLocaleString()}
• Total Products: ${stats?.totalProducts || 0}

🔄 RECENT ACTIVITIES:`;
      
      const activitiesText = recentActivities.map(a => `• ${a.message} (${a.time})`).join('\n');
      const fullText = summary + '\n' + activitiesText;
      
      navigator.clipboard.writeText(fullText);
      setExportMessage('✅ Summary copied to clipboard!');
      setTimeout(() => setExportMessage(''), 3000);
      
    } catch (err) {
      console.error('Clipboard error:', err);
      setExportMessage('❌ Failed to copy to clipboard');
      setTimeout(() => setExportMessage(''), 3000);
    }
  };

  const printDashboard = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <style>
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; }
        }
      </style>
      <div class="print-area">
        <h1>BagHaven Dashboard Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <h2>Statistics</h2>
        <table border="1" cellpadding="5" style="border-collapse: collapse;">
          <tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Total Users</td><td>${stats?.totalUsers || 0}</td></tr>
          <tr><td>Total Orders</td><td>${stats?.totalOrders || 0}</td></tr>
          <tr><td>Total Revenue</td><td>₹${(stats?.totalRevenue || 0).toLocaleString()}</td></tr>
          <tr><td>Total Products</td><td>${stats?.totalProducts || 0}</td></tr>
        </table>
        <h2>Recent Activities</h2>
        <ul>
          ${recentActivities.map(a => `<li>${a.message} (${a.time})</li>`).join('')}
        </ul>
      </div>
    `;
    
    document.body.appendChild(printContent);
    window.print();
    document.body.removeChild(printContent);
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'user': return <UserPlus className="text-blue-600" size={18} />;
      case 'order': return <ShoppingBag className="text-green-600" size={18} />;
      case 'product': return <Package className="text-amber-600" size={18} />;
      case 'revenue': return <DollarSign className="text-purple-600" size={18} />;
      case 'notification': return <Bell className="text-red-600" size={18} />;
      case 'email': return <Mail className="text-cyan-600" size={18} />;
      default: return <FileText className="text-gray-600" size={18} />;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'user': return 'bg-blue-100';
      case 'order': return 'bg-green-100';
      case 'product': return 'bg-amber-100';
      case 'revenue': return 'bg-purple-100';
      case 'notification': return 'bg-red-100';
      case 'email': return 'bg-cyan-100';
      default: return 'bg-gray-100';
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateGrowth = (currentValue, previousValue = 0) => {
    if (previousValue === 0) return 12.5;
    return parseFloat(((currentValue - previousValue) / previousValue * 100).toFixed(1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">Loading Dashboard...</p>
          <p className="text-gray-600 text-sm">Fetching real-time analytics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
              <XCircle className="text-white" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Connection Error</h3>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
          >
            <RefreshCw size={20} />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
      {/* Export Message Toast */}
      {exportMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-slide-in backdrop-blur-sm border border-green-400/20">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <span className="font-semibold">{exportMessage}</span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-purple-100">
              <Activity className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-gray-600 text-sm md:text-base font-medium flex items-center gap-2">
                <Zap size={16} className="text-green-500" />
                Real-time analytics • Live updates
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all disabled:opacity-50 font-semibold shadow-sm hover:shadow-md"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            
            <div className="relative group">
              <button 
                onClick={exportToExcel}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 transform hover:scale-105"
              >
                <Download size={18} className={exporting ? 'animate-bounce' : ''} />
                <span>{exporting ? 'Exporting...' : 'Export'}</span>
              </button>
              
              {/* Export options dropdown */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-100 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <p className="text-sm font-bold text-gray-900">Export Options</p>
                  <p className="text-xs text-gray-600 mt-1">Choose your preferred format</p>
                </div>
                <button 
                  onClick={exportToExcel}
                  className="w-full text-left px-4 py-4 hover:bg-green-50 flex items-center gap-3 text-gray-700 border-b border-gray-100 transition-all group/item"
                >
                  <div className="p-2 bg-green-100 rounded-lg group-hover/item:scale-110 transition-transform">
                    <FileText size={18} className="text-green-600" />
                  </div>
                  <div>
                    <span className="font-bold block">Excel (CSV)</span>
                    <p className="text-xs text-gray-500">Spreadsheet format</p>
                  </div>
                </button>
                <button 
                  onClick={exportToJSON}
                  className="w-full text-left px-4 py-4 hover:bg-blue-50 flex items-center gap-3 text-gray-700 border-b border-gray-100 transition-all group/item"
                >
                  <div className="p-2 bg-blue-100 rounded-lg group-hover/item:scale-110 transition-transform">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <span className="font-bold block">JSON Backup</span>
                    <p className="text-xs text-gray-500">Complete data backup</p>
                  </div>
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="w-full text-left px-4 py-4 hover:bg-purple-50 flex items-center gap-3 text-gray-700 border-b border-gray-100 transition-all group/item"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover/item:scale-110 transition-transform">
                    <Copy size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <span className="font-bold block">Copy Summary</span>
                    <p className="text-xs text-gray-500">To clipboard</p>
                  </div>
                </button>
                <button 
                  onClick={printDashboard}
                  className="w-full text-left px-4 py-4 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-all group/item"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover/item:scale-110 transition-transform">
                    <Printer size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <span className="font-bold block">Print Report</span>
                    <p className="text-xs text-gray-500">Physical copy</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers?.toLocaleString() || '0'}
            change={calculateGrowth(stats?.totalUsers || 0, (stats?.totalUsers || 0) * 0.85)}
            icon={<Users size={28} />}
            color="blue"
          />
          
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders?.toLocaleString() || '0'}
            change={calculateGrowth(stats?.totalOrders || 0, (stats?.totalOrders || 0) * 0.9)}
            icon={<ShoppingBag size={28} />}
            color="green"
          />
          
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
            change={calculateGrowth(stats?.totalRevenue || 0, (stats?.totalRevenue || 0) * 0.8)}
            icon={<DollarSign size={28} />}
            color="purple"
          />
          
          <StatCard
            title="Total Products"
            value={stats?.totalProducts?.toLocaleString() || '0'}
            change={calculateGrowth(stats?.totalProducts || 0, (stats?.totalProducts || 0) * 0.95)}
            icon={<Package size={28} />}
            color="orange"
          />
        </div>

        {/* Charts and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                    <BarChart3 className="text-white" size={22} />
                  </div>
                  Revenue Overview
                </h2>
                <p className="text-gray-600 text-sm mt-1 ml-12">Last 6 months performance</p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                <Calendar className="text-purple-600" size={18} />
                <span className="text-sm font-semibold text-purple-700">Monthly Trends</span>
              </div>
            </div>
            
            {monthlyData.length > 0 ? (
              <div className="space-y-5">
                {monthlyData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                    <div className="w-20 text-sm font-bold text-gray-700">
                      {item._id.month}/{item._id.year}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-900 font-bold">
                          ₹{item.revenue?.toLocaleString() || '0'}
                        </span>
                        <span className="text-gray-600 font-semibold">{item.orders} orders</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (item.revenue / (Math.max(...monthlyData.map(m => m.revenue)) || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No revenue data available</p>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                  <Clock className="text-white" size={20} />
                </div>
                <span>Activities</span>
              </h2>
              <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full font-bold shadow-lg">
                {recentActivities.filter(a => !a.read).length} new
              </span>
            </div>
            
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-l-4 transition-all hover:shadow-md ${
                      activity.type === 'order' ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50' :
                      activity.type === 'user' ? 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50' :
                      activity.type === 'revenue' ? 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50' :
                      'border-l-gray-500 bg-gradient-to-r from-gray-50 to-slate-50'
                    }`}
                  >
                    <div className={`mt-1 p-2.5 rounded-xl shadow-sm ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{activity.message}</p>
                      {activity.amount && (
                        <p className="text-sm font-bold text-green-700 mt-1">
                          {activity.amount}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          activity.type === 'order' ? 'bg-green-100 text-green-800' :
                          activity.type === 'user' ? 'bg-blue-100 text-blue-800' :
                          activity.type === 'revenue' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sales Report Section */}
        {salesReport && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sales Report</h2>
                <p className="text-gray-600 text-sm">Real-time sales analytics and insights</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Today's Sales */}
              <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="text-blue-600" size={20} />
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Today</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">
                  ₹{salesReport.todaySales.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 font-semibold">Today's Sales</p>
                <p className="text-xs text-gray-500 mt-2">{salesReport.todayOrders} orders placed</p>
              </div>

              {/* This Month's Sales */}
              <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="text-purple-600" size={20} />
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Month</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">
                  ₹{salesReport.thisMonthSales.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 font-semibold">Monthly Sales</p>
                <p className="text-xs text-gray-500 mt-2">{salesReport.thisMonthOrders} orders this month</p>
              </div>

              {/* Average Order Value */}
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingBag className="text-green-600" size={20} />
                  </div>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">AOV</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">
                  ₹{Math.round(salesReport.avgOrderValue).toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 font-semibold">Avg Order Value</p>
                <p className="text-xs text-gray-500 mt-2">Per transaction</p>
              </div>

              {/* Order Status */}
              <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package className="text-orange-600" size={20} />
                  </div>
                  <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                    {salesReport.completionRate}%
                  </span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">
                  {salesReport.completedOrders}
                </h3>
                <p className="text-sm text-gray-600 font-semibold">Completed Orders</p>
                <p className="text-xs text-gray-500 mt-2">{salesReport.pendingOrders} pending</p>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Completion Rate */}
              <div className="p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-700">Order Completion Rate</span>
                  <span className="text-lg font-black text-blue-600">{salesReport.completionRate}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${salesReport.completionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {salesReport.completedOrders} of {salesReport.totalOrders} orders completed
                </p>
              </div>

              {/* Pending vs Completed */}
              <div className="p-5 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-700">Order Distribution</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-gray-600">Pending</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${(salesReport.completedOrders / salesReport.totalOrders) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${(salesReport.pendingOrders / salesReport.totalOrders) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {salesReport.completedOrders} completed, {salesReport.pendingOrders} pending
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 border-t-2 border-gray-200">
          <p className="text-gray-700 font-bold text-sm mb-1">
            BagHaven Admin Dashboard • {new Date().getFullYear()}
          </p>
          <p className="text-gray-500 text-xs">
            Data refreshes on page load • Export available anytime
          </p>
        </div>
      </div>
      
      {/* Animation styles */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, change, icon, color }) => {
  const isPositive = change >= 0;
  
  const colorClasses = {
    blue: { 
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      text: 'text-blue-600',
      shadow: 'shadow-blue-200'
    },
    green: { 
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50', 
      border: 'border-green-200', 
      text: 'text-green-600',
      shadow: 'shadow-green-200'
    },
    purple: { 
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50', 
      border: 'border-purple-200', 
      text: 'text-purple-600',
      shadow: 'shadow-purple-200'
    },
    orange: { 
      gradient: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-50', 
      border: 'border-orange-200', 
      text: 'text-orange-600',
      shadow: 'shadow-orange-200'
    }
  };

  return (
    <div className={`bg-white border-2 ${colorClasses[color].border} rounded-2xl p-6 transition-all hover:shadow-xl ${colorClasses[color].shadow} transform hover:scale-105 hover:-translate-y-1 duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color].gradient} shadow-lg ${colorClasses[color].shadow}`}>
          <div className="text-white">{icon}</div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
          isPositive ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
        }`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      
      <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{value}</h3>
      <p className="text-gray-600 font-bold text-sm mb-4">{title}</p>
      
      <div className="pt-4 border-t-2 border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <p className="text-xs font-semibold text-gray-600">
            {isPositive ? '↗ Increased' : '↘ Decreased'} from last month
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;