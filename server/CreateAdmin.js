import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/UserSchema.js"; // Import the User model

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO); // Connect to MongoDB

    const email = "admin@example.com"; // Change to your desired admin email
    const password = "admin123"; // Change to your desired password

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists.");
      mongoose.connection.close();
      return;
    }

    // Create the admin user
    const newAdmin = new User({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    console.log("Admin user created successfully!");

    mongoose.connection.close(); // Close connection
  } catch (error) {
    console.error("Error creating admin user:", error);
    mongoose.connection.close();
  }
};

createAdminUser();
