import Lead from "../models/LeadSchema.js";
import OnboardedClient from "../models/onboardedSchema.js";

export const onBoardedClients = async (req, res) => {
  try {
    const clients = await OnboardedClient.find().populate('leadId');
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToOnboarded = async (req, res) => {
    const { leadId } = req.body;
  
    try {
      const lead = await Lead.findById(leadId);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
  
      // Update existing or create new
      const onboardedClient = await OnboardedClient.findOneAndUpdate(
        { leadId },
        {
          company: lead.company,
          bestEmail: lead.bestEmail,
          industry: lead.industry,
          importDate: lead.importDate,
          onboardedDate: Date.now() // Update the onboarded date
        },
        { upsert: true, new: true }
      );
  
      res.status(201).json(onboardedClient);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

export const getOnboardedStats = async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      
      // Get all onboarded clients
      const clients = await OnboardedClient.find().populate('leadId');
      
      // Process data into monthly counts
      const stats = {
        currentYear: Array(12).fill(0),
        lastYear: Array(12).fill(0)
      };
      
      clients.forEach(client => {
        const date = client.onboardedDate || client.importDate;
        const month = date.getMonth(); // 0-11
        const year = date.getFullYear();
        
        if (year === currentYear) {
          stats.currentYear[month]++;
        } else if (year === lastYear) {
          stats.lastYear[month]++;
        }
      });
      
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };