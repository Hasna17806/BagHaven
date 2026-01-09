import Admin from "../../models/Admin.js";
import { generateAdminToken } from "../../utils/generateToken.js";

// ADMIN REGISTER
export const registerAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ email, password });

    res.status(201).json({
      message: "Admin registered",
      token: generateAdminToken(admin._id),
    });
  } catch (err) {
    next(err);
  }
};

// ADMIN LOGIN
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Admin login success",
      token: generateAdminToken(admin._id),
    });
  } catch (err) {
    next(err);
  }
};
