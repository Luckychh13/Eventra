import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Pricing from "../models/Pricing.js";

const authorizeCartOwner = (req, res, requestedUid) => {
    const authenticatedUid = req.user?.uid;

    if (!authenticatedUid) {
        res.status(401).json({ error: "Authentication required" });
        return null;
    }

    if (!requestedUid) {
        res.status(400).json({ error: "uid is required" });
        return null;
    }

    if (requestedUid !== authenticatedUid) {
        res.status(403).json({ error: "You cannot access another user's cart" });
        return null;
    }

    return authenticatedUid;
};

const calculateCartTotal = async (cart) => {
    const pricingIds = cart.items.map((item) => item.pricingId);

    const pricingDocs = await Pricing.find({
        _id: { $in: pricingIds },
    });

    cart.totalPrice = cart.items.reduce((total, item) => {
        const pricing = pricingDocs.find(
            (entry) => entry._id.toString() === item.pricingId.toString()
        );

        const price = pricing?.finalPrice ?? pricing?.price ?? 0;

        return total + item.quantity * price;
    }, 0);
};

const getPopulatedCart = async (cartId) => {
    return Cart.findById(cartId).populate("items.pricingId");
};

export const addToCart = async (req, res) => {
    try {
        const { uid, eventId, pricingId, quantity = 1 } = req.body;

        const ownerUid = authorizeCartOwner(req, res, uid);
        if (!ownerUid) return;

        if (
            !mongoose.isValidObjectId(eventId) ||
            !mongoose.isValidObjectId(pricingId)
        ) {
            return res.status(400).json({
                error: "Invalid event ID or pricing ID",
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                error: "Quantity must be a positive integer",
            });
        }

        const pricing = await Pricing.findById(pricingId);

        if (!pricing) {
            return res.status(404).json({ error: "Ticket type not found" });
        }

        if (pricing.event.toString() !== eventId) {
            return res.status(400).json({
                error: "Ticket pricing does not belong to this event",
            });
        }

        let cart = await Cart.findOne({ uid: ownerUid });

        if (!cart) {
            cart = new Cart({
                uid: ownerUid,
                eventId,
                items: [],
                totalPrice: 0,
            });
        } else if (cart.eventId.toString() !== eventId) {
            return res.status(400).json({
                error: "Your cart already belongs to another event",
            });
        }

        const existingItem = cart.items.find(
            (item) => item.pricingId.toString() === pricingId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ pricingId, quantity });
        }

        await calculateCartTotal(cart);
        await cart.save();

        const populatedCart = await getPopulatedCart(cart._id);

        return res.status(200).json({
            success: true,
            message: "Added to cart",
            cart: populatedCart,
        });
    } catch (error) {
        console.error("Failed to add item to cart:", error);

        return res.status(500).json({
            error: "Failed to add item to cart",
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const { uid } = req.params;

        const ownerUid = authorizeCartOwner(req, res, uid);
        if (!ownerUid) return;

        const cart = await Cart.findOne({ uid: ownerUid }).populate(
            "items.pricingId"
        );

        if (!cart) {
            return res.status(200).json({
                uid: ownerUid,
                eventId: null,
                items: [],
                totalPrice: 0,
            });
        }

        return res.status(200).json(cart);
    } catch (error) {
        console.error("Failed to fetch cart:", error);

        return res.status(500).json({
            error: "Failed to fetch cart",
        });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { uid, pricingId, action } = req.body;

        const ownerUid = authorizeCartOwner(req, res, uid);
        if (!ownerUid) return;

        if (!mongoose.isValidObjectId(pricingId)) {
            return res.status(400).json({ error: "Invalid pricing ID" });
        }

        if (!["increase", "decrease"].includes(action)) {
            return res.status(400).json({
                error: "Action must be increase or decrease",
            });
        }

        const cart = await Cart.findOne({ uid: ownerUid });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const item = cart.items.find(
            (entry) => entry.pricingId.toString() === pricingId
        );

        if (!item) {
            return res.status(404).json({
                error: "Item not found in cart",
            });
        }

        if (action === "increase") {
            item.quantity += 1;
        } else {
            item.quantity -= 1;
        }

        if (item.quantity <= 0) {
            cart.items = cart.items.filter(
                (entry) => entry.pricingId.toString() !== pricingId
            );
        }

        await calculateCartTotal(cart);
        await cart.save();

        const populatedCart = await getPopulatedCart(cart._id);

        return res.status(200).json({
            message: "Cart updated successfully",
            cart: populatedCart,
        });
    } catch (error) {
        console.error("Failed to update cart:", error);

        return res.status(500).json({
            error: "Failed to update cart",
        });
    }
};

export const deleteCartItem = async (req, res) => {
    try {
        const { uid, pricingId } = req.body;

        const ownerUid = authorizeCartOwner(req, res, uid);
        if (!ownerUid) return;

        if (!mongoose.isValidObjectId(pricingId)) {
            return res.status(400).json({ error: "Invalid pricing ID" });
        }

        const cart = await Cart.findOne({ uid: ownerUid });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const originalCount = cart.items.length;

        cart.items = cart.items.filter(
            (item) => item.pricingId.toString() !== pricingId
        );

        if (cart.items.length === originalCount) {
            return res.status(404).json({
                error: "Item not found in cart",
            });
        }

        await calculateCartTotal(cart);
        await cart.save();

        const populatedCart = await getPopulatedCart(cart._id);

        return res.status(200).json({
            message: "Item deleted successfully",
            cart: populatedCart,
        });
    } catch (error) {
        console.error("Failed to delete cart item:", error);

        return res.status(500).json({
            error: "Failed to delete cart item",
        });
    }
};
