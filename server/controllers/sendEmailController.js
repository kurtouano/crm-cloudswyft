import axios from "axios";
import dotenv from "dotenv";
import { ConfidentialClientApplication } from "@azure/msal-node";  // Use ConfidentialClientApplication for client secret
import { SentEmail } from "../models/EmailSchema.js";  

dotenv.config();

const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,               // Your client ID
        clientSecret: process.env.CLIENT_SECRET,       // Your client secret
        authority: "https://login.microsoftonline.com/common",  // Use common for personal accounts
        redirectUri: process.env.REDIRECT_URI,         // Your redirect URI
    },
};

const cca = new ConfidentialClientApplication(msalConfig);  // Using ConfidentialClientApplication

// Route for triggering Microsoft OAuth flow
export async function handleMicrosoftLogin(req, res) {
    try {
        const authUrl = await cca.getAuthCodeUrl({
            scopes: ["openid", "email", "profile", "Mail.Send"], // Scopes for personal account login
            redirectUri: process.env.REDIRECT_URI,
        });

        // Redirect the user to the Microsoft login page
        res.redirect(authUrl);
    } catch (error) {
        console.error("Error generating auth URL:", error);
        res.status(500).json({ error: "Failed to initiate Microsoft login." });
    }
}

export async function handleOAuthRedirect(req, res) {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: "Authorization code missing" });

    try {
        const tokenResponse = await cca.acquireTokenByCode({
            code,
            scopes: ["Mail.Send", "User.Read"],
            redirectUri: process.env.REDIRECT_URI,
        });

         if (tokenResponse?.accessToken) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/communications?accessToken=${tokenResponse.accessToken}&expiry=${tokenResponse.expiresOnTimestamp}`
            );

        } else {
            return res.status(400).json({ error: "Token response is invalid or empty" });
        }
    } catch (error) {
        console.error("OAuth Error:", error);
        return res.status(500).json({ error: "OAuth authentication failed. Please try again." });
    }
}

// Route to send an email using Microsoft Graph API
export async function sendEmail(req, res) {
    try {
        const { to, subject, content, token, attachments } = req.body;
        if (!to || !subject || !content || !token) {
            return res.status(400).json({ error: "Missing fields or authentication token" });
        }

        // Format attachments for Microsoft Graph API
        const formattedAttachments = attachments?.map((file) => ({
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: file.fileName,
            contentType: file.mimeType,
            contentBytes: file.contentBytes, // Base64 encoded content
        })) || [];

        const emailData = {
            message: {
                subject,
                body: { contentType: "Text", content },
                toRecipients: [{ emailAddress: { address: to } }],
                attachments: formattedAttachments // Attachments included here
            },
        };

        // Send email via Microsoft Graph API
        await axios.post("https://graph.microsoft.com/v1.0/me/sendMail", emailData, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        // Save email to database
        const sentEmail = new SentEmail({
            to,
            subject,
            content,
            sentAt: new Date(),
            attachments
        });

        await sentEmail.save();

        res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to send email" });
    }
}

