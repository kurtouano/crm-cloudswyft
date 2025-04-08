import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

// Use the default mongoose connection
const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const LeadSchema = new mongoose.Schema(
  {
    leadName: { type: String, required: true },
    bestEmail: { type: String, required: true }, // Remove required: true
    leadID: { type: Number, unique: true }, // Auto-incremented number
    importDate: { type: Date, default: Date.now }, 
    status: { type: String, required: true, default: "active" },
    temperature: { type: String, required: true, default: "warm" },
    starred: {type: Boolean, default: false},
    starredForSupport: {type: Boolean, default: false},
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
      default: "Lead", // Automatically sets the default stage
      required: true,
    },
    nameOfPresident: { type: String, required: true },
    nameOfHrHead: { type: String },
    company: { type: String, required: true },
    companyAddress: { type: String, required: true }, 
    industry: { type: String, required: true },
    phone: { type: String, required: true },
    social: { type: String }, 
    website: { type: String }, 
  },
  { timestamps: true }
);

// Apply auto-increment to `leadID`
LeadSchema.plugin(AutoIncrement, { inc_field: "leadID", start_seq: 1 });

// Format `leadID` dynamically when returning data
LeadSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.leadID) {
      ret.leadID = `LID-${String(ret.leadID).padStart(3, "0")}`;
    }
    return ret;
  },
});

export default mongoose.model("Lead", LeadSchema);
