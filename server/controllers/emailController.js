import axios from "axios";
import dotenv from "dotenv";
import { io } from "../index.js";
import { ConfidentialClientApplication } from "@azure/msal-node";  // Use ConfidentialClientApplication for client secret
import { SentEmail, ReceivedEmail, ReplyEmail } from "../models/EmailSchema.js";  
import Lead from "../models/LeadSchema.js";
import * as cheerio from 'cheerio';
import { clearHandlingTimeCache } from './analyticsController.js';

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
        const { currentPage } = req.query;
        const authUrl = await cca.getAuthCodeUrl({
            scopes: ["Mail.ReadWrite", "Mail.Send", "Mail.Read", "openid", "email", "profile"], // Scopes for personal account login
            redirectUri: process.env.REDIRECT_URI,
            state: currentPage
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
    const currentPage = req.query.state;
    if (!code) return res.status(400).json({ error: "Authorization code missing" });

    try {
        const tokenResponse = await cca.acquireTokenByCode({
            code,
            scopes: ["Mail.ReadWrite", "Mail.Send", "Mail.Read", "openid", "email", "profile"],
            redirectUri: process.env.REDIRECT_URI,
        });

        if (tokenResponse?.accessToken) {
            global.MICROSOFT_ACCESS_TOKEN = tokenResponse.accessToken; // Save globally!
            const expiryTimestamp = new Date(tokenResponse.expiresOn).getTime(); // Convert ISO to ms
            
            return res.redirect(
                `${process.env.FRONTEND_URL}/${currentPage}?accessToken=${tokenResponse.accessToken}&expiry=${expiryTimestamp}`
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
    const formatRecipients = (emails) => {
        if (!emails) return [];
        
        return emails.split(',')
            .map(email => email.trim())
            .filter(email => {
                if (email.length === 0) return false;
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    throw new Error(`Invalid email address: ${email}`);
                }
                return true;
            })
            .map(email => ({ 
                emailAddress: { 
                    address: email 
                } 
            }));
    };

    try {
        const { to, cc, bcc, subject, content, token, attachments } = req.body;
        if (!to || !subject || !content || !token) {
            return res.status(400).json({ error: "Missing required fields or authentication token" });
        }

        // Format attachments
        const formattedAttachments = attachments?.map((file) => ({
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: file.fileName,
            contentType: file.mimeType,
            contentBytes: file.contentBytes,
        })) || [];

        const emailData = {
            message: {
                subject,
                body: { 
                    contentType: "HTML",
                    content 
                },
                toRecipients: formatRecipients(to),
                ccRecipients: cc ? formatRecipients(cc) : [],
                bccRecipients: bcc ? formatRecipients(bcc) : [],
                attachments: formattedAttachments
            },
            saveToSentItems: true
        };

        // Debug log
        console.log("Sending email with recipients:", {
            to: emailData.message.toRecipients,
            cc: emailData.message.ccRecipients,
            bcc: emailData.message.bccRecipients
        });

        // Send email via Microsoft Graph API
        const response = await axios.post(
            "https://graph.microsoft.com/v1.0/me/sendMail", 
            emailData, 
            {
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    "Content-Type": "application/json" 
                },
            }
        );

        console.log("Email sent successfully:", response.data);

        // Save email to database
        const sentEmail = new SentEmail({
            to,
            cc: cc || undefined,
            bcc: bcc || undefined,
            subject,
            content,
            sentAt: new Date(),
            attachments
        });

        await sentEmail.save();

        res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error.response?.data || error.message);
        let errorMessage = "Failed to send email";
        
        if (error.message.includes("Invalid email address")) {
            errorMessage = error.message;
        } else if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        }

        res.status(500).json({ 
            error: errorMessage,
            details: error.response?.data || error.message 
        });
    }
}

export async function replyEmail(req, res) {
    try {
        const { messageId, threadId, content, token, attachments = [] } = req.body;
        
        if (!messageId || !content || !token || !threadId) {
            return res.status(400).json({ error: "Missing required fields (messageId, threadId, content, or token)" });
        }

        // Remove some automatic stylings caused by Tiptap rich text editor 
        const processedContent = content
            .replace(/<p><\/p>/g, '<br>') // Replace empty paragraphs with line breaks
            .replace(/<p>/g, '<p style="margin:0 0 0 0;">') // Add consistent paragraph spacing
            .replace(/<h1>/g, '<h1 style="margin:0 0 0 0;">') // Remove headings spacing
            .replace(/<h2>/g, '<h2 style="margin:0 0 0 0;">') // Remove headings spacing
            .replace(/<h3>/g, '<h3 style="margin:0 0 0 0;">') // Remove headings spacing
            .replace(/<ol>/g, '<ol style="margin:0 0 0 0; padding: 0 0 0 20px;">')
            .replace(/<ul>/g, '<ul style="margin:0 0 0 0; padding: 0 0 0 20px;">')
            .replace(/<th colspan="1" rowspan="1">/g, '<th style="padding: 0 12px;">')
            .replace(/<td colspan="1" rowspan="1">/g, '<td style="padding: 0 12px;">')

        // Format all attachments for Microsoft Graph API (including images)
        const formattedAttachments = attachments.map((file) => ({
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: file.fileName,
            contentType: file.mimeType,
            contentBytes: file.contentBytes,
        }));

        // Create the email data with attachments
        const emailData = {
            message: {
                body: {
                    contentType: "HTML",
                    content: processedContent, // Ensures HTML rendering
                },
                attachments: formattedAttachments,
            }
        };
        

        // Send reply via Microsoft Graph API
        const response = await axios.post(
            `https://graph.microsoft.com/v1.0/me/messages/${messageId}/reply`,
            emailData,
            {
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    "Content-Type": "application/json",
                },
            }
        );

        // Save reply email to database with all attachments
        const repliedEmail = new ReplyEmail({
            threadId,
            originalMessageId: messageId,
            replyContentHtml: content,
            replyContentText: content.replace(/<[^>]*>?/gm, ''),
            repliedAt: new Date(),
            attachments: attachments, // Include all attachments
        });

        await repliedEmail.save();
        clearHandlingTimeCache(); 

        res.status(200).json({ 
            success: true, 
            message: "Email replied successfully!", 
            replyMessageId: response.data?.id || null
        });
    } catch (error) {
        console.error("Error replying to email:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "Failed to send reply",
            details: error.response?.data || error.message,
        });
    }
}

