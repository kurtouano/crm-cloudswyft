import Lead from "../models/LeadSchema.js";
import { sendAutoWelcomeEmail } from "../utils/sendAutoWelcomeEmail.js";

// 🟢 Get all leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find();

    const formattedLeads = leads.map((lead) => ({
      ...lead._doc, // Keep all other fields
      leadID: `LID-${String(lead.leadID).padStart(3, "0")}`, // Ensure formatted leadID
      importDate: lead.importDate ? lead.importDate.toISOString().split("T")[0] : null, // Ensure correct date format
    }));

    res.status(200).json(formattedLeads);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leads", error });
  }
};

// 🔵 Add a new lead
export const addLead = async (req, res) => {
  try {
    const newLead = new Lead({
      ...req.body,
      importDate: new Date(), // Automatically set importDate
    });

    await newLead.save();
    res.status(201).json({ message: "Lead added successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error adding lead", error });
  }
};

export const importLead = async (req, res) => {
  try {
    const { leads } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Microsoft Access token missing. Please log in first." });
    }
    const accessToken = authHeader.slice(7); // Extract the token

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: "Invalid data format or empty file." });
    }

    const requiredFields = [
      "leadName", "bestEmail", "nameOfPresident", "company",
      "industry", "companyAddress", "phone"
    ];

    const validLeads = leads.filter(lead =>
      requiredFields.every(field =>
        lead[field] !== undefined && lead[field] !== null &&
        (typeof lead[field] === "string" ? lead[field].trim() !== "" : true)
      )
    );

    if (validLeads.length === 0) {
      return res.status(400).json({ error: "All rows are empty or missing required fields." });
    }

    validLeads.forEach(lead => {
      if (typeof lead.phone !== "string") {
        lead.phone = String(lead.phone);
      }
    });

    const existingLeads = await Lead.find({
      $or: validLeads.map(lead => ({
        bestEmail: lead.bestEmail,
        company: lead.company
      }))
    });

    const existingLeadSet = new Set(
      existingLeads.map(lead => `${lead.bestEmail}-${lead.company}`)
    );

    const newLeads = validLeads.filter(lead =>
      !existingLeadSet.has(`${lead.bestEmail}-${lead.company}`)
    );

    const skippedCount = validLeads.length - newLeads.length;

    if (newLeads.length === 0) {
      return res.status(200).json({
        message: "No new leads added. All entries already exist.",
        insertedCount: 0,
        skippedCount
      });
    }

    const insertedLeads = [];

    for (const lead of newLeads) {
      const newLead = new Lead({
        ...lead,
        importDate: new Date(),
      });
      const savedLead = await newLead.save();
      insertedLeads.push(savedLead);

      await sendAutoWelcomeEmail(savedLead, accessToken);
      console.log(`✅ Auto welcome email sent to ${savedLead.bestEmail}`);
    }

    res.status(201).json({
      message: "Leads uploaded successfully and welcome emails sent!",
      insertedCount: insertedLeads.length,
      skippedCount,
      insertedLeads
    });

  } catch (error) {
    console.error("Error saving leads:", error);
    res.status(500).json({ error: "Failed to save leads or send emails." });
  }
};

// 🟡 Update lead stage when moved in Kanban
export const updateLeadStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    // Check if the stage is valid
    const validStages = [
      "Lead",
      "Discovery Call",
      "Quote",
      "Provision",
      "Proposal",
      "Negotiation",
      "On-boarding"
    ];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage" });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { stage },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: "Error updating lead stage", error });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Convert `id` to number if it's in `LID-001` format
    const leadIdNumber = parseInt(id.replace("LID-", ""), 10);

    // Find and delete lead by `leadID`
    const deletedLead = await Lead.findOneAndDelete({ leadID: leadIdNumber });

    if (!deletedLead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    res.status(200).json({ message: "Lead deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting lead", error });
  }
};

export async function updateLeadStatus(req, res) {
  let { leadID } = req.params;
  const { status } = req.body;

  try {
    leadID = parseInt(leadID); // Convert to number

    const updatedLead = await Lead.findOneAndUpdate(
      { leadID: leadID }, // Ensure matching field name
      { status },
      { new: true }
    );

    if (!updatedLead) {
      console.log("Lead not found for ID:", leadID);
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({ message: "Status updated successfully", lead: updatedLead });
  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({ error: error.message });
  }
}

export const updateLeadTemperature = async (req, res) => {
  const { leadId, temperature } = req.body;

  if (!leadId || !temperature) {
    return res.status(400).json({ error: "Missing leadId or temperature" });
  }

  try {
    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,  // Make sure this matches your schema's ID field
      { temperature },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    console.error("Error updating lead temperature:", error);
    res.status(500).json({ error: "Failed to update lead temperature" });
  }
};



