import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.get(
  "/admin-check",
  verifyToken,
  requireRole("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access verified.",
    });
  }
);

export default router;
