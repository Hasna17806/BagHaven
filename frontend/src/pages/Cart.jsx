import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "../context/CartContext"; 
import { useAuth } from "../context/AuthContext";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  CreditCard,
  Package,
  Shield,
  Truck,
  Heart,
  X,
  Image as ImageIcon
} from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    cartItems, 
    cartCount, 
    cartTotal,
    loading: cartLoading,
    fetchCart,
    updateItem,
    removeItem 
  } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  // Fix image URL function
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Handle different image path formats
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    if (imagePath.startsWith('uploads/')) {
      return `http://localhost:5000/${imagePath}`;
    }
    
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  // Handle image error
  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

 const loadCartData = useCallback(async () => {
  if (!isAuthenticated) {
    navigate("/login");
    return;
  }

  setLoading(true);
  try {
    await fetchCart();
  } catch (error) {
    console.error("Failed to load cart:", error);
    // Handle errors
  } finally {
    setLoading(false);
  }
}, [isAuthenticated, navigate, fetchCart]); 

  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

  const handleRemove = async (productId, productName) => {
    try {
      await removeItem(productId);
      toast.success(`${productName} removed from cart`, {
        icon: '🗑️',
        duration: 2000,
      });
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Error removing item");
    }
  };

  const handleUpdateQuantity = async (productId, change) => {
    try {
      const currentItem = cartItems.find(item => item.product?._id === productId);
      if (!currentItem) return;

      const newQuantity = (currentItem.quantity || 0) + change;
      
      if (newQuantity < 1) {
        // If quantity becomes 0, remove the item
        await handleRemove(productId, currentItem.product?.name);
        return;
      }

      await updateItem(productId, newQuantity);
      
      toast.success(`Quantity updated to ${newQuantity}`, {
        icon: '✓',
        duration: 1500,
      });
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error("Failed to update quantity");
    }
  };

  // Calculate totals
  const totalAmount = cartTotal || cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0
  ) || 0;

  const taxAmount = totalAmount * 0.18;
  const finalTotal = totalAmount + taxAmount;

  // Show loading state
  if (loading || cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-amber-500 mx-auto"></div>
            <ShoppingBag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-amber-500" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; 
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '10px',
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate("/products")}
            className="group flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-6 transition-colors"
          >
            <div className="p-2 rounded-full group-hover:bg-amber-50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium">Continue Shopping</span>
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-1">
                {cartCount || 0} item{(cartCount || 0) !== 1 ? 's' : ''} in your cart
              </p>
            </div>
          </div>
        </div>
           
        {!cartItems || cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-10 blur-3xl"></div>
                <Package className="relative h-24 w-24 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Your cart is empty
              </h3>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                Looks like you haven't added any bags yet. Explore our premium collection and find your perfect match!
              </p>
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-4 rounded-full hover:shadow-xl transition-all font-semibold text-lg transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="h-5 w-5" />
                Browse Collection
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const productId = item.product?._id || item._id;
                const hasImageError = imageErrors[productId];
                const imageUrl = item.product?.images?.[0] 
                  ? getImageUrl(item.product.images[0])
                  : null;
                
                return (
                  <div key={productId} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                    <div className="flex p-6">
                      {/* Product Image */}
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 mr-6">
                        {hasImageError || !imageUrl ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500">No image</span>
                          </div>
                        ) : (
                          <img
                            src={imageUrl}
                            alt={item.product?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={() => handleImageError(productId)}
                            loading="lazy"
                          />
                        )}
                        <button
                          onClick={() => handleRemove(item.product?._id, item.product?.name)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                              {item.product?.name}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {item.product?.description?.substring(0, 80)}...
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{item.product?.price}
                            </p>
                            <p className="text-sm text-gray-500">per item</p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1">
                              <button
                                onClick={() => handleUpdateQuantity(item.product?._id, -1)}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-amber-50 hover:border-amber-500 hover:text-amber-600 transition-all disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-10 text-center font-bold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.product?._id, 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-amber-50 hover:border-amber-500 hover:text-amber-600 transition-all"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemove(item.product?._id, item.product?.name)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all font-medium"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                    <span className="font-semibold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">Shipping</span>
                    </div>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-semibold text-gray-900">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                        ₹{finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl hover:shadow-xl transition-all font-bold text-lg mb-4 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={cartCount === 0}
                >
                  <CreditCard className="h-5 w-5" />
                  Proceed to Checkout
                </button>

                <p className="text-xs text-gray-500 text-center mb-6">
                  Secure checkout • You won't be charged until you review your order
                </p>

                {/* Continue Shopping */}
                <button
                  onClick={() => navigate("/products")}
                  className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-amber-500 transition-all font-semibold"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Secure Payment</h4>
                    <p className="text-xs text-blue-700">100% encrypted & protected</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-900">Free Shipping</h4>
                    <p className="text-xs text-green-700">On all orders above ₹999</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-purple-900">Easy Returns</h4>
                    <p className="text-xs text-purple-700">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;