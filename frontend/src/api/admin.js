import API from "./axios.js";

// Auth
export const adminLogin = (data) => API.post("/admin/login", data);

// Dashboard
export const getDashboardStats = () => API.get("/admin/dashboard/stats");

// Products
export const getAdminProducts = () => API.get("/admin/products");

// Orders
export const getAdminOrders = () => API.get("/admin/orders");

// Users
export const getAdminUsers = () => API.get("/admin/users");

// Revenue
export const getRevenueStats = () => API.get("/admin/revenue");