import User from '../../models/User.js';
import Order from '../../models/Order.js';
import bcrypt from 'bcryptjs';

import { io } from '../../server.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('-password');
    
    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Update user with socket.io real-time updates
export const updateUser = async (req, res) => {
  try {
    const { isBlocked, ...otherUpdates } = req.body;
    const admin = req.admin; 
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow blocking admins
    if (isBlocked && user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block admin users'
      });
    }
    
    // Store previous status for comparison
    const previousStatus = user.isBlocked;
    
    // Update user
    if (isBlocked !== undefined) {
      user.isBlocked = isBlocked;
    }
    
    // Update other fields
    Object.keys(otherUpdates).forEach(key => {
      if (key !== 'password' && key !== '_id') {
        user[key] = otherUpdates[key];
      }
    });
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    if (io && previousStatus !== user.isBlocked) {
      io.emit('user-updated', {
        type: 'user-status-changed',
        data: {
          userId: user._id,
          email: user.email,
          name: user.name,
          status: user.isBlocked ? 'blocked' : 'active',
          timestamp: new Date(),
          admin: admin?.email || 'System',
          action: user.isBlocked ? 'blocked' : 'unblocked'
        }
      });
      
      // Send specific update to user's room
      io.to(`user-${user._id}`).emit('user-update', {
        type: 'account-status-changed',
        data: {
          status: user.isBlocked ? 'blocked' : 'active',
          timestamp: new Date(),
          message: user.isBlocked 
            ? 'Your account has been blocked by an administrator' 
            : 'Your account has been activated',
          admin: admin?.email || 'System'
        }
      });
      
      console.log(`📢 Real-time update sent for user ${user.email}: ${user.isBlocked ? 'BLOCKED' : 'UNBLOCKED'}`);
    }
    
    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'updated'} successfully`,
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Toggle block user with socket.io
export const toggleBlockUser = async (req, res) => {
  try {
    const admin = req.admin;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow blocking admins
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block admin users'
      });
    }
    
    // Store previous status
    const wasBlocked = user.isBlocked;
    
    // Toggle block status
    user.isBlocked = !user.isBlocked;
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    // Emit real-time update
    if (io) {
      io.emit('user-updated', {
        type: 'user-status-changed',
        data: {
          userId: user._id,
          email: user.email,
          name: user.name,
          status: user.isBlocked ? 'blocked' : 'active',
          timestamp: new Date(),
          admin: admin?.email || 'System',
          action: user.isBlocked ? 'blocked' : 'unblocked'
        }
      });
      
      // Send specific update to user's room
      io.to(`user-${user._id}`).emit('user-update', {
        type: 'account-status-changed',
        data: {
          status: user.isBlocked ? 'blocked' : 'active',
          timestamp: new Date(),
          message: user.isBlocked 
            ? 'Your account has been blocked by an administrator' 
            : 'Your account has been activated',
          admin: admin?.email || 'System'
        }
      });
      
      console.log(`📢 Real-time toggle sent for user ${user.email}: ${wasBlocked ? 'UNBLOCKED' : 'BLOCKED'}`);
    }
    
    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: userResponse
    });
  } catch (error) {
    console.error('Error toggling user block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Delete user with socket.io
export const deleteUser = async (req, res) => {
  try {
    const admin = req.admin;
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user's orders
    await Order.deleteMany({ user: req.params.id });
    
    // Emit real-time deletion notification
    if (io) {
      io.emit('user-updated', {
        type: 'user-deleted',
        data: {
          userId: user._id,
          email: user.email,
          name: user.name,
          timestamp: new Date(),
          admin: admin?.email || 'System',
          action: 'deleted'
        }
      });
      
      console.log(`🗑️ Real-time delete notification sent for user: ${user.email}`);
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Reset user password (admin)
export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const admin = req.admin;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    // Emit real-time update
    if (io) {
      io.to(`user-${user._id}`).emit('user-update', {
        type: 'password-reset',
        data: {
          userId: user._id,
          email: user.email,
          timestamp: new Date(),
          admin: admin?.email || 'System',
          message: 'Your password has been reset by an administrator'
        }
      });
      
      console.log(`🔑 Password reset notification sent for user: ${user.email}`);
    }
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};