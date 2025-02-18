import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

app.use("/api/auth", authRoutes); // Authentication routes

// ✅ Add Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the CRM CloudSwyft API!");
});

app.listen(4000, () => console.log("✅ Server running on http://localhost:4000"));
