import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueResult] =
      await Promise.all([
        User.countDocuments({}),
        Product.countDocuments({}),
        Order.countDocuments({}),
        Order.aggregate([
          { $match: { isPaid: true } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
      ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getMonthlyRevenue = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      monthlyData
    });
  } catch (error) {
    next(error);
  }
};