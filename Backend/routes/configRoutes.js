import express from "express";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  setVotingLive,
  getVotingStatus,
} from "../controllers/configController.js";

const router = express.Router();

router.get("/status", getVotingStatus);

router.post(
  "/toggle/live",
  verifyToken,
  requireRole("admin"),
  setVotingLive
);

export default router;