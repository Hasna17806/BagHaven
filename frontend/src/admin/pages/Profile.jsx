import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Activity,
  Award,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../../api/axios";

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "Admin",
    email: "adminbaghavan@example.com",
    phone: "+91 98765 43210",
    address: "MG Road, Kochi, Kerala",
    role: "Super Administrator",
    joinedDate: "January 2024",
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem("adminToken");
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        
        if (decoded.email) {
          setAdminData(prev => ({
            ...prev,
            email: decoded.email,
            name: decoded.name || prev.name,
          }));
        }
      }
    } catch (e) {
      console.log("Could not decode token");
    }
  }, []);

  const handleSave = async () => {
    try {
      const backendData = {
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        address: adminData.address,
      };

      console.log('Updating profile...', backendData);
      
      const response = await API.put("/users/profile", backendData);
      
      if (response.data.success) {
        toast.success("Profile updated successfully!", { 
          icon: "✅",
          style: {
            background: '#10b981',
            color: '#fff',
          }
        });
        setIsEditing(false);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to update profile");
      }
      
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <Toaster position="top-right" />

      {/* Animated Header */}
      <div className="mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl opacity-20 blur-3xl"></div>
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-purple-100 transform rotate-3 hover:rotate-0 transition-transform">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                  Admin Profile
                </h1>
                <p className="text-gray-600 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Manage your account and settings
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-xl ${
                isEditing
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-gray-500/50"
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white hover:shadow-orange-500/50"
              }`}
            >
              {isEditing ? (
                <>
                  <X size={20} />
                  Cancel Edit
                </>
              ) : (
                <>
                  <Edit size={20} />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-20 blur-2xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-purple-200 p-8">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-6">
                  <div className="w-36 h-36 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center text-white font-black text-6xl shadow-2xl ring-4 ring-purple-100 transform hover:scale-105 transition-transform">
                    {adminData.name.charAt(0).toUpperCase()}
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-xl border-4 border-white hover:scale-110 transition-transform">
                      <Camera size={20} className="text-white" />
                    </button>
                  )}
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white animate-pulse">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-2">{adminData.name}</h2>
                <p className="text-gray-600 font-medium mb-6">{adminData.email}</p>

                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 via-orange-100 to-red-100 border-2 border-amber-300 rounded-2xl shadow-lg">
                  <Shield size={20} className="text-amber-600" />
                  <span className="text-base font-black text-amber-700">{adminData.role}</span>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center justify-center gap-3 text-gray-700">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Calendar size={18} className="text-blue-600" />
                    </div>
                    <span className="font-bold">Joined {adminData.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl opacity-20 blur-2xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Activity Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
                  <span className="text-gray-700 font-bold">Total Actions</span>
                  <span className="text-2xl font-black text-purple-600">1,234</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
                  <span className="text-gray-700 font-bold">Last Login</span>
                  <span className="text-2xl font-black text-blue-600">Today</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                  <span className="text-gray-700 font-bold">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    <span className="text-lg font-black text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl opacity-20 blur-2xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-orange-200 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Personal Information</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
                    <User className="w-5 h-5 text-purple-600" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={adminData.name}
                      onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                      className="w-full px-6 py-4 border-3 border-purple-300 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all font-bold text-lg bg-gradient-to-r from-purple-50 to-pink-50"
                    />
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-inner">
                      <p className="text-gray-900 font-bold text-lg">{adminData.name}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Email Address
                  </label>
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 shadow-inner">
                    <p className="text-gray-900 font-bold text-lg">{adminData.email}</p>
                    <p className="text-sm text-blue-600 mt-2 font-semibold">🔒 Email cannot be changed</p>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
                    <Phone className="w-5 h-5 text-green-600" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={adminData.phone}
                      onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                      className="w-full px-6 py-4 border-3 border-green-300 rounded-2xl focus:ring-4 focus:ring-green-500 focus:border-green-500 transition-all font-bold text-lg bg-gradient-to-r from-green-50 to-emerald-50"
                    />
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-inner">
                      <p className="text-gray-900 font-bold text-lg">{adminData.phone}</p>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
                    <MapPin className="w-5 h-5 text-red-600" />
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={adminData.address}
                      onChange={(e) => setAdminData({ ...adminData, address: e.target.value })}
                      rows="3"
                      className="w-full px-6 py-4 border-3 border-red-300 rounded-2xl focus:ring-4 focus:ring-red-500 focus:border-red-500 transition-all resize-none font-bold text-lg bg-gradient-to-r from-red-50 to-orange-50"
                    />
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200 shadow-inner">
                      <p className="text-gray-900 font-bold text-lg">{adminData.address}</p>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="md:col-span-2 pt-4">
                    <button
                      onClick={handleSave}
                      className="w-full flex items-center justify-center gap-4 px-10 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-2xl font-black text-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:shadow-green-500/50"
                    >
                      <Save className="w-6 h-6" />
                      Save All Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl opacity-20 blur-2xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-indigo-200 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Security Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 border-2 border-purple-300 rounded-2xl hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">Password</p>
                      <p className="text-sm text-gray-600 font-semibold">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-bold transform hover:scale-105">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-300 rounded-2xl hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600 font-semibold">Add extra security layer</p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-bold transform hover:scale-105">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;