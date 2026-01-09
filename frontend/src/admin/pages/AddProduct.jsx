import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Eye
} from "lucide-react";
import API from "../../api/axios";
import { FaRupeeSign } from "react-icons/fa";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    colors: [],
    features: [],
    specifications: {},
    isActive: true,
    images: []
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const showAlert = (message, type = 'success') => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newPreviews = [];
      const newFiles = [];

      for (const file of files) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          showAlert(`File ${file.name} is not a valid image type. Please use JPEG, PNG, WEBP, AVIF, or GIF.`, "error");
          continue;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          showAlert(`File ${file.name} is too large. Maximum size is 5MB.`, "error");
          continue;
        }

        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
        newFiles.push(file);
      }

      if (newFiles.length > 0) {
        setImagePreviews(prev => [...prev, ...newPreviews]);
        setImageFiles(prev => [...prev, ...newFiles]);
        showAlert(`${newFiles.length} image(s) added successfully!`, 'success');
      }

    } catch (err) {
      console.error("Image upload error:", err);
      showAlert("Failed to process images. Please try again.", "error");
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be selected again
      e.target.value = null;
    }
  };

  const removeImage = (index) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    showAlert("Image removed", "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.price || !formData.category) {
        throw new Error("Please fill in all required fields (Name, Price, Category)");
      }

      if (imageFiles.length === 0) {
        throw new Error("At least one product image is required");
      }

      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error("No admin token found. Please login again.");
      }

      // Validate price is a valid number
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("Please enter a valid price greater than 0");
      }

      // Create FormData
      const submitFormData = new FormData();
      
      // Append text fields
      submitFormData.append('name', formData.name.trim());
      submitFormData.append('description', formData.description.trim() || '');
      submitFormData.append('price', price.toFixed(2));
      submitFormData.append('category', formData.category);
      submitFormData.append('isActive', formData.isActive.toString());
      
      // Append images as separate entries
      imageFiles.forEach((file, index) => {
        submitFormData.append('images', file);
      });

      // Debug: Check FormData contents
      console.log("FormData contents:");
      for (let pair of submitFormData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Make API call
      const response = await API.post('/admin/products', submitFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Explicitly set content type
        },
        timeout: 60000,
        withCredentials: true, // Add this if your API needs credentials
      });

      if (response.data.success) {
        showAlert("Product created successfully!", "success");
        // Clean up object URLs
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      } else {
        throw new Error(response.data.message || "Failed to create product");
      }

    } catch (err) {
      console.error("Add product error:", err);
      console.error("Error details:", err.response?.data);
      
      let errorMessage = "Failed to create product. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Handle specific error cases
      if (errorMessage.includes("images")) {
        errorMessage = "There was an issue with the uploaded images. Please check file types and sizes.";
      }
      
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 md:ring-4 ring-orange-100">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                Add New Product
              </h1>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 font-medium flex items-center gap-2">
                <Sparkles size={14} className="text-orange-500" />
                Fill in the details to create a new product
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="text-orange-600" size={20} />
                <h2 className="text-xl font-black text-gray-900">Basic Information</h2>
              </div>

              {/* Product Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FileText size={16} className="text-orange-600" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-medium transition-all"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FaRupeeSign size={16} className="text-green-600" />
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-bold text-lg transition-all"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                {formData.price && parseFloat(formData.price) <= 0 && (
                  <p className="text-red-500 text-xs mt-1 font-medium">Price must be greater than 0</p>
                )}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-bold appearance-none cursor-pointer transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-medium resize-none transition-all"
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
                <ImageIcon className="text-orange-600" size={20} />
                <div>
                  <h2 className="text-xl font-black text-gray-900">Product Images</h2>
                  <p className="text-xs text-red-500 font-medium">* At least one image is required</p>
                </div>
              </div>

              {/* Images Upload */}
              <div>
                <div className="border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center hover:border-orange-400 transition-all">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploading ? (
                      <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Upload className="text-white" size={28} />
                      </div>
                    )}
                    <p className="text-gray-900 font-bold mb-2 text-lg">
                      {uploading ? 'Uploading images...' : 'Click to upload images'}
                    </p>
                    <p className="text-gray-600 text-sm font-medium">
                      PNG, JPG, JPEG, AVIF, WEBP up to 5MB each
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      You can select multiple images at once
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        Selected Images ({imagePreviews.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          // Clean up object URLs
                          imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                          setImagePreviews([]);
                          setImageFiles([]);
                          showAlert("All images cleared", "success");
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-700 transition-all"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {imagePreviews.length === 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                      <AlertTriangle size={16} />
                      <span>At least one image is required</span>
                    </div>
                    <p className="text-sm text-red-500 mt-1">
                      Please upload at least one product image before submitting.
                    </p>
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
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
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading || imageFiles.length === 0 || parseFloat(formData.price) <= 0}
              className={`flex-1 px-6 py-4 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
                loading || uploading || imageFiles.length === 0 || parseFloat(formData.price) <= 0
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:shadow-2xl hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Product...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Create Product
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

export default AddProduct;