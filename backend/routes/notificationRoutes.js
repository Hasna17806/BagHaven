import express from 'express';
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  getNotificationsByType
} from '../../controllers/admin/notificationController.js';
import { authenticateAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateAdmin, getAdminNotifications);
router.get('/unread-count', authenticateAdmin, getUnreadCount);
router.get('/type/:type', authenticateAdmin, getNotificationsByType);
router.put('/:id/read', authenticateAdmin, markNotificationAsRead); // Changed to match frontend
router.put('/read-all', authenticateAdmin, markAllNotificationsAsRead);
router.delete('/:id', authenticateAdmin, deleteNotification);
router.delete('/', authenticateAdmin, clearAllNotifications);

export default router;