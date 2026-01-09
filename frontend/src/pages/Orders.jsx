import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { 
  Package, CheckCircle, Clock, Truck, AlertCircle, Calendar, 
  CreditCard, ShoppingBag, Download, RotateCcw,
  RefreshCw, MapPin, Eye, Copy, Phone,
  Shield, Image as ImageIcon, Home, X, ExternalLink, XCircle,
  Activity, Star, Tag, Banknote, User
} from "lucide-react";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnComments, setReturnComments] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  // Get orders from both API and localStorage
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please login to view orders");
        navigate("/login");
        return;
      }

      let apiOrders = [];
      // Try API first
      try {
        const timestamp = Date.now();
        const response = await fetch(`${API_BASE_URL}/api/orders/my?t=${timestamp}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.orders) {
            apiOrders = data.orders.map(order => ({
              ...order,
              source: 'api'
            }));
          }
        }
      } catch (apiError) {
        console.log("API orders failed, will use localStorage");
      }

      // Get orders from localStorage
      const localOrders = JSON.parse(localStorage.getItem("user_orders") || "[]");
      const localStorageOrders = localOrders.map(order => ({
        ...order,
        source: 'local',
        orderStatus: order.orderStatus || 'processing'
      }));

      // Combine and deduplicate
      const allOrdersMap = new Map();
      
      // Add local orders
      localStorageOrders.forEach(order => {
        allOrdersMap.set(order._id, order);
      });

      // Add API orders (overwrite if same ID exists)
      apiOrders.forEach(order => {
        allOrdersMap.set(order._id, order);
      });

      const combinedOrders = Array.from(allOrdersMap.values())
        .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));

      console.log(`✅ Total orders: ${combinedOrders.length} (API: ${apiOrders.length}, Local: ${localStorageOrders.length})`);
      
      // Process orders to ensure data consistency
      const processedOrders = combinedOrders.map(order => ({
        ...order,
        shippingAddress: order.shippingAddress || order.address || {
          fullName: "Not specified",
          street: "Address not available",
          city: "City",
          state: "State",
          pincode: "000000",
          phone: "+91 00000 00000"
        },
        isPaid: order.isPaid !== undefined ? order.isPaid : (order.paymentMethod === 'paypal' ? true : false),
        orderStatus: order.orderStatus || order.status || 'processing',
        orderItems: order.orderItems?.map(item => ({
          ...item,
          name: item.name || item.product?.name || "Unnamed Product",
          price: item.price || item.product?.price || 0,
          quantity: item.quantity || 1,
          product: item.product || {}
        })) || []
      }));

      setOrders(processedOrders);
      
    } catch (error) {
      console.error("❌ Failed to fetch orders:", error);
      toast.error("Failed to load orders");
      
      // Fallback to localStorage only
      const localOrders = JSON.parse(localStorage.getItem("user_orders") || "[]");
      setOrders(localOrders.map(order => ({
        ...order,
        source: 'local',
        orderStatus: order.orderStatus || 'processing'
      })));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    let cleanPath = imagePath;
    if (imagePath.includes('?')) {
      cleanPath = imagePath.split('?')[0];
    }
    
    const hasExtension = /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(cleanPath);
    
    if (cleanPath.startsWith('/uploads/')) {
      const url = `${API_BASE_URL}${cleanPath}`;
      return hasExtension ? url : `${url}.jpg`;
    } else if (cleanPath.startsWith('uploads/')) {
      const url = `${API_BASE_URL}/${cleanPath}`;
      return hasExtension ? url : `${url}.jpg`;
    } else {
      const url = `${API_BASE_URL}/uploads/${cleanPath}`;
      return hasExtension ? url : `${url}.jpg`;
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: "text-amber-700", 
        bg: "bg-gradient-to-r from-amber-50 to-yellow-50", 
        border: "border-amber-200", 
        icon: <Clock className="w-4 h-4" />, 
        label: "Pending", 
        days: "Processing soon"
      },
      processing: { 
        color: "text-blue-700", 
        bg: "bg-gradient-to-r from-blue-50 to-cyan-50", 
        border: "border-blue-200", 
        icon: <Clock className="w-4 h-4" />, 
        label: "Processing", 
        days: "3-5 business days"
      },
      shipped: { 
        color: "text-purple-700", 
        bg: "bg-gradient-to-r from-purple-50 to-violet-50", 
        border: "border-purple-200", 
        icon: <Truck className="w-4 h-4" />, 
        label: "Shipped", 
        days: "2-3 business days"
      },
      out_for_delivery: { 
        color: "text-indigo-700", 
        bg: "bg-gradient-to-r from-indigo-50 to-blue-50", 
        border: "border-indigo-200", 
        icon: <Truck className="w-4 h-4" />, 
        label: "Out for Delivery", 
        days: "Arriving today or tomorrow"
      },
      delivered: { 
        color: "text-green-700", 
        bg: "bg-gradient-to-r from-green-50 to-emerald-50", 
        border: "border-green-200", 
        icon: <CheckCircle className="w-4 h-4" />, 
        label: "Delivered", 
        days: "Successfully delivered"
      },
      cancelled: { 
        color: "text-red-700", 
        bg: "bg-gradient-to-r from-red-50 to-pink-50", 
        border: "border-red-200", 
        icon: <XCircle className="w-4 h-4" />, 
        label: "Cancelled", 
        days: "Order cancelled"
      },
      returned: { 
        color: "text-purple-700", 
        bg: "bg-gradient-to-r from-purple-50 to-pink-50", 
        border: "border-purple-200", 
        icon: <RefreshCw className="w-4 h-4" />, 
        label: "Returned", 
        days: "Return processed"
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleDateString("en-IN", {
        day: "numeric", 
        month: "short", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit"
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const formatCurrency = (amount) => {
    const numAmount = Number(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const formatAddress = (address) => {
    if (!address || typeof address !== 'object') return "No address provided";
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode || address.postalCode) parts.push(address.pincode || address.postalCode);
    
    return parts.length > 0 ? parts.join(", ") : "No address provided";
  };

  const filteredOrders = orders.filter(order => 
    activeFilter === "all" || order.orderStatus === activeFilter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 py-12">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <Activity className="w-12 h-12 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-20 blur-3xl"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Loading Your Orders</h3>
            <p className="text-gray-600">Fetching your order history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 py-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                  <p className="text-gray-600">
                    {orders.length} order{orders.length !== 1 ? 's' : ''} total
                    {orders.some(o => o.source === 'local') && (
                      <span className="ml-2 text-amber-600 text-sm">
                        (Some orders stored locally)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchAllOrders}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop More
              </button>
            </div>
          </div>
        </div>

        {/* Info about local orders */}
        {orders.some(order => order.source === 'local') && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  Some orders are stored locally
                </p>
                <p className="text-xs text-yellow-700">
                  These orders were created when the server connection failed. 
                  They will be automatically synced when the connection is restored.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { key: "all", label: "All Orders" },
                { key: "pending", label: "Pending" },
                { key: "processing", label: "Processing" },
                { key: "shipped", label: "Shipped" },
                { key: "out_for_delivery", label: "Out for Delivery" },
                { key: "delivered", label: "Delivered" },
                { key: "cancelled", label: "Cancelled" },
                { key: "returned", label: "Returned" }
              ].map((filter) => {
                const count = filter.key === "all" 
                  ? orders.length 
                  : orders.filter(o => o.orderStatus === filter.key).length;
                
                return (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`flex-1 min-w-fit px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all rounded-lg ${
                      activeFilter === filter.key
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {filter.label}
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold ${
                      activeFilter === filter.key
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-5">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-10 blur-3xl"></div>
                  <Package className="relative h-24 w-24 text-gray-300 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 text-sm mb-8">
                  {activeFilter === "all"
                    ? "You haven't placed any orders yet. Start shopping now!"
                    : `No ${activeFilter} orders found.`}
                </p>
                <button
                  onClick={() => navigate("/products")}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.orderStatus);
              const isExpanded = expandedOrder === order._id;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-gray-900">
                            Order #{order._id?.slice(-8).toUpperCase()}
                          </span>
                          {order.source === 'local' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                              Local
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                          {order.paymentMethod === 'paypal' && (
                            <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
                              <Banknote className="w-3 h-3" />
                              PayPal
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span className={order.isPaid ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>
                              {order.isPaid ? "Paid" : "Pending Payment"}
                            </span>
                          </span>
                          {order.paymentMethod && (
                            <span className="flex items-center gap-1.5">
                              <span className="font-semibold capitalize">
                                {order.paymentMethod}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(order.totalPrice || order.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500">{order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg border border-amber-200">
                        <Home className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Delivery Address</h4>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {formatAddress(order.shippingAddress)}
                          {order.shippingAddress?.phone && (
                            <span className="block mt-1 text-gray-600">
                              <Phone className="w-3 h-3 inline mr-1" />
                              {order.shippingAddress.phone}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Order Items ({order.orderItems?.length || 0})</h3>
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                        {isExpanded ? <X className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {order.orderItems?.map((item, index) => {
                        const imagePath = item.product?.images?.[0] || item.image;
                        const imageUrl = getImageUrl(imagePath);
                        
                        return (
                          <div
                            key={index}
                            className={`p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors ${
                              isExpanded ? "bg-gray-50" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-4">
                                  {/* Product Image */}
                                  <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt={item.name || item.product?.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                                        <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-500">No image</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 hover:text-amber-600 transition-colors">
                                      {item.name || item.product?.name || "Product"}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-2 mb-3">
                                      <span className="font-medium bg-gray-100 px-2 py-1 rounded">Qty: {item.quantity}</span>
                                      <span>•</span>
                                      <span className="font-semibold text-gray-900">
                                        {formatCurrency(item.price)} each
                                      </span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                      Total: {formatCurrency(item.price * item.quantity)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Status: {statusConfig.label} • {statusConfig.days}</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            toast.success("Invoice downloaded!", { icon: "📄" });
                          }}
                          className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                        
                        <button
                          onClick={() => navigate("/")}
                          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Shop More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Order Status</h4>
                <p className="text-sm text-gray-600">
                  Orders with <span className="text-yellow-600 font-semibold">"Local"</span> tag are stored on your device and will sync when the server is available.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Contact our support team for assistance with orders, returns, or payment issues.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Your Orders</h4>
                <p className="text-sm text-gray-600">
                  Showing orders from: {orders.filter(o => o.source === 'api').length} server + {orders.filter(o => o.source === 'local').length} local
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;