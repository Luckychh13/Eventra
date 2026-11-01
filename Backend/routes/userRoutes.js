import express from "express";

import { getAllUsers } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get(
    "/all",
    verifyToken,
    requireRole("admin"),
    getAllUsers
);

export default router;