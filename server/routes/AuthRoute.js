import express from "express";
import { loginUser } from "../controller/AuthController.js"; // Import the controller

const router = express.Router();

// Define the login route
router.post("/login", loginUser);

export default router;
