// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateUserToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error("❌ JWT_SECRET is not defined in environment variables");
    throw new Error("Server configuration error");
  }
  
  return jwt.sign(
    { 
      id: userId, 
      role: "user",
      timestamp: Date.now()
    }, 
    secret,
    { expiresIn: "7d" }
  );
};

export const generateAdminToken = (adminId) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error("❌ JWT_SECRET is not defined in environment variables");
    throw new Error("Server configuration error");
  }
  
  return jwt.sign(
    { 
      id: adminId, 
      role: "admin",
      timestamp: Date.now()
    }, 
    secret,
    { expiresIn: "7d" }
  );
};