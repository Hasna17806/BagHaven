import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById
} from "../controllers/admin/productController.js";

const router = express.Router();


// 1. Get all products
router.get("/products", adminAuth, getAllProducts);

// 2. Get single product
router.get("/products/:id", adminAuth, getProductById);

// 3. Create product
router.post(
  "/products",
  adminAuth,
  upload.array("images", 5),
  createProduct
);

// 4. Update product
router.put(
  "/products/:id",
  adminAuth,
  upload.array("images", 5),
  updateProduct
);

// 5. Delete product
router.delete(
  "/products/:id",
  adminAuth,
  deleteProduct
);

export default router;