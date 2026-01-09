import express from "express";
import {
  createOrder,
  getMyOrders,
  requestReturn, 
  getOrderById 
} from "../controllers/order/orderController.js";

import {
  getAllOrders,
  getRevenue,
} from "../controllers/admin/orderController.js";

import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// User routes
router.post("/", userAuth, createOrder);
router.get("/my", userAuth, getMyOrders);
router.post("/:orderId/return", userAuth, requestReturn); 
router.get("/:orderId", userAuth, getOrderById); 
router.post("/:orderId/return", userAuth, requestReturn);
router.get("/:orderId", userAuth, getOrderById);

// Admin routes
router.get("/revenue", adminAuth, getRevenue);
router.get("/", adminAuth, getAllOrders);

export default router;