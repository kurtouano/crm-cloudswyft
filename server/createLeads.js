import mongoose from "mongoose";
import dotenv from "dotenv";
import Lead from "./models/LeadSchema.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

const sampleLeads = [];
const stages = [
  "lead",
  "discovery-call",
  "quote",
  "provision",
  "proposal",
  "negotiation",
  "onboarding",
];

for (let i = 1; i <= 40; i++) {
  sampleLeads.push({
    lead: `Lead ${i}`,
    email: `lead${i}@example.com`,
    stage: stages[Math.floor(Math.random() * stages.length)], 
    date: `2024-02-${String(i % 28 + 1).padStart(2, "0")}`, 
  });
}

const seedDatabase = async () => {
  try {
    await Lead.deleteMany(); // ✅ Clear existing data
    await Lead.insertMany(sampleLeads);
    console.log("✅ 40 Sample Leads Added Successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

seedDatabase();
