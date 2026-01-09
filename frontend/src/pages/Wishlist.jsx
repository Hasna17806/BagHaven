import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useWishlist } from "../context/wishlistContext";
import { useCart } from "../context/CartContext";
import { 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  Home,
  Image as ImageIcon,
  Eye,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';

const Wishlist = () => {
  const [showClearModal, setShowClearModal] = useState(false);
  const [movingItems, setMovingItems] = useState({});

  const { 
    wishlistItems, 
    wishlistCount, 
    loading,
    fetchWishlist, 
    removeFromWishlist,
    clearWishlist 
  } = useWishlist();
  
  const { addItem: addToCart, fetchCart } = useCart();
  const [imageErrors, setImageErrors] = useState({});

  // Function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    if (imagePath.includes('.')) {
      return `http://localhost:5000/uploads/${imagePath}`;
    }
    
    return null;
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  // Load wishlist when page opens
  useEffect(() => {
    console.log("🔄 Wishlist page loading...");
    fetchWishlist();
  }, []);

  const handleRemove = async (wishlistItemId, productName) => {
    try {
      toast.loading("Removing...", { id: `remove-${wishlistItemId}` });
      
      await removeFromWishlist(wishlistItemId);
      
      toast.success(`${productName} removed from wishlist`, {
        id: `remove-${wishlistItemId}`,
      });
      
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Error removing item", {
        id: `remove-${wishlistItemId}`,
      });
    }
  };

  const handleClearAll = async () => {
    setShowClearModal(false);
    
    try {
      const toastId = toast.loading("Clearing wishlist...");
      
      await clearWishlist();
      
      toast.success("All items removed from wishlist", {
        id: toastId,
      });
      
    } catch (error) {
      toast.error("Error clearing wishlist");
    }
  };

  const handleMoveSingleToCart = async (productId, productName, wishlistItemId) => {
    setMovingItems(prev => ({ ...prev, [wishlistItemId]: true }));
    
    try {
      toast.loading(`Adding ${productName} to cart...`, { 
        id: `move-${wishlistItemId}`,
      });
      
      // 1. Add to cart
      await addToCart(productId, 1);
      
      // 2. Remove from wishlist
      await removeFromWishlist(wishlistItemId);
      
      // 3. Refresh cart
      await fetchCart();
      
      toast.success(`${productName} moved to cart!`, {
        id: `move-${wishlistItemId}`,
      });
      
    } catch (error) {
      console.error("Move to cart error:", error);
      toast.error("Error moving item to cart", {
        id: `move-${wishlistItemId}`,
      });
    } finally {
      setMovingItems(prev => ({ ...prev, [wishlistItemId]: false }));
    }
  };

  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) {
      toast.error("Wishlist is empty");
      return;
    }

    const toastId = toast.loading(`Moving items to cart...`);

    try {
      let successCount = 0;
      
      // Move each item one by one
      for (const item of wishlistItems) {
        const productId = item.product?._id || item.productId;
        const wishlistItemId = item._id;
        
        if (!productId) continue;
        
        try {
          // Add to cart
          await addToCart(productId, 1);
          
          // Remove from wishlist
          await removeFromWishlist(wishlistItemId);
          
          successCount++;
          
        } catch (error) {
          console.error(`Failed to move item:`, error);
        }
      }

      // Refresh cart
      await fetchCart();

      if (successCount > 0) {
        toast.success(`Moved ${successCount} item(s) to cart!`, {
          id: toastId,
        });
      }

    } catch (error) {
      console.error("Move all error:", error);
      toast.error("Error moving items to cart", {
        id: toastId,
      });
    }
  };

  // Check if item is being moved
  const isItemMoving = (wishlistItemId) => {
    return movingItems[wishlistItemId] || false;
  };

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      {/* Clear All Modal - keep same */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 rounded-full">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Clear Wishlist?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all {wishlistCount} items?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:shadow-lg"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
                <p className="text-gray-600 mt-1">
                  {wishlistCount || 0} item{wishlistCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/cart"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">View Cart</span>
              </Link>
              <button
                onClick={() => window.location.href = "/"}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full opacity-10 blur-3xl"></div>
                <Heart className="relative h-24 w-24 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                Your wishlist is empty
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Start adding your favorite handbags to your wishlist.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Collection
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              {wishlistItems.map((item, index) => {
                const productId = item.product?._id || item.productId;
                const wishlistItemId = item._id;
                const isMoving = isItemMoving(wishlistItemId);
                const hasImageError = imageErrors[productId];
                const imagePath = item.product?.images?.[0];
                const imageUrl = getImageUrl(imagePath);
                
                return (
                  <div key={wishlistItemId} className="group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 hover:bg-gray-50">
                      {/* Product Image */}
                      <div className="w-full sm:w-48 h-56 sm:h-48 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-50">
                        {hasImageError || !imageUrl ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
                            <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-500 text-center">Image not available</p>
                          </div>
                        ) : (
                          <img
                            src={imageUrl}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(productId)}
                          />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.product?.name || "Product"}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {item.product?.description || "Premium quality handbag"}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <span className="text-2xl font-bold text-gray-900">
                            ₹{item.product?.price || "0"}
                          </span>
                          <span className="px-3 py-1 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 text-sm rounded-full font-medium">
                            {item.product?.category || "Handbag"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {productId && (
                          <Link
                            to={`/products/${productId}`}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                        )}
                        <button
                          onClick={() => handleMoveSingleToCart(productId, item.product?.name || "Product", wishlistItemId)}
                          disabled={isMoving || !productId}
                          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium ${
                            isMoving
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-wait'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                          }`}
                        >
                          {isMoving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Moving...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Move to Cart
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRemove(wishlistItemId, item.product?.name || "Product")}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 rounded-lg hover:bg-rose-100"
                        >
                          <Trash2 className="w-4 h-5" />
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    {index < wishlistItems.length - 1 && (
                      <hr className="border-gray-200 mx-6" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bulk Actions */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-gray-700">
                  <span className="font-semibold">{wishlistCount} item{wishlistCount !== 1 ? 's' : ''}</span> in your wishlist
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={handleMoveAllToCart}
                  disabled={wishlistCount === 0}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-xl"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Move All to Cart ({wishlistCount})
                </button>
                
                <div className="flex gap-3">
                  <Link
                    to="/products"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Continue Shopping
                  </Link>
                  <button
                    onClick={() => setShowClearModal(true)}
                    disabled={wishlistCount === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl hover:shadow-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;