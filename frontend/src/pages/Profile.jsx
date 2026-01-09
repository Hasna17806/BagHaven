import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getCart } from "../api/cart";
import { getWishlist } from "../api/wishlist";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  ShoppingBag,
  Heart,
  Package,
  Star,
  CreditCard,
  Shield,
  Settings,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Wifi,
  WifiOff,
  Bell,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";

const Profile = () => {
  const { user, logout, loading: authLoading, updateUser } = useAuth();
  const { socket, isConnected, showNotification } = useSocket();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [addresses, setAddresses] = useState([
    { street: "", city: "", state: "", pincode: "", isDefault: true }
  ]);

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fileInputRef = useRef(null);
  const hasLoaded = useRef(false);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Account stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    totalSpent: 0,
    reviews: 0,
  });

  // Real-time notification state
  const [recentNotifications, setRecentNotifications] = useState([]);

  // API endpoints configuration
  const apiEndpoints = {
    getProfile: [
      "/api/users/profile",
      "/api/profile",
      "/profile",
      "/api/user",
      "/users/profile"
    ],
    updateProfile: [
      "/api/users/update-profile",
      "/api/users/profile",
      "/api/profile",
      "/profile/update",
      "/users/update",
      "/api/user/update"
    ],
    changePassword: [
      "/api/users/change-password",
      "/api/profile/change-password",
      "/profile/change-password",
      "/auth/change-password"
    ]
  };

  // Enhanced API call function with fallbacks
  const apiCallWithFallbacks = async (endpoints, method = 'GET', data = null) => {
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying ${method} ${endpoint}...`);
        
        let response;
        switch (method.toUpperCase()) {
          case 'GET':
            response = await API.get(endpoint);
            break;
          case 'PUT':
            response = await API.put(endpoint, data);
            break;
          case 'POST':
            response = await API.post(endpoint, data);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
        
        console.log(`✅ Success with ${endpoint}`);
        return response;
      } catch (error) {
        console.log(`❌ Failed with ${endpoint}:`, error.message);
        lastError = error;
        
        // Don't retry if it's an authorization error
        if (error.response?.status === 401 || error.response?.status === 403) {
          break;
        }
      }
    }
    
    throw lastError;
  };

  // Save profile to localStorage
  const saveProfileToLocalStorage = useCallback((profileData) => {
    const key = `user_profile_${user?._id || user?.email || 'default'}`;
    try {
      localStorage.setItem(key, JSON.stringify(profileData));
      console.log("✅ Profile saved to localStorage:", key);
    } catch (error) {
      console.error("❌ Error saving profile to localStorage:", error);
    }
  }, [user]);

  // Load profile from localStorage
  const loadProfileFromLocalStorage = useCallback(() => {
    const key = `user_profile_${user?._id || user?.email || 'default'}`;
    try {
      const savedProfile = localStorage.getItem(key);
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
    } catch (error) {
      console.error("❌ Error loading profile from localStorage:", error);
    }
    return null;
  }, [user]);

  // Load addresses from localStorage on component mount
  useEffect(() => {
    if (user?._id || user?.email) {
      const key = `user_addresses_${user._id || user.email}`;
      const savedAddresses = localStorage.getItem(key);
      if (savedAddresses) {
        try {
          const parsedAddresses = JSON.parse(savedAddresses);
          if (parsedAddresses && parsedAddresses.length > 0) {
            setAddresses(parsedAddresses);
            console.log("✅ Loaded addresses from localStorage");
          }
        } catch (error) {
          console.log("❌ Error loading addresses:", error);
        }
      }
    }
  }, [user]);

  // Join socket room when user is available
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('join-user-room', user._id);
      console.log('✅ Joined user room:', user._id);
    }
  }, [socket, user?._id]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUserUpdate = (data) => {
      console.log('🔄 Real-time update received:', data);
      
      // Show notification
      showNotification('Profile Updated', 'Your profile has been updated by an admin');
      
      // Refresh user data
      setTimeout(() => {
        fetchFreshUserData();
      }, 1000);
    };

    const handleGeneralUserUpdate = (data) => {
      console.log('📢 General user update:', data);
      
      // Check if this update is for current user
      if (data.data?.userId === user?._id || data.data?.email === user?.email) {
        toast.success('Your profile has been updated!', {
          icon: '🔄',
          duration: 5000,
        });
        
        // Add to notifications
        setRecentNotifications(prev => [{
          id: Date.now(),
          type: 'admin-update',
          message: `Admin updated your profile (${data.data?.updates?.join(', ') || 'profile info'})`,
          time: new Date().toLocaleTimeString(),
          read: false
        }, ...prev.slice(0, 4)]);
        
        // Force refresh data
        fetchFreshUserData();
      }
    };

    // Listen for user-specific updates
    socket.on('user-update', handleUserUpdate);
    
    // Listen for general user updates
    socket.on('user-updated', handleGeneralUserUpdate);

    return () => {
      socket.off('user-update', handleUserUpdate);
      socket.off('user-updated', handleGeneralUserUpdate);
    };
  }, [socket, user?._id, user?.email]);

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      console.log("🔍 Profile auth check:", {
        authLoading,
        hasUserContext: !!user,
        hasTokenLocalStorage: !!token,
        hasUserLocalStorage: !!storedUser
      });
      
      if (!user && (!token || !storedUser)) {
        console.log("🚫 No auth found anywhere, redirecting to login");
        navigate("/login");
        return;
      }
      
      if (!user && token && storedUser) {
        console.log("⏳ Waiting for AuthContext to load user from localStorage...");
        const timer = setTimeout(() => {
          if (!user) {
            console.log("⚠️ AuthContext still hasn't loaded user after delay");
            window.location.reload();
          }
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, user, navigate]);

  // Enhanced loadProfile function - REMOVED the toast.loading from here
  const loadProfile = useCallback(async (forceRefresh = false, silent = false) => {
    const storedUser = localStorage.getItem("user");
    
    if ((!user && !storedUser) || (hasLoaded.current && !forceRefresh)) return;
    
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      let freshUser;
      let fromAPI = false;
      
      try {
        // Try to fetch fresh data from API
        const response = await apiCallWithFallbacks(apiEndpoints.getProfile, 'GET');
        
        if (response.data.success || response.data.user) {
          freshUser = response.data.user || response.data;
          fromAPI = true;
          console.log('✅ Profile data fetched from API');
          
          // Save API response to localStorage
          saveProfileToLocalStorage(freshUser);
        }
      } catch (apiError) {
        console.log("All API endpoints failed, checking localStorage...");
        
        // First try to load from our dedicated profile storage
        const savedProfile = loadProfileFromLocalStorage();
        
        if (savedProfile) {
          freshUser = savedProfile;
          console.log('✅ Profile loaded from dedicated localStorage');
        } else {
          // Fallback to user data from localStorage
          const cachedUser = storedUser ? JSON.parse(storedUser) : user;
          
          if (!cachedUser) {
            throw new Error("No user data available");
          }
          
          freshUser = cachedUser;
          console.log('✅ Profile loaded from user localStorage');
        }
        
        if (!silent) {
          toast("Using saved profile data", {
            icon: "💾",
            duration: 1000,
          });
        }
      }
      
      // Update profile state with proper fallbacks
      const profileData = {
        fullName: freshUser.name || freshUser.fullName || "",
        email: freshUser.email || "",
        phone: freshUser.phone || freshUser.mobile || freshUser.contact || "",
        street: freshUser.address || freshUser.street || "",
        city: freshUser.city || "",
        state: freshUser.state || "",
        pincode: freshUser.pincode || freshUser.zipcode || freshUser.postalCode || "",
      };
      
      setProfile(profileData);
      
      // Save this profile data to dedicated storage
      saveProfileToLocalStorage(profileData);
      
      // Enhanced address loading
      try {
        const savedAddresses = localStorage.getItem(`user_addresses_${freshUser._id || freshUser.email}`);
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        } else {
          // Check if user has any address data
          const hasAddressData = freshUser.address || freshUser.city || freshUser.state || freshUser.pincode;
          
          if (hasAddressData) {
            setAddresses([{
              street: freshUser.address || "",
              city: freshUser.city || "",
              state: freshUser.state || "",
              pincode: freshUser.pincode || "",
              isDefault: true
            }]);
          } else {
            setAddresses([{
              street: "",
              city: "",
              state: "",
              pincode: "",
              isDefault: true
            }]);
          }
        }
      } catch (addressError) {
        console.log("Error loading addresses:", addressError);
        // Set default empty address
        setAddresses([{
          street: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: true
        }]);
      }
      
      // Enhanced profile picture loading
      try {
        const userId = freshUser._id || freshUser.email || "default";
        const savedPicture = localStorage.getItem(`profile_picture_${userId}`);
        
        if (savedPicture) {
          setPreviewImage(savedPicture);
        } else if (freshUser.profilePicture) {
          setPreviewImage(freshUser.profilePicture);
          localStorage.setItem(`profile_picture_${userId}`, freshUser.profilePicture);
        } else if (freshUser.avatar) {
          setPreviewImage(freshUser.avatar);
          localStorage.setItem(`profile_picture_${userId}`, freshUser.avatar);
        } else if (freshUser.profileImage) {
          setPreviewImage(freshUser.profileImage);
          localStorage.setItem(`profile_picture_${userId}`, freshUser.profileImage);
        }
      } catch (imageError) {
        console.log("Error loading profile picture:", imageError);
      }
      
      // Update auth context
      if (freshUser._id || freshUser.email) {
        updateUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      }
      
    } catch (error) {
      console.error("Error loading profile:", error);
      
      // Final fallback - check localStorage
      const savedProfile = loadProfileFromLocalStorage();
      
      if (savedProfile) {
        setProfile(savedProfile);
        if (!silent) {
          toast("Loaded from saved profile", {
            icon: "💾",
          });
        }
      } else if (!silent) {
        toast.error("Could not load profile data");
      }
    }
    
    hasLoaded.current = !forceRefresh;
    setLoading(false);
    setRefreshing(false);
  }, [user, updateUser, saveProfileToLocalStorage, loadProfileFromLocalStorage]);

  // Initial load
  useEffect(() => {
    if (!authLoading) {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (user) {
        console.log("✅ User found in context, loading profile...");
        loadProfile();
        fetchAccountStats();
      } else if (token && storedUser) {
        console.log("🔄 User not in context but tokens exist in localStorage");
        
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("🔄 Using localStorage user as fallback:", parsedUser.email);
          
          // Try to load saved profile first
          const savedProfile = loadProfileFromLocalStorage();
          
          if (savedProfile) {
            setProfile(savedProfile);
          } else {
            setProfile({
              fullName: parsedUser.name || parsedUser.fullName || "",
              email: parsedUser.email || "",
              phone: parsedUser.phone || parsedUser.mobile || "",
              street: parsedUser.address || parsedUser.street || "",
              city: parsedUser.city || "",
              state: parsedUser.state || "",
              pincode: parsedUser.pincode || parsedUser.zipcode || "",
            });
          }
          
          // Try to load addresses from localStorage first
          const savedAddresses = localStorage.getItem(`user_addresses_${parsedUser._id || parsedUser.email}`);
          if (savedAddresses) {
            try {
              setAddresses(JSON.parse(savedAddresses));
            } catch (error) {
              console.log("Error parsing saved addresses in fallback");
              // Initialize addresses with parsed data
              if (parsedUser.address || parsedUser.city || parsedUser.state || parsedUser.pincode) {
                setAddresses([{
                  street: parsedUser.address || "",
                  city: parsedUser.city || "",
                  state: parsedUser.state || "",
                  pincode: parsedUser.pincode || "",
                  isDefault: true
                }]);
              }
            }
          } else {
            // Initialize addresses with parsed data
            if (parsedUser.address || parsedUser.city || parsedUser.state || parsedUser.pincode) {
              setAddresses([{
                street: parsedUser.address || "",
                city: parsedUser.city || "",
                state: parsedUser.state || "",
                pincode: parsedUser.pincode || "",
                isDefault: true
              }]);
            }
          }

          // Load profile picture
          const userId = parsedUser._id || parsedUser.email || "default";
          const savedPicture = localStorage.getItem(`profile_picture_${userId}`);
          
          if (savedPicture) {
            setPreviewImage(savedPicture);
          } else if (parsedUser.profilePicture) {
            setPreviewImage(parsedUser.profilePicture);
            localStorage.setItem(`profile_picture_${userId}`, parsedUser.profilePicture);
          } else if (parsedUser.avatar) {
            setPreviewImage(parsedUser.avatar);
            localStorage.setItem(`profile_picture_${userId}`, parsedUser.avatar);
          }
          
          setStats({
            totalOrders: 0,
            wishlistItems: 0,
            totalSpent: 0,
            reviews: 0,
          });
          
          // Set axios header manually
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Update loading state
          setLoading(false);
          
          console.log("✅ Profile loaded from localStorage fallback");
        } catch (error) {
          console.error("❌ Error parsing localStorage user:", error);
          setLoading(false);
        }
      } else {
        console.log("🚫 No auth tokens found anywhere");
        setLoading(false);
      }
    }
  }, [authLoading, user, loadProfile, loadProfileFromLocalStorage]);

  const fetchAccountStats = async () => {
    try {
      let wishlistCount = 0;
      let totalOrders = 0;
      let totalSpent = 0;
      
      // Wishlist
      try {
        const wishlistRes = await getWishlist();
        const wishlistItems = wishlistRes.data?.wishlist?.items || wishlistRes.data?.items || [];
        wishlistCount = wishlistItems.length || 0;
      } catch (wishlistError) {
        console.log("Wishlist not available");
        wishlistCount = 0;
      }
      
      // Orders
      try {
        const ordersRes = await API.get("/orders/my");
        const orders = ordersRes.data?.orders || ordersRes.data || [];
        
        totalOrders = orders.length || 0;
        totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);
      } catch (ordersError) {
        console.log("Orders fetch error:", ordersError.message);
        totalOrders = 0;
        totalSpent = 0;
      }
      
      setStats({
        totalOrders,
        wishlistItems: wishlistCount,
        totalSpent,
        reviews: 0,
      });
      
    } catch (error) {
      console.log("Stats fetch error:", error.message);
    }
  };

  // Function to fetch fresh user data
  const fetchFreshUserData = async () => {
    try {
      setRefreshing(true);
      await loadProfile(true);
      await fetchAccountStats();
      toast.success('Profile refreshed successfully!', {
        icon: '🔄',
      });
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast.error('Failed to refresh profile');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle profile input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => {
      const updatedProfile = {
        ...prev,
        [name]: value
      };
      
      // Save to localStorage immediately
      saveProfileToLocalStorage(updatedProfile);
      
      return updatedProfile;
    });
  };

  // Handle address input changes
  const handleAddressChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [name]: value
    };
    setAddresses(updatedAddresses);
    saveAddressesToLocalStorage(updatedAddresses);
  };

  // Add new address
  const handleAddAddress = () => {
    const newAddresses = [
      ...addresses,
      { street: "", city: "", state: "", pincode: "", isDefault: false }
    ];
    setAddresses(newAddresses);
    saveAddressesToLocalStorage(newAddresses);
    toast.success("New address field added!");
  };

  // Remove address
  const handleRemoveAddress = (index) => {
    if (addresses.length <= 1) {
      toast.error("You must have at least one address");
      return;
    }
    
    if (window.confirm("Are you sure you want to remove this address?")) {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      
      if (addresses[index].isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }
      
      setAddresses(updatedAddresses);
      saveAddressesToLocalStorage(updatedAddresses);
      toast.success("Address removed!");
    }
  };

  // Set default address
  const handleSetDefaultAddress = (index) => {
    const updatedAddresses = addresses.map((address, i) => ({
      ...address,
      isDefault: i === index
    }));
    setAddresses(updatedAddresses);
    saveAddressesToLocalStorage(updatedAddresses);
    toast.success("Default address updated!");
  };

  // Save addresses to localStorage
  const saveAddressesToLocalStorage = (addressesArray) => {
    if (user?._id || user?.email) {
      const key = `user_addresses_${user._id || user.email}`;
      localStorage.setItem(key, JSON.stringify(addressesArray));
      console.log("✅ Addresses saved to localStorage");
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setProfileImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload profile picture
  const uploadProfilePicture = async () => {
    if (!profileImage) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploadingImage(true);
      
      // Convert to base64
      const base64Image = await convertFileToBase64(profileImage);
      
      // Set preview
      setPreviewImage(base64Image);
      
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...currentUser,
        profilePicture: base64Image,
        avatar: base64Image,
        profileImage: base64Image
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Save with multiple keys for reliability
      const userId = currentUser._id || currentUser.email || "default";
      const userEmail = currentUser.email;
      
      // Save to multiple localStorage keys for redundancy
      localStorage.setItem(`profile_picture_${userId}`, base64Image);
      localStorage.setItem(`user_profile_picture`, base64Image);
      
      if (userEmail) {
        localStorage.setItem(`profile_picture_${userEmail}`, base64Image);
      }
      
      // Update context
      updateUser(updatedUser);
      
      // Try to save to backend
      try {
        await apiCallWithFallbacks(apiEndpoints.updateProfile, 'PUT', {
          profilePicture: base64Image
        });
        toast.success("Profile picture saved to server!");
      } catch (error) {
        console.log("Could not save to backend, but saved locally", error.message);
        toast.success("Profile picture saved locally!", {
          icon: "💾",
        });
      }
      
      setProfileImage(null);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to save picture");
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove profile picture
  const removeProfilePicture = async () => {
    try {
      setUploadingImage(true);
      
      // Remove from state
      setPreviewImage("");
      setProfileImage(null);
      
      // Update user in localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...currentUser,
        profilePicture: "",
        avatar: "",
        profileImage: ""
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Remove from all localStorage keys
      const userId = currentUser._id || currentUser.email || "default";
      const userEmail = currentUser.email;
      
      localStorage.removeItem(`profile_picture_${userId}`);
      localStorage.removeItem(`user_profile_picture`);
      
      if (userEmail) {
        localStorage.removeItem(`profile_picture_${userEmail}`);
      }
      
      // Update context
      updateUser(updatedUser);
      
      // Try to remove from backend
      try {
        await apiCallWithFallbacks(apiEndpoints.updateProfile, 'PUT', {
          profilePicture: ""
        });
      } catch (error) {
        console.log("Could not update backend, but removed locally", error.message);
      }
      
      toast.success("Profile picture removed!");
      
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove picture");
    } finally {
      setUploadingImage(false);
    }
  };

  // Enhanced handleSave function - FIXED to show correct success message
  const handleSave = async () => {
    if (!isEditing) return;
    
    try {
      setIsSaving(true);
      
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      
      // Prepare update data with multiple possible field names
      const updateData = {
        name: profile.fullName,
        fullName: profile.fullName,
        phone: profile.phone,
        mobile: profile.phone,
        contact: profile.phone,
        address: defaultAddress?.street || "",
        street: defaultAddress?.street || "",
        city: defaultAddress?.city || "",
        state: defaultAddress?.state || "",
        pincode: defaultAddress?.pincode || "",
        zipcode: defaultAddress?.pincode || "",
        postalCode: defaultAddress?.pincode || "",
      };
      
      // Clean up empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null || updateData[key] === "") {
          delete updateData[key];
        }
      });
      
      // Save addresses to localStorage first
      saveAddressesToLocalStorage(addresses);
      
      // Save profile picture to localStorage if available
      if (previewImage && previewImage.startsWith('data:image')) {
        const userId = user?._id || user?.email || "default";
        localStorage.setItem(`profile_picture_${userId}`, previewImage);
      }
      
      // Save profile data to dedicated localStorage
      saveProfileToLocalStorage(profile);
      
      let saveSuccessful = false;
      
      try {
        // Try to update via API
        const response = await apiCallWithFallbacks(apiEndpoints.updateProfile, 'PUT', updateData);
        
        if (response.data.success || response.data.user) {
          const updatedUser = response.data.user || response.data;
          
          // Merge with existing user data
          const finalUser = {
            ...user,
            ...updatedUser,
            profilePicture: previewImage && previewImage.startsWith('data:image') ? previewImage : user?.profilePicture,
            avatar: previewImage && previewImage.startsWith('data:image') ? previewImage : user?.avatar,
          };
          
          updateUser(finalUser);
          localStorage.setItem("user", JSON.stringify(finalUser));
          
          toast.success("✅ Profile updated successfully!");
          saveSuccessful = true;
          setIsEditing(false);
          
          // Refresh data SILENTLY (no toast messages)
          hasLoaded.current = false;
          await loadProfile(true, true); // Pass silent=true to prevent toast
        } else {
          throw new Error(response.data.message || "Update failed");
        }
      } catch (apiError) {
        console.log("API update failed, saving locally...", apiError);
        
        // Update localStorage as fallback
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          name: profile.fullName,
          fullName: profile.fullName,
          phone: profile.phone,
          mobile: profile.phone,
          contact: profile.phone,
          address: defaultAddress?.street || "",
          street: defaultAddress?.street || "",
          city: defaultAddress?.city || "",
          state: defaultAddress?.state || "",
          pincode: defaultAddress?.pincode || "",
          zipcode: defaultAddress?.pincode || "",
          postalCode: defaultAddress?.pincode || "",
          profilePicture: previewImage && previewImage.startsWith('data:image') ? previewImage : currentUser.profilePicture,
          avatar: previewImage && previewImage.startsWith('data:image') ? previewImage : currentUser.avatar,
        };
        
        localStorage.setItem("user", JSON.stringify(updatedUser));
        updateUser(updatedUser);
        
        toast.success(" Profile saved locally!", {
          icon: "💾",
          duration: 5000,
        });
        
        saveSuccessful = true;
        setIsEditing(false);
        setProfileImage(null);
      }
      
      // If save was successful, refresh stats too
      if (saveSuccessful) {
        await fetchAccountStats();
      }
      
    } catch (error) {
      console.error("Profile save error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const response = await apiCallWithFallbacks(
        apiEndpoints.changePassword,
        'PUT',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      );

      if (response.data.success) {
        toast.success("Password changed successfully!", {
          icon: "🔒",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowSettings(false);
      }
    } catch (error) {
      console.error("Password change error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Could not change password. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    
    setTimeout(() => {
      navigate("/");
    }, 100);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Clear notifications
  const clearNotifications = () => {
    setRecentNotifications([]);
    toast.success('Notifications cleared');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
          <p className="text-sm text-gray-500 mt-2">
            Debug: localStorage has token: {localStorage.getItem("token") ? "Yes" : "No"}
          </p>
        </div>
      </div>
    );
  }

  if (!authLoading && !user) {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!token || !storedUser) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center p-12 max-w-lg">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-10 blur-3xl"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-10 text-lg">
              You need to be logged in to view your profile
            </p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:shadow-xl transition-all font-semibold text-lg transform hover:-translate-y-0.5"
            >
              <User className="w-5 h-5" />
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center p-12 max-w-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restoring Session</h2>
          <p className="text-gray-600 mb-6">
            We found your saved session. Loading your profile...
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Click here if loading takes too long
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="px-6 py-3 text-gray-600 hover:text-gray-800"
            >
              Use different account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12">
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
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
          <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-8 py-16 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMThjMC0zIDMtNiA2LTZzNiAzIDYgNi0zIDYtNiA2LTYtMy02LTZ6bS0xMiAwYzAtMyAzLTYgNi02czYgMyA2IDYtMyA2LTYgNi02LTMtNi02em0yNCAyNGMwLTMgMy02IDYtNnM2IDMgNiA2LTMgNi02IDYtNi0zLTYtNnptLTEyIDBjMC0zIDMtNiA2LTZzNiAzIDYgNi0zIDYtNiA2LTYtMy02LTZ6bS0xMiAwYzAtMyAzLTYgNi02czYgMyA2IDYtMyA2LTYgNi02LTMtNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className="relative group">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-4 ring-white/30 overflow-hidden">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                        {profile.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Upload/Change Profile Picture Button */}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-all"
                      title="Change profile picture"
                    >
                      <Camera className="w-5 h-5 text-gray-800" />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold">{profile.fullName}</h1>
                  </div>
                  <p className="text-white/90 flex items-center gap-2 justify-center md:justify-start">
                    <Mail className="w-4 w-4" />
                    {profile.email}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setShowSettings(false);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all font-semibold border border-white/30"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 hover:bg-gray-50 rounded-xl transition-all font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Picture Upload Section */}
        {isEditing && (profileImage || previewImage) && (
          <div className="mb-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                  <p className="text-sm text-gray-600">
                    {profileImage ? "New image selected" : "Current profile picture"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {profileImage && (
                  <>
                    <button
                      onClick={uploadProfilePicture}
                      disabled={uploadingImage}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Picture
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setProfileImage(null);
                        setPreviewImage(user?.profilePicture || user?.avatar || "");
                      }}
                      disabled={uploadingImage}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
                
                {!profileImage && previewImage && (
                  <button
                    onClick={removeProfilePicture}
                    disabled={uploadingImage}
                    className="px-5 py-2.5 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all disabled:opacity-50"
                  >
                    {uploadingImage ? "Removing..." : "Remove Picture"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        {recentNotifications.length > 0 && (
          <div className="mb-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                Recent Updates
              </h3>
              <button
                onClick={clearNotifications}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-3">
              {recentNotifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100"
                >
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Bell className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mb-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {isConnected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {isConnected ? 'Connected to Server' : 'Offline Mode'}
                </h4>
                <p className="text-sm text-gray-600">
                  {isConnected ? 'Real-time updates enabled' : 'Using local data only'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchFreshUserData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile/Settings Section */}
          <div className="lg:col-span-2">
            {!showSettings ? (
              // Profile Information 
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    Profile Information
                  </h2>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <User className="h-4 w-4 text-amber-600" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-gray-900 font-medium">{profile.fullName}</p>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Mail className="h-4 w-4 text-amber-600" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        disabled
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-gray-900 font-medium">{profile.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Phone - Enhanced */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Phone className="h-4 w-4 text-amber-600" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="+91 98765 43210"
                          pattern="[0-9]{10}"
                          title="Please enter a 10-digit phone number"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Make sure to include country code if required
                        </p>
                      </>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-gray-900 font-medium">
                          {profile.phone || "Not provided"}
                          {!profile.phone && (
                            <span className="text-sm text-gray-500 ml-2">
                              (Click Edit Profile to add)
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Addresses Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-amber-600" />
                        Addresses ({addresses.length})
                      </h3>
                      
                      <button
                        onClick={handleAddAddress}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        Add Another Address
                      </button>
                    </div>

                    {addresses.map((address, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-gray-900">
                              Address {index + 1}
                            </h4>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          
                          {isEditing && (
                            <div className="flex gap-2">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(index)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Set as Default
                                </button>
                              )}
                              
                              {addresses.length > 1 && (
                                <button
                                  onClick={() => handleRemoveAddress(index)}
                                  className="text-xs text-red-600 hover:text-red-800 ml-2"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Street Address */}
                        <div className="mb-4">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <MapPin className="h-4 w-4 text-amber-600" />
                            Street Address
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="street"
                              value={address.street}
                              onChange={(e) => handleAddressChange(index, e)}
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                              placeholder="House no., Building, Street"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                              <p className="text-gray-900">
                                {address.street || "Not provided"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* City and State */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <MapPin className="h-4 w-4 text-amber-600" />
                              City
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="city"
                                value={address.city}
                                onChange={(e) => handleAddressChange(index, e)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                placeholder="City"
                              />
                            ) : (
                              <div className="p-3 bg-white rounded-lg border border-gray-100">
                                <p className="text-gray-900">
                                  {address.city || "Not provided"}
                                </p>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <MapPin className="h-4 w-4 text-amber-600" />
                              State
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="state"
                                value={address.state}
                                onChange={(e) => handleAddressChange(index, e)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                placeholder="State"
                              />
                            ) : (
                              <div className="p-3 bg-white rounded-lg border border-gray-100">
                                <p className="text-gray-900">
                                  {address.state || "Not provided"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* PIN Code */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <MapPin className="h-4 w-4 text-amber-600" />
                            PIN Code
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="pincode"
                              value={address.pincode}
                              onChange={(e) => handleAddressChange(index, e)}
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                              placeholder="123456"
                              maxLength="6"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                              <p className="text-gray-900">
                                {address.pincode || "Not provided"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Password Change Settings
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  Change Password
                </h2>

                <div className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Lock className="h-4 w-4 text-purple-600" />
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Lock className="h-4 w-4 text-purple-600" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Lock className="h-4 w-4 text-purple-600" />
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-sm font-semibold text-purple-900 mb-2">Password Requirements:</p>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Minimum 6 characters</li>
                      <li>• New password must match confirmation</li>
                      <li>• Cannot be the same as current password</li>
                    </ul>
                  </div>

                  {/* Change Password Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={handlePasswordChange}
                      className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                      <Lock className="h-5 w-5" />
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Account Overview</h3>
                <button
                  onClick={fetchAccountStats}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 bg-gray-100 rounded-xl animate-pulse h-24"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-900 font-medium">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-red-900 font-medium">Wishlist Items</p>
                        <p className="text-2xl font-bold text-red-900">{stats.wishlistItems}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-900 font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-green-900">{formatPrice(stats.totalSpent)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-lg">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-amber-900 font-medium">Reviews</p>
                        <p className="text-2xl font-bold text-amber-900">{stats.reviews}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left"
                >
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">View Orders</span>
                </button>
                <button
                  onClick={() => navigate("/wishlist")}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left"
                >
                  <Heart className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">My Wishlist</span>
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left"
                >
                  <ShoppingBag className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Shopping Cart</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setIsEditing(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Change Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;