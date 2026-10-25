import express from "express";

import {
    createEventOrder,
    verifyEventPayment,
    getUserOrders,
    getEventOrders,
    getAllEventOrders,
    allotEventTicket,
} from "../controllers/eventPaymentController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/user-orders/:uid", verifyToken, getUserOrders);

router.post("/create-order", verifyToken, createEventOrder);
router.post("/verify-payment", verifyToken, verifyEventPayment);

router.get("/event/:eventId", verifyToken, requireRole("admin"), getEventOrders);
router.get("/all-orders", verifyToken, requireRole("admin"), getAllEventOrders);

router.put(
    "/allot/:orderId",
    verifyToken,
    requireRole("admin"),
    allotEventTicket
);

export default router;