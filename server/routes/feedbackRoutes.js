import express from 'express';
import { submitFeedback, getFeedbackStats } from '../controllers/feedbackController.js';

const router = express.Router();

router.get('/', submitFeedback);        // ?rating=happy
router.get('/stats', getFeedbackStats); // Optional: get counts

export default router;