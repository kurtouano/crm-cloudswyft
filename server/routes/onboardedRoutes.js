import express from "express";
import { onBoardedClients, addToOnboarded, getOnboardedStats } from "../controllers/onboardedController.js";

const router = express.Router(); 

router.get("/", onBoardedClients);
router.post("/", addToOnboarded);
router.get("/stats", getOnboardedStats);

export default router;