
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";

/**
 * GET user's cart
 */

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: {
          _id: null,
          user: req.user._id,
          items: [],
          totalAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * (item.quantity || 1);
    }, 0);

    res.status(200).json({
      success: true,
      cart: {
        ...cart.toObject(),
        totalAmount
      }
    });
  } catch (err) {
    next(err);
  }
};

/*
 * ADD product to cart
 */

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    const totalAmount = populatedCart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * (item.quantity || 1);
    }, 0);

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: {
        ...populatedCart.toObject(),
        totalAmount
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * REMOVE product from cart
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: "Cart not found" 
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    const totalAmount = populatedCart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * (item.quantity || 1);
    }, 0);

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: {
        ...populatedCart.toObject(),
        totalAmount
      }
    });
  } catch (err) {
    next(err);
  }
};


