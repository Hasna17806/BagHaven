import { useEffect, useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  CreditCard,
  TrendingDown,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Sparkles,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Revenue = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      const orders = data.orders || [];

      if (orders.length === 0) {
        setStats(getEmptyStats());
        return;
      }

      // Calculate real stats from orders
      const realStats = calculateRealStats(orders);
      setStats(realStats);
    } catch (error) {
      console.error("Failed to fetch revenue", error);
      setStats(getEmptyStats());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateRealStats = (orders) => {
    // Filter valid orders with totalPrice
    const validOrders = orders.filter(order => order.totalPrice && order.totalPrice > 0);
    
    // Calculate basic stats
    const totalRevenue = validOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const paidOrders = validOrders.filter(o => o.isPaid);
    const pendingOrders = validOrders.filter(o => !o.isPaid);
    const paidRevenue = paidOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const pendingRevenue = pendingOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    // Calculate growth based on order dates
    const revenueGrowth = calculateGrowthRate(validOrders);
    const ordersGrowth = calculateOrdersGrowth(validOrders);

    // Generate real monthly data from order dates
    const monthlyData = generateRealMonthlyData(validOrders);
    const dailyData = generateRealDailyData(validOrders);

    return {
      totalRevenue,
      totalOrders: validOrders.length,
      paidRevenue,
      pendingRevenue,
      avgOrderValue,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      revenueGrowth,
      ordersGrowth,
      monthlyData,
      dailyData,
      rawOrders: validOrders // Keep for any additional calculations
    };
  };

  const calculateGrowthRate = (orders) => {
    if (orders.length < 2) return 0;
    
    // Group orders by month and calculate monthly revenue
    const monthlyRevenue = {};
    orders.forEach(order => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (order.totalPrice || 0);
      }
    });

    const monthlyValues = Object.values(monthlyRevenue);
    if (monthlyValues.length < 2) return 0;

    const latestMonth = monthlyValues[monthlyValues.length - 1];
    const previousMonth = monthlyValues[monthlyValues.length - 2];
    
    if (previousMonth === 0) return 0;
    return ((latestMonth - previousMonth) / previousMonth * 100).toFixed(1);
  };

  const calculateOrdersGrowth = (orders) => {
    if (orders.length < 2) return 0;
    
    // Group orders by month
    const monthlyOrders = {};
    orders.forEach(order => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyOrders[monthKey] = (monthlyOrders[monthKey] || 0) + 1;
      }
    });

    const monthlyCounts = Object.values(monthlyOrders);
    if (monthlyCounts.length < 2) return 0;

    const latestMonth = monthlyCounts[monthlyCounts.length - 1];
    const previousMonth = monthlyCounts[monthlyCounts.length - 2];
    
    if (previousMonth === 0) return 0;
    return ((latestMonth - previousMonth) / previousMonth * 100).toFixed(1);
  };

  const generateRealMonthlyData = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get last 6 months
    const last6Months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      last6Months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        monthName: months[date.getMonth()],
        key: monthKey
      });
    }

    // Initialize monthly data
    const monthlyData = last6Months.map(m => ({
      month: m.monthName,
      year: m.year,
      key: m.key,
      revenue: 0,
      orders: 0,
      paid: 0,
      pending: 0
    }));

    // Populate with real order data
    orders.forEach(order => {
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const orderMonthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
        
        const monthData = monthlyData.find(m => m.key === orderMonthKey);
        if (monthData) {
          monthData.revenue += order.totalPrice || 0;
          monthData.orders += 1;
          if (order.isPaid) {
            monthData.paid += order.totalPrice || 0;
          } else {
            monthData.pending += order.totalPrice || 0;
          }
        }
      }
    });

    return monthlyData;
  };

  const generateRealDailyData = (orders) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get last 7 days
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      last7Days.push({
        date: new Date(date),
        day: days[date.getDay()],
        dayNum: date.getDate(),
        key: dayKey
      });
    }

    // Initialize daily data
    const dailyData = last7Days.map(d => ({
      day: d.day,
      fullDate: d.date,
      key: d.key,
      revenue: 0,
      orders: 0
    }));

    // Populate with real order data
    orders.forEach(order => {
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const orderDayKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}-${orderDate.getDate()}`;
        
        const dayData = dailyData.find(d => d.key === orderDayKey);
        if (dayData) {
          dayData.revenue += order.totalPrice || 0;
          dayData.orders += 1;
        }
      }
    });

    return dailyData;
  };

  const getEmptyStats = () => {
    const emptyData = Array(6).fill(0).map((_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      revenue: 0,
      orders: 0,
      paid: 0,
      pending: 0
    }));

    const emptyDaily = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      revenue: 0,
      orders: 0
    }));

    return {
      totalRevenue: 0,
      totalOrders: 0,
      paidRevenue: 0,
      pendingRevenue: 0,
      avgOrderValue: 0,
      paidOrders: 0,
      pendingOrders: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      monthlyData: emptyData,
      dailyData: emptyDaily
    };
  };

  const COLORS = {
    paid: '#10b981',
    pending: '#f59e0b',
    primary: '#8b5cf6',
    secondary: '#06b6d4'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <DollarSign className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">Loading Revenue Data...</p>
          <p className="text-gray-600 text-sm">Calculating financial metrics</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Paid Revenue', value: stats?.paidRevenue || 0, color: COLORS.paid },
    { name: 'Pending Revenue', value: stats?.pendingRevenue || 0, color: COLORS.pending }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-green-100">
              <BarChart3 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Revenue Analytics</h1>
              <p className="text-gray-600 text-sm md:text-base font-medium flex items-center gap-2">
                <Sparkles size={16} className="text-green-500" />
                Real-time financial insights
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchRevenue}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all disabled:opacity-50 font-semibold shadow-sm hover:shadow-md"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            
            <button 
              onClick={() => exportData(stats)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue */}
          <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-xl shadow-green-200 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <DollarSign className="text-white" size={24} />
              </div>
              {stats?.revenueGrowth !== 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  stats?.revenueGrowth >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats?.revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{stats?.revenueGrowth}%</span>
                </div>
              )}
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">
              ₹{stats?.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-gray-600 font-bold text-sm">Total Revenue</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xl shadow-blue-200 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <ShoppingCart className="text-white" size={24} />
              </div>
              {stats?.ordersGrowth !== 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  stats?.ordersGrowth >= 0 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats?.ordersGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{stats?.ordersGrowth}%</span>
                </div>
              )}
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">
              {stats?.totalOrders}
            </h3>
            <p className="text-gray-600 font-bold text-sm">Total Orders</p>
          </div>

          {/* Paid Revenue */}
          <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-xl shadow-purple-200 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                <span>{stats?.paidOrders} orders</span>
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">
              ₹{stats?.paidRevenue.toLocaleString()}
            </h3>
            <p className="text-gray-600 font-bold text-sm">Paid Revenue</p>
          </div>

          {/* Avg Order Value */}
          <div className="bg-white border-2 border-orange-200 rounded-2xl p-6 shadow-xl shadow-orange-200 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                <Package className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                <span>AOV</span>
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">
              ₹{Math.round(stats?.avgOrderValue).toLocaleString()}
            </h3>
            <p className="text-gray-600 font-bold text-sm">Avg Order Value</p>
          </div>
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend - Area Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Activity className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
                <p className="text-sm text-gray-600">Last 6 months performance</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px',
                    fontWeight: '600'
                  }} 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Distribution - Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <PieChart className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Revenue Distribution</h2>
                <p className="text-sm text-gray-600">Paid vs Pending breakdown</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
              </RePieChart>
            </ResponsiveContainer>
            
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm font-semibold text-gray-700">Paid (₹{stats?.paidRevenue.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-sm font-semibold text-gray-700">Pending (₹{stats?.pendingRevenue.toLocaleString()})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Revenue - Bar Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <BarChart3 className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Daily Revenue</h2>
                <p className="text-sm text-gray-600">Last 7 days performance</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[10, 10, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Comparison - Line Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                <TrendingUp className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Paid vs Pending</h2>
                <p className="text-sm text-gray-600">Monthly comparison</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Legend 
                  wrapperStyle={{ fontWeight: '600', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="paid" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Payment Rate</h3>
              <CheckCircle size={24} />
            </div>
            <p className="text-4xl font-black mb-2">
              {stats?.totalOrders > 0 ? Math.round((stats.paidOrders / stats.totalOrders) * 100) : 0}%
            </p>
            <p className="text-green-100 text-sm font-semibold">
              {stats?.paidOrders} of {stats?.totalOrders} orders completed
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Collected</h3>
              <DollarSign size={24} />
            </div>
            <p className="text-4xl font-black mb-2">
              {stats?.totalRevenue > 0 ? Math.round((stats.paidRevenue / stats.totalRevenue) * 100) : 0}%
            </p>
            <p className="text-blue-100 text-sm font-semibold">
              ₹{stats?.paidRevenue.toLocaleString()} received
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Pending</h3>
              <Clock size={24} />
            </div>
            <p className="text-4xl font-black mb-2">
              {stats?.totalRevenue > 0 ? Math.round((stats.pendingRevenue / stats.totalRevenue) * 100) : 0}%
            </p>
            <p className="text-orange-100 text-sm font-semibold">
              ₹{stats?.pendingRevenue.toLocaleString()} awaiting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to export data as CSV
const exportData = (stats) => {
  if (!stats) return;
  
  const csvContent = [
    ['Metric', 'Value'],
    ['Total Revenue', `₹${stats.totalRevenue}`],
    ['Total Orders', stats.totalOrders],
    ['Paid Revenue', `₹${stats.paidRevenue}`],
    ['Pending Revenue', `₹${stats.pendingRevenue}`],
    ['Average Order Value', `₹${Math.round(stats.avgOrderValue)}`],
    ['Revenue Growth', `${stats.revenueGrowth}%`],
    ['Orders Growth', `${stats.ordersGrowth}%`],
    [],
    ['Monthly Data', 'Revenue', 'Orders', 'Paid', 'Pending'],
    ...stats.monthlyData.map(m => [
      m.month, 
      `₹${m.revenue}`, 
      m.orders, 
      `₹${m.paid}`, 
      `₹${m.pending}`
    ]),
    [],
    ['Daily Data (Last 7 Days)', 'Revenue', 'Orders'],
    ...stats.dailyData.map(d => [
      d.day, 
      `₹${d.revenue}`, 
      d.orders
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `revenue-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default Revenue;