import express from "express";

import {
    getFirebaseUsers,
} from "../controllers/firebaseController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get(
    "/users",
    verifyToken,
    requireRole("admin"),
    getFirebaseUsers
);

export default router;