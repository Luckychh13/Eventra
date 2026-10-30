import express from "express";

import {
    createStallOrder,
    verifyStallPayment,
    getStallOrders,
    getUserStallOrders,
} from "../controllers/stallPaymentController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", verifyToken, createStallOrder);

router.post("/verify-payment", verifyToken, verifyStallPayment);

router.get("/stall/:stallId", verifyToken, getStallOrders);

router.get("/user-orders/:uid", verifyToken, getUserStallOrders);

export default router;