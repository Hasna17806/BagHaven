import API from "./axios.js";

export const getCart = () => API.get("/cart");

export const addToCart = (productId, quantity = 1) =>
  API.post("/cart", { productId, quantity });

export const removeFromCart = (productId) =>
  API.delete(`/cart/${productId}`);

export const updateCart = async (productId, quantity) => {
  // Remove the item
  await API.delete(`/cart/${productId}`);
  
  // Add it back with new quantity
  return await API.post("/cart", { productId, quantity });
};