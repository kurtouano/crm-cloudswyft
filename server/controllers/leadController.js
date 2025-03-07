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

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: "Invalid data format or empty file." });
    }

    // Required fields for individual rows (REMOVED name of HR, Social, and Website)
    const requiredFields = [
      "leadName", "bestEmail", "nameOfPresident", "company",
      "industry", "companyAddress", "phone"
    ];

    // Remove empty or incomplete rows, ensuring numbers are accepted
    const validLeads = leads.filter(lead =>
      requiredFields.every(field =>
        lead[field] !== undefined && lead[field] !== null && 
        (typeof lead[field] === "string" ? lead[field].trim() !== "" : true)
      )
    );

    if (validLeads.length === 0) {
      return res.status(400).json({ error: "All rows are empty or missing required fields." });
    }

    // Convert phone numbers to strings before inserting into DB
    validLeads.forEach(lead => {
      if (typeof lead.phone !== "string") {
        lead.phone = String(lead.phone);
      }
    });

    // Fetch existing leads based on email & company
    const existingLeads = await Lead.find({
      $or: validLeads.map(lead => ({
        bestEmail: lead.bestEmail,
        company: lead.company
      }))
    });

    // Convert existing leads into a Set for quick lookup
    const existingLeadSet = new Set(
      existingLeads.map(lead => `${lead.bestEmail}-${lead.company}`)
    );

    // Filter out duplicates based on email & company
    const newLeads = validLeads.filter(lead =>
      !existingLeadSet.has(`${lead.bestEmail}-${lead.company}`)
    );

    const skippedCount = validLeads.length - newLeads.length;

    if (newLeads.length === 0) {
      return res.status(200).json({
        message: "No new leads added. All entries already exist.",
        insertedCount: 0,
        skippedCount: skippedCount
      });
    }

    // Save each lead individually to trigger auto-incremented `leadID`
    const insertedLeads = [];
    for (const lead of newLeads) {
      const newLead = new Lead({
        ...lead,
        importDate: new Date(), // Ensure import date is set
      });

      const savedLead = await newLead.save();
      insertedLeads.push(savedLead);
    }

    res.status(201).json({
      message: "Leads uploaded successfully!",
      insertedCount: insertedLeads.length,
      skippedCount: skippedCount, // Now always present
      insertedLeads
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



