import express from "express";

import {
  addFeedback,
  getAllFeedback,
} from "../controllers/feedbackController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post("/", addFeedback);

// Admin only: retrieve all feedback
router.get(
  "/",
  verifyToken,
  requireRole("admin"),
  getAllFeedback
);

export default router;