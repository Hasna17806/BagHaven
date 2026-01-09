import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";
// Remove: import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Remove: const navigate = useNavigate(); // ❌ This is gone

  // Helper function to safely access localStorage
  const getLocalStorageItem = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("❌ Error accessing localStorage:", error);
      return null;
    }
  };

  // Enhanced loadUser function
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use helper function to safely get items
      const storedUser = getLocalStorageItem("user");
      const token = getLocalStorageItem("token");
      
      console.log("🔄 Loading user from localStorage...", {
        hasToken: !!token,
        hasStoredUser: !!storedUser,
        storedUser: storedUser ? JSON.parse(storedUser) : null
      });
      
      // If no token or user, clear state and return
      if (!token || !storedUser) {
        console.log("❌ No auth tokens found in localStorage");
        setUser(null);
        setIsAuthenticated(false);
        setInitialLoadDone(true);
        setLoading(false);
        return null;
      }
      
      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (parseError) {
        console.error("❌ Error parsing user from localStorage:", parseError);
        console.log("🛑 DEBUG: Not clearing tokens, just returning null");
        setUser(null);
        setIsAuthenticated(false);
        setInitialLoadDone(true);
        setLoading(false);
        return null;
      }
      
      if (parsedUser.isBlocked) {
        localStorage.removeItem("token");
        // localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        setInitialLoadDone(true);
        
        toast.error("Your account has been blocked. Please contact support.", {
          duration: 5000,
          icon: "🚫",
        });
        
       
        setTimeout(() => {
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }, 100);
        
        return null;
      }
      
      // Set axios header
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user immediately from localStorage
      setUser(parsedUser);
      setIsAuthenticated(true);
      
      console.log("✅ User set from localStorage:", parsedUser);
      
      setTimeout(async () => {
        try {
          const response = await API.get("/users/me");
          if (response.data.success) {
            const freshUser = response.data.user || response.data;
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
            console.log("✅ User verified and updated from backend");
          }
        } catch (error) {
          console.log("⚠️ Backend verification failed:", error.message);
        }
      }, 0);
      
      setInitialLoadDone(true);
      return parsedUser;
      
    } catch (error) {
      console.error("❌ Critical error in loadUser:", error);
      setUser(null);
      setIsAuthenticated(false);
      setInitialLoadDone(true);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    console.log("🚀 AuthProvider mounted, loading user...");
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log("🔄 Storage changed, reloading user...");
        setTimeout(() => loadUser(), 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUser]);

  const login = async (data) => {
    try {
      if (!data.token || !data.user) {
        throw new Error("Invalid login data");
      }
      
      if (data.user?.isBlocked) {
        toast.error("Your account has been blocked. Please contact support.", {
          duration: 5000,
          icon: "🚫",
        });
        return { success: false, error: "Account blocked", isBlocked: true };
      }
      
      localStorage.removeItem("adminToken");
      
      // Store data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Set axios header
      API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Update state
      setUser(data.user);
      setIsAuthenticated(true);
      setInitialLoadDone(true);
      
      window.dispatchEvent(new Event("authStateChanged"));

      
      console.log("✅User logged in successfully");
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
  console.log("🚪 Logging out user...");
  
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const safeUserData = {
    _id: currentUser._id,
    email: currentUser.email,
    name: currentUser.name,
    profilePicture: currentUser.profilePicture, 
    avatar: currentUser.avatar
  };
  
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("user");
  delete API.defaults.headers.common['Authorization'];
  
  setUser(null);
  setIsAuthenticated(false);
  setInitialLoadDone(true);

  window.dispatchEvent(new Event("authStateChanged"));

  
  setTimeout(() => {
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }, 100);
  
  return { success: true };
};

  const updateUser = (updatedData) => {
    try {
      const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
      const newUser = { ...currentUser, ...updatedData };
      
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error("Update user error:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated,
      login, 
      logout, 
      loading,
      updateUser,
      refreshUser: loadUser,
      initialLoadDone
    }}>
      {children}
    </AuthContext.Provider>
  );
};