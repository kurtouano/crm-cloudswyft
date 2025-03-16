import express from "express";
import { sendEmail, replyEmail, handleMicrosoftLogin, handleOAuthRedirect, fetchReceivedEmails, getSentEmail, fetchNotifications, getEmailAttachments } from "../controllers/emailController.js";

const router = express.Router();

router.get("/received", fetchReceivedEmails);
router.post("/send-email", sendEmail);
router.post("/reply-email", replyEmail);
router.get("/microsoft-login", handleMicrosoftLogin); // Redirects to Microsoft login page
router.get("/auth/callback", handleOAuthRedirect); // Callback route after user logs in with Microsoft
router.get("/attachments/:emailId", getEmailAttachments);
router.get("/sent", getSentEmail); // ✅ Add this line
router.get("/notifications", fetchNotifications);

export default router;
