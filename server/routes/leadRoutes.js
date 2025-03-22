import express from "express";
import { getLeads, addLead, updateLeadStage, importLead, deleteLead, updateLeadStatus} from "../controllers/leadController.js";

const router = express.Router();

router.get("/", getLeads);  // Fetch all leads
router.post("/", addLead);  // Add new lead (for testing)
router.post("/upload", importLead);  // Import leads
router.put("/:id", updateLeadStage);  // Update lead stage
router.delete("/leadID/:id", deleteLead);  // ✅ Change route to `/leadID/:id`
router.patch("/status/:leadID", updateLeadStatus) // Update status

export default router;