export async function getSentEmail(req, res) {
    try {
        const { to, page = 1, limit = 10 } = req.query;
        if (!to) return res.status(400).json({ error: "Recipient email is required" });

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
        const skip = (pageNumber - 1) * limitNumber;

        // Create a query that checks to, cc, and bcc fields
        const query = {
            $or: [
                { to: { $regex: to, $options: 'i' } },
                { cc: { $regex: to, $options: 'i' } },
                { bcc: { $regex: to, $options: 'i' } }
            ]
        };

        // Fetch emails WITHOUT attachments for speed
        const [sentEmails, totalEmails] = await Promise.all([
            SentEmail.find(query)
                .sort({ _id: -1 })
                .select("to cc bcc subject sender sentAt content") // Include cc/bcc in response
                .skip(skip)
                .limit(limitNumber)
                .lean(), 

            SentEmail.countDocuments(query) 
        ]);

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

export async function getEmailAttachments(req, res) {
    try {
        const { emailId } = req.params;
        const email = await SentEmail.findById(emailId).select("attachments").lean();
        if (!email) return res.status(404).json({ error: "Email not found" });

        res.status(200).json({ attachments: email.attachments });
    } catch (error) {
        console.error("Error fetching attachments:", error);
        res.status(500).json({ error: "Failed to retrieve attachments" });
    }
}

export async function fetchSentReplyEmails(req, res) {
    try {
        const { threadId } = req.query;
        if (!threadId) return res.status(400).json({ error: "Thread ID is required" });

        // Fetch reply emails from the database based on threadId
        const replyEmails = await ReplyEmail.find({ threadId }).sort({ repliedAt: -1 }).lean();

        if (!replyEmails || replyEmails.length === 0) {
            return res.status(200).json({ success: true, replies: [] });
        }

        // Add attachments to each reply email
        const repliesWithAttachments = replyEmails.map((reply) => {
            return {
                ...reply,
                attachments: reply.attachments || [], // Attachments are already included in the reply
            };
        });

        res.status(200).json({ success: true, replies: repliesWithAttachments });
    } catch (error) {
        console.error("Error fetching reply emails:", error);
        res.status(500).json({ error: "Failed to fetch reply emails" });
    }
}
    
export async function fetchAttachmentsForReply(req, res) {
    try {
        const { emailId } = req.params;

        // Fetch the reply email by its _id (using the emailId)
        const reply = await ReplyEmail.findById(emailId).select("attachments").lean();

        if (!reply) {
            return res.status(404).json({ error: "Reply email not found" });
        }

        res.status(200).json({ attachments: reply.attachments || [] });
    } catch (error) {
        console.error("Error fetching attachments:", error);
        res.status(500).json({ error: "Failed to fetch attachments" });
    }
}

export async function fetchReceivedEmails(req, res) {
    try {
        const authHeader = req.headers.authorization; // Get Microsoft Access Token from headers
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("Authorization header is missing or invalid");
        return res.status(401).json({ error: "Unauthorized - Access token is required" });
    }

    const accessToken = authHeader.slice(7); // Extract token after "Bearer "

    // Fetch emails from Microsoft Graph API
    const graphResponse = await axios.get(
        "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=40&$expand=attachments",
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const emails = graphResponse.data.value || [];
    console.log(`Fetched ${emails.length} emails from Microsoft`);

    if (emails.length === 0) {
        return res.status(200).json({ success: true, emails: [] });
    }

    // Fetch leads from the database
    const leads = await Lead.find({}, "bestEmail").lean();
    const leadEmails = new Set(leads.map(lead => lead.bestEmail.toLowerCase()));

    // Filter emails based on lead emails
    const filteredEmails = emails.filter(email =>
        email.from?.emailAddress && leadEmails.has(email.from.emailAddress.address.toLowerCase())
    );

    console.log(`Filtered ${filteredEmails.length} emails matching leads`);

    function cleanReplyText(html) {
        const $ = cheerio.load(html);

        // Remove quoted text, previous replies, and Gmail/Outlook metadata
        $("blockquote, .gmail_quote, .gmail_attr, #divRplyFwdMsg, #x_divRplyFwdMsg, hr").remove();
        $("#ms-outlook-mobile-signature, #x_ms-outlook-mobile-signature").remove();
        $("a[href*='outlook.com'], a[href*='aka.ms']").remove(); // Remove "Get Outlook for iOS" links

        // Remove unnecessary meta tags
        $("head, meta").remove();

        // Replace <br> with new lines
        $("br").replaceWith("\n");

        // Convert <div> to new lines (while keeping spacing)
        $("div").each(function () {
            $(this).replaceWith($(this).text() + "\n");
        });

        // Extract only the first part of the body (latest reply)
        let cleanedText = $("body").contents().first().text().trim();

        // Preserve multiple new lines (while preventing excessive spaces)
        cleanedText = cleanedText.replace(/\n{3,}/g, "\n\n");

        return cleanedText;
    }
            
    let newEmails = []; // ✅ Track new emails for WebSocket notifications

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

                const existingEmail = await ReceivedEmail.findOne({ messageId }); // ✅ Check if email exists

                // ✅ If it's a new email, push to `newEmails`
                if (!existingEmail) {
                    newEmails.push({
                        message: `New reply from ${email.from.emailAddress.name} – Click to view the conversation!`,
                        leadEmail: email.from.emailAddress.address,
                        threadId: conversationId
                    });
                    clearHandlingTimeCache();
                }

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

    // ✅ Emit WebSocket notifications for new emails only
    if (newEmails.length > 0) {
        // Sort new emails by timestamp (latest first)
        newEmails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        newEmails.forEach(notif => {
            io.emit("newReplyNotification", notif);
        });
        console.log(`Sent ${newEmails.length} new notifications via WebSocket.`);
    } else {
        console.log("No new notifications to send.");
    }

        res.status(200).json({ success: true, emails: successfullySavedEmails });
    } catch (error) {
        console.error("❌ Error fetching emails:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch received emails" });
    }
}

export async function fetchNotifications(req, res) {
    try {
        const storedEmails = await ReceivedEmail.find({ notificationDeleted: { $ne: true } }) 
            .sort({ timestamp: -1 });
  
        if (!storedEmails || storedEmails.length === 0) {
            return res.status(200).json({ success: true, notifications: [] });
        }
  
        const notifications = storedEmails.map(email => ({
            message: `New reply from ${email.senderName || "Unknown"} – Click to view the conversation!`,
            leadEmail: email.sender,
            threadId: email.threadId,
            viewed: email.viewed,
            timestamp: email.timestamp,
        }));
  
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }
  


//// LEAD PROFILE PAGE CONTROLLER

export async function fetchSentEmailsForLeadProfile(req, res) {
    try {
        const { leadEmail } = req.query;
        if (!leadEmail) return res.status(400).json({ error: "Lead email is required" });

        const sentEmails = await SentEmail.find({ to: leadEmail })
            .sort({ _id: -1 })
            .select("subject content sentAt")
            .lean();

        res.status(200).json(sentEmails); // ✅ Send array directly
        io.emit("new-email", { leadEmail }); // ✅ Emit WebSocket event   
    } catch (error) {
        console.error("Error fetching sent emails for lead profile:", error);
        res.status(500).json({ error: "Failed to retrieve sent emails" });
    }
}

export async function fetchReceivedEmailsForLeadProfile(req, res) {
    try {
        const { leadEmail } = req.query;
        if (!leadEmail) return res.status(400).json({ error: "Lead email is required" });

        const receivedEmails = await ReceivedEmail.find({ sender: leadEmail })
            .sort({ _id: -1 })
            .select("subject sender timestamp message threadId")
            .lean();

        res.status(200).json(receivedEmails); // ✅ Send array directly
    } catch (error) {
        console.error("Error fetching received emails for lead profile:", error);
        res.status(500).json({ error: "Failed to retrieve received emails" });
    }
}

export async function markNotificationAsViewed(req, res) {
    try {
        const { threadId } = req.body;
        if (!threadId) return res.status(400).json({ error: "Thread ID is required" });

        await ReceivedEmail.updateMany({ threadId }, { viewed: true });

        res.status(200).json({ success: true, message: "Notification marked as viewed." });
    } catch (error) {
        console.error("❌ Error updating viewed status:", error);
        res.status(500).json({ error: "Failed to mark notification as viewed." });
    }
}


export async function deleteNotification(req, res) {
    try {
      const { threadId } = req.body;
      if (!threadId) return res.status(400).json({ error: "Thread ID is required" });
  
      await ReceivedEmail.updateMany({ threadId }, { notificationDeleted: true });
  
      res.status(200).json({ success: true, message: "Notification hidden from frontend." });
    } catch (error) {
      console.error("❌ Error updating notificationDeleted:", error);
      res.status(500).json({ error: "Failed to hide notification." });
    }
}

  