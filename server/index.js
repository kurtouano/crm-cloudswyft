import express from "express";
import http from "http"; // Required for WebSockets
import { Server } from "socket.io"; // Import Socket.IO
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import customerSupportRoutes from "./routes/emailAfterSalesRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import onboardedRoutes from "./routes/onboardedRoutes.js";

dotenv.config();

const FRONTEND_URL = process.env.DEPLOYMENT_FRONTEND_URL || "http://localhost:3000";
const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app); // ✅ Create an HTTP server

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: FRONTEND_URL, credentials: true }, // Allow frontend
});

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ limit: "3mb", extended: true }));

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/emails/support", customerSupportRoutes);
app.use("/api/newsletters", newsletterRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/onboarded", onboardedRoutes);

app.set('io', io);

app.get("/", (req, res) => {
  res.send("Welcome to the CRM CloudSwyft API!");
});

// ✅ Handle WebSocket Connections
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Handle joining lead-specific rooms
    socket.on('joinLeadRoom', (leadId) => {
        socket.join(leadId);
        console.log(`Client joined lead room ${leadId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// ✅ Export io so other files can emit events
export { io };

//server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
server.listen(PORT, () => console.log(`Server running on ${process.env.DEPLOYMENT_BACKEND_URL}`));
