import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/payment/paymentController.js";

const router = express.Router();

router.post("/razorpay", userAuth, createRazorpayOrder);
router.post("/verify", userAuth, verifyRazorpayPayment);

export default router;
