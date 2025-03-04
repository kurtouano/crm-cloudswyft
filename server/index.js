import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js"; 
import emailRoutes from "./routes/emailRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// ✅ Remove deprecated options
mongoose
  .connect(process.env.MONGO) // Simply pass the connection string
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/emails", emailRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the CRM CloudSwyft API!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
