import Notification from '../models/Notification.js';

export const createNotification = async (type, message, data = {}) => {
  try {
    const notification = await Notification.create({
      type,
      message,
      data,
      read: false
    });
    
    console.log(`📢 Notification: ${message}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};