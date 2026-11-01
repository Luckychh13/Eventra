import express from "express";

import {
    makeAdmin,
    getAdmins,
    removeAdmin,
} from "../controllers/adminController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post(
    "/make-admin",
    verifyToken,
    requireRole("admin"),
    makeAdmin
);

router.get(
    "/list-admins",
    verifyToken,
    requireRole("admin"),
    getAdmins
);

router.post(
    "/remove-admin",
    verifyToken,
    requireRole("admin"),
    removeAdmin
);

export default router;