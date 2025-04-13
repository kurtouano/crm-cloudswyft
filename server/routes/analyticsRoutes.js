import express from "express";
import { fetchHandlingTimeData } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/handling-time", fetchHandlingTimeData);  // Fetch all leads

export default router;
