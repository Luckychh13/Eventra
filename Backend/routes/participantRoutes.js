import express from "express";

import {
  createParticipant,
  editParticipant,
  deleteParticipant,
  listParticipants,
  listVotingParticipants,
} from "../controllers/participantController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  requireRole("admin"),
  listParticipants
);

router.get(
  "/voting",
  verifyToken,
  listVotingParticipants
);
router.post(
  "/",
  verifyToken,
  requireRole("admin"),
  upload.single("photo"),
  createParticipant
);
router.put(
  "/:id",
  verifyToken,
  requireRole("admin"),
  upload.single("photo"),
  editParticipant
);
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  deleteParticipant
);

export default router;