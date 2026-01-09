import React, { useEffect, useState } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Eye,
  RefreshCw,
  Sparkles,
  DollarSign,
  User,
  Calendar,
  X,
  AlertTriangle,
  Edit,
  MapPin,
  Phone,
  Mail,
  Database,
  HardDrive
} from 'lucide-react';
import API from "../../api/axios";
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      let apiOrders = [];
      // Get orders from API
      try {
        const response = await API.get("/admin/orders");
        if (response.data.success) {
          apiOrders = (response.data.orders || response.data.data || []).map(order => ({
            ...order,
            source: 'api'
          }));
          console.log(`✅ API Orders: ${apiOrders.length}`);
        }
      } catch (apiError) {
        console.log("Admin API orders failed:", apiError);
        apiOrders = [];
      }

      // Get local orders from localStorage (from user purchases)
      // This collects orders from all users' localStorage
      const localOrders = getAllLocalOrders();
      console.log(`📱 Local Orders: ${localOrders.length}`);

      // Combine orders
      const allOrdersMap = new Map();
      
      // Add local orders
      localOrders.forEach(order => {
        allOrdersMap.set(order._id, {
          ...order,
          source: 'local',
          user: order.user || {
            name: order.shippingAddress?.fullName || "Local Customer",
            email: order.shippingAddress?.email || "local@customer.com"
          }
        });
      });

      // Add API orders (overwrite if same ID exists)
      apiOrders.forEach(order => {
        allOrdersMap.set(order._id, order);
      });

      const combinedOrders = Array.from(allOrdersMap.values())
        .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));

      console.log(`📊 Total Orders: ${combinedOrders.length} (API: ${apiOrders.length}, Local: ${localOrders.length})`);
      setOrders(combinedOrders);
      
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to get all local orders from localStorage
  const getAllLocalOrders = () => {
    try {
      // Get orders from current user's localStorage
      const userOrders = JSON.parse(localStorage.getItem("user_orders") || "[]");
      
      // Also check for admin storage (if you set it up in Checkout)
      const adminOrders = JSON.parse(localStorage.getItem("admin_orders") || "[]");
      
      // Combine and deduplicate
      const allOrders = [...userOrders, ...adminOrders];
      const uniqueOrders = Array.from(
        new Map(allOrders.map(order => [order._id, order])).values()
      );
      
      return uniqueOrders.map(order => ({
        ...order,
        orderStatus: order.orderStatus || 'processing',
        createdAt: order.createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error reading local orders:", error);
      return [];
    }
  };

  const handleUpdateStatus = (order) => {
    setOrderToUpdate(order);
    setNewStatus(order.orderStatus || 'processing');
    setShowStatusModal(true);
  };

  const confirmUpdateStatus = async () => {
    if (!orderToUpdate || !newStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setUpdatingOrder(orderToUpdate._id);
      setShowStatusModal(false);
      
      // If it's a local order, update localStorage
      if (orderToUpdate.source === 'local') {
        updateLocalOrderStatus(orderToUpdate._id, newStatus);
        toast.success(`Local order status updated to ${newStatus}!`);
      } else {
        // Update API order
        const response = await API.put(`/admin/orders/${orderToUpdate._id}/status`, {
          status: newStatus
        });
        
        if (response.data.success) {
          toast.success(`Order status updated to ${newStatus}!`);
        } else {
          throw new Error(response.data.message || 'Failed to update order status');
        }
      }
      
      // Update the order in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderToUpdate._id 
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
      
    } catch (error) {
      console.error("Failed to update order status", error);
      toast.error(error.message || 'An error occurred while updating status');
    } finally {
      setUpdatingOrder(null);
      setOrderToUpdate(null);
      setNewStatus("");
    }
  };

  // Function to update local order status in localStorage
  const updateLocalOrderStatus = (orderId, newStatus) => {
    try {
      // Update in user_orders
      const userOrders = JSON.parse(localStorage.getItem("user_orders") || "[]");
      const updatedUserOrders = userOrders.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      );
      localStorage.setItem("user_orders", JSON.stringify(updatedUserOrders));
      
      // Update in admin_orders if exists
      const adminOrders = JSON.parse(localStorage.getItem("admin_orders") || "[]");
      const updatedAdminOrders = adminOrders.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      );
      localStorage.setItem("admin_orders", JSON.stringify(updatedAdminOrders));
      
      console.log(`🔄 Updated local order ${orderId} to ${newStatus}`);
    } catch (error) {
      console.error("Error updating local order:", error);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      processing: { 
        icon: Clock, 
        color: "text-amber-600", 
        bg: "bg-amber-50", 
        gradient: "from-amber-500 to-orange-500", 
        label: "Processing" 
      },
      shipped: { 
        icon: Truck, 
        color: "text-blue-600", 
        bg: "bg-blue-50", 
        gradient: "from-blue-500 to-cyan-500", 
        label: "Shipped" 
      },
      delivered: { 
        icon: CheckCircle, 
        color: "text-green-600", 
        bg: "bg-green-50", 
        gradient: "from-green-500 to-emerald-500", 
        label: "Delivered" 
      },
      cancelled: { 
        icon: XCircle, 
        color: "text-red-600", 
        bg: "bg-red-50", 
        gradient: "from-red-500 to-rose-500", 
        label: "Cancelled" 
      }
    };
    return configs[status] || configs.processing;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: "numeric", 
        month: "short", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shippingAddress?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || order.orderStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <Package className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">Loading Orders...</p>
          <p className="text-gray-600 text-sm">Fetching order data</p>
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
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 md:ring-4 ring-green-100">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                Orders
              </h1>
              <div className="text-xs md:text-sm lg:text-base text-gray-600 font-medium flex items-center gap-2">
                <Sparkles size={14} className="text-green-500" />
                <span>Total: {orders.length} (API: {orders.filter(o => o.source === 'api').length}, Local: {orders.filter(o => o.source === 'local').length})</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={fetchAllOrders}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all disabled:opacity-50 font-semibold shadow-sm hover:shadow-md text-sm"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white border-2 border-green-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-green-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg md:rounded-xl shadow-lg">
                <Package className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">{orders.length}</p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-blue-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl shadow-lg">
                <Database className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
                  {orders.filter(o => o.source === 'api').length}
                </p>
                <p className="text-xs md:text-sm font-bold text-gray-600">API Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-amber-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-amber-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg md:rounded-xl shadow-lg">
                <HardDrive className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
                  {orders.filter(o => o.source === 'local').length}
                </p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Local Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-amber-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-amber-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg md:rounded-xl shadow-lg">
                <Clock className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
                  {orders.filter(o => o.orderStatus === 'processing').length}
                </p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Processing</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-emerald-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-emerald-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg md:rounded-xl shadow-lg">
                <CheckCircle className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
                  {orders.filter(o => o.orderStatus === 'delivered').length}
                </p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Delivered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            <div className="relative">
              <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search orders by ID, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm font-medium"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center shadow-xl">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-green-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Source</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-4 lg:px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.orderStatus);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={order._id} className="hover:bg-green-50 transition-all">
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-bold text-gray-900">
                              #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                            </p>
                            {order.paymentMethod === 'paypal' && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                PayPal
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{order.user?.name || order.shippingAddress?.fullName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{order.user?.email || order.shippingAddress?.email || ''}</p>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <p className="text-sm font-black text-green-600">
                            {formatCurrency(order.totalPrice || order.totalAmount)}
                          </p>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.color} border-2 ${statusConfig.color.replace('text-', 'border-')}`}>
                            <StatusIcon size={14} />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            order.source === 'api' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {order.source === 'api' ? 'API' : 'Local'}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <p className="text-sm font-medium text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all hover:scale-110"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order)}
                              disabled={updatingOrder === order._id}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Update Status"
                            >
                              {updatingOrder === order._id ? (
                                <RefreshCw size={18} className="animate-spin" />
                              ) : (
                                <Edit size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 lg:px-6 py-4 bg-gradient-to-r from-gray-50 to-green-50 border-t-2 border-gray-200">
              <p className="text-sm font-bold text-gray-700">
                Showing <span className="text-green-600">{filteredOrders.length}</span> of{" "}
                <span className="text-green-600">{orders.length}</span> orders
                <span className="ml-4 text-xs text-gray-500">
                  (API: {orders.filter(o => o.source === 'api').length}, Local: {orders.filter(o => o.source === 'local').length})
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
            {/* Modal Header */}
            <div className={`sticky top-0 p-6 flex items-center justify-between z-10 ${
              selectedOrder.source === 'local' 
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600' 
                : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Eye className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Order Details</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-white/90 text-sm font-mono">
                      #{selectedOrder._id?.slice(-8).toUpperCase() || 'N/A'}
                    </p>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      selectedOrder.source === 'local' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedOrder.source === 'local' ? 'Local' : 'API'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className={`p-5 rounded-xl border-2 flex items-center gap-4 ${
                getStatusConfig(selectedOrder.orderStatus).bg
              } ${getStatusConfig(selectedOrder.orderStatus).color.replace('text-', 'border-')}`}>
                {(() => {
                  const IconComponent = getStatusConfig(selectedOrder.orderStatus).icon;
                  return <IconComponent size={32} className={getStatusConfig(selectedOrder.orderStatus).color} />;
                })()}
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Order Status</p>
                  <p className={`text-2xl font-black ${getStatusConfig(selectedOrder.orderStatus).color}`}>
                    {getStatusConfig(selectedOrder.orderStatus).label}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="text-blue-600" size={18} />
                    <p className="text-xs font-bold text-gray-500 uppercase">Customer</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.user?.email || selectedOrder.shippingAddress?.email || ''}</p>
                </div>

                <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="text-green-600" size={18} />
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Amount</p>
                  </div>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                    {formatCurrency(selectedOrder.totalPrice || selectedOrder.totalAmount)}
                  </p>
                </div>

                <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-purple-600" size={18} />
                    <p className="text-xs font-bold text-gray-500 uppercase">Order Date</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>

                <div className="p-5 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-orange-600" size={18} />
                    <p className="text-xs font-bold text-gray-500 uppercase">Items</p>
                  </div>
                  <p className="text-2xl font-black text-gray-900">
                    {selectedOrder.orderItems?.length || 0}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="text-blue-600" size={20} />
                    <h3 className="font-bold text-gray-900">Shipping Address</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {[
                      selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.address,
                      selectedOrder.shippingAddress.city,
                      selectedOrder.shippingAddress.state,
                      selectedOrder.shippingAddress.pincode || selectedOrder.shippingAddress.postalCode
                    ].filter(Boolean).join(', ')}
                  </p>
                  {selectedOrder.shippingAddress.phone && (
                    <p className="text-sm text-gray-600 mt-2">
                      <Phone className="inline w-4 h-4 mr-2" />
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  )}
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Order Items ({selectedOrder.orderItems.length})</h3>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="font-bold text-gray-900">{item.name || item.product?.name || 'Item'}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="font-bold text-green-600">
                          ₹{(item.price || 0) * (item.quantity || 1)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                <h3 className="font-bold text-gray-900 mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-bold text-gray-900 capitalize">
                      {selectedOrder.paymentMethod || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`font-bold ${selectedOrder.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                      {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleUpdateStatus(selectedOrder);
                  }}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && orderToUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Edit className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Update Order Status</h3>
                  <p className="text-sm text-gray-600">
                    Order ID: #{orderToUpdate._id?.slice(-8).toUpperCase()}
                    <span className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-gray-100">
                      {orderToUpdate.source}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Select New Status</label>
                <div className="space-y-2">
                  {['processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                    const config = getStatusConfig(status);
                    const StatusIcon = config.icon;
                    return (
                      <label
                        key={status}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          newStatus === status
                            ? `${config.bg} ${config.color.replace('text-', 'border-')} shadow-lg`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={newStatus === status}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-5 h-5"
                        />
                        <div className="flex items-center gap-2">
                          <StatusIcon 
                            size={20}
                            className={newStatus === status ? config.color : 'text-gray-400'}
                          />
                          <span className="font-bold capitalize">{status}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmUpdateStatus}
                  disabled={!newStatus || updatingOrder === orderToUpdate._id}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingOrder === orderToUpdate._id ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setOrderToUpdate(null);
                    setNewStatus("");
                  }}
                  className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;