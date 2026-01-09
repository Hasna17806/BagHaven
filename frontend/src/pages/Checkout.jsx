import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getCart } from "../api/cart";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import PaymentMethod from "./PaymentMethod";
import { 
  Loader2, 
  Shield, 
  ShoppingBag,
  MapPin,
  User,
  Phone,
  ArrowLeft,
  Package,
  CreditCard,
  CheckCircle,
  Mail,
  Home,
  MapPinned,
  Plus,
  TrendingUp,
  Lock,
  Truck,
  Star,
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import PayPalButton from "../components/PayPalButton";

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cart, setCart] = useState({ items: [] });
  const [loadingCart, setLoadingCart] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressOptions, setShowAddressOptions] = useState(false);

  // Function to get phone from storage - MOVED OUTSIDE useEffect
  const getPhoneFromStorage = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.phone || user.mobile || user.contact) {
        return user.phone || user.mobile || user.contact;
      }
      
      // Try dedicated profile storage
      const userId = user._id || user.email || "default";
      const profileKey = `user_profile_${userId}`;
      const profile = JSON.parse(localStorage.getItem(profileKey) || "{}");
      if (profile.phone) {
        return profile.phone;
      }
      
      // Try dedicated phone key
      const phone = localStorage.getItem(`user_phone_${userId}`);
      if (phone) {
        return phone;
      }
      
      return "";
    } catch (error) {
      console.error("Error getting phone:", error);
      return "";
    }
  };

  // Function to save order to localStorage
  const saveOrderToLocalStorage = (orderData, source = 'local') => {
    try {
      // Get existing orders
      const existingOrders = JSON.parse(localStorage.getItem("user_orders") || "[]");
      
      // Create order object
      const orderId = orderData._id || `${source}_${Date.now()}`;
      const order = {
        _id: orderId,
        orderNumber: orderData.orderNumber || `ORD${Date.now().toString().slice(-8).toUpperCase()}`,
        ...orderData,
        source: source,
        user: user || {
          _id: user?._id || 'guest',
          name: user?.name || address.fullName,
          email: user?.email || address.email
        },
        createdAt: orderData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to existing orders
      existingOrders.push(order);
      
      // Save back to localStorage
      localStorage.setItem("user_orders", JSON.stringify(existingOrders));
      
      // Also save to admin storage
      const adminOrders = JSON.parse(localStorage.getItem("admin_orders") || "[]");
      adminOrders.push({
        ...order,
        synced: source === 'api'
      });
      localStorage.setItem("admin_orders", JSON.stringify(adminOrders));
      
      console.log(`💾 Order saved to localStorage (${source}):`, order);
      console.log(`📁 Total user orders: ${existingOrders.length}, admin orders: ${adminOrders.length}`);
      
      return order;
    } catch (error) {
      console.error("❌ Error saving order to localStorage:", error);
      return null;
    }
  };

  // Load cart data
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        toast.error("Please login to checkout");
        navigate("/login");
        return;
      }
      
      setLoadingCart(true);
      try {
        const res = await getCart();
        
        let items = [];
        
        if (res.data && res.data.items) {
          items = res.data.items;
        } else if (res.data && res.data.cart && res.data.cart.items) {
          items = res.data.cart.items;
        } else if (res.data && Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data && res.data.data && res.data.data.items) {
          items = res.data.data.items;
        }
        
        if (!items || items.length === 0) {
          toast.error("Your cart is empty");
          navigate("/cart");
          return;
        }
        
        const validItems = items.filter(item => 
          item.product && item.product._id && item.quantity > 0
        );
        
        if (validItems.length === 0) {
          toast.error("No valid items in cart");
          navigate("/cart");
          return;
        }
        
        setCart({ items: validItems });
        
      } catch (error) {
        console.error("Failed to load cart:", error);
        
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else if (error.response?.status === 404) {
          toast.error("Cart not found");
          navigate("/cart");
        } else {
          toast.error("Failed to load cart data");
          navigate("/cart");
        }
      } finally {
        setLoadingCart(false);
      }
    };

    loadCart();
  }, [isAuthenticated, navigate]);

  // Load user addresses from localStorage - UPDATED TO INCLUDE PHONE
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (cart.items.length === 0) return;
      
      try {
        setLoadingAddress(true);
        
        // First try to get current user data
        const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
        
        // Get phone from storage using the function
        const savedPhone = getPhoneFromStorage();
        
        // Load saved addresses from localStorage
        const userId = currentUser._id || currentUser.email || "default";
        const savedAddressesKey = `user_addresses_${userId}`;
        const savedAddresses = localStorage.getItem(savedAddressesKey);
        
        let loadedAddresses = [];
        
        if (savedAddresses) {
          try {
            const parsedAddresses = JSON.parse(savedAddresses);
            if (parsedAddresses && parsedAddresses.length > 0) {
              loadedAddresses = parsedAddresses;
              setAddresses(parsedAddresses);
              
              // Find default address or use first one
              const defaultAddress = parsedAddresses.find(addr => addr.isDefault) || parsedAddresses[0];
              if (defaultAddress) {
                setAddress(prev => ({
                  ...prev,
                  fullName: currentUser.name || currentUser.fullName || "",
                  email: currentUser.email || "",
                  // Use savedPhone if available, otherwise fallback
                  phone: savedPhone || currentUser.phone || "",
                  street: defaultAddress.street || "",
                  city: defaultAddress.city || "",
                  state: defaultAddress.state || "",
                  pincode: defaultAddress.pincode || ""
                }));
                setSelectedAddressIndex(parsedAddresses.findIndex(addr => 
                  addr === defaultAddress || (defaultAddress.isDefault && addr.isDefault)
                ));
              }
            }
          } catch (error) {
            console.log("Error parsing saved addresses:", error);
            loadedAddresses = [];
          }
        }
        
        if (loadedAddresses.length === 0) {
          const userAddress = {
            street: currentUser.address || "",
            city: currentUser.city || "",
            state: currentUser.state || "",
            pincode: currentUser.pincode || "",
            isDefault: true
          };
          
          loadedAddresses = [userAddress];
          setAddresses([userAddress]);
          
          setAddress(prev => ({
            ...prev,
            fullName: currentUser.name || currentUser.fullName || "",
            email: currentUser.email || "",
            // Use savedPhone if available, otherwise fallback
            phone: savedPhone || currentUser.phone || "",
            street: userAddress.street || "",
            city: userAddress.city || "",
            state: userAddress.state || "",
            pincode: userAddress.pincode || ""
          }));
        }
        
        console.log("Loaded addresses:", loadedAddresses);
        console.log("Loaded phone:", savedPhone || currentUser.phone);
        
      } catch (error) {
        console.error("Error loading addresses:", error);
      } finally {
        setLoadingAddress(false);
      }
    };

    if (!loadingCart && cart.items.length > 0) {
      loadUserAddresses();
    }
  }, [loadingCart, cart.items, user]);

  // Calculate totals
  const calculateTotals = () => {
    if (!cart.items || cart.items.length === 0) return { subtotal: 0, tax: 0, total: 0 };
    
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
    
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    return { 
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  const { subtotal, tax, total } = calculateTotals();

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectAddress = (index) => {
    if (index < 0 || index >= addresses.length) return;
    
    const selectedAddress = addresses[index];
    if (selectedAddress) {
      const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
      const savedPhone = getPhoneFromStorage(); // Get phone again
      
      setAddress(prev => ({
        ...prev,
        fullName: currentUser.name || currentUser.fullName || prev.fullName,
        email: currentUser.email || prev.email,
        // Use saved phone, otherwise keep existing
        phone: savedPhone || prev.phone,
        street: selectedAddress.street || "",
        city: selectedAddress.city || "",
        state: selectedAddress.state || "",
        pincode: selectedAddress.pincode || ""
      }));
      setSelectedAddressIndex(index);
      setShowAddressOptions(false);
      toast.success(`Address ${index + 1} selected!`);
    }
  };

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
  };

  const validateOrderData = () => {
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !address[field]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate phone number
    const phoneDigits = address.phone.replace(/\D/g, '');
    if (!/^[0-9]{10}$/.test(phoneDigits)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    // Validate pincode
    if (!/^[0-9]{6}$/.test(address.pincode)) {
      toast.error("Please enter a valid 6-digit PIN code");
      return false;
    }

    // Validate cart items
    if (!cart.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    return true;
  };

  const handlePaymentSubmit = async () => {
    if (!validateOrderData()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || ""
      }));

     const orderData = {
  orderItems: orderItems.map(item => ({
    product: item.product,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image
  })),
  shippingAddress: {
    fullName: address.fullName.trim(),
    phone: address.phone.trim(),
    street: address.street.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: address.pincode.trim(), 
    country: "India"
  },
  totalPrice: total,
  paymentMethod: paymentMethod 
};

      console.log("Sending order data:", orderData);

      // Try multiple endpoints
      let response;
      try {
        response = await API.post("/api/orders", orderData);
      } catch (error1) {
        console.log("Trying /orders endpoint...");
        response = await API.post("/orders", orderData);
      }
      
      console.log("Order response:", response);
      
      if (response.data.success || response.data._id || response.data.order) {
        const order = response.data.order || response.data;
        
        // ALSO SAVE TO LOCALSTORAGE FOR COD ORDERS
        const localOrder = {
          _id: order._id || `cod_${Date.now()}`,
          orderNumber: order.orderNumber || `ORD${(order._id || Date.now()).toString().slice(-8).toUpperCase()}`,
          ...orderData,
          source: 'api',
          user: user || {
            name: address.fullName,
            email: address.email
          }
        };
        
        // Save to localStorage using helper function
        saveOrderToLocalStorage(localOrder, 'api');
        
        toast.success(
          paymentMethod === 'cod' 
            ? "Order placed successfully! You will pay on delivery."
            : "Payment successful! Order placed.",
          { icon: '✅', duration: 5000 }
        );

        await clearCart();

        // Redirect to success page
        setTimeout(() => {
          navigate("/ordersuccess", { 
            state: { 
              order: {
                _id: order._id || order.data?._id || Date.now().toString(),
                shippingAddress: orderData.shippingAddress,
                subtotal: subtotal,
                tax: tax,
                totalAmount: total,
                paymentMethod: paymentMethod,
                orderStatus: "processing",
                items: orderItems,
                createdAt: new Date().toISOString()
              },
              orderNumber: order._id ? `ORD${order._id.slice(-8).toUpperCase()}` : `ORD${Date.now().toString().slice(-8)}`,
            } 
          });
        }, 1000);
        
      } else {
        throw new Error(response.data.message || "Order creation failed");
      }
      
    } catch (error) {
      console.error("Order error:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).join(", ");
      } else if (error.response?.status === 401) {
        errorMessage = "Please login again to place order";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid order data. Please check your information.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const handlePayPalSuccess = async (paypalOrderId, details) => {
    try {
      // Validate address first
      const requiredFields = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
      const missing = requiredFields.filter(f => !address[f]?.trim());
      
      if (missing.length > 0) {
        toast.error(`Please fill in: ${missing.join(', ')}`);
        return;
      }

      setIsProcessing(true);

      // Create order after PayPal payment
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || ""
      }));

      const orderData = {
  orderItems,
  shippingAddress: {
    fullName: address.fullName.trim(),
    phone: address.phone.trim(),
    street: address.street.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: address.pincode.trim(), 
    country: "India"
  },
  totalPrice: total,
  paymentMethod: "paypal", 
  paymentResult: { 
    transactionId: paypalOrderId, 
    status: details.status === "COMPLETED" ? "success" : "pending", 
    email: details.payer?.email_address || address.email
  },
  orderStatus: "processing",
};
      console.log("Creating order after PayPal:", orderData);

      let response;
      let orderCreated = false;
      let savedOrder = null;
      
      try {
        // Try API endpoint first
        response = await API.post("/api/orders", orderData);
        orderCreated = true;
        savedOrder = response.data.order || response.data;
        console.log("✅ Order created via /api/orders", savedOrder);
      } catch (error1) {
        console.log("Endpoint /api/orders failed, trying /orders...");
        try {
          response = await API.post("/orders", orderData);
          orderCreated = true;
          savedOrder = response.data.order || response.data;
          console.log("✅ Order created via /orders", savedOrder);
        } catch (error2) {
          console.log("❌ Both API endpoints failed, saving order locally...");
          orderCreated = false;
        }
      }

      // Generate order ID and number
      const orderId = orderCreated ? (savedOrder?._id || `api_${Date.now()}`) : `local_${Date.now()}`;
      const orderNumber = orderCreated ? 
        (savedOrder?.orderNumber || `ORD${orderId.slice(-8).toUpperCase()}`) : 
        `ORD${Date.now().toString().slice(-8).toUpperCase()}`;

      // Create final order object for storage
      let finalOrder = {
        _id: orderId,
        orderNumber: orderNumber,
        ...orderData,
        source: orderCreated ? 'api' : 'local',
        user: user || {
          _id: user?._id || 'guest',
          name: user?.name || address.fullName,
          email: user?.email || address.email
        }
      };

      // Save order to localStorage if API failed
      if (!orderCreated) {
        const savedOrder = saveOrderToLocalStorage(orderData, 'local');
        finalOrder = savedOrder || finalOrder;
      } else {
        // Save API order to localStorage as well
        saveOrderToLocalStorage({...orderData, _id: orderId, orderNumber: orderNumber}, 'api');
      }

      // // Clear cart regardless of API success
      // try {
      //   await API.delete("/cart/clear");
      //   localStorage.removeItem("cart");
      //   console.log("🛒 Cart cleared successfully");
      // } catch (cartError) {
      //   console.log("⚠️ Note: Cart not cleared", cartError);
      // }

      // Show success message
      toast.success("Payment successful! Order placed. Redirecting...", {
        icon: "✅",
        duration: 3000,
      });

      clearCart();

      // Wait 1.5 seconds then redirect to success page
      setTimeout(() => {
        navigate("/ordersuccess", { 
          replace: true,
          state: { 
            order: finalOrder,
            orderNumber: orderNumber,
            totalAmount: total,
            paymentMethod: "paypal"
          } 
        });
      }, 1500);

    } catch (error) {
      console.error("❌ PayPal order creation error:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Order creation failed after payment";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).join(", ");
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { duration: 10000 });
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    if (imagePath.includes('.jpg') || imagePath.includes('.jpeg') || imagePath.includes('.png') || imagePath.includes('.avif')) {
      return `http://localhost:5000/uploads/${imagePath}`;
    }
    
    return imagePath;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate("/cart")}
            className="group flex items-center text-gray-700 hover:text-amber-600 mb-6 transition-all transform hover:-translate-x-1"
          >
            <div className="p-2.5 rounded-xl bg-white group-hover:bg-amber-50 transition-all shadow-lg group-hover:shadow-xl">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="ml-3 font-semibold">Back to Cart</span>
          </button>
          
          <div className="flex items-center gap-5 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-2xl">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                Checkout
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-md">
                  <ShoppingBag className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-bold text-gray-700">
                    {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-md">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-bold text-gray-700">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-white transform hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  Shipping Address
                </h2>
                
                {addresses.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowAddressOptions(!showAddressOptions)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-xl transition-all text-sm font-bold transform hover:-translate-y-0.5"
                    >
                      <MapPinned className="h-4 w-4" />
                      Choose ({selectedAddressIndex + 1}/{addresses.length})
                      <svg 
                        className={`w-4 h-4 transition-transform ${showAddressOptions ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showAddressOptions && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-10 overflow-hidden">
                        <div className="p-3">
                          {addresses.map((addr, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectAddress(index)}
                              className={`w-full text-left p-4 rounded-xl mb-2 hover:bg-amber-50 transition-all ${
                                selectedAddressIndex === index ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-md' : 'border-2 border-transparent'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  {addr.isDefault ? (
                                    <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-lg">
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                  ) : (
                                    <div className="p-1.5 border-2 border-gray-300 rounded-full">
                                      <div className="h-4 w-4"></div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-gray-900 mb-1">
                                    Address {index + 1} {addr.isDefault &&  "Default"}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {addr.street ? `${addr.street.substring(0, 35)}...` : "No street"}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {addr.city}, {addr.state} - {addr.pincode}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                          
                          <div className="border-t-2 border-gray-200 mt-3 pt-3">
                            <button
                              onClick={() => {
                                setShowAddressOptions(false);
                                navigate("/profile");
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-semibold"
                            >
                              <Plus className="h-4 w-4" />
                              Manage in Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {addresses.length > 0 && (
                <div className="mb-6 p-5 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-2xl border-2 border-green-300 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-md">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-900">
                        Using Address {selectedAddressIndex + 1} of {addresses.length}
                        {addresses[selectedAddressIndex]?.isDefault && " "}
                      </p>
                      <p className="text-xs text-green-700 mt-1 font-medium">
                        {addresses[selectedAddressIndex]?.street || address.street}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <User className="h-4 w-4 text-amber-600" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Mail className="h-4 w-4 text-amber-600" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-sm"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Phone className="h-4 w-4 text-amber-600" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <MapPinned className="h-4 w-4 text-amber-600" />
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-sm"
                    placeholder="123456"
                    maxLength="6"
                  />
                </div>
                
                <div className="md:col-span-2 group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Home className="h-4 w-4 text-amber-600" />
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-sm"
                    placeholder="House no., Building, Street"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-sm"
                    placeholder="City"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber500 transition-all shadow-sm"
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <p className="text-sm text-amber-900">
                    <span className="font-bold">Pro Tip:</span> Manage all your addresses easily in your Profile page
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Component */}
            <div className="transform hover:scale-[1.01] transition-transform">
              <PaymentMethod 
                selectedMethod={paymentMethod}
                onPaymentSelect={handlePaymentSelect}
              />
            </div>

            {/* Order Items */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-white transform hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-lg">
                    <ShoppingBag className="h-6 w-6 text-purple-600" />
                  </div>
                  Order Items
                </h2>
                <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg">
                  {cart.items.length}
                </div>
              </div>
              
              <div className="space-y-4">
                {cart.items.map((item, index) => {
                  const firstImage = item.product?.images?.[0];
                  const imageUrl = firstImage ? getImageUrl(firstImage) : null;
                  
                  return (
                    <div key={item.product?._id} 
                      className="flex items-center gap-5 p-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:border-amber-300 hover:shadow-xl transition-all transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                        <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md z-10">
                          {item.quantity}
                        </div>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover transform hover:scale-110 transition-transform"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/200x200/e5e7eb/6b7280?text=Product";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Package className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">{item.product?.name}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatPrice(item.product?.price || 0)} each
                            </span>
                          </div>
                          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sticky top-6 border-2 border-white">
              <div className="flex items-center gap-3 mb-7">
                <div className="p-2.5 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="space-y-5 mb-7">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900 text-lg">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 font-medium">Shipping</span>
                  </div>
                  <span className="font-bold text-green-600 text-lg flex items-center gap-1">
                    FREE <Star className="h-4 w-4 fill-current" />
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <span className="text-gray-700 font-medium">Tax (GST 18%)</span>
                  <span className="font-bold text-blue-700 text-lg">{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t-4 border-dashed border-gray-200 pt-5">
                  <div className="flex justify-between items-center p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-amber-300">
                    <span className="text-xl font-bold text-gray-900">Total Amount</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mb-7 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border-2 border-blue-300 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-md">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1.5 flex items-center gap-2">
                      100% Secure Checkout
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Your information is encrypted with bank-level security
                    </p>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePaymentSubmit}
                disabled={isProcessing || paymentMethod === "paypal"}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-5 rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transform hover:-translate-y-1 hover:scale-105 mb-4 shadow-xl"
              >
                {isProcessing && paymentMethod !== "paypal" ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Processing Order...
                  </>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <CheckCircle className="h-6 w-6" />
                    Place Order (COD)
                  </>
                ) : paymentMethod === 'card' ? (
                  <>
                    <CreditCard className="h-6 w-6" />
                    Pay Securely Now
                  </>
                ) : (
                  <>
                    <CreditCard className="h-6 w-6" />
                    Pay Securely Now
                  </>
                )}
              </button>

              {/* PayPal Button */}
              {paymentMethod === "paypal" && (
                <div className="mt-4">
                  <PayPalButton
                    amount={total}  
                    onSuccess={(paypalOrderId, details) => handlePayPalSuccess(paypalOrderId, details)}
                    disabled={!address.fullName || !address.phone || !address.pincode}
                  />
                </div>
              )}

              <p className="mt-5 text-xs text-center text-gray-500 leading-relaxed">
                🔒 By placing this order, you agree to our <span className="font-semibold text-gray-700">Terms & Conditions</span>
              </p>
              
              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-700">Verified</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-700">Secure</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Truck className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-700">Fast Ship</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;