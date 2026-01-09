import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

const [token, setToken] = useState(localStorage.getItem("token"));

useEffect(() => {
  const syncAuth = () => {
    setToken(localStorage.getItem("token"));
  };

  window.addEventListener("authStateChanged", syncAuth);
  window.addEventListener("storage", syncAuth);

  return () => {
    window.removeEventListener("authStateChanged", syncAuth);
    window.removeEventListener("storage", syncAuth);
  };
}, []);


  // Fetch wishlist from server
  const fetchWishlist = async () => {
    if (!token) {
      setWishlistItems([]);
      setWishlistCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Get items from response
      let items = [];
      if (res.data?.wishlist?.items) {
        items = res.data.wishlist.items;
      } else if (res.data?.items) {
        items = res.data.items;
      } else if (Array.isArray(res.data)) {
        items = res.data;
      }

      console.log("🔄 Got fresh wishlist from server:", items.length, "items");
      
      // Update state
      setWishlistItems(items);
      setWishlistCount(items.length);
      
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setWishlistItems([]);
      setWishlistCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Remove item

const removeFromWishlist = async (wishlistItemId) => {
  if (!token) throw new Error("Not authenticated");
  
  console.log("🔍 Looking for wishlist item:", wishlistItemId);
  
  const wishlistItem = wishlistItems.find(item => item._id === wishlistItemId);
  
  if (!wishlistItem) {
    console.error("❌ Item not found in local state");
    throw new Error("Item not found");
  }
  
  console.log("🔍 Found item:", wishlistItem);
  
  let productId = null;
  
  if (wishlistItem.product && wishlistItem.product._id) {
    productId = wishlistItem.product._id;
  } else if (wishlistItem.productId) {
    productId = wishlistItem.productId;
  } else if (wishlistItem.product) {
    productId = wishlistItem.product;
  }
  
  console.log("🔍 Product ID to send:", productId);
  
  if (!productId) {
    console.error("❌ No product ID found in:", wishlistItem);
    throw new Error("Could not find product ID");
  }
  
  
  try {
    console.log("🔄 Deleting with PRODUCT ID:", productId);
    
    const response = await axios.delete(`/wishlist/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("✅ Delete successful:", response.data);
    
    await fetchWishlist();
    return true;

  } catch (error) {
    console.error("❌ Delete failed:", error.response?.data);
    throw error;
  }
};

  // Add to wishlist
  const addToWishlist = async (productId) => {
    if (!token) throw new Error("Not authenticated");
    
    try {
      await axios.post("/wishlist", { productId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Refresh wishlist
      await fetchWishlist();
      return true;
    } catch (error) {
      console.error("Add error:", error);
      throw error;
    }
  };

  // Check if in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => 
      item.product?._id === productId || 
      item.productId === productId
    );
  };

  // Clear all items
  const clearWishlist = async () => {
    if (!token || wishlistItems.length === 0) return;
    
    try {
      // Remove all items one by one
      for (const item of wishlistItems) {
        await removeFromWishlist(item._id);
      }
    } catch (error) {
      console.error("Clear error:", error);
      throw error;
    }
  };

  // Load wishlist when component mounts
  useEffect(() => {
    console.log("📥 Loading wishlist on mount...");
    fetchWishlist();
  }, [token]);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount,
      loading,
      fetchWishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};