import express from 'express';
import {
  handleNewEmail,
  handleAgentReply,
  resolveTicket,
  getTicketStats,
  getTicketByThread,
  reopenTicket

} from '../controllers/ticketController.js';

const router = express.Router();

// Handle new incoming email
router.post('/handle-email', handleNewEmail);

// Update status when agent replies
router.post('/handle-reply', handleAgentReply);

// Resolve a ticket
router.post('/:threadId/resolve', resolveTicket);

// Get ticket statistics
router.get('/stats', getTicketStats);

// Get ticket by thread ID
router.get('/:threadId', getTicketByThread);

// In your routes file
router.post('/:threadId/reopen', reopenTicket);

export default router;