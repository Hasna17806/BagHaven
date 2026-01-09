import Order from "../../models/Order.js";

/*
=====================================
GET ALL ORDERS (ADMIN)
=====================================
*/
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/*
=====================================
   GET SINGLE ORDER BY ID (ADMIN)
=====================================
*/
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("orderItems.product", "name price images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/*
=====================================
      GET REVENUE DATA (ADMIN)
=====================================
*/
export const getRevenue = async (req, res, next) => {
  try {
    const orders = await Order.find({ isPaid: true });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalRevenue,
    });
  } catch (error) {
    next(error);
  }
};

/*
=====================================
    UPDATE ORDER STATUS (ADMIN)
=====================================
*/
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    // If delivered, set delivered date
    if (status === "delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};