import express from "express";

import {
    createAnnouncement,
    getAllAnnouncements,
    editAnnouncement,
    deleteAnnouncement,
} from "../controllers/announcementController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", getAllAnnouncements);

router.post(
    "/",
    verifyToken,
    requireRole("admin"),
    createAnnouncement
);

router.put(
    "/:id",
    verifyToken,
    requireRole("admin"),
    editAnnouncement
);

router.delete(
    "/:id",
    verifyToken,
    requireRole("admin"),
    deleteAnnouncement
);

export default router;