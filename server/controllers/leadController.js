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
