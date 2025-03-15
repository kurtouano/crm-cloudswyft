import axios from "axios";
import dotenv from "dotenv";
import { ConfidentialClientApplication } from "@azure/msal-node";  // Use ConfidentialClientApplication for client secret
import { SentEmail, ReceivedEmail, ReplyEmail } from "../models/EmailSchema.js";  
import Lead from "../models/LeadSchema.js";
import * as cheerio from 'cheerio';

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
            scopes: ["Mail.ReadWrite", "Mail.Send", "Mail.Read", "openid", "email", "profile"], // Scopes for personal account login
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
            scopes: ["Mail.ReadWrite", "Mail.Send", "Mail.Read", "openid", "email", "profile"],
            redirectUri: process.env.REDIRECT_URI,
        });

        if (tokenResponse?.accessToken) {
            const expiryTimestamp = new Date(tokenResponse.expiresOn).getTime(); // Convert ISO to ms
            
            return res.redirect(
                `${process.env.FRONTEND_URL}/communications?accessToken=${tokenResponse.accessToken}&expiry=${expiryTimestamp}`
            );
        }        

        else {
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
        res.status(500).json({ 
            error: "Failed to send email",
            details: error.response?.data || error.message 
        });
    }
    
}

export async function replyEmail(req, res) {
    try {
        const { messageId, threadId, content, token, attachments } = req.body;

        if (!messageId || !content || !token || !threadId) {
            return res.status(400).json({ error: "Missing required fields (messageId, threadId, content, or token)" });
        }

        // Format attachments for Microsoft Graph API
        const formattedAttachments = attachments?.map((file) => ({
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: file.fileName,
            contentType: file.mimeType,
            contentBytes: file.contentBytes, // Base64 encoded content
        })) || [];

        // Reply Email Data
        const emailData = {
            comment: content, // Microsoft API requires "comment" for replies
            message: {
                attachments: formattedAttachments,
            }
        };

        // Send reply via Microsoft Graph API
        const response = await axios.post(
            `https://graph.microsoft.com/v1.0/me/messages/${messageId}/reply`,
            emailData,
            {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            }
        );

        // Extract the message ID of the sent reply
        const replyMessageId = response.data?.id || null;

        // Save reply email to database
        const repliedEmail = new ReplyEmail({
            threadId, // Store threadId for proper threading
            originalMessageId: messageId, // The email being replied to
            replyContent: content,
            repliedAt: new Date(),
            attachments,
        });

        await repliedEmail.save();

        res.status(200).json({ success: true, message: "Email replied successfully!", replyMessageId });
    } catch (error) {
        console.error("Error replying to email:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to send reply" });
    }
}


export async function getSentEmail(req, res) {
    try {
        const { to, page = 1, limit = 1 } = req.query;
        if (!to) return res.status(400).json({ error: "Recipient email is required" });

        // Ensure page and limit are integers
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 1;
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch paginated emails sorted by latest first
        const sentEmails = await SentEmail.find({ to })
            .sort({ sentAt: -1 }) // Sort newest to oldest
            .skip(skip)
            .limit(limitNumber);

        const totalEmails = await SentEmail.countDocuments({ to }); // Get total sent emails

        res.status(200).json({
            emails: sentEmails,
            totalEmails,
            totalPages: Math.ceil(totalEmails / limitNumber),
            currentPage: pageNumber
        });
    } catch (error) {
        console.error("Error fetching sent emails:", error);
        res.status(500).json({ error: "Failed to retrieve sent emails" });
    }
}

export async function fetchReceivedEmails(req, res) {
    try {
        // Get Microsoft Access Token from headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.error("Authorization header is missing or invalid");
            return res.status(401).json({ error: "Unauthorized - Access token is required" });
        }

        const accessToken = authHeader.slice(7); // Extract token after "Bearer "

        // Fetch emails from Microsoft Graph API
        const graphResponse = await axios.get(
            "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=15&$expand=attachments",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const emails = graphResponse.data.value || [];
        console.log(`Fetched ${emails.length} emails from Microsoft`);

        if (emails.length === 0) {
            return res.status(200).json({ success: true, emails: [] });
        }

        // Fetch leads from the database
        const leads = await Lead.find({}, "bestEmail");
        const leadEmails = new Set(leads.map(lead => lead.bestEmail.toLowerCase()));

        // Filter emails based on lead emails
        const filteredEmails = emails.filter(email =>
            email.from &&
            email.from.emailAddress &&
            leadEmails.has(email.from.emailAddress.address.toLowerCase())
        );

        console.log(`Filtered ${filteredEmails.length} emails matching leads`);

        function cleanReplyText(html) {
            const $ = cheerio.load(html);
            $('blockquote, .gmail_quote, .gmail_attr').remove(); // Remove previous replies
            return $('body').text().trim(); // Extract latest reply only
        }

        // Save filtered emails to MongoDB
        const savedEmails = await Promise.all(
            filteredEmails.map(async (email) => {
                try {
                    const htmlContent = email.body.content || "";
                    const plainTextMessage = cleanReplyText(htmlContent);
                    const conversationId = email.conversationId || email.id; // Use conversationId as threadId
                    const messageId = email.id; // Unique per email

                    const attachments = email.attachments?.map(att => ({
                        fileName: att.name,
                        mimeType: att.contentType,
                        contentBytes: att.contentBytes || null, // Only if Base64 is available
                    })) || [];

                    return await ReceivedEmail.findOneAndUpdate(
                        { messageId }, // Ensure uniqueness
                        {
                            messageId,
                            threadId: conversationId, // Grouping based on conversationId
                            subject: email.subject,
                            sender: email.from.emailAddress.address,
                            senderName: email.from.emailAddress.name,
                            message: plainTextMessage,
                            html: htmlContent,
                            timestamp: new Date(email.receivedDateTime),
                            attachments
                        },
                        { upsert: true, new: true }
                    );
                } catch (dbError) {
                    console.error("Error saving email to MongoDB:", dbError);
                    return null;
                }
            })
        );

        const successfullySavedEmails = savedEmails.filter(email => email !== null);
        console.log(`Saved ${successfullySavedEmails.length} emails to MongoDB`);

        res.status(200).json({ success: true, emails: successfullySavedEmails });
    } catch (error) {
        console.error("Error fetching emails:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch received emails" });
    }
}

