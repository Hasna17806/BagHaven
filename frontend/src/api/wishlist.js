import API from "./axios.js";

// Get user wishlist
export const getWishlist = () => API.get("/wishlist");

// Add product to wishlist
export const addToWishlist = (productId) =>
  API.post("/wishlist", { productId });

// Remove product from wishlist
export const removeFromWishlist = (productId) =>
  API.delete(`/wishlist/${productId}`);
