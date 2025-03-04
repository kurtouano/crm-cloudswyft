import express from "express";
import { createEmail, getEmails } from "../controllers/emailController.js";

const router = express.Router();

router.post('/', createEmail);
router.get('/', getEmails);

export default router;