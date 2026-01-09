import Wishlist from "../../models/Wishlist.js";
import Product from "../../models/Product.js";


 //GET user's wishlist
 
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price description images category brand'
      });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        wishlist: {
          _id: null,
          user: req.user._id,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    res.status(200).json({
      success: true,
      wishlist
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADD product to wishlist
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        items: [{ product: productId }],
      });
    } else {
      const exists = wishlist.items.find(
        (item) => item.product.toString() === productId
      );

      if (exists) {
        return res.status(400).json({ 
          success: false,
          message: "Already in wishlist" 
        });
      }

      wishlist.items.push({ product: productId });
      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'items.product',
        select: 'name price description images category brand'
      });

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: populatedWishlist
    });
  } catch (err) {
    next(err);
  }
};

  //REMOVE product from wishlist

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params; // This is the PRODUCT ID from URL
    const userId = req.user.id;
    
    console.log("🛑 BACKEND: Removing product with ID:", productId);
    console.log("🛑 BACKEND: User ID:", userId);
    
    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      console.log("❌ No wishlist found for user");
      return res.status(404).json({ 
        success: false, 
        message: "Wishlist not found" 
      });
    }
    
    console.log("📋 Wishlist has", wishlist.items.length, "items");
    
    // DEBUG: Show all products in wishlist
    console.log("📋 Products in wishlist:");
    wishlist.items.forEach((item, index) => {
      console.log(`  Item ${index}: product ID = ${item.product}`);
    });
    
    // Find the item by PRODUCT ID
    // item.product is an ObjectId, so convert both to string for comparison
    const itemIndex = wishlist.items.findIndex(
      item => item.product.toString() === productId
    );
    
    console.log("🔍 Found item at index:", itemIndex);
    
    if (itemIndex === -1) {
      console.log("❌ Product ID", productId, "not found in wishlist");
      return res.status(404).json({ 
        success: false, 
        message: "Product not found in wishlist" 
      });
    }
    
    // Remove the item
    const removedItem = wishlist.items[itemIndex];
    wishlist.items.splice(itemIndex, 1);
    
    console.log("🗑️ Removed item with product ID:", removedItem.product);
    
    // Save to database
    await wishlist.save();
    
    console.log("✅ Success! Wishlist now has", wishlist.items.length, "items");
    
    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      wishlist
    });
    
  } catch (error) {
    console.error("🔥 BACKEND ERROR in removeFromWishlist:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};