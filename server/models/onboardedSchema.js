import mongoose from "mongoose";

const OnboardedClientSchema = new mongoose.Schema(
  {
    leadId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Lead",
      required: true,
    },
    company: { 
      type: String, 
      required: true 
    },
    bestEmail: { 
      type: String, 
      required: true 
    },
    industry: { 
      type: String 
    },
    importDate: { 
        type: Date, 
        required: true 
    },
    onboardedDate: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

// Index for faster queries
OnboardedClientSchema.index({ company: 1 });
OnboardedClientSchema.index({ bestEmail: 1 });

export default mongoose.model("OnboardedClient", OnboardedClientSchema);