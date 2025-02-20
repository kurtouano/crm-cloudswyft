import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  lead: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  stage: { 
    type: String, 
    enum: [
      "lead", 
      "discovery-call", 
      "quote", 
      "provision", 
      "proposal", 
      "negotiation", 
      "onboarding"
    ], 
    required: true 
  },
    date: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Lead", LeadSchema);
