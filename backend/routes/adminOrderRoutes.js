import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getAllOrders,
  getRevenue,
  updateOrderStatus,
} from "../controllers/admin/orderController.js";

const router = express.Router();

router.get("/orders", adminAuth, getAllOrders);
router.get("/revenue", adminAuth, getRevenue);
router.put("/orders/:id/status", adminAuth, updateOrderStatus);

export default router;
