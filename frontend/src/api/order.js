import API from "./axios.js";

// Create order
export const createOrder = (data) => API.post("/orders", data);

// Get my orders
export const getMyOrders = () => API.get("/orders/my");

// Get single order by ID
export const getOrderById = (orderId) => API.get(`/orders/${orderId}`);

// Cancel order
export const cancelOrder = (orderId) => API.delete(`/orders/${orderId}`);

// Request return for order item - FIXED PARAMETERS
export const requestReturn = (orderId, returnData) => 
  API.post(`/orders/${orderId}/return`, returnData);

// Get return status
export const getReturnStatus = (orderId, itemId) => 
  API.get(`/orders/${orderId}/return/${itemId}`);

// Download invoice
export const downloadInvoice = (orderId) => 
  API.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob' 
  });

// Track order
export const trackOrder = (orderId) => API.get(`/orders/${orderId}/track`);

// Admin: Update order status
export const updateOrderStatus = (orderId, statusData) => 
  API.put(`/orders/${orderId}/status`, statusData);