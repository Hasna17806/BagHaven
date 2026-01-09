import Order from '../../models/Order.js';
import User from '../../models/User.js';
import Notification from '../../models/Notification.js';

/**
 * Get admin notifications
 */
export const getAdminNotifications = async (req, res) => {
  try {
    // First, check if we have any stored notifications
    const storedNotifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Generate real-time activities
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    
    // Get recent orders 
    const recentOrders = await Order.find({
      createdAt: { $gte: oneDayAgo },
      status: 'pending'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber totalAmount status paymentStatus createdAt user shippingAddress')
      .populate('user', 'name email')
      .lean();

    // Get recent users
    const recentUsers = await User.find({
      createdAt: { $gte: oneDayAgo },
      role: 'user'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email createdAt')
      .lean();

    // Transform recent orders into notifications
    const orderNotifications = recentOrders.map(order => ({
      _id: `order-${order._id}-${order.createdAt.getTime()}`,
      type: 'order',
      message: order.status === 'pending' 
        ? `New Order #${order.orderNumber} - ₹${order.totalAmount.toFixed(2)}`
        : `Order #${order.orderNumber} ${order.status}`,
      read: false,
      createdAt: order.createdAt,
      data: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        status: order.status,
        customerName: order.user?.name || 'Customer',
        isActivity: true
      }
    }));

    // Transform recent users into notifications
    const userNotifications = recentUsers.map(user => ({
      _id: `user-${user._id}-${user.createdAt.getTime()}`,
      type: 'user',
      message: `New user registered: ${user.name}`,
      read: false,
      createdAt: user.createdAt,
      data: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        isActivity: true
      }
    }));

    // Combine all notifications
    const allNotifications = [
      ...storedNotifications.map(notif => ({
        ...notif,
        data: notif.data || {},
        isStored: true
      })),
      ...orderNotifications,
      ...userNotifications
    ];

    // Sort by date 
    const sortedNotifications = allNotifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 25);

    // Calculate unread count 
    const unreadStoredCount = await Notification.countDocuments({ read: false });

    res.json({
      success: true,
      notifications: sortedNotifications,
      unreadCount: unreadStoredCount,
      totalCount: sortedNotifications.length,
      hasActivities: orderNotifications.length > 0 || userNotifications.length > 0
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's a stored notification
    if (!id.startsWith('order-') && !id.startsWith('user-')) {
      const notification = await Notification.findById(id);
      
      if (notification) {
        // Update stored notification
        notification.read = true;
        await notification.save();
        
        return res.json({
          success: true,
          message: 'Notification marked as read',
          notificationId: id
        });
      }
    }
    
    // For activity notifications
    res.json({
      success: true,
      message: 'Notification marked as read',
      notificationId: id
    });
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification'
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    // Mark all stored notifications as read
    await Notification.updateMany({ read: false }, { read: true });
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
    
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notifications'
    });
  }
};

/**
 * Create a new notification 
 */
export const createNotification = async (type, message, data = {}) => {
  try {
    const notification = new Notification({
      type,
      message,
      data,
      read: false
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id.startsWith('order-') || id.startsWith('user-')) {
      return res.json({
        success: true,
        message: 'Activity notification cannot be deleted'
      });
    }
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notification.deleteOne();
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

/**
 * Clear all stored notifications
 */
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    
    res.json({
      success: true,
      message: 'All notifications cleared successfully'
    });
    
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications'
    });
  }
};

/**
 * Get unread notifications count only
 */
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ read: false });
    
    res.json({
      success: true,
      unreadCount
    });
    
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

/**
 * Get notifications by type
 */
export const getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const validTypes = ['order', 'user', 'system', 'product'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }
    
    const notifications = await Notification.find({ type })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    res.json({
      success: true,
      notifications,
      count: notifications.length
    });
    
  } catch (error) {
    console.error('Error getting notifications by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
};