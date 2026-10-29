import mongoose from "mongoose";

import Stall from "../models/Stall.js";
import StallCart from "../models/StallCart.js";

export const addStallItemToCart = async (req, res, next) => {
    try {
        const { stallId, itemId } = req.body;
        const userId = req.user.uid;

        if (
            !mongoose.isValidObjectId(stallId) ||
            !mongoose.isValidObjectId(itemId)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid stall ID and menu item ID are required.",
            });
        }

        const stall = await Stall.findById(stallId);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        const menuItem = stall.menu.id(itemId);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found in this stall.",
            });
        }

        if (
            !Number.isFinite(menuItem.price) ||
            menuItem.price < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "This menu item's price is invalid.",
            });
        }
        let cart = await StallCart.findOne({
            userId,
            stallId,
        });

        if (!cart) {
            cart = new StallCart({
                userId,
                stallId,
                items: [],
                totalPrice: 0,
            });
        }

        const existingItem = cart.items.find(
            (cartItem) =>
                cartItem.itemId.toString() === menuItem._id.toString()
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                itemId: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                imageUrl: menuItem.imageUrl,
                quantity: 1,
            });
        }

        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item added to stall cart successfully.",
            items: cart.items,
            totalPrice: cart.totalPrice,
        });
    } catch (error) {
        return next(error);
    }
};

export const updateStallCartItem = async (req, res, next) => {
    try {
        const { stallId, itemId, quantity } = req.body;
        const userId = req.user.uid;

        if (
            !mongoose.isValidObjectId(stallId) ||
            !mongoose.isValidObjectId(itemId)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid stall ID and menu item ID are required.",
            });
        }

        const parsedQuantity = Number(quantity);

        if (
            !Number.isInteger(parsedQuantity) ||
            parsedQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer.",
            });
        }

        const cart = await StallCart.findOne({
            userId,
            stallId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Stall cart not found.",
            });
        }

        const cartItem = cart.items.find(
            (item) => item.itemId.toString() === itemId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Item not found in this cart.",
            });
        }

        const stall = await Stall.findById(stallId);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        const menuItem = stall.menu.id(itemId);

        if (!menuItem) {
            return res.status(409).json({
                success: false,
                message: "This item is no longer available in the stall menu.",
            });
        }

        if (
            !Number.isFinite(menuItem.price) ||
            menuItem.price < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "This menu item's price is invalid.",
            });
        }

        cartItem.quantity = parsedQuantity;
        cartItem.name = menuItem.name;
        cartItem.price = menuItem.price;
        cartItem.imageUrl = menuItem.imageUrl;

        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();

        return res.json({
            success: true,
            message: "Stall cart item updated successfully.",
            items: cart.items,
            totalPrice: cart.totalPrice,
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteStallCartItem = async (req, res, next) => {
    try {
        const { stallId, itemId } = req.body;
        const userId = req.user.uid;

        if (
            !mongoose.isValidObjectId(stallId) ||
            !mongoose.isValidObjectId(itemId)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid stall ID and menu item ID are required.",
            });
        }

        const cart = await StallCart.findOne({
            userId,
            stallId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Stall cart not found.",
            });
        }

        const cartItemIndex = cart.items.findIndex(
            (item) => item.itemId.toString() === itemId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in this cart.",
            });
        }

        cart.items.splice(cartItemIndex, 1);

        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await cart.save();

        return res.json({
            success: true,
            message: "Item removed from stall cart successfully.",
            items: cart.items,
            totalPrice: cart.totalPrice,
        });
    } catch (error) {
        return next(error);
    }
};

export const getStallCart = async (req, res, next) => {
    try {
        const { uid, stallId } = req.params;
        const userId = req.user.uid;

        if (uid !== userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot access another user's cart.",
            });
        }

        if (!mongoose.isValidObjectId(stallId)) {
            return res.status(400).json({
                success: false,
                message: "A valid stall ID is required.",
            });
        }

        const cart = await StallCart.findOne({
            userId,
            stallId,
        });

        if (!cart) {
            return res.json({
                success: true,
                items: [],
                totalPrice: 0,
            });
        }

        return res.json({
            success: true,
            cart,
        });
    } catch (error) {
        return next(error);
    }
};

export const clearStallCart = async (req, res, next) => {
    try {
        const { stallId } = req.body;
        const userId = req.user.uid;

        if (!mongoose.isValidObjectId(stallId)) {
            return res.status(400).json({
                success: false,
                message: "A valid stall ID is required.",
            });
        }

        const cart = await StallCart.findOneAndDelete({
            userId,
            stallId,
        });

        return res.json({
            success: true,
            message: "Stall cart cleared successfully.",
        });
    } catch (error) {
        return next(error);
    }
};


