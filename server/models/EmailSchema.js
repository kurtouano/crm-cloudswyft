import mongoose from "mongoose";

const receivedEmailSchema = new mongoose.Schema({
    messageId: { type: String, required: true, index: true },
    threadId: { type: String, required: true, index: true },
    subject: { type: String, required: true, index: true  },
    sender: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true },
    html: { type: String },
    attachments: [
        {
            fileName: { type: String, required: true },
            mimeType: { type: String, required: true },
            contentBytes: { type: String, required: false },
        }
    ],
    timestamp: { type: Date, default: Date.now, index: true },
    viewed: { type: Boolean, default: false },
    notificationDeleted: { type: Boolean, default: false },
    emailType: {
        type: String,
        enum: ['revenue', 'after-sales'],
        required: true,
        default: 'revenue',
        index: true
    }
});

const replyEmailSchema = new mongoose.Schema({
    threadId: { type: String, required: true, index: true }, 
    originalMessageId: { type: String, index: true },
    replyContentHtml: { type: String, required: true },
    replyContentText: { type: String },
    repliedAt: { type: Date, default: Date.now, index: true },
    attachments: [
        {
            fileName: { type: String, required: true },
            mimeType: { type: String, required: true },
            contentBytes: { type: String, required: true },
        }
    ],
    emailType: {
        type: String,
        enum: ['revenue', 'after-sales'],
        required: true,
        default: 'revenue',
        index: true
    }
});

const sentEmailSchema = new mongoose.Schema({
    to: { type: String, required: true, index: true },
    cc: { type: String },
    bcc: { type: String },
    subject: { type: String, required: true, index: true },
    content: { type: String, required: true},
    sentAt: { type: Date, default: Date.now, index: true },
    attachments: [
        {
            fileName: { type: String, required: true },
            mimeType: { type: String, required: true },
            contentBytes: { type: String, required: true }
        }
    ],
    emailType: {
        type: String,
        enum: ['revenue', 'after-sales'],
        required: true,
        default: 'revenue',
        index: true
    }
});

// Create models
const ReceivedEmail = mongoose.model("ReceivedEmail", receivedEmailSchema);
const SentEmail = mongoose.model("SentEmail", sentEmailSchema);
const ReplyEmail = mongoose.model("ReplyEmail", replyEmailSchema);

export { ReceivedEmail, SentEmail, ReplyEmail };