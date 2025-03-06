import express from "express";
import { createEmail, getEmails } from "../controllers/emailController.js";
import { sendEmail, handleMicrosoftLogin, handleOAuthRedirect } from "../controllers/sendEmailController.js";

const router = express.Router();

//Track Emails Api
router.post('/', createEmail);
router.get('/sent', getEmails);

// Send Emails Api
router.post("/send-email", sendEmail);
router.get("/microsoft-login", handleMicrosoftLogin); // Redirects to Microsoft login page
router.get("/auth/callback", handleOAuthRedirect); // Callback route after user logs in with Microsoft

export default router;