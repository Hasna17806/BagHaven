import crypto from "crypto";
import razorpay from "../../utils/razorpay.js";
import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";

/*
=====================================
CREATE RAZORPAY ORDER
=====================================
*/
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "price");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const amount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/*
=====================================
VERIFY PAYMENT & CREATE ORDER
=====================================
*/
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
    } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name price image");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    //  Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: address,
      totalPrice,
      paymentMethod: "Razorpay",
      paymentResult: {
        transactionId: razorpay_payment_id,
        status: "success",
      },
      isPaid: true,
      paidAt: Date.now(),
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Payment verified & order created",
      order,
    });
  } catch (error) {
    next(error);
  }
};
