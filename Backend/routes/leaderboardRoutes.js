import express from "express";

import {
    getLeaderboard,
    getLeaderboardStatus,
    toggleLeaderboard,
    scheduleLeaderboard,
} from "../controllers/leaderboardController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", getLeaderboard);
router.get(
    "/status",
    verifyToken,
    requireRole("admin"),
    getLeaderboardStatus
);

router.post(
    "/toggle",
    verifyToken,
    requireRole("admin"),
    toggleLeaderboard
);

router.post(
    "/schedule",
    verifyToken,
    requireRole("admin"),
    scheduleLeaderboard
);

export default router;