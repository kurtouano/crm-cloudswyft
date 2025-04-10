import express from 'express';
import { createNewsletters, monitorClicks, getClickData } from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/create-newsletter", createNewsletters);
router.get("/create-newsletter", createNewsletters);
router.get("/track/:serviceNum", monitorClicks);
router.get("/click-data", getClickData);

export default router;