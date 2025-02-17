import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    if (user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Unauthorized Access" });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in admin middleware", error: error.message });
  }
};
