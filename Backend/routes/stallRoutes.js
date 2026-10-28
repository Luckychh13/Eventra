
import express from "express";

import upload from "../middleware/uploadMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

import {
    createStall,
    getStalls,
    getStallById,
    updateStall,
    deleteStall,
    generateToken,
    resetTokens,
    addItem,
    updateItem,
    deleteItem,
    getMyStalls,
    getOwnerDashboard,
    markOrderCompleted,
} from "../controllers/stallController.js";

const router = express.Router();

router.get("/my-stalls", verifyToken, getMyStalls);

router.get(
    "/owner/dashboard",
    verifyToken,
    requireRole("stallOwner"),
    getOwnerDashboard
);

router.get("/", getStalls);
router.get("/:id", getStallById);

router.post(
    "/",
    verifyToken,
    requireRole("admin"),
    upload.single("image"),
    createStall
);

router.put(
    "/:id",
    verifyToken,
    requireRole("admin"),
    upload.single("image"),
    updateStall
);

router.delete(
    "/:id",
    verifyToken,
    requireRole("admin"),
    deleteStall
);

router.post("/:id/token", generateToken);

router.post(
    "/:id/reset",
    verifyToken,
    requireRole("admin", "stallOwner"),
    resetTokens
);

router.post(
    "/:id/item",
    verifyToken,
    requireRole("admin", "stallOwner"),
    upload.single("image"),
    addItem
);

router.put(
    "/:id/item/:itemId",
    verifyToken,
    requireRole("admin", "stallOwner"),
    upload.single("image"),
    updateItem
);

router.delete(
    "/:id/item/:itemId",
    verifyToken,
    requireRole("admin", "stallOwner"),
    deleteItem
);
router.put(
    "/order/:id/complete",
    verifyToken,
    requireRole("admin", "stallOwner"),
    markOrderCompleted
);

export default router;
