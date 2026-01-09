import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// ====================================
// DEBUG SETTING - Set to false to disable logs
// ====================================
const DEBUG_AUTH = false;

const adminAuth = async (req, res, next) => {
  if (DEBUG_AUTH) {
    console.log("🔐 [ADMIN AUTH] Checking:", req.originalUrl);
  }
  
  try {
    // 1️⃣ Get token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (DEBUG_AUTH) console.log("❌ No Bearer token");
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (DEBUG_AUTH) {
      console.log("🔍 Token length:", token.length);
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (DEBUG_AUTH) {
      console.log("🔍 Decoded:", { id: decoded.id, role: decoded.role });
    }

    // 3️⃣ Check if token has admin role
    if (decoded.role !== "admin") {
      if (DEBUG_AUTH) console.log("❌ Token role is not admin:", decoded.role);
      return res.status(403).json({
        success: false,
        message: "Admin access only. Token role: " + decoded.role,
      });
    }

    // 4️⃣ Find admin in database (optional)
    const admin = await Admin.findById(decoded.id || decoded._id);
    
    if (!admin && DEBUG_AUTH) {
      console.log("⚠️ Admin not found in DB, but token is valid");
    }

    // 5️⃣ Attach admin info
    req.admin = admin || { id: decoded.id, role: "admin" };
    req.user = req.admin;

    if (DEBUG_AUTH) {
      console.log("✅ Admin access granted for:", decoded.id);
    }
    
    next();
  } catch (error) {
    // 🔴 ALWAYS log errors (even when DEBUG_AUTH is false)
    console.error("❌ Admin auth error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token: " + error.message,
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed: " + error.message,
    });
  }
};

export default adminAuth;