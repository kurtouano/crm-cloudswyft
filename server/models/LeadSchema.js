import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    lead: { type: String, required: true }, // Consider renaming to `fullName`
    email: { type: String, required: true, unique: true },
    stage: {
      type: String,
      enum: [
        "Lead",
        "Discovery Call",
        "Quote",
        "Provision",
        "Proposal",
        "Negotiation",
        "On-boarding",
      ],
      required: true,
    },
    date: { type: Date, required: true }, // Changed to Date type
    name: { type: String, required: true },
    company: { type: String, required: true },
    leadID: { type: String, required: true, unique: true },
    joinDate: { type: Date, required: true }, // Changed to Date type
    jobTitle: { type: String, required: true },
    industry: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true }, // Consider validating format
    social: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", LeadSchema);
