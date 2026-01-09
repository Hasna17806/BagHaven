import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/upload.js';
import {
  loginAdmin,
  registerAdmin
} from '../controllers/admin/authController.js';
import {
  getDashboardStats,
  getMonthlyRevenue
} from '../controllers/admin/dashboardController.js';
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/admin/notificationController.js';
import {
  getAdminProducts, 
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/admin/productController.js'; 
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getRevenue
} from '../controllers/admin/orderController.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleBlockUser,
  resetUserPassword
} from '../controllers/admin/userController.js';

const router = express.Router();

// Auth
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Dashboard
router.get('/dashboard', adminAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Admin Dashboard',
    admin: req.admin
  });
});
router.get('/dashboard/stats', adminAuth, getDashboardStats);
router.get('/dashboard/revenue/monthly', adminAuth, getMonthlyRevenue);

// Notifications
router.get('/notifications', adminAuth, getAdminNotifications);
router.put('/notifications/:id/read', adminAuth, markNotificationAsRead);
router.put('/notifications/read-all', adminAuth, markAllNotificationsAsRead);

// Products
router.get('/products', adminAuth, getAdminProducts); 
router.get('/products/:id', adminAuth, getProductById);
router.post('/products', adminAuth, upload.array('images', 5), createProduct);
router.put('/products/:id', adminAuth, upload.array('images', 5), updateProduct);
router.patch('/products/:id', adminAuth, upload.array('images', 5), updateProduct);
router.delete('/products/:id', adminAuth, deleteProduct);

// Orders
router.get('/orders', adminAuth, getAllOrders);
router.get('/orders/revenue', adminAuth, getRevenue);
router.get('/orders/:id', adminAuth, getOrderById);
router.put('/orders/:id/status', adminAuth, updateOrderStatus);

// Users 
router.get('/users', adminAuth, getAllUsers);
router.get('/users/:id', adminAuth, getUserById);
router.put('/users/:id', adminAuth, updateUser); 
router.put('/users/:id/toggle-block', adminAuth, toggleBlockUser); 
router.put('/users/:id/reset-password', adminAuth, resetUserPassword);
router.delete('/users/:id', adminAuth, deleteUser);

// Categories
router.get('/categories', adminAuth, (req, res) => {
  res.json({
    success: false,
    categories: ['women', 'men', 'kids']
  });
});

export default router;