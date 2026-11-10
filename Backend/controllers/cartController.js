import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Pricing from "../models/Pricing.js";

const authorizeCartOwner = (req, res, requestedUid) => {
    const authenticatedUid = req.user?.uid;

    if (!authenticatedUid) {
        res.status(401).json({
            error: "Authentication required",
        });
        return null;
    }

    if (!requestedUid) {
        res.status(400).json({
            error: "uid is required",
        });
        return null;
    }

    if (requestedUid !== authenticatedUid) {
        res.status(403).json({
            error: "You cannot access another user's cart",
        });
        return null;
    }

    return authenticatedUid;
};

const getEffectivePrice = (pricing) => {
    const offerIsValid =
        pricing.offer?.active === true &&
        pricing.offer?.expiry &&
        new Date(pricing.offer.expiry) > new Date();

    return offerIsValid
        ? pricing.finalPrice ?? pricing.price
        : pricing.price;
};

const calculateCartTotal = async (cart) => {
    const pricingIds = cart.items.map(
        (item) => item.pricingId
    );

    const pricingDocs = await Pricing.find({
        _id: { $in: pricingIds },
    });

    const pricingMap = new Map(
        pricingDocs.map((pricing) => [
            pricing._id.toString(),
            pricing,
        ])
    );

    cart.totalPrice = cart.items.reduce((total, item) => {
        const pricing = pricingMap.get(
            item.pricingId.toString()
        );

        if (!pricing) {
            return total;
        }

        return total + item.quantity * getEffectivePrice(pricing);
    }, 0);
};

const getPopulatedCart = async (cartId) => {
    return Cart.findById(cartId).populate({
        path: "items.pricingId",
        populate: {
            path: "event",
            select: "title day date time location imageUrl",
        },
    });
};

const getAvailableTickets = (pricing) => {
    return Math.max(
        0,
        pricing.totalTickets - pricing.ticketsSold
    );
};

export const addToCart = async (req, res) => {
    try {
        const {
            uid,
            pricingId,
            quantity = 1,
        } = req.body;

        const ownerUid = authorizeCartOwner(req, res, uid);

        if (!ownerUid) return;

        if (!mongoose.isValidObjectId(pricingId)) {
            return res.status(400).json({
                error: "Invalid pricing ID",
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                error: "Quantity must be a positive integer",
            });
        }

        const pricing = await Pricing.findById(pricingId);

        if (!pricing) {
            return res.status(404).json({
                error: "Ticket type not found",
            });
        }

        let cart = await Cart.findOne({
            uid: ownerUid,
        });

        const existingItem = cart?.items.find(
            (item) =>
                item.pricingId.toString() === pricingId
        );

        const existingQuantity = existingItem
            ? existingItem.quantity
            : 0;

        const availableTickets = getAvailableTickets(pricing);

        if (existingQuantity + quantity > availableTickets) {
            return res.status(409).json({
                error: `Only ${availableTickets} ${pricing.ticketType} tickets are currently available`,
            });
        }

        if (!cart) {
            cart = new Cart({
                uid: ownerUid,
                items: [],
                totalPrice: 0,
            });
        }

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                pricingId,
                quantity,
            });
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

        const cart = await Cart.findOne({
            uid: ownerUid,
        }).populate({
            path: "items.pricingId",
            populate: {
                path: "event",
                select: "title day date time location imageUrl",
            },
        });

        if (!cart) {
            return res.status(200).json({
                uid: ownerUid,
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
        const {
            uid,
            pricingId,
            action,
        } = req.body;

        const ownerUid = authorizeCartOwner(req, res, uid);

        if (!ownerUid) return;

        if (!mongoose.isValidObjectId(pricingId)) {
            return res.status(400).json({
                error: "Invalid pricing ID",
            });
        }

        if (!["increase", "decrease"].includes(action)) {
            return res.status(400).json({
                error: "Action must be increase or decrease",
            });
        }

        const cart = await Cart.findOne({
            uid: ownerUid,
        });

        if (!cart) {
            return res.status(404).json({
                error: "Cart not found",
            });
        }

        const item = cart.items.find(
            (entry) =>
                entry.pricingId.toString() === pricingId
        );

        if (!item) {
            return res.status(404).json({
                error: "Item not found in cart",
            });
        }

        if (action === "increase") {
            const pricing = await Pricing.findById(pricingId);

            if (!pricing) {
                return res.status(404).json({
                    error: "Ticket type not found",
                });
            }

            const availableTickets = getAvailableTickets(pricing);

            if (item.quantity + 1 > availableTickets) {
                return res.status(409).json({
                    error: `Only ${availableTickets} ${pricing.ticketType} tickets are currently available`,
                });
            }

            item.quantity += 1;
        } else {
            item.quantity -= 1;
        }

        if (item.quantity <= 0) {
            cart.items = cart.items.filter(
                (entry) =>
                    entry.pricingId.toString() !== pricingId
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
        const {
            uid,
            pricingId,
        } = req.body;

        const ownerUid = authorizeCartOwner(req, res, uid);

        if (!ownerUid) return;

        if (!mongoose.isValidObjectId(pricingId)) {
            return res.status(400).json({
                error: "Invalid pricing ID",
            });
        }

        const cart = await Cart.findOne({
            uid: ownerUid,
        });

        if (!cart) {
            return res.status(404).json({
                error: "Cart not found",
            });
        }

        const originalCount = cart.items.length;

        cart.items = cart.items.filter(
            (item) =>
                item.pricingId.toString() !== pricingId
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