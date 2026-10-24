import express from "express";

import { verifyToken } from "../middleware/authMiddleware.js";

import {
  castVote,
  getVotes,
  getUserVotes,
  getVotingStats,
} from "../controllers/voteController.js";

const router = express.Router();

router.post("/:participantId", verifyToken, castVote);

router.get("/all", getVotes);
router.get("/user", verifyToken, getUserVotes);
router.get("/", getVotingStats);

export default router;