import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
} from "../controllers/cart/cartController.js";

import userAuth from "../middleware/userAuth.js";

const router = express.Router();

/*
=====================================
        USER CART ROUTES
=====================================
*/

// Get cart
router.get("/", userAuth, getCart);

// Add to cart
router.post("/", userAuth, addToCart);

// Remove from cart
router.delete("/:productId", userAuth, removeFromCart);

export default router;


//________________________________________________

// //to confirm only logged-in USERS can access

// import express from "express";
// import { protect } from "../middleware/auth.js";

// const router = express.Router();

// router.post("/", protect, (req, res) => {
//     res.send("Cart updated");
// });

// export default router;