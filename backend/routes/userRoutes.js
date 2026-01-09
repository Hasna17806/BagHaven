import express from "express";
import multer from "multer";
import User from "../models/User.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only 1 file at a time
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
    }
    cb(null, true);
  }
});

/*
=====================================
USER PROFILE ROUTES
=====================================
*/

// Get current user profile
router.get("/me", userAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ 
      _id: req.user._id,
      isDeleted: false // Exclude soft-deleted users
    }).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is blocked (additional safety check)
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support."
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put("/profile", userAuth, async (req, res, next) => {
  try {
    const { name, email, phone, address, city, state, pincode, profilePicture } = req.body;
    const userId = req.user._id;

    // First, get the current user to check if they're blocked or soft-deleted
    const currentUser = await User.findOne({ 
      _id: userId,
      isDeleted: false // Exclude soft-deleted users
    });
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is blocked
    if (currentUser.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. You cannot update your profile."
      });
    }

    // Check if email already exists (if changing email)
    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({ 
        email,
        isDeleted: false // Only check non-deleted users
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: userId,
        isDeleted: false // Only update non-deleted users
      },
      {
        name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        profilePicture
      },
      { 
        new: true,  
        runValidators: true  
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    next(error);
  }
});

// Change password
router.put("/change-password", userAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findOne({ 
      _id: req.user._id,
      isDeleted: false // Exclude soft-deleted users
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. You cannot change your password."
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    next(error);
  }
});

/*
=====================================
USER PROFILE PICTURE ROUTES
=====================================
*/

// Upload/Update profile picture with file upload
router.put("/profile/upload-picture", userAuth, upload.single('profilePicture'), async (req, res, next) => {
  try {
    console.log("📸 Uploading profile picture file for user:", req.user._id);
    console.log("📁 File received:", req.file);
    
    // Check if user exists and is not soft-deleted
    const userExists = await User.findOne({ 
      _id: req.user._id,
      isDeleted: false 
    });
    
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is blocked
    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. You cannot update profile picture."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please select an image file."
      });
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed."
      });
    }

    // Check file size (multer already checks, but double-check)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File size must be less than 5MB"
      });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `profile_${req.user._id}_${timestamp}.${fileExtension}`;
    
    // In a real application, you would:
    // 1. Upload to cloud storage (AWS S3, Cloudinary, Firebase Storage, etc.)
    // 2. Or save to server uploads directory
    
    // For now, we'll simulate by creating a data URL (base64)
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    // For demo purposes, let's use a simulated URL
    const profilePicture = `uploads/profiles/${fileName}`;

    console.log("🖼️ Updating profile picture to:", profilePicture);

    // Update user with the profile picture path
    const user = await User.findOneAndUpdate(
      { 
        _id: req.user._id,
        isDeleted: false // Only update non-deleted users
      },
      { profilePicture },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ Profile picture updated for user:", user.email);
    
    // Return success response with the data URL for immediate display
    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      user: {
        ...user.toObject(),
        // Include the data URL for immediate frontend display
        profilePicturePreview: dataUrl
      }
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: "File size must be less than 5MB"
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
});

// Update profile picture with URL (alternative method)
router.put("/profile/picture", userAuth, async (req, res, next) => {
  try {
    console.log("🌐 Updating profile picture with URL for user:", req.user._id);
    
    const { profilePicture } = req.body;
    
    // Check if user is blocked
    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. You cannot update profile picture."
      });
    }

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: "Profile picture URL is required"
      });
    }

    // Validate URL format (basic check)
    try {
      new URL(profilePicture);
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format"
      });
    }

    // Update user with the profile picture URL
    const user = await User.findOneAndUpdate(
      { 
        _id: req.user._id,
        isDeleted: false // Only update non-deleted users
      },
      { profilePicture },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ Profile picture updated with URL for user:", user.email);
    
    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user
    });
  } catch (error) {
    console.error("Profile picture URL update error:", error);
    next(error);
  }
});

// Remove profile picture
router.delete("/profile/picture", userAuth, async (req, res, next) => {
  try {
    console.log("🗑️ Removing profile picture for user:", req.user._id);
    
    // Check if user is blocked
    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. You cannot remove profile picture."
      });
    }

    // Update user to remove profile picture
    const user = await User.findOneAndUpdate(
      { 
        _id: req.user._id,
        isDeleted: false // Only update non-deleted users
      },
      { profilePicture: "" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ Profile picture removed for user:", user.email);
    
    res.status(200).json({
      success: true,
      message: "Profile picture removed successfully",
      user
    });
  } catch (error) {
    console.error("Profile picture removal error:", error);
    next(error);
  }
});

// Get profile picture
router.get("/profile/picture", userAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ 
      _id: req.user._id,
      isDeleted: false // Only get non-deleted users
    }).select("profilePicture");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      profilePicture: user.profilePicture || ""
    });
  } catch (error) {
    console.error("Get profile picture error:", error);
    next(error);
  }
});

