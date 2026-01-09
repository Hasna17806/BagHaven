// OrderSuccess.jsx - Fixed with fallback data
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Home,
  ShoppingBag,
  MapPin,
  CreditCard,
  Mail,
  Phone,
} from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  
  // Get order data from navigation state or use localStorage as fallback
  const order = location.state?.order || {
    shippingAddress: {
      fullName: localStorage.getItem("userName") || "Customer",
      street: localStorage.getItem("userAddress") || "Address not available",
      city: localStorage.getItem("userCity") || "City",
      state: localStorage.getItem("userState") || "State",
      pincode: localStorage.getItem("userPincode") || "000000",
      phone: localStorage.getItem("userPhone") || "+91 00000 00000"
    },
    subtotal: location.state?.totalAmount || 0,
    tax: (location.state?.totalAmount || 0) * 0.18,
    totalAmount: location.state?.totalAmount || 0,
    paymentMethod: location.state?.paymentMethod || "COD"
  };

  const orderNumber = location.state?.orderNumber || "ORD" + Date.now().toString().slice(-8).toUpperCase();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getOrderId = () => {
    return orderNumber.substring(0, 12).toUpperCase();
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-1">
            Thank you for your purchase
          </p>
          <p className="text-sm text-gray-500">
            Redirecting in <span className="font-semibold text-green-600">{countdown}s</span>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          {/* Order Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Order Number</p>
                <p className="text-lg font-bold text-gray-900">#{getOrderId()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Order Date</p>
                <p className="text-sm font-semibold text-gray-900">{getCurrentDate()}</p>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between relative mb-8">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-900">Ordered</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs font-medium text-gray-500">Processing</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Truck className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs font-medium text-gray-500">Shipped</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Home className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs font-medium text-gray-500">Delivered</p>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  Delivery Address
                </h3>
                <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-1">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  Order Summary
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">{formatPrice(order.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (18%)</span>
                      <span className="font-medium text-gray-900">{formatPrice(order.tax || 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900 text-lg">{formatPrice(order.totalAmount || 0)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-semibold text-gray-900 uppercase">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 px-6 py-4 border-t border-blue-100">
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Confirmation email sent</p>
                <p className="text-blue-700">We've sent order confirmation details to your email. Estimated delivery: 3-5 business days.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Package className="w-4 h-4" />
            View Orders
          </button>
          
          <button
            onClick={() => navigate("/products")}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;