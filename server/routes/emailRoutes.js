import express from "express";
import { sendEmail, handleMicrosoftLogin, handleOAuthRedirect, fetchReceivedEmails } from "../controllers/emailController.js";

const router = express.Router();

//Track Emails Api
router.get("/received", fetchReceivedEmails);

// Send Emails Api
router.post("/send-email", sendEmail);
router.get("/microsoft-login", handleMicrosoftLogin); // Redirects to Microsoft login page
router.get("/auth/callback", handleOAuthRedirect); // Callback route after user logs in with Microsoft

export default router;