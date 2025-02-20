import express from "express";
import { getLeads, addLead, updateLeadStage } from "../controllers/leadController.js";

const router = express.Router();

router.get("/", getLeads);  // Fetch all leads
router.post("/", addLead);  // Add new lead (for testing)
router.put("/:id", updateLeadStage);  // ✅ Update lead stage when moved in Kanban

export default router;
