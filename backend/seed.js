import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/savor-co";

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists! Deleting and recreating...");
      await Admin.deleteOne({ email: adminEmail });
    }

    // Create admin user (password will be auto-hashed by pre-save middleware)
    const admin = new Admin({
      name: "Admin",
      email: adminEmail,
      password: adminPassword,
      permissions: ["create_items", "edit_items", "delete_items", "manage_users"],
      isActive: true,
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log("👤 Role: admin");
    console.log("📋 Permissions: create_items, edit_items, delete_items, manage_users");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
