import express from "express";
import {
    addToCart,
    updateCartItem,
    deleteCartItem,
    getCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.put("/update", verifyToken, updateCartItem);
router.delete("/delete", verifyToken, deleteCartItem);
router.get("/:uid", verifyToken, getCart);

export default router;