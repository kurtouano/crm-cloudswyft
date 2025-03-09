import { ReceivedEmail } from "../models/EmailSchema.js";

export const createEmail = async (req, res) => {
    const { subject, sender, message } = req.body;

    if (!subject || !sender || !message) {
        return res.status(400).json({ error: "Missing fields" });
    }

    try {
        const emailData = new ReceivedEmail({ subject, sender, message });
        await emailData.save();
        res.status(201).json({ success: true, data: emailData });
    } catch (error) {
        console.error("Error saving received email:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

export const getEmails = async (req, res) => {
    try {
        const emails = await ReceivedEmail.find().sort({ timestamp: -1 }); // Sort by latest
        res.json(emails);
    } catch (error) {
        console.error("Error fetching received emails:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
