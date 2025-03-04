import mongoose from "mongoose";

const EmailSchema = new mongoose.Schema({
    subject: String,
    sender: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Email', EmailSchema);