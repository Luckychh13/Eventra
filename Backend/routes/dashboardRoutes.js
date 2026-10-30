import express from "express";

import {
    getDashboardSummary,
} from "../controllers/dashboardController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get(
    "/summary",
    verifyToken,
    requireRole("admin"),
    getDashboardSummary
);

export default router;