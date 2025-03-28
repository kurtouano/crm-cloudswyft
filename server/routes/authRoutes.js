import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Incoming login:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login success for:", email);
    res.json({ token, role: user.role });
  } catch (error) {
    console.error("💥 Server crash in login:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/employees", async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("name email employeeId lastLogin");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});


// Register Employee Route
router.post("/register-employee", async (req, res) => {
  const { name, email, employeeId } = req.body;

  if (!/^CS\d{4}$/.test(employeeId)) {
    return res.status(400).json({ message: "Invalid employee ID format. Must be CS followed by 4 digits." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash("cssales2025!", 10);

    const newEmployee = new User({
      name,
      email,
      employeeId,
      password: hashedPassword,
      role: "employee", // auto-assign role
    });

    await newEmployee.save();

    res.status(201).json({ message: "Employee registered successfully" });
  } catch (error) {
    console.error("Error registering employee:", error);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
