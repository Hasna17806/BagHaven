import express from "express";
import {
  getProducts,
  getByCategory,
  getProductById,
} from "../controllers/product/productController.js";
import Product from '../models/Product.js';

const router = express.Router();

/*
=====================================
           USER ROUTES
=====================================
*/

// Get all products
router.get("/", getProducts);

// Get products by category
router.get("/category/:category", getByCategory);

// Get single product
router.get("/:id", getProductById);

// Test route
router.get('/test/images', async (req, res) => {
  try {
    // Get first 5 products
    const products = await Product.find({}).limit(5).lean();
    
    const result = products.map(p => ({
      _id: p._id,
      name: p.name,
      images: p.images,
      imagesCount: p.images?.length || 0,
      firstImage: p.images?.[0],
      imageStartsWithSlash: p.images?.[0]?.startsWith('/') || false,
      imageStartsWithUploads: p.images?.[0]?.startsWith('/uploads/') || false,
      isFullUrl: p.images?.[0]?.startsWith('http') || false
    }));
    
    res.json({
      success: true,
      message: 'Database check',
      products: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;