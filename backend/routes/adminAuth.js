import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "savor_co_jwt_secret_key";

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Admin login request received");
    console.log("   Email:", email);
    console.log("   Password provided:", password ? "✓ Yes" : "✗ No");

    // Validation
    if (!email || !password) {
      console.log("   ❌ Missing email or password");
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find admin and include password field
    const admin = await Admin.findOne({ email }).select("+password");
    console.log("   Admin found:", admin ? "✓ Yes" : "✗ No");

    if (!admin) {
      console.log("   ❌ Admin not found in database");
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    console.log("   Admin name:", admin.name);
    console.log("   Admin active:", admin.isActive);

    if (!admin.isActive) {
      console.log("   ❌ Admin account is inactive");
      return res.status(403).json({ message: "Admin account is inactive" });
    }

    // Compare passwords
    const passwordMatch = await admin.comparePassword(password);
    console.log("   Password match:", passwordMatch ? "✓ Yes" : "✗ No");

    if (!passwordMatch) {
      console.log("   ❌ Password does not match");
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
    
    console.log("   ✅ Authentication successful");

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin", permissions: admin.permissions },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: "admin", permissions: admin.permissions },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "An error occurred during admin login" });
  }
});

export default router;
