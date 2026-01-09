import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    street: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    },
    state: {
      type: String,
      default: ""
    },
    pincode: {
      type: String,
      default: ""
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }
);

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"],
      trim: true
    },
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    address: {
      type: String,
      default: "",
      trim: true
    },
    city: {
      type: String,
      default: "",
      trim: true
    },
    state: {
      type: String,
      default: "",
      trim: true
    },
    pincode: {
      type: String,
      default: "",
      trim: true
    },
    profilePicture: {
      type: String,
      default: ""
    },
    addresses: {
      type: [addressSchema],
      default: []
    },
    isBlocked: { 
      type: Boolean, 
      default: false 
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    blockedAt: {
      type: Date,
      default: null
    },
    blockedReason: {
      type: String,
      default: ""
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Hash password before saving 
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
 
    if (typeof next === 'function') {
      return next();
    }
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Check if next is a function before calling it
    if (typeof next === 'function') {
      return next();
    }
  } catch (error) {
    if (typeof next === 'function') {
      return next(error);
    }
    throw error;
  }
});

// Update blockedAt when isBlocked changes
userSchema.pre("save", function(next) {
  if (this.isModified('isBlocked')) {
    if (this.isBlocked && !this.blockedAt) {
      this.blockedAt = new Date();
    } else if (!this.isBlocked) {
      this.blockedAt = null;
      this.blockedReason = "";
    }
  }
  
  // Check if next is a function before calling it
  if (typeof next === 'function') {
    return next();
  }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full address
userSchema.virtual("fullAddress").get(function() {
  const parts = [this.address, this.city, this.state, this.pincode]
    .filter(part => part && part.trim() !== "");
  return parts.join(", ").trim();
});

// Method to check if user is active
userSchema.methods.isActive = function() {
  return !this.isBlocked;
};

// Method to block user
userSchema.methods.block = function(reason = "") {
  this.isBlocked = true;
  this.blockedAt = new Date();
  this.blockedReason = reason;
  return this.save();
};

// Method to unblock user
userSchema.methods.unblock = function() {
  this.isBlocked = false;
  this.blockedAt = null;
  this.blockedReason = "";
  return this.save();
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isBlocked: false });
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;