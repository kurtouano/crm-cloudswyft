import express from "express";

import {sendEmail, replyEmail, handleMicrosoftLogin, 
    handleOAuthRedirect, fetchReceivedEmails, getSentEmail, 
    getEmailAttachments, fetchSentReplyEmails, fetchAttachmentsForReply}
    from "../controllers/emailAfterSalesController.js";
 
const router = express.Router();

router.get("/received", fetchReceivedEmails); // Fetch Recevied Emails
router.get("/sent", getSentEmail);  // Fetch Sent Emails
router.get("/fetch-reply-emails", fetchSentReplyEmails);  // Fetch Reply Emails
router.post("/send-email", sendEmail);  // Send Emails Router
router.post("/reply-email", replyEmail); // Reply Emails Router
router.get("/microsoft-login", handleMicrosoftLogin); // Redirect to Microsoft Login for Microsoft Graph api
router.get("/auth/callback", handleOAuthRedirect); // Callback route after user logs in with Microsoft
router.get("/attachments/:emailId", getEmailAttachments); // Fetch Received Email Attachments
router.get("/attachments/reply/:emailId", fetchAttachmentsForReply); // Fetch Sent Reply Attachments

export default router;
