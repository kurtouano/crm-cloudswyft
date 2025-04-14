import Ticket from "../models/TicketSchema.js";

export const handleNewEmail = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.threadId || !req.body.sender) {
      return res.status(400).json({ error: "Missing required fields: threadId and sender" });
    }

    // First check if ticket exists
    const existingTicket = await Ticket.findOne({ threadId: req.body.threadId });
    
    if (existingTicket) {
      // If ticket exists but status is none, update to open
      if (existingTicket.status === 'none') {
        existingTicket.status = 'open';
        existingTicket.openedAt = existingTicket.openedAt || new Date();
        await existingTicket.save();
      }
      return res.status(200).json(existingTicket);
    }

    // Create new ticket if doesn't exist
    const ticket = await Ticket.create({
      threadId: req.body.threadId,
      bestEmail: req.body.sender,
      status: 'open',
      openedAt: new Date()
    });
    
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error in handleNewEmail:", error);
    res.status(500).json({ 
      error: "Failed to process new email",
      details: error.message 
    });
  }
};

export const handleAgentReply = async (req, res) => {
  try {
    await Ticket.handleAgentReply(req.body.threadId);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update ticket status" });
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.resolveTicket(req.params.threadId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve ticket" });
  }
};

export const getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.getResolutionStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to get ticket stats" });
  }
};

export const getTicketByThread = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ threadId: req.params.threadId });
    res.status(200).json(ticket || { status: 'none' });
  } catch (error) {
    res.status(500).json({ error: "Failed to get ticket" });
  }
};

export const reopenTicket = async (req, res) => {
  try {
    const ticket = await Ticket.reopenTicket(req.params.threadId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to reopen ticket" });
  }
};