import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "savor_co_jwt_secret_key";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided. Please login first." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token. Please login again." });
  }
};

// Middleware to check if user is admin
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  next();
};

// Combined middleware for admin routes
export const adminOnly = [verifyToken, verifyAdmin];
