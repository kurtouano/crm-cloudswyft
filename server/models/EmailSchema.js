import mongoose from "mongoose";

const receivedEmailSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    sender: { type: String, required: true },
    message: { type: String, required: true }, // Cleaned text version
    html: { type: String }, // Raw HTML content (optional)
    attachments: [
        {
            fileName: { type: String, required: true },
            mimeType: { type: String, required: true },
            contentUrl: { type: String, required: true } // Base64 or download URL
        }
    ],
    timestamp: { type: Date, default: Date.now },
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
            contentBytes: { type: String, required: true } // Base64 encoded content
        }
    ]
});

// Create models
const ReceivedEmail = mongoose.model("ReceivedEmail", receivedEmailSchema);
const SentEmail = mongoose.model("SentEmail", sentEmailSchema);

export { ReceivedEmail, SentEmail };
