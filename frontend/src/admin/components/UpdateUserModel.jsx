// src/admin/components/UpdateUserModal.jsx
import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import API from '../../api/axios';

const UpdateUserModal = ({ user, onClose, onUpdate }) => {
  const { emitAdminAction } = useSocket();
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    pincode: user.pincode || '',
    isActive: user.isActive ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await API.put(`/admin/users/${user._id}`, formData);
      
      // Emit real-time update
      emitAdminAction('user-updated', {
        userId: user._id,
        updates: formData,
        timestamp: new Date().toISOString(),
        admin: JSON.parse(localStorage.getItem('admin')).email
      });
      
      onUpdate(response.data.user);
      toast.success('User updated successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Update User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          
          {/* ... other fields ... */}
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};