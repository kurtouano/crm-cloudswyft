import Lead from "../models/LeadSchema.js";

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

    console.log("Received Leads:", leads); // Debugging log

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: "Invalid data format or empty file." });
    }

    // Trim headers and remove empty spaces
    const requiredFields = [
      "leadName", "bestEmail", "nameOfPresident", "nameOfHrHead", "company",
      "industry", "companyAddress", "phone", "website", "social"
    ];

    // Remove empty rows (where required fields are missing or empty)
    const validLeads = leads.filter(lead =>
      requiredFields.every(field => lead[field] && lead[field].trim())
    );

    if (validLeads.length === 0) {
      return res.status(400).json({ error: "All rows are empty or missing required fields." });
    }

    console.log(`Valid Leads Count: ${validLeads.length}`);

    // Check for duplicate emails
    const emails = validLeads.map(lead => lead.bestEmail);
    const existingLeads = await Lead.find({ bestEmail: { $in: emails } });

    if (existingLeads.length > 0) {
      return res.status(400).json({
        error: "Duplicate emails detected.",
        duplicateEmails: existingLeads.map(lead => lead.bestEmail),
      });
    }

    // Insert leads one by one to maintain auto-increment behavior
    const insertedLeads = [];
    for (const lead of validLeads) {
      const newLead = new Lead({
        ...lead,
        importDate: new Date(), // Auto-set import date
      });
      await newLead.save();
      insertedLeads.push(newLead);
    }

    console.log(`Inserted Leads Count: ${insertedLeads.length}`);

    res.status(201).json({
      message: "Leads uploaded successfully!",
      insertedCount: insertedLeads.length
    });

  } catch (error) {
    console.error("Error saving leads:", error);
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
