import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Upload, 
  X, 
  Loader2, 
  ArrowLeft, 
  Package, 
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  DollarSign,
  Tag,
  FileText,
  Eye,
  Edit
} from "lucide-react";
import API from "../../api/axios";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isActive: true
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const showAlert = (message, type = 'success') => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/admin/products/${id}`);
      
      if (response.data.success) {
        const product = response.data.product;
        
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          category: product.category || "",
          isActive: product.isActive !== false
        });
        
        const imageFilenames = product.images.map(img => {
          if (img.startsWith('/uploads/')) {
            return img.replace('/uploads/', '');
          }
          return img;
        });
        
        setExistingImages(imageFilenames);
        
        const previews = product.images.map(img => {
          if (img.startsWith('http')) return img;
          if (img.startsWith('/uploads/')) return `${import.meta.env.VITE_SOCKET_URL}${img}`;
          return `${import.meta.env.VITE_SOCKET_URL}/uploads/${img}`;
        });
        
        setImagePreviews(previews);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      showAlert("Failed to load product. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviews = [];
    const newFiles = [];

    for (const file of files) {
      const preview = URL.createObjectURL(file);
      newPreviews.push(preview);
      newFiles.push(file);
    }

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...newFiles]);
    showAlert(`${files.length} image(s) added successfully!`, 'success');
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      const updatedExisting = [...existingImages];
      updatedExisting.splice(index, 1);
      setExistingImages(updatedExisting);
    } else {
      const adjustedIndex = index - existingImages.length;
      const updatedFiles = [...imageFiles];
      updatedFiles.splice(adjustedIndex, 1);
      setImageFiles(updatedFiles);
    }
    
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
    showAlert("Image removed", "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const submitFormData = new FormData();
      
      submitFormData.append('name', formData.name);
      submitFormData.append('description', formData.description || '');
      submitFormData.append('price', formData.price);
      submitFormData.append('category', formData.category);
      submitFormData.append('isActive', formData.isActive.toString());
      
      submitFormData.append('existingImages', JSON.stringify(existingImages));
      
      imageFiles.forEach(file => {
        submitFormData.append('images', file);
      });

      const response = await API.put(`/admin/products/${id}`, submitFormData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showAlert("Product updated successfully!", "success");
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      }

    } catch (err) {
      console.error("Update error:", err);
      const errorMsg = err.response?.data?.message || "Failed to update product";
      showAlert(errorMsg, "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <Package className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">Loading Product...</p>
          <p className="text-gray-600 text-sm">Fetching product details</p>
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
              : 'bg-red-600 border-red-400 text-white'
          }`}>
            {alertMessage.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
            <span className="font-bold">{alertMessage.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 font-semibold transition-all hover:gap-3"
          >
            <ArrowLeft size={20} />
            Back to Products
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 md:ring-4 ring-green-100">
              <Edit className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                Edit Product
              </h1>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 font-medium flex items-center gap-2">
                <Sparkles size={14} className="text-green-500" />
                Update product information
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="text-green-600" size={20} />
                <h2 className="text-xl font-black text-gray-900">Basic Information</h2>
              </div>

              {/* Product Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FileText size={16} className="text-green-600" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-medium transition-all"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <DollarSign size={16} className="text-emerald-600" />
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-bold text-lg transition-all"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <Tag size={16} className="text-purple-600" />
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-bold appearance-none cursor-pointer transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="kids">Kids</option>
                </select>
              </div>


              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FileText size={16} className="text-indigo-600" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-medium resize-none transition-all"
                  placeholder="Describe the product features, specifications, materials, etc."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.description.length} characters
                </p>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="text-green-600" size={20} />
                <h2 className="text-xl font-black text-gray-900">Product Images</h2>
              </div>

              {/* Current Images Info */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-blue-600" />
                    <span className="font-bold text-gray-700">Current: {existingImages.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Upload size={16} className="text-green-600" />
                    <span className="font-bold text-gray-700">New: {imageFiles.length}</span>
                  </div>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      All Images ({imagePreviews.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreviews([]);
                        setImageFiles([]);
                        setExistingImages([]);
                        showAlert("All images cleared", "success");
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 transition-all"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/200?text=No+Image";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full p-2 hover:scale-110 transition-all shadow-lg"
                        >
                          <X size={16} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                          {index < existingImages.length ? '📁' : '🆕'} #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div>
                <div className="border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center hover:border-green-400 transition-all">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <Upload className="text-white" size={28} />
                    </div>
                    <p className="text-gray-900 font-bold mb-2 text-lg">
                      Add More Images
                    </p>
                    <p className="text-gray-600 text-sm font-medium">
                      PNG, JPG, JPEG, AVIF, WEBP up to 5MB each
                    </p>
                  </label>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      formData.isActive 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg' 
                        : 'bg-gray-300'
                    }`}>
                      {formData.isActive ? (
                        <CheckCircle className="text-white" size={24} />
                      ) : (
                        <Eye className="text-gray-600" size={24} />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">Product Status</span>
                      <span className="text-xs text-gray-600 font-medium">
                        {formData.isActive 
                          ? 'Active and visible to customers' 
                          : 'Inactive and hidden from customers'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-6 h-6 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 pt-8 border-t-2 border-gray-200 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all hover:shadow-md"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              {updating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Product...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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

export default EditProduct;