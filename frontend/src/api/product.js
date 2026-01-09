import API from "./axios.js";

/*
=====================================
GET ALL PRODUCTS
=====================================
*/
export const getAllProducts = (params = {}) => {
  // params example:
  // { category: "women", search: "bag", limit: 8 }
  return API.get("/products", { params });
};

export const getProductById = (id) => {
  return API.get(`/products/${id}`);
};

/* ================= ADMIN ================= */

export const createProduct = (data) => {
  return API.post("/products", data);
};

export const updateProduct = (id, data) => {
  return API.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return API.delete(`/products/${id}`);
};
