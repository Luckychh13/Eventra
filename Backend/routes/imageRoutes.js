import express from "express";

import {
    createImage,
    getImages,
    updateImage,
    deleteImage,
} from "../controllers/imageController.js";

import upload from "../middleware/uploadMiddleware.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", getImages);

// Create image (admin only)
router.post(
    "/",
    verifyToken,
    requireRole("admin"),
    upload.single("image"),
    createImage
);

router.put(
    "/:id",
    verifyToken,
    requireRole("admin"),
    upload.single("image"),
    updateImage
);

router.delete(
    "/:id",
    verifyToken,
    requireRole("admin"),
    deleteImage
);

export default router;
