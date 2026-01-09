import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getCart, addToCart, updateCart, removeFromCart } from "../api/cart";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);


  // Check authentication from localStorage
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  };

  // Fetch cart from API
  const fetchCart = useCallback(async (forceRefresh = false) => {
    if (!checkAuth()) {
      setCartItems([]);
      setHasLoaded(true);
      return;
    }
    
    try {
      setCartLoading(true);
      const res = await getCart();
      
      const items = res.data?.items || 
                    res.data?.cart?.items || 
                    res.data?.data?.items || 
                    [];
      
      setCartItems(items);
      setHasLoaded(true);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      if (error.response?.status === 401) {
        // Clear auth on 401
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setCartItems([]);
      setHasLoaded(true);
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Add item
  const addItem = async (productId, qty = 1) => {
    try {
      await addToCart(productId, qty);

      setCartItems(prev => [...prev]);

      await fetchCart();

      return true;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    try {
      // Optimistic update
      setCartItems(prev => prev.filter(item => 
        item.product?._id !== productId && item._id !== productId
      ));
      
      await removeFromCart(productId);
      return true;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      await fetchCart(true); // Refresh on error
      throw error;
    }
  };

  // Update item quantity
  const updateItem = async (productId, quantity) => {
    try {
      // Optimistic update
      setCartItems(prev => prev.map(item => 
        (item.product?._id === productId || item._id === productId)
          ? { ...item, quantity }
          : item
      ));
      
      await updateCart(productId, quantity);
      return true;
    } catch (error) {
      console.error("Failed to update cart:", error);
      await fetchCart(true); // Refresh on error
      throw error;
    }
  };

 const clearCart = async () => {
  setCartItems([]);
  setCartCount(0);
  setCartTotal(0);
  setHasLoaded(true);

  // Force backend sync
  await fetchCart(true);
};


  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
  const count = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const total = cartItems.reduce(
    (sum, item) =>
      sum + (item.product?.price || 0) * (item.quantity || 1),
    0
  );

  setCartCount(count);
  setCartTotal(total);
}, [cartItems]);


  useEffect(() => {
  const syncCart = () => {
    fetchCart(true);
  };

  window.addEventListener("authStateChanged", syncCart);
  window.addEventListener("storage", syncCart);

  return () => {
    window.removeEventListener("authStateChanged", syncCart);
    window.removeEventListener("storage", syncCart);
  };
}, [fetchCart]);


  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading: cartLoading,
        hasLoaded,
        fetchCart,
        addItem,
        removeItem,
        updateItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};