import Email from "../models/EmailSchema.js";

export const createEmail = async (req, res) => {
    const { subject, sender, message } = req.body;

    if (!subject || !sender || !message) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        const emailData = new Email({ subject, sender, message });
        await emailData.save();
        res.status(201).json({ success: true, data: emailData });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getEmails = async (req, res) => {
    try {
        const emails = await Email.find();
        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};