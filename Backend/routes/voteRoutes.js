import express from "express";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  castVote,
  getVotes,
  getUserVotes,
  getVotingStats,
} from "../controllers/voteController.js";

const router = express.Router();

router.post("/:participantId", verifyToken, castVote);

router.get(
  "/all",
  verifyToken,
  requireRole("admin"),
  getVotes
);

router.get(
  "/user",
  verifyToken,
  getUserVotes
);

router.get(
  "/",
  verifyToken,
  requireRole("admin"),
  getVotingStats
);
export default router;