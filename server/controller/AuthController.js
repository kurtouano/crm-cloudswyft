import User from "../models/UserSchema.js"; // Import the User model
import bcrypt from "bcryptjs"; // For comparing hashed passwords
import jwt from "jsonwebtoken"; // For generating JWT tokens
import dotenv from "dotenv"; // Load environment variables

dotenv.config();

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in .env file.");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Use a secret key from .env
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name, // Include only necessary details
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
