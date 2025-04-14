import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  threadId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  status: {
    type: String,
    enum: ['none', 'open', 'in-progress', 'resolved'],
    default: 'none',
    index: true
  },
  bestEmail: {
    type: String,
    required: true,
    index: true
  },
  openedAt: Date,
  resolvedAt: Date,
  handlingTime: Number // in milliseconds
}, { timestamps: true });

ticketSchema.statics.handleNewEmail = async function(emailData) {
  try {
    // Validate input
    if (!emailData.threadId || !emailData.sender) {
      throw new Error('Missing required fields: threadId and sender');
    }

    const existingTicket = await this.findOne({ threadId: emailData.threadId });
    
    if (existingTicket) {
      if (existingTicket.status === 'none') {
        existingTicket.status = 'open';
        existingTicket.openedAt = existingTicket.openedAt || new Date();
        await existingTicket.save();
      }
      return existingTicket;
    }

    return await this.create({
      threadId: emailData.threadId,
      bestEmail: emailData.sender,
      status: 'open',
      openedAt: new Date()
    });
  } catch (error) {
    console.error('Error in handleNewEmail:', error);
    throw error; // Re-throw for controller to handle
  }
};

// In TicketSchema.js
ticketSchema.statics.reopenTicket = async function(threadId) {
  const ticket = await this.findOne({ threadId });
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  
  ticket.status = 'open';
  ticket.openedAt = ticket.openedAt || new Date();
  ticket.resolvedAt = undefined;
  ticket.handlingTime = undefined;
  
  await ticket.save();
  return ticket;
};

// When agent replies
ticketSchema.statics.handleAgentReply = async function(threadId) {
  return this.updateOne(
    { threadId },
    { status: 'in-progress' }
  );
};

// When manually resolving
ticketSchema.statics.resolveTicket = async function(threadId) {
  const ticket = await this.findOne({ threadId });
  if (!ticket) return null;

  ticket.status = 'resolved';
  ticket.resolvedAt = new Date();
  ticket.handlingTime = ticket.resolvedAt - ticket.openedAt;
  await ticket.save();
  return ticket;
};

// Get resolution stats
ticketSchema.statics.getResolutionStats = async function() {
  const stats = await this.aggregate([
    {
      $match: {
        status: 'resolved',
        handlingTime: { $exists: true }
      }
    },
    {
      $project: {
        timeBucket: {
          $switch: {
            branches: [
              { case: { $lte: ['$handlingTime', 3600000] }, then: '0-1 hour' },       // 1 hour
              { case: { $lte: ['$handlingTime', 10800000] }, then: '1-3 hours' },     // 3 hours
              { case: { $lte: ['$handlingTime', 21600000] }, then: '4-6 hours' },      // 6 hours
              { case: { $lte: ['$handlingTime', 43200000] }, then: '7-12 hours' },     // 12 hours
              { case: { $lte: ['$handlingTime', 64800000] }, then: '13-18 hours' },    // 18 hours
              { case: { $lte: ['$handlingTime', 86400000] }, then: '19-24 hours' },     // 24 hours
              { case: { $lte: ['$handlingTime', 172800000] }, then: '24-48 hours' },   // 48 hours
              { case: { $lte: ['$handlingTime', 259200000] }, then: '48-72 hours' },   // 72 hours
              { case: { $gt: ['$handlingTime', 259200000] }, then: '72+ hours' }       // 72+ hours
            ],
            default: 'Unknown'
          }
        }
      }
    },
    {
      $group: {
        _id: '$timeBucket',
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]);

  return stats;
};

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;