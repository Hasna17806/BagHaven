import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env")
});


import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import http from "http";
import { Server } from "socket.io"; 
import paypalRoutes from "./routes/paypalRoutes.js";

/*
=====================================
          ROUTE IMPORTS
=====================================
*/
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorHandler.js";


// Database Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/nodeproject")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("⚠️  Starting server without database connection...");
  });

const app = express();
const server = http.createServer(app); // Changed from app to server


/*
=====================================
        CREATE UPLOADS FOLDER
=====================================
*/
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
} else {
  console.log('📁 Uploads directory exists');
  // List files for debugging
  const files = fs.readdirSync(uploadsDir);
  console.log(`📁 Files in uploads: ${files.length}`);
  if (files.length > 0) {
    console.log('📁 Sample files:', files.slice(0, 5));
  }
}

/*
=====================================
              MIDDLEWARE
=====================================
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

/*
=====================================
        STATIC UPLOADS - IMPROVED
=====================================
*/
// Serve static files with better configuration
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  // Add cache control
  maxAge: '1d',
  // Add index file fallback
  index: false,
  // Add redirect
  redirect: false,
  // Set custom headers for CORS
  setHeaders: function (res, path) {
    // Allow images from different origin
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Log static file requests (for debugging)
app.use("/uploads", (req, res, next) => {
  console.log(`📁 Static file request: ${req.originalUrl}`);
  next();
});

/*
=====================================
        SOCKET.IO SETUP
=====================================
*/
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store connected clients
const connectedClients = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // Join admin room
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log(`👑 Admin joined room: ${socket.id}`);
  });
  
  // Join user room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    connectedClients.set(socket.id, userId);
    console.log(`👤 User ${userId} joined room`);
  });
  
  // Listen for admin actions
  socket.on('admin-action', (data) => {
    console.log('⚡ Admin action:', data);
    
    // Broadcast to all admins
    io.to('admin-room').emit('admin-update', data);
    
    // Send to specific user if userId is provided
    if (data.data?.userId) {
      io.to(`user-${data.data.userId}`).emit('user-update', data);
      console.log(`📤 Update sent to user: ${data.data.userId}`);
    }
    
    // Also broadcast general user updates
    if (data.type?.includes('user')) {
      io.emit('user-updated', data);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = connectedClients.get(socket.id);
    if (userId) {
      connectedClients.delete(socket.id);
      console.log(`👤 User ${userId} disconnected`);
    } else {
      console.log('🔌 Client disconnected:', socket.id);
    }
  });
  
  // Error handling
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

export { io };

/*
=====================================
            API ROUTES
=====================================
*/
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/paypal", paypalRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

/*
=====================================
             TEST ROUTES
=====================================
*/
app.get("/", (req, res) => {
  res.json({ 
    message: "API is running with real database connection!",
    status: "OK",
    timestamp: new Date().toISOString(),
    endpoints: {
      test: "/api/test",
      admin: "/api/admin/dashboard",
      products: "/api/products",
      uploads: "/uploads"
    },
    socket: "Socket.io is running on /socket.io/"
  });
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "API is working!",
    data: { test: "success", time: new Date().toISOString() }
  });
});

// Socket test endpoint
app.get("/api/socket-test", (req, res) => {
  res.json({
    success: true,
    message: "Socket.io is running",
    connectedClients: connectedClients.size,
    socketStatus: "active"
  });
});

// Test endpoint to check uploads folder
app.get("/api/debug/uploads", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime,
        path: `/uploads/${file}`
      };
    });
    
    res.json({
      success: true,
      uploadsPath: uploadsDir,
      exists: fs.existsSync(uploadsDir),
      fileCount: files.length,
      files: fileDetails.slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      uploadsPath: uploadsDir,
      exists: fs.existsSync(uploadsDir)
    });
  }
});

app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  console.log(`📤 Attempting to serve: ${filename}`);
  console.log(`📁 Full path: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`❌ Error sending file:`, err);
        res.status(500).json({ 
          success: false, 
          message: 'Error serving file' 
        });
      } else {
        console.log(`✅ Successfully served: ${filename}`);
      }
    });
  } else {
    console.log(`❌ File not found: ${filename}`);
    res.status(404).json({ 
      success: false, 
      message: `File ${filename} not found in uploads directory` 
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "UP",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    uploadsDir: uploadsDir,
    uploadsExists: fs.existsSync(uploadsDir),
    socket: {
      connected: connectedClients.size,
      status: "active"
    }
  });
});

// Socket.io health endpoint
app.get("/socket.io/health", (req, res) => {
  res.json({
    success: true,
    connectedClients: connectedClients.size,
    status: "running"
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => { // Changed from app.listen to server.listen
  console.log(`=========================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io running on ws://localhost:${PORT}`);
  console.log(`=========================================`);
  console.log(`📊 Available endpoints:`);
  console.log(`   → http://localhost:${PORT}/`);
  console.log(`   → http://localhost:${PORT}/api/test`);
  console.log(`   → http://localhost:${PORT}/api/health`);
  console.log(`   → http://localhost:${PORT}/api/debug/uploads`);
  console.log(`   → http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`   → http://localhost:${PORT}/api/admin/products`);
  console.log(`   → http://localhost:${PORT}/uploads/ (static files)`);
  console.log(`   → http://localhost:${PORT}/socket.io/health`);
  console.log(`=========================================`);
  console.log(`🌐 CORS enabled for:`);
  console.log(`   → http://localhost:5173`);
  console.log(`   → http://127.0.0.1:5173`);
  console.log(`=========================================`);
  console.log(`🔗 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`=========================================`);
});