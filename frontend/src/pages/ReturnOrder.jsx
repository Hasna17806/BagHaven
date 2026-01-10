// src/pages/ReturnOrder.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  Package,
  RefreshCw,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera
} from 'lucide-react';

const ReturnOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const itemId = searchParams.get('itemId');

  const [order, setOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    reason: '',
    comments: '',
    images: []
  });

  const returnReasons = [
    { value: 'damaged', label: 'Damaged in Shipment' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'defective', label: 'Defective Product' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'quality_issues', label: 'Quality Issues' },
    { value: 'size_fit', label: 'Size/Fit Issue' },
    { value: 'changed_mind', label: 'Changed My Mind' },
    { value: 'other', label: 'Other Reason' }
  ];

  useEffect(() => {
    if (!orderId || !itemId) {
      toast.error('Invalid return request');
      navigate('/orders');
      return;
    }
    fetchOrderDetails();
  }, [orderId, itemId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SOCKET_URL}/api/orders/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch order');

      const data = await response.json();
      const foundOrder = data.orders?.find(o => o._id === orderId);
      
      if (!foundOrder) {
        toast.error('Order not found');
        navigate('/orders');
        return;
      }

      const foundItem = foundOrder.orderItems?.find(
        item => item._id === itemId || item.product?._id === itemId
      );

      if (!foundItem) {
        toast.error('Item not found');
        navigate('/orders');
        return;
      }

      setOrder(foundOrder);
      setSelectedItem(foundItem);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reason) {
      toast.error('Please select a reason for return');
      return;
    }

    if (!formData.comments.trim()) {
      toast.error('Please provide additional details');
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(
        <div>
          <p className="font-semibold">✓ Return Request Submitted!</p>
          <p className="text-sm mt-1">Request ID: RET{Date.now().toString().slice(-8)}</p>
          <p className="text-xs mt-2 text-gray-600">We'll contact you within 24 hours</p>
        </div>,
        { duration: 5000 }
      );

      setTimeout(() => {
        navigate('/orders');
      }, 2000);

    } catch (error) {
      toast.error('Failed to submit return request');
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Toaster position="top-right" />
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-amber-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading return details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Orders</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">Return Request</h1>
            </div>
            <p className="text-amber-50">Order #{order?._id?.slice(-8).toUpperCase()}</p>
          </div>

          {/* Item Details */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Item to Return
            </h3>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedItem?.name || selectedItem?.product?.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>Quantity: {selectedItem?.quantity}</span>
                    <span>•</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(selectedItem?.price || selectedItem?.product?.price)}
                    </span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Eligible for Return
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-6">
            
            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Reason for Return <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-gray-900"
                required
              >
                <option value="">Select a reason</option>
                {returnReasons.map(reason => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Additional Details <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Please provide more details about the issue..."
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 10 characters required
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Upload Images (Optional)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Upload photos showing the issue (max 3 images)
              </p>
              
              {formData.images.length < 3 && (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-amber-500 hover:bg-amber-50 transition-all">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 5MB each
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Image Previews */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    Important Information
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Return must be initiated within 7 days of delivery</li>
                    <li>• Product should be unused and in original packaging</li>
                    <li>• Free pickup will be arranged from your address</li>
                    <li>• Refund will be processed within 5-7 business days</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.reason || formData.comments.length < 10}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-xl hover:shadow-amber-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Submit Return Request
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-2">
                Contact our support team for any questions about returns
              </p>
              <p className="text-sm text-gray-900 font-medium">
                📧 support@baghaven.com | 📞 +91 98765 43210
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnOrder;