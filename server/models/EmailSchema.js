import mongoose from "mongoose";

const receivedEmailSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    threadId: { type: String, required: true },
    subject: { type: String, required: true },
    sender: { type: String, required: true },
    message: { type: String, required: true }, // Cleaned text version
    html: { type: String }, // Raw HTML content
    attachments: [
        {
            fileName: { type: String, required: true },
            mimeType: { type: String, required: true },
            contentUrl: { type: String, required: true }
        }
    ],
    timestamp: { type: Date, default: Date.now },
});

const replyEmailSchema = new mongoose.Schema({
    threadId: { type: String, required: true }, 
    originalMessageId: { type: String }, // Links reply to the original email
    replyContent: { type: String, required: true }, // The reply text from cloudswyft 
    repliedAt: { type: Date, default: Date.now }, 
    attachments: [
        {
            fileName: { type: String, required: true },
            mimeType: { type: String, required: true },
            contentBytes: { type: String, required: true }, // Base64 encoded content
        }
    ]
});

const sentEmailSchema = new mongoose.Schema({
    to: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    attachments: [
        {
            fileName: { type: String, required: true },
            mimeType: { type: String, required: true },
            contentBytes: { type: String, required: true } 
        }
    ]
});

// Create models
const ReceivedEmail = mongoose.model("ReceivedEmail", receivedEmailSchema);
const SentEmail = mongoose.model("SentEmail", sentEmailSchema);
const ReplyEmail = mongoose.model("ReplyEmail", replyEmailSchema);

export { ReceivedEmail, SentEmail, ReplyEmail };
