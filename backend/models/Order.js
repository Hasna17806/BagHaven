import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,    
    price: Number,    
    quantity: Number,
    image: String, // Add this field
    returnRequested: {
      type: Boolean,
      default: false
    },
    returnStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", null],
      default: null
    },
    returnReason: String,
    returnComments: String,
    returnRequestedAt: Date,
    returnId: String
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    // User who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Products in the order
    orderItems: [orderItemSchema],

    // Shipping address 
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      postalCode: String, 
      country: {
        type: String,
        default: "India"
      }
    },

    // Total order price
    totalPrice: {
      type: Number,
      required: true,
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "wallet"],
      default: "cod",
    },

    // Payment result details
    paymentResult: {
      transactionId: String,
      status: String,
      email: String,
    },

    // Payment status
    isPaid: {
      type: Boolean,
      default: true,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },

    // Order lifecycle status
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
      default: "pending",
    },

    deliveredAt: Date,
    
    // Return tracking
    hasReturns: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;