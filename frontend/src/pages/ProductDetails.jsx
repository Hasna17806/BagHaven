import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { addToWishlist } from "../api/wishlist";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/axios";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Tag,
  Share2,
  Minus,
  Plus,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, fetchCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await API.get(`/products/${id}`);

        if (res.data.success === true && res.data.product) {
          setProduct(res.data.product);
        } else if (res.data.product) {
          setProduct(res.data.product);
        } else if (res.data.success === false) {
          setError(res.data.message || "Product not found");
        } else {
          setProduct(res.data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);

        if (error.response) {
          if (error.response.status === 404) {
            setError("Product not found. It may have been removed.");
          } else if (error.response.status === 500) {
            setError("Server error. Please try again later.");
          } else {
            setError(error.response.data?.message || "Failed to load product");
          }
        } else if (error.request) {
          setError("Network error. Please check your connection.");
        } else {
          setError("Failed to load product. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError("Invalid product ID");
      setLoading(false);
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addItem(product._id, quantity);
      toast.success(`${quantity} x ${product.name} added to cart!`);
    } catch (error) {
      toast.error("Please login first");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    setBuyingNow(true);
    try {
      await addItem(product._id, quantity);

      toast.success(`Added to cart! Redirecting to checkout...`, {
        icon: "⚡",
        duration: 2000,
      });

      setTimeout(() => {
        navigate("/checkout");
      }, 1500);
    } catch (error) {
      console.error("Buy Now error:", error);
      toast.error(error.response?.data?.message || "Please login first");
      setBuyingNow(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    setAddingToWishlist(true);
    try {
      await addToWishlist(product._id);
      toast.success(`${product.name} added to wishlist!`, {
        icon: "❤️",
        duration: 3000,
      });
    } catch (error) {
      console.error("Add to wishlist error:", error);
      toast.error(error.response?.data?.message || "Please login first");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: url,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!", {
          icon: "🔗",
        });
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("₹", "₹");
  };

  const calculateDiscount = (original, current) => {
    if (!original || original <= current) return null;
    return Math.round(((original - current) / original) * 100);
  };

  const isInStock = () => {
    return true;
  };

  const getStockStatus = () => {
    if (!product) return null;

    return {
      text: "In Stock",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <Check className="w-4 h-4" />,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-100 border-t-orange-500 mx-auto"></div>
            <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-orange-500" />
          </div>
          <p className="mt-8 text-gray-700 font-semibold text-lg">Loading your selection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Oops!</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105"
            >
              Browse Products
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center p-8 max-w-lg">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl mb-8">
            <Package className="w-16 h-16 text-orange-500" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-10 text-lg">
            This item is currently unavailable or has been removed from our collection.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full hover:shadow-2xl transition-all font-semibold text-lg transform hover:scale-105"
          >
            <ShoppingCart className="w-5 h-5" />
            Discover More
          </button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(product.originalPrice, product.price);
  const images = product.images || [];
  const stockStatus = getStockStatus();
  const inStock = isInStock();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 lg:py-12">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 lg:mb-8">
          <button
            onClick={() => navigate("/products")}
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-all duration-300"
          >
            <div className="p-2.5 rounded-full group-hover:bg-orange-100 transition-all duration-300">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-semibold">Back to Products</span>
          </button>
        </nav>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Product Images Section */}
            <div className="relative p-6 lg:p-10 bg-gradient-to-br from-gray-50 via-white to-orange-50">
              {/* Main Image */}
              <div className="relative bg-white rounded-3xl aspect-square overflow-hidden mb-6 shadow-xl border border-gray-100 group">
                {images.length > 0 ? (
                  <img
                    src={`http://localhost:5000${images[selectedImage]}`}
                    alt={product.name}
                    className="w-full h-full object-cover p-10 group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-300" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-5 left-5 flex flex-col gap-3">
                  {discount && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold rounded-full shadow-xl backdrop-blur-sm">
                      <Tag className="h-4 w-4" />
                      {discount}% OFF
                    </div>
                  )}
                 
                </div>

                {/* Share Button Overlay */}
                <button
                  onClick={handleShare}
                  className="absolute top-5 right-5 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                >
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Thumbnail Grid */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-2xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 ${
                        selectedImage === idx
                          ? "border-orange-500 shadow-xl scale-105 ring-4 ring-orange-100"
                          : "border-gray-200 hover:border-orange-300 hover:shadow-lg"
                      }`}
                    >
                      <img
                        src={`http://localhost:5000${img}`}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover p-2"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="p-6 lg:p-10 flex flex-col">
              {/* Category Badge */}
              {product.category && (
                <div className="mb-5">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-sm font-bold rounded-full border-2 border-orange-200 capitalize shadow-sm">
                    <Star className="w-4 h-4 fill-current" />
                    {product.category}
                  </span>
                </div>
              )}

              {/* Product Title */}
              <h1 className="text-3xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Rating Stars (Mock) */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">(128 reviews)</span>
              </div>

              {/* Price Section */}
              <div className="mb-8 pb-8 border-b-2 border-gray-100">
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <span className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-2xl lg:text-3xl text-gray-400 line-through font-semibold">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-base font-bold rounded-full shadow-lg">
                        Save {formatPrice(product.originalPrice - product.price)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-600 font-medium">Inclusive of all taxes • Free shipping on orders above ₹999</p>
              </div>

              {/* Stock Status */}
              {stockStatus && (
                <div className={`flex items-center gap-3 mb-8 p-4 ${stockStatus.bg} ${stockStatus.border} border-2 rounded-2xl shadow-sm`}>
                  <span className={`${stockStatus.color} p-2 bg-white rounded-full`}>{stockStatus.icon}</span>
                  <div>
                    <span className={`font-bold text-lg ${stockStatus.color}`}>{stockStatus.text}</span>
                    <p className="text-sm text-gray-600">Ready to ship immediately</p>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-base font-bold text-gray-900 mb-4">Select Quantity</label>
                <div className="inline-flex items-center gap-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl p-2 border-2 border-gray-200 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-16 text-center font-black text-2xl text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                  className="col-span-1 sm:col-span-2 py-5 px-8 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl font-black text-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <Zap className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">{buyingNow ? "Processing..." : "Buy Now"}</span>
                </button>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="py-5 px-6 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white rounded-2xl font-bold text-base hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <ShoppingCart className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{addingToCart ? "Adding..." : "Add to Cart"}</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleAddToWishlist}
                  disabled={addingToWishlist}
                  className="py-5 px-6 border-3 border-gray-900 text-gray-900 rounded-2xl font-bold text-base hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 disabled:opacity-50 shadow-sm hover:shadow-xl"
                >
                  <Heart className="w-5 h-5" />
                  {addingToWishlist ? "Adding..." : "Wishlist"}
                </button>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-10 p-6 bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    Product Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all">
                  <div className="p-3 bg-blue-200 rounded-xl">
                    <Truck className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm mb-1">Free Shipping</h4>
                    <p className="text-xs text-blue-700 font-medium">Orders over ₹999</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl border-2 border-emerald-200 shadow-sm hover:shadow-lg transition-all">
                  <div className="p-3 bg-emerald-200 rounded-xl">
                    <Shield className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm mb-1">Secure Payment</h4>
                    <p className="text-xs text-emerald-700 font-medium">100% protected</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-sm hover:shadow-lg transition-all">
                  <div className="p-3 bg-purple-200 rounded-xl">
                    <RotateCcw className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900 text-sm mb-1">Easy Returns</h4>
                    <p className="text-xs text-purple-700 font-medium">30-day policy</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl border-2 border-amber-200 shadow-sm hover:shadow-lg transition-all">
                  <div className="p-3 bg-amber-200 rounded-xl">
                    <Package className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm mb-1">Premium Quality</h4>
                    <p className="text-xs text-amber-700 font-medium">Handcrafted bags</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="pt-8 border-t-2 border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  {product.category && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-500 mb-2 font-medium">Category</p>
                      <p className="font-bold text-gray-900 capitalize text-lg">{product.category}</p>
                    </div>
                  )}
                  {product.brand && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-500 mb-2 font-medium">Brand</p>
                      <p className="font-bold text-gray-900 text-lg">{product.brand}</p>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-2 font-medium">Product ID</p>
                    <p className="font-bold text-gray-900 font-mono text-sm">
                      {product._id?.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                    <p className="text-sm text-gray-500 mb-2 font-medium">Availability</p>
                    <p className="font-bold text-emerald-600 text-lg flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      In Stock
                    </p>
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

export default ProductDetails;