import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Package,
  Sparkles,
  DollarSign,
  Tag,
  CheckCircle,
  XCircle,
  Download,
  X,
  AlertTriangle,
  Power,
  PowerOff
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const navigate = useNavigate();

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '') {
      return "https://via.placeholder.com/400?text=No+Image";
    }
    
    const baseUrl = "http://localhost:5000";
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `${baseUrl}${imagePath}`;
    }
    
    return `${baseUrl}/uploads/${imagePath}`;
  };
  

  const showAlert = (message, type = 'success') => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const response = await API.get("/admin/products");
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Error loading products:", err);
      showAlert("Failed to load products", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      setTogglingStatus(product._id);
      
      // Debug: Check what methods are available
      console.log("Attempting to toggle product status for:", product._id);
      console.log("Current status:", product.isActive);
      console.log("New status:", !product.isActive);
      
      
      try {
        const response = await API.put(`/admin/products/${product._id}`, {
          isActive: !product.isActive
        });
        
        console.log("PUT request successful:", response.data);
        showAlert(
          `${product.name} ${!product.isActive ? 'activated' : 'deactivated'} successfully!`, 
          'success'
        );
        
        // Update local state
        setProducts(prev => prev.map(p => 
          p._id === product._id ? { ...p, isActive: !p.isActive } : p
        ));
        return;
      } catch (putError) {
        console.log("PUT failed:", putError.message);
      }
      
      // OPTION 2: Try POST to a specific status endpoint
      try {
        const endpoint = !product.isActive 
          ? `/admin/products/${product._id}/activate`
          : `/admin/products/${product._id}/deactivate`;
        
        await API.post(endpoint);
        
        showAlert(
          `${product.name} ${!product.isActive ? 'activated' : 'deactivated'} successfully!`, 
          'success'
        );
        
        // Update local state
        setProducts(prev => prev.map(p => 
          p._id === product._id ? { ...p, isActive: !p.isActive } : p
        ));
        return;
      } catch (postError) {
        console.log("POST to status endpoint failed:", postError.message);
      }
      
      // OPTION 3: Try POST with action parameter
      try {
        await API.post(`/admin/products/${product._id}`, {
          action: 'toggleStatus',
          isActive: !product.isActive
        });
        
        showAlert(
          `${product.name} ${!product.isActive ? 'activated' : 'deactivated'} successfully!`, 
          'success'
        );
        
        // Update local state
        setProducts(prev => prev.map(p => 
          p._id === product._id ? { ...p, isActive: !p.isActive } : p
        ));
        return;
      } catch (actionError) {
        console.log("POST with action parameter failed:", actionError.message);
      }
      
      // If all methods fail, show error
      throw new Error("Could not update product status. Check backend API routes.");
      
    } catch (err) {
      console.error("Error toggling product status:", err);
      
      // Check if it's a 404 error
      if (err.response?.status === 404) {
        const errorMessage = `
          Backend API route not found.
          
          Your backend doesn't have an endpoint for updating product status.
          
          Please check your backend routes. Common endpoints are:
          1. PUT /admin/products/{id}
          2. POST /admin/products/{id}/toggle-status
          3. POST /admin/products/{id}/status
          
          Current attempt: /admin/products/{id}
        `;
        
        console.error(errorMessage);
        showAlert("Cannot update status - backend API route not configured", "error");
      } else {
        showAlert(err.response?.data?.message || "Failed to update product status", "error");
      }
      
      // Refresh to get correct state from server
      await fetchProducts();
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeletingProduct(productToDelete._id);
      setShowDeleteModal(false);
      
      await API.delete(`/admin/products/${productToDelete._id}`);
      showAlert(`${productToDelete.name} deleted successfully!`, 'success');
      
      // Update local state
      setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
    } catch (err) {
      console.error("Error deleting product:", err);
      showAlert("Failed to delete product", "error");
    } finally {
      setDeletingProduct(null);
      setProductToDelete(null);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && product.isActive) ||
                         (filterStatus === "inactive" && !product.isActive);
    return matchesSearch && matchesStatus;
  });

  // Add a temporary workaround for testing
  const handleToggleStatusWorkaround = (product) => {
    // Temporary: Just update the local state without API call
    setProducts(prev => prev.map(p => 
      p._id === product._id ? { ...p, isActive: !p.isActive } : p
    ));
    
    showAlert(
      `${product.name} ${!product.isActive ? 'activated' : 'deactivated'} (local only - check backend)`, 
      'warning'
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <Package className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">Loading Products...</p>
          <p className="text-gray-600 text-sm">Fetching product catalog</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-2 sm:p-4 lg:p-8">
      {/* Alert Message */}
      {alertMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border-2 flex items-center gap-3 ${
            alertMessage.type === 'success' 
              ? 'bg-green-600 border-green-400 text-white' 
              : alertMessage.type === 'warning'
              ? 'bg-yellow-600 border-yellow-400 text-white'
              : 'bg-red-600 border-red-400 text-white'
          }`}>
            {alertMessage.type === 'success' ? (
              <CheckCircle size={20} />
            ) : alertMessage.type === 'warning' ? (
              <AlertTriangle size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
            <span className="font-bold">{alertMessage.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 lg:mb-8 gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 md:ring-4 ring-orange-100">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                Products
              </h1>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 font-medium flex items-center gap-2">
                <Sparkles size={14} className="text-orange-500" />
                Manage your catalog
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={fetchProducts}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all disabled:opacity-50 font-semibold shadow-sm hover:shadow-md text-sm"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            
            <button
              onClick={() => navigate("/admin/products/add")}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 text-sm"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white border-2 border-orange-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-orange-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg md:rounded-xl shadow-lg">
                <Package className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">{products.length}</p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-green-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-green-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg md:rounded-xl shadow-lg">
                <CheckCircle className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
                  {products.filter(p => p.isActive).length}
                </p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-red-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-red-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg md:rounded-xl shadow-lg">
                <XCircle className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
                  {products.filter(p => !p.isActive).length}
                </p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Inactive</p>
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm font-medium"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="all">All Products</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center shadow-xl">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {products.length === 0 ? "No products yet" : "No products found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {products.length === 0 
                ? "Start building your catalog" 
                : "Try adjusting your search or filter"}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => navigate("/admin/products/add")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Plus size={18} />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-[4/3] bg-white flex items-center justify-center overflow-hidden group">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      className="w-full h-100 object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-gray-400" size={48} />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                      product.isActive 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                    }`}>
                      {product.isActive ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </div>

                  {/* Quick View Button */}
                  <button
                    onClick={() => handleViewProduct(product)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Eye size={18} className="text-gray-700" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 lg:p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-lg lg:text-xl text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                    {product.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Price</p>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                        ₹{product.price?.toLocaleString()}
                      </p>
                    </div>
                    {product.category && (
                      <div className="px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-xs font-bold text-orange-700 capitalize">{product.category}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {/* Toggle Status Button - TEMPORARY: Using workaround */}
                    <button
                      onClick={() => handleToggleStatusWorkaround(product)}
                      disabled={togglingStatus === product._id}
                      className={`p-2.5 rounded-lg transition-all hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        product.isActive 
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-600' 
                          : 'bg-green-100 hover:bg-green-200 text-green-600'
                      }`}
                      title={product.isActive ? "Deactivate Product (Local Only)" : "Activate Product (Local Only)"}
                    >
                      {togglingStatus === product._id ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : product.isActive ? (
                        <PowerOff size={18} />
                      ) : (
                        <Power size={18} />
                      )}
                    </button>

                    <button
                      onClick={() => handleViewProduct(product)}
                      className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all hover:scale-110 flex items-center justify-center"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                      className="p-2.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-all hover:scale-110 flex items-center justify-center"
                      title="Edit Product"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      disabled={deletingProduct === product._id}
                      className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Product"
                    >
                      {deletingProduct === product._id ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-gray-700">
              Showing <span className="text-orange-600">{filteredProducts.length}</span> of{" "}
              <span className="text-orange-600">{products.length}</span> products
            </p>
          </div>
        )}
      </div>

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Eye className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-black text-white">Product Details</h2>
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
              {/* Product Images */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  selectedProduct.images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={getImageUrl(img)}
                        alt={`${selectedProduct.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/200?text=No+Image";
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 md:col-span-4 aspect-video rounded-xl bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="text-gray-400" size={48} />
                  </div>
                )}
              </div>

              {/* Product Name and Status */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{selectedProduct.name}</h3>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
                <span className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold ${
                  selectedProduct.isActive 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : 'bg-red-100 text-red-700 border-2 border-red-300'
                }`}>
                  {selectedProduct.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Price</p>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                    ₹{selectedProduct.price?.toLocaleString()}
                  </p>
                </div>
                <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Category</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {selectedProduct.category || 'N/A'}
                  </p>
                </div>
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Product ID</p>
                  <p className="text-sm font-mono font-bold text-gray-900">{selectedProduct._id}</p>
                </div>
                <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Created</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(selectedProduct.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    navigate(`/admin/products/edit/${selectedProduct._id}`);
                  }}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Edit Product
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Delete Product?</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{productToDelete.name}</strong>? 
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
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

export default Products;