/*
=====================================
ADMIN USER MANAGEMENT ROUTES
=====================================
*/

// Get all users (Admin only) - Excludes soft-deleted users by default
router.get("/", adminAuth, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = "createdAt", 
      sortOrder = "desc",
      search = "",
      status = "all",
      showDeleted = false // New parameter to show soft-deleted users
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    // Status filter
    if (status === "active") {
      query.isBlocked = false;
    } else if (status === "blocked") {
      query.isBlocked = true;
    }

    // Soft delete filter - exclude soft-deleted by default
    if (showDeleted === "true" || showDeleted === true) {
      // Show all users including soft-deleted
    } else {
      query.isDeleted = false; // Exclude soft-deleted users
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get total count
    const totalUsers = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
});

// Get single user by ID (Admin only) - Can get soft-deleted users
router.get("/:id", adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// Update user (Admin only)
router.put("/:id", adminAuth, async (req, res, next) => {
  try {
    const { isBlocked, blockedReason, ...otherUpdates } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Don't allow updating soft-deleted users
    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot update a deleted user. Restore the user first."
      });
    }
    
    // Don't allow blocking admins
    if (isBlocked && user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot block admin users"
      });
    }
    
    // Update block status if provided
    if (isBlocked !== undefined) {
      if (isBlocked) {
        user.isBlocked = true;
        user.blockedAt = new Date();
        user.blockedReason = blockedReason || "";
      } else {
        user.isBlocked = false;
        user.blockedAt = null;
        user.blockedReason = "";
      }
    }
    
    // Update other fields
    Object.keys(otherUpdates).forEach(key => {
      if (otherUpdates[key] !== undefined) {
        user[key] = otherUpdates[key];
      }
    });
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: "User updated successfully",
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Block/Unblock user (Admin only)
router.put("/:id/toggle-block", adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Don't allow blocking soft-deleted users
    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot block/unblock a deleted user"
      });
    }
    
    // Don't allow blocking admins
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot block admin users"
      });
    }
    
    // Toggle block status
    user.isBlocked = !user.isBlocked;
    
    if (user.isBlocked) {
      user.blockedAt = new Date();
      user.blockedReason = req.body.reason || "";
    } else {
      user.blockedAt = null;
      user.blockedReason = "";
    }
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
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
});

// Block user with reason (Admin only)
router.put("/:id/block", adminAuth, async (req, res, next) => {
  try {
    const { reason = "" } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Don't allow blocking soft-deleted users
    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot block a deleted user"
      });
    }
    
    // Don't allow blocking admins
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot block admin users"
      });
    }
    
    // Block the user
    user.isBlocked = true;
    user.blockedAt = new Date();
    user.blockedReason = reason;
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: "User blocked successfully",
      user: userResponse
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user'
    });
  }
});

// Unblock user (Admin only)
router.put("/:id/unblock", adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Don't allow unblocking soft-deleted users
    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot unblock a deleted user"
      });
    }
    
    // Unblock the user
    user.isBlocked = false;
    user.blockedAt = null;
    user.blockedReason = "";
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: "User unblocked successfully",
      user: userResponse
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user'
    });
  }
});

// Delete user (Admin only) - SOFT DELETE
router.delete("/:id", adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if already soft-deleted
    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "User is already deleted"
      });
    }
    
    // Don't allow deleting admins
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin users"
      });
    }
    
    // SOFT DELETE: Mark as deleted instead of removing
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = req.admin?._id; // Track which admin deleted it
    
    await user.save();
    
    res.json({
      success: true,
      message: "User marked as deleted successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isDeleted: user.isDeleted,
        deletedAt: user.deletedAt
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Restore soft-deleted user (Admin only)
router.put("/:id/restore", adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Only restore if already soft-deleted
    if (!user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "User is not deleted"
      });
    }
    
    // Restore the user
    user.isDeleted = false;
    user.deletedAt = null;
    user.deletedBy = null;
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: "User restored successfully",
      user: userResponse
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore user'
    });
  }
});

// Permanently delete user (Admin only) - HARD DELETE
router.delete("/:id/permanent", adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Don't allow deleting admins
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin users"
      });
    }
    
    // Verify it's a soft-deleted user before permanent deletion
    if (!user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "User must be soft-deleted first before permanent deletion"
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "User permanently deleted from database"
    });
  } catch (error) {
    console.error('Error permanently deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete user'
    });
  }
});

// Get user statistics (Admin only)
router.get("/stats/overview", adminAuth, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeUsers = await User.countDocuments({ 
      isBlocked: false,
      isDeleted: false 
    });
    const blockedUsers = await User.countDocuments({ 
      isBlocked: true,
      isDeleted: false 
    });
    const adminUsers = await User.countDocuments({ 
      isAdmin: true,
      isDeleted: false 
    });
    const deletedUsers = await User.countDocuments({ isDeleted: true });
    
    // New users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        adminUsers,
        deletedUsers,
        newUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;