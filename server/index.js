import express from "express";
import http from "http"; // Required for WebSockets
import { Server } from "socket.io"; // Import Socket.IO
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

dotenv.config();
const app = express();
const server = http.createServer(app); // ✅ Create an HTTP server

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true }, // Allow frontend
});

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ limit: "3mb", extended: true }));

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/emails", emailRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the CRM CloudSwyft API!");
});

// ✅ Handle WebSocket Connections
io.on("connection", (socket) => {
  console.log("🔗 New WebSocket Connection:", socket.id);

  // Listen for custom events (if needed)
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Export io so other files can emit events
export { io };

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
