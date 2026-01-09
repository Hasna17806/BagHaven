import { useEffect, useState } from "react";
import { 
  Users as UsersIcon, 
  Search, 
  Mail, 
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Eye,
  RefreshCw,
  Filter,
  Download,
  Sparkles,
  X,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import API from "../../api/axios"; // Import your axios instance
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [blockingUser, setBlockingUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);

  useEffect(() => {
    fetchUsers();
    
    // Listen for socket updates
    const socket = window.socket; // Assuming socket is available globally
    
    if (socket) {
      const handleUserUpdate = (data) => {
        if (data.type === 'user-status-changed' || data.type === 'user-updated') {
          const updatedUserId = data.data.userId;
          
          setUsers(prevUsers => 
            prevUsers.map(user => {
              if (user._id === updatedUserId) {
                // Update user status based on the real-time event
                const isBlocked = data.data.status === 'blocked';
                return {
                  ...user,
                  isBlocked,
                  status: data.data.status
                };
              }
              return user;
            })
          );
          
          // Show toast notification
          toast.success(`User ${data.data.email} ${data.data.action}`);
        }
      };
      
      socket.on('user-updated', handleUserUpdate);
      
      return () => {
        socket.off('user-updated', handleUserUpdate);
      };
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      // Using your API instance instead of fetch
      const response = await API.get("/admin/users");
      
      console.log("Users response:", response.data);
      
      if (response.data.success) {
        setUsers(response.data.users || response.data.data || []);
      } else {
        toast.error("Failed to fetch users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBlockUser = async (userId) => {
    const user = users.find(u => u._id === userId);
    
    // Prevent blocking admins
    if (user?.isAdmin) {
      toast.error('Cannot block admin users');
      return;
    }

    setUserToBlock(user);
    setShowConfirmModal(true);
  };

  // Updated confirmBlockUser function with improved error handling
  const confirmBlockUser = async () => {
    if (!userToBlock) return;

    try {
      setBlockingUser(userToBlock._id);
      setShowConfirmModal(false);
      
      // Use the toggle-block endpoint
      const response = await API.put(`/admin/users/${userToBlock._id}/toggle-block`);
      
      console.log("Block/Unblock response:", response.data);
      
      if (response.data.success) {
        // Update the user in local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userToBlock._id 
              ? { 
                  ...user, 
                  isBlocked: !user.isBlocked,
                  // Also update any other fields returned
                  ...response.data.user
                }
              : user
          )
        );
        
        toast.success(response.data.message || `User ${userToBlock.isBlocked ? 'unblocked' : 'blocked'} successfully!`);
        
        // If user was blocked, show a warning that they'll be logged out
        if (!userToBlock.isBlocked) {
          toast.success('User will be logged out from all devices', {
            duration: 4000,
          });
        }
      } else {
        toast.error(response.data.message || 'Failed to update user status');
        // Refresh users to get correct status
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to block/unblock user", error);
      
      // Try fallback to regular update endpoint
      try {
        const fallbackResponse = await API.put(`/admin/users/${userToBlock._id}`, {
          isBlocked: !userToBlock.isBlocked
        });
        
        if (fallbackResponse.data.success) {
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user._id === userToBlock._id 
                ? { 
                    ...user, 
                    isBlocked: !user.isBlocked,
                    ...fallbackResponse.data.user
                  }
                : user
            )
          );
          toast.success(`User status updated successfully!`);
        } else {
          throw new Error(fallbackResponse.data.message || 'Failed to update user');
        }
      } catch (fallbackError) {
        console.error("Fallback endpoint also failed:", fallbackError);
        toast.error('An error occurred while updating user status');
        fetchUsers();
      }
    } finally {
      setBlockingUser(null);
      setUserToBlock(null);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || 
                       (filterRole === "admin" && user.isAdmin) ||
                       (filterRole === "customer" && !user.isAdmin);
    return matchesSearch && matchesRole;
  });

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <UsersIcon className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-900 text-xl font-bold mb-2">Loading Users...</p>
          <p className="text-gray-600 text-sm">Fetching user data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 lg:mb-8 gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 md:ring-4 ring-blue-100">
              <UsersIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">Users</h1>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 font-medium flex items-center gap-2">
                <Sparkles size={14} className="text-blue-500" />
                Manage users
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={fetchUsers}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all disabled:opacity-50 font-semibold shadow-sm hover:shadow-md text-sm"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            
            <button className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 text-sm">
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white border-2 border-blue-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-blue-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl shadow-lg">
                <UsersIcon className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">{users.length}</p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-purple-200 rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 shadow-xl shadow-purple-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl shadow-lg">
                <Shield className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900">
                  {users.filter(u => u.isAdmin).length}
                </p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Admins</p>
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
                  {users.filter(u => !u.isAdmin).length}
                </p>
                <p className="text-xs md:text-sm font-bold text-gray-600">Customers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm font-medium"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="customer">Customers Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center shadow-xl">
            <UsersIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-purple-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-purple-50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-100">
                            <span className="text-white font-bold text-base">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{user.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500 font-mono">ID: {user._id?.slice(-8) || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">{user.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                            <Shield size={12} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                            <UsersIcon size={12} />
                            Customer
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border-2 border-red-300">
                            <Ban size={12} />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border-2 border-green-300">
                            <CheckCircle size={12} />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all hover:scale-110"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleBlockUser(user._id)}
                            disabled={blockingUser === user._id || user.isAdmin}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              user.isAdmin
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : user.isBlocked 
                                  ? 'bg-green-100 hover:bg-green-200 text-green-600' 
                                  : 'bg-red-100 hover:bg-red-200 text-red-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={
                              user.isAdmin 
                                ? "Cannot block admin users" 
                                : user.isBlocked 
                                  ? "Unblock User" 
                                  : "Block User"
                            }
                          >
                            {blockingUser === user._id ? (
                              <RefreshCw size={18} className="animate-spin" />
                            ) : user.isAdmin ? (
                              <Shield size={18} />
                            ) : user.isBlocked ? (
                              <CheckCircle size={18} />
                            ) : (
                              <Ban size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-purple-50 border-t-2 border-gray-200">
              <p className="text-sm font-bold text-gray-700">
                Showing <span className="text-purple-600">{filteredUsers.length}</span> of{" "}
                <span className="text-purple-600">{users.length}</span> users
              </p>
            </div>
          </div>
        )}
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Eye className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-black text-white">User Details</h2>
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
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-blue-100">
                  <span className="text-white font-black text-3xl">
                    {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{selectedUser.name || 'N/A'}</h3>
                  <p className="text-sm text-gray-600 font-medium">{selectedUser.email || 'N/A'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedUser.isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        <UsersIcon size={12} />
                        Customer
                      </span>
                    )}
                    {selectedUser.isBlocked ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <Ban size={12} />
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">User ID</p>
                  <p className="text-sm font-mono font-bold text-gray-900 break-all">{selectedUser._id || 'N/A'}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Joined Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-bold text-amber-900 mb-1">Account Information</p>
                    <p className="text-sm text-amber-800">
                      This user account was created on {formatDate(selectedUser.createdAt)}. 
                      {selectedUser.isBlocked 
                        ? ' The account is currently blocked and cannot access the platform.' 
                        : ' The account is active and in good standing.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                {!selectedUser.isAdmin && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleBlockUser(selectedUser._id);
                    }}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all transform hover:scale-105 ${
                      selectedUser.isBlocked
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-xl'
                    }`}
                  >
                    {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className={`${selectedUser.isAdmin ? 'flex-1' : ''} px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Block Modal */}
      {showConfirmModal && userToBlock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  userToBlock.isBlocked ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {userToBlock.isBlocked ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <Ban className="text-red-600" size={24} />
                  )}
                </div>
                <h3 className="text-xl font-black text-gray-900">
                  {userToBlock.isBlocked ? 'Unblock User?' : 'Block User?'}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                {userToBlock.isBlocked 
                  ? `Are you sure you want to unblock ${userToBlock.name || 'this user'}? They will regain access to the platform.`
                  : `Are you sure you want to block ${userToBlock.name || 'this user'}? They will lose access to the platform.`
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmBlockUser}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all transform hover:scale-105 ${
                    userToBlock.isBlocked
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-xl'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-xl'
                  }`}
                >
                  {userToBlock.isBlocked ? 'Yes, Unblock' : 'Yes, Block'}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setUserToBlock(null);
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

export default Users;