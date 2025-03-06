import axios from "axios";
import dotenv from "dotenv";
import { ConfidentialClientApplication } from "@azure/msal-node";  // Use ConfidentialClientApplication for client secret

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
            state: "12345", // Optional for CSRF protection
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
        // Acquire token by the authorization code
        const tokenResponse = await cca.acquireTokenByCode({
            code,
            scopes: ["Mail.Send", "User.Read"],  // Scopes to request access to the user's email
            redirectUri: process.env.REDIRECT_URI,  // Ensure this matches the one in your Azure registration
        });

        // Check if we got the access token
        if (tokenResponse && tokenResponse.accessToken) {
            const accessToken = tokenResponse.accessToken;
            // Log the access token and URL to ensure it's working
            console.log("Redirecting to:", `${process.env.FRONTEND_URL}/callback?accessToken=${accessToken}`);
        
            return res.redirect(`${process.env.FRONTEND_URL}/communications?accessToken=${accessToken}`);
        } else {
            return res.status(400).json({ error: "Token response is invalid or empty" });
        }
        
    } catch (error) {
        console.error("OAuth Error:", error);
        
        if (error.errorCode === 'invalid_grant') {
            return res.status(400).json({ error: "Authorization code has expired. Please try logging in again." });
        }

        if (error.errorCode === 'invalid_client') {
            return res.status(400).json({ error: "Client configuration issue. Ensure correct settings in Azure" });
        }

        return res.status(500).json({ error: "OAuth authentication failed. Please try again." });
    }
}


// Route to send an email using Microsoft Graph API
export async function sendEmail(req, res) {
    try {
        const { to, subject, content, token } = req.body;
        if (!to || !subject || !content || !token) {
            return res.status(400).json({ error: "Missing fields or authentication token" });
        }

        const emailData = {
            message: {
                subject,
                body: { contentType: "Text", content },
                toRecipients: [{ emailAddress: { address: to } }], // Recipient's email
            },
            saveToSentItems: "true", // Save the sent email in Sent Items
        };

        // Send the email via Microsoft Graph API
        await axios.post("https://graph.microsoft.com/v1.0/me/sendMail", emailData, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to send email" });
    }
}
