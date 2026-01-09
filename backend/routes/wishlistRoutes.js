import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlist/wishlistController.js";

import userAuth from "../middleware/userAuth.js";

const router = express.Router();

/*
=====================================
      USER WISHLIST ROUTES
=====================================
*/

// Get wishlist
router.get("/", userAuth, getWishlist);

// Add to wishlist
router.post("/", userAuth, addToWishlist);

// Remove from wishlist
router.delete("/:productId", userAuth, removeFromWishlist);

export default router;
