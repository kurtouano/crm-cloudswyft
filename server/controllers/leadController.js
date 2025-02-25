import Lead from "../models/LeadSchema.js";

// 🟢 Get all leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find();

    // Format date fields before sending response
    const formattedLeads = leads.map((lead) => ({
      ...lead._doc, // Keep all other properties
      joinDate: lead.joinDate.toISOString().split("T")[0], // Format YYYY-MM-DD
      date: lead.date.toISOString().split("T")[0], // Format YYYY-MM-DD
    }));

    res.status(200).json(formattedLeads);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leads", error });
  }
};

// 🔵 Add a new lead (For initial testing)
export const addLead = async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save();
    res.status(201).json({ message: "Lead added successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error adding lead", error });
  }
};

export const importLead = async (req, res) => {
  try {
    const { leads } = req.body;

    console.log("Received Leads:", leads); // Debugging log

    // Validate input
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: "Invalid data format or empty file." });
    }

    // Check if required fields exist in each lead
    const requiredFields = [
      "lead", "email", "stage", "date", "name", "company", "leadID", 
      "joinDate", "jobTitle", "industry", "location", "phone", "social"
    ];

    const invalidLeads = leads.filter(lead =>
      !requiredFields.every(field => Object.keys(lead).includes(field) && lead[field]?.trim())
    );

    if (invalidLeads.length > 0) {
      return res.status(400).json({
        error: "Some leads are missing required fields.",
        invalidLeads, // Return faulty leads for debugging
      });
    }

    // Ensure no duplicate lead IDs or emails before inserting
    const leadIDs = leads.map(lead => lead.leadID);
    const emails = leads.map(lead => lead.email);

    const existingLeads = await Lead.find({ 
      $or: [{ leadID: { $in: leadIDs } }, { email: { $in: emails } }] 
    });

    if (existingLeads.length > 0) {
      return res.status(400).json({
        error: "Duplicate lead IDs or emails detected.",
        duplicateLeads: existingLeads.map(lead => ({
          leadID: lead.leadID,
          email: lead.email
        })),
      });
    }

    // Insert leads into the database
    await Lead.insertMany(leads);

    res.status(201).json({ message: "Leads uploaded successfully!", insertedCount: leads.length });
  } catch (error) {
    console.error("Error saving leads:", error);

    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({ error: "Duplicate email or lead ID found." });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid lead data format.", details: error.errors });
    }

    res.status(500).json({ error: "Failed to save leads." });
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
