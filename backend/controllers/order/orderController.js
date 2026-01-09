import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js"; 
import { createNotification } from "../../utils/createNotifications.js";

export const createOrder = async (req, res, next) => {
  try {
    const { paymentMethod, paymentResult, shippingAddress, orderItems, totalPrice } = req.body;

    console.log("🛒 Creating order with data:", {
      paymentMethod,
      shippingAddress,
      orderItemsCount: orderItems?.length,
      paymentResult: paymentResult ? "Present" : "Missing"
    });

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name price images description category brand");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    console.log("🛒 Cart items:", cart.items.length);

    // Determine payment status
    const isCOD = paymentMethod?.toLowerCase() === "cod";
    const isOnlinePaid = !isCOD && paymentResult?.status === "success";
    
    console.log("💳 Payment check:", {
      isCOD,
      isOnlinePaid,
      paymentMethod,
      paymentResultStatus: paymentResult?.status
    });

    // Use orderItems from request or create from cart
    const finalOrderItems = orderItems || cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images?.[0] || null 
    }));

    const finalTotalPrice = totalPrice || finalOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    console.log("💰 Total price:", finalTotalPrice);

    const orderData = {
      user: req.user._id,
      orderItems: finalOrderItems,
      shippingAddress, 
      paymentMethod: paymentMethod || "cod",
      totalPrice: finalTotalPrice,
      isPaid: isOnlinePaid, 
      orderStatus: "processing"
    };

    if (isOnlinePaid && paymentResult) {
      orderData.paymentResult = {
        transactionId: paymentResult.transactionId || paymentResult.id,
        status: paymentResult.status,
        email: paymentResult.email
      };
      orderData.paidAt = new Date();
    }

    console.log("📝 Order data to save:", orderData);

    const order = await Order.create(orderData);

    console.log("✅ Order created:", order._id);

    cart.items = [];
    await cart.save();
    console.log("🛒 Cart cleared");

    // Create notification
    await createNotification(
      'new_order',
      `New order #${order._id.toString().slice(-6)} - ₹${order.totalPrice} by ${req.user.name}`,
      {
        orderId: order._id,
        userId: req.user._id,
        userName: req.user.name,
        amount: order.totalPrice
      }
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Order creation error:", error);
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    console.log("📋 Fetching orders for user:", req.user._id);
    
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'orderItems.product',
        select: 'name price images description category brand',
        model: Product
      })
      .sort({ createdAt: -1 });

    console.log("📊 Orders fetched:", orders.length);

    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      // Ensure shippingAddress has all fields
      const shippingAddress = orderObj.shippingAddress || {};
      
      return {
        ...orderObj,
        shippingAddress: {
          street: shippingAddress.street || shippingAddress.address || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          postalCode: shippingAddress.postalCode || shippingAddress.pincode || "",
          country: shippingAddress.country || "India",
          phone: shippingAddress.phone || "",
          fullName: shippingAddress.fullName || req.user.name || ""
        },
        orderItems: orderObj.orderItems.map(item => {
          const itemObj = item;
          const product = item.product ? item.product.toObject?.() || item.product : null;
          
          // Get image 
          let imagePath = null;
          if (product?.images?.[0]) {
            imagePath = product.images[0];
          } else if (itemObj.image) {
            imagePath = itemObj.image;
          }
          
          return {
            _id: itemObj._id,
            name: itemObj.name || product?.name || "Product",
            price: itemObj.price || product?.price || 0,
            quantity: itemObj.quantity || 1,
            product: product ? {
              _id: product._id,
              name: product.name,
              price: product.price,
              images: product.images || [],
              description: product.description || "",
              category: product.category || "",
              brand: product.brand || ""
            } : null,
            image: imagePath,
            returnRequested: itemObj.returnRequested || false,
            returnStatus: itemObj.returnStatus || null,
            returnId: itemObj.returnId || null
          };
        })
      };
    });

    console.log("✅ Formatted orders:", formattedOrders.length);
    
    // Debug first order
    if (formattedOrders.length > 0) {
      console.log("🔍 First order debug:", {
        orderId: formattedOrders[0]._id,
        itemCount: formattedOrders[0].orderItems?.length,
        firstItem: formattedOrders[0].orderItems?.[0],
        firstItemProduct: formattedOrders[0].orderItems?.[0]?.product,
        firstItemImage: formattedOrders[0].orderItems?.[0]?.image || formattedOrders[0].orderItems?.[0]?.product?.images?.[0]
      });
    }

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    next(error);
  }
};

export const requestReturn = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { itemId, reason, comments } = req.body;
    const userId = req.user._id;

    console.log("🔄 Processing return request:", {
      orderId,
      itemId,
      reason,
      userId
    });

    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      console.log("❌ Order not found:", orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log("📦 Order found, status:", order.orderStatus);
    console.log("📦 Order delivered at:", order.deliveredAt);

    // Only delivered orders can be returned
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be returned"
      });
    }

    // Find the item in order
    const item = order.orderItems.id(itemId);
    
    if (!item) {
      console.log("❌ Item not found in order:", itemId);
      return res.status(404).json({
        success: false,
        message: "Item not found in order"
      });
    }

    console.log("📦 Item found:", item.name);

    // Check if already returned
    if (item.returnRequested) {
      return res.status(400).json({
        success: false,
        message: "Return already requested for this item"
      });
    }

    // Check if within return period (7 days from delivery)
    if (order.deliveredAt) {
      const deliveryDate = new Date(order.deliveredAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      console.log("📅 Delivery date:", deliveryDate);
      console.log("📅 7 days ago:", sevenDaysAgo);
      console.log("📅 Is within 7 days?", deliveryDate > sevenDaysAgo);
      
      if (deliveryDate < sevenDaysAgo) {
        return res.status(400).json({
          success: false,
          message: "Return period (7 days) has expired"
        });
      }
    } else {
      console.log("⚠️ No delivery date found");
    }

    // Generate return ID
    const returnId = `RET${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Update item with return request
    item.returnRequested = true;
    item.returnStatus = "pending";
    item.returnReason = reason;
    item.returnComments = comments;
    item.returnRequestedAt = new Date();
    item.returnId = returnId;
    
    order.hasReturns = true;
    
    await order.save();

    console.log("✅ Return request saved, return ID:", returnId);

    // Create notification for admin
    await createNotification(
      'return_request',
      `Return requested for order #${order._id.toString().slice(-6)} - Item: ${item.name}`,
      {
        orderId: order._id,
        userId: userId,
        itemId: itemId,
        returnId: returnId,
        reason: reason
      }
    );

    res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
      returnId: returnId,
      order: {
        _id: order._id,
        orderStatus: order.orderStatus
      }
    });
  } catch (error) {
    console.error("❌ Return request error:", error);
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    }).populate({
      path: 'orderItems.product',
      select: 'name price images description category brand',
      model: Product
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    next(error);
  }
};