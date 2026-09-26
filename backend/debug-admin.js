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

const debugAdmin = async () => {
  try {
    await connectDB();

    // Check all admins in collection
    const allAdmins = await Admin.find({});
    console.log("\n📋 All Admins in Collection:");
    console.log(JSON.stringify(allAdmins, null, 2));

    // Try to find specific admin
    const admin = await Admin.findOne({ email: "tamilnav0905@gmail.com" }).select("+password");
    console.log("\n🔍 Finding admin by email (tamilnav0905@gmail.com):");
    console.log(admin);

    // Try lowercase
    const adminLower = await Admin.findOne({ email: "tamilnav0905@gmail.com".toLowerCase() }).select("+password");
    console.log("\n🔍 Finding admin by lowercase email:");
    console.log(adminLower);

    if (admin) {
      console.log("\n✅ Admin found!");
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Active: ${admin.isActive}`);
      console.log(`Permissions: ${admin.permissions}`);
    } else {
      console.log("\n❌ Admin NOT found!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Debug error:", error.message);
    process.exit(1);
  }
};

debugAdmin();
