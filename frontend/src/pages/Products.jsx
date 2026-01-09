import { useEffect, useState, useMemo } from "react";
import { getAllProducts } from "../api/product";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/wishlistContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  Heart,
  ShoppingCart,
  Star,
  Filter,
  Tag,
  TrendingUp,
  Package,
} from "lucide-react";

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("featured");
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const searchQuery = searchParams.get("search");

   const formatPrice = (price) => {
    if (price === undefined || price === null) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };


// Keep ONLY this useEffect (remove the commented ones):
useEffect(() => {
  const fetchProducts = async () => {
    try {
      console.log("🔍 [DEBUG] Starting product fetch...");
      setIsLoading(true);
      setError(null);
      
      // Call your API
      const res = await getAllProducts();
      console.log("✅ [DEBUG] API call successful");
      console.log("📦 [DEBUG] Full response:", res);
      console.log("📦 [DEBUG] Response data:", res.data);
      
      // Check response structure
      console.log("🔍 [DEBUG] Response analysis:");
      console.log("   - Is data an array?", Array.isArray(res.data));
      console.log("   - Data keys:", Object.keys(res.data || {}));
      
      // If data has products array
      if (res.data.products) {
        console.log("   - Has 'products' array?", Array.isArray(res.data.products));
        console.log("   - Products count:", res.data.products?.length);
      }
      
      // Check first product if exists
      if (res.data.products && res.data.products.length > 0) {
        const firstProduct = res.data.products[0];
        console.log("🎯 [DEBUG] First product analysis:");
        console.log("   - Name:", firstProduct.name);
        console.log("   - ID:", firstProduct._id);
        console.log("   - Images array:", firstProduct.images);
        console.log("   - First image value:", firstProduct.images?.[0]);
        console.log("   - Type of first image:", typeof firstProduct.images?.[0]);
        
        // Check what URL frontend will try to load
        const imagePath = firstProduct.images?.[0];
        if (imagePath) {
          console.log("🖼️  [DEBUG] Image analysis:");
          console.log("   - Starts with /?", imagePath.startsWith('/'));
          console.log("   - Starts with /uploads/?", imagePath.startsWith('/uploads/'));
          console.log("   - Starts with http?", imagePath.startsWith('http'));
          
          // How frontend constructs the URL
          const frontendUrl = `http://localhost:5000${imagePath}`;
          console.log("   - Frontend will try:", frontendUrl);
          
          // Test if image loads
          const img = new Image();
          img.onload = () => console.log("   - Image loads: ✅ YES");
          img.onerror = () => console.log("   - Image loads: ❌ NO (404 or error)");
          img.src = frontendUrl;
        } else {
          console.log("   - No image found in product");
        }
      }
      
      console.log("🏁 [DEBUG] Analysis complete");
      
      // YOUR ORIGINAL CODE CONTINUES HERE
      const data = res.data;
      let allProducts = [];

      if (Array.isArray(data)) {
        allProducts = data;
      } else if (Array.isArray(data.products)) {
        allProducts = data.products;
      } else {
        allProducts = [];
      }
      
      // Filter by category
      if (categoryFilter) {
        allProducts = allProducts.filter(
          (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase()
        );
      }
      
      // Filter by search
      if (searchQuery) {
        allProducts = allProducts.filter((p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      console.log("📊 [DEBUG] Final products after filtering:", allProducts.length);
      setProducts(allProducts);
      
    } catch (err) {
      console.error("❌ [DEBUG] Error fetching products:", err);
      console.error("❌ [DEBUG] Error details:", err.response?.data || err.message);
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  fetchProducts();
}, [categoryFilter, searchQuery]);

//---------------------------------------------

 const handleAddToCart = async (e, product) => {
  e.preventDefault();
  e.stopPropagation();

  if (!user) {
    toast.error("Please login first");
    navigate("/login");
    return;
  }

  try {
    await addItem(product._id, 1);
    toast.success(`${product.name} added to cart`, { icon: "🛒" });
  } catch (err) {
    toast.error("Failed to add to cart");
  }
};


 const handleAddToWishlist = async (e, product) => {
  e.preventDefault();
  e.stopPropagation();

  if (!user) {
    toast.error("Please login first");
    navigate("/login");
    return;
  }

  try {
    await addToWishlist(product._id);
    toast.success(`${product.name} added to wishlist`, { icon: "❤️" });
  } catch {
    toast.error("Already in wishlist");
  }
};


  const calculateDiscount = (original, current) => {
    if (!original || original <= current) return null;
    const discount = ((original - current) / original) * 100;
    return Math.round(discount);
  };

  const sortedProducts = useMemo(() => {
    const productsCopy = [...products];

    switch (sortOption) {
      case "price-low":
        return productsCopy.sort((a, b) => a.price - b.price);
      case "price-high":
        return productsCopy.sort((a, b) => b.price - a.price);
      case "newest":
        return productsCopy.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      case "name-asc":
        return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return productsCopy.sort((a, b) => b.name.localeCompare(a.name));
      case "discount":
        return productsCopy.sort((a, b) => {
          const discountA = calculateDiscount(a.originalPrice, a.price) || 0;
          const discountB = calculateDiscount(b.originalPrice, b.price) || 0;
          return discountB - discountA;
        });
      default:
        return productsCopy;
    }
  }, [products, sortOption]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-4">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl w-80 animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl w-96 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-gradient-to-br from-gray-200 to-gray-100 aspect-square animate-pulse"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center p-12 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Unable to Load Products</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16 flex items-center justify-center">
        <div className="text-center p-12 max-w-lg">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-10 blur-3xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryFilter ? `No ${categoryFilter}'s Bags Found` : searchQuery ? "No Results Found" : "No Products Yet"}
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            {searchQuery
              ? `We couldn't find any bags matching "${searchQuery}". Try different keywords.`
              : categoryFilter
              ? "This category will be stocked soon. Check back later!"
              : "Our collection is being curated. Check back soon for amazing bags!"}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:shadow-xl transition-all font-semibold text-lg transform hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-5 h-5" />
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                {categoryFilter
                  ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}'s Collection`
                  : searchQuery
                  ? "Search Results"
                  : "Premium Collection"}
              </h1>
              {searchQuery && (
                <p className="text-gray-600 mt-1">
                  Showing results for "{searchQuery}"
                </p>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-lg mb-8 max-w-2xl">
            Discover handcrafted bags that blend timeless style with modern functionality
          </p>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <span className="text-gray-600">Found</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                {sortedProducts.length}
              </span>
              <span className="text-gray-600">bags</span>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-5 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm cursor-pointer font-medium hover:border-amber-500 transition-colors"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="discount">Best Deals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => {
            const discount = calculateDiscount(product.originalPrice, product.price);

            return (
              <Link
                to={`/products/${product._id}`}
                key={product._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-200 relative block transform hover:-translate-y-1"
              >
                {/* Discount Badge */}
                {discount && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                      <Tag className="h-3 w-3" />
                      {discount}% OFF
                    </div>
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  className="absolute top-4 right-4 z-10 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-red-50"
                  onClick={(e) => handleAddToWishlist(e, product)}
                >
                  <Heart className="w-4 h-4 text-gray-700 hover:text-red-500 transition-colors" />
                </button>

                {/* Image Container - FIXED */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
                  {product.images && product.images.length > 0 ? (
                    <img
                      // src={`http://localhost:5000${product.images?.[0]}`}

                     src={
  product.images && product.images.length > 0 && product.images[0] 
    ? (() => {
        const imgPath = product.images[0];
        console.log(`Image for ${product.name}:`, imgPath);
        
        if (imgPath.startsWith('http')) {
          return imgPath;
        } else if (imgPath.startsWith('/')) {
          return `http://localhost:5000${imgPath}`;
        } else {
          return `http://localhost:5000/${imgPath}`;
        }
      })()
    : "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop"
}

                      alt={product.name}
                      className="w-full h-full object-cover p-4 group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">View Details</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  {/* Category */}
                  {product.category && (
                    <div className="mb-3">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                        {product.category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">(4.8)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats Footer */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-gray-100">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-2">
                {products.length}
              </div>
              <div className="text-gray-600 font-medium">Total Products</div>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-gray-100">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-700 mb-2">
                {products.filter((p) => p.originalPrice && p.originalPrice > p.price).length}
              </div>
              <div className="text-gray-600 font-medium">On Sale</div>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-gray-100">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700 mb-2">
                {[...new Set(products.map((p) => p.category).filter(Boolean))].length}
              </div>
              <div className="text-gray-600 font-medium">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;