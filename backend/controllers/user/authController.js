import User from "../../models/User.js";
import { generateUserToken } from "../../utils/generateToken.js";
import { createNotification } from "../../utils/createNotifications.js";

/*
=====================================
REGISTER USER
=====================================
*/
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = new User({
      name,
      email,
      password, 
    });

    // Save the user
    await user.save();

    // Generate token
    const token = generateUserToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
/*
=====================================
LOGIN USER
=====================================
*/
export const loginUser = async (req, res) => {
  try {
    console.log("🔑 Login attempt:", req.body.email);
    
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.log("❌ Blocked user attempt:", email);
      
      if (global.io) {
        global.io.emit('blocked-user-attempt', {
          type: 'blocked-login-attempt',
          data: {
            userId: user._id,
            email: user.email,
            name: user.name,
            timestamp: new Date(),
            ip: req.ip
          }
        });
      }
      
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    // Compare password 
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    let token;
    try {
      token = generateUserToken(user._id);
      console.log("✅ Login token generated for:", email);
    } catch (tokenError) {
      console.error("❌ Token generation error:", tokenError.message);
      return res.status(500).json({
        success: false,
        message: "Authentication failed"
      });
    }

    // Create notification
    try {
      await createNotification(
        'user_login',
        `User logged in: ${user.name} (${user.email})`,
        { userId: user._id, name: user.name, email: user.email }
      );
    } catch (notifError) {
      console.warn("⚠️ Login notification error:", notifError.message);
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    console.log("✅ Login successful for:", email);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        profilePicture: user.profilePicture || "",
        createdAt: user.createdAt
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};