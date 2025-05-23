import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/UserSchema.js";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);

    // Predefined users
    const users = [
      {
        name: "Admin", 
        email: "admin@cloudswyft.com",
        password: adminPassword,
        role: "admin",
      },
    ];
    

    // Insert users
    await User.insertMany(users);
    console.log("✅ Users added successfully!");

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    mongoose.disconnect();
  });
