import express from "express";

import {
    addPerformer,
    getAllPerformers,
    getPerformersByEvent,
    getPerformerById,
    updatePerformer,
    deletePerformer,
} from "../controllers/performerController.js";

import upload from "../middleware/uploadMiddleware.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", getAllPerformers);
router.get("/event/:eventId", getPerformersByEvent);

router.get("/:id", getPerformerById);

router.post(
    "/",
    verifyToken,
    requireRole("admin"),
    upload.single("image"),
    addPerformer
);

router.put(
    "/:id",
    verifyToken,
    requireRole("admin"),
    upload.single("image"),
    updatePerformer
);

router.delete(
    "/:id",
    verifyToken,
    requireRole("admin"),
    deletePerformer
);

export default router;