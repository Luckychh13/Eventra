import Razorpay from "razorpay";
import crypto from "node:crypto";
import mongoose from "mongoose";

import Stall from "../models/Stall.js";
import StallCart from "../models/StallCart.js";
import StallOrder from "../models/StallOrder.js";
import { getFirebaseAuth } from "../config/firebase.js";

const hasRazorpayConfig = () =>
    Boolean(
        process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET
    );

const createRazorpayClient = () =>
    new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

const isAdmin = (user) =>
    user?.admin === true || user?.role === "admin";

const canManageStall = (stall, user) =>
    isAdmin(user) || stall.ownerUID === user?.uid;

const toPaise = (amount) =>
    Math.round(Number(amount) * 100);


const generateUniqueTokenNumber = async () => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        const tokenNumber = crypto.randomInt(1000, 10000);

        const existingOrder = await StallOrder.exists({
            tokenNumber,
        });

        if (!existingOrder) {
            return tokenNumber;
        }
    }

    throw Object.assign(
        new Error("Could not generate a unique order token."),
        { statusCode: 503 }
    );
};

const getCustomerName = async (uid, fallbackEmail) => {
    try {
        const auth = getFirebaseAuth();
        const userRecord = await auth.getUser(uid);

        return (
            userRecord.displayName ||
            userRecord.email ||
            fallbackEmail ||
            "User"
        );
    } catch {
        return fallbackEmail || "User";
    }
};

export const createStallOrder = async (req, res) => {
    try {
        const uid = req.user?.uid;

        if (!uid) {
            return res.status(401).json({
                success: false,
                error: "Authentication required.",
            });
        }

        if (!hasRazorpayConfig()) {
            return res.status(503).json({
                success: false,
                error: "Razorpay is not configured.",
            });
        }

        const requestedStallId = req.body?.stallId;

        if (
            requestedStallId &&
            !mongoose.isValidObjectId(requestedStallId)
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid stall ID.",
            });
        }

        let cart;

        if (requestedStallId) {
            cart = await StallCart.findOne({
                userId: uid,
                stallId: requestedStallId,
            });
        } else {
            
            const carts = await StallCart.find({
                userId: uid,
                "items.0": { $exists: true },
            });

            if (carts.length > 1) {
                return res.status(400).json({
                    success: false,
                    error: "stallId is required when you have carts for multiple stalls.",
                });
            }

            cart = carts[0] ?? null;
        }

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Stall cart is empty.",
            });
        }

        const stall = await Stall.findById(cart.stallId);

        if (!stall) {
            return res.status(404).json({
                success: false,
                error: "Stall not found.",
            });
        }

        let amountInPaise = 0;
        const orderItems = [];

        for (const cartItem of cart.items) {
            if (
                !cartItem.itemId ||
                !mongoose.isValidObjectId(cartItem.itemId)
            ) {
                return res.status(409).json({
                    success: false,
                    error: "The cart contains an invalid menu item.",
                });
            }

            if (
                !Number.isInteger(cartItem.quantity) ||
                cartItem.quantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    error: "The cart contains an invalid item quantity.",
                });
            }

            const menuItem = stall.menu.id(
                cartItem.itemId.toString()
            );

            if (!menuItem) {
                return res.status(409).json({
                    success: false,
                    error: "A cart item is no longer available in this stall's menu.",
                });
            }

            const priceInPaise = toPaise(menuItem.price);

            if (
                !Number.isFinite(Number(menuItem.price)) ||
                Number(menuItem.price) < 0 ||
                !Number.isSafeInteger(priceInPaise)
            ) {
                return res.status(409).json({
                    success: false,
                    error: `Invalid price for ${menuItem.name}.`,
                });
            }

            const subtotalInPaise =
                priceInPaise * cartItem.quantity;

            if (!Number.isSafeInteger(subtotalInPaise)) {
                return res.status(400).json({
                    success: false,
                    error: "The cart amount is too large.",
                });
            }

            amountInPaise += subtotalInPaise;

            if (!Number.isSafeInteger(amountInPaise)) {
                return res.status(400).json({
                    success: false,
                    error: "The cart amount is too large.",
                });
            }

            orderItems.push({
                itemId: menuItem._id,
                name: menuItem.name,
                price: priceInPaise / 100,
                quantity: cartItem.quantity,
                imageUrl: menuItem.imageUrl || "",
            });
        }

        if (amountInPaise <= 0) {
            return res.status(400).json({
                success: false,
                error: "The payable amount must be greater than zero.",
            });
        }

        const razorpay = createRazorpayClient();

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `stall_${Date.now()}`,
            notes: {
                uid,
                stallId: stall._id.toString(),
            },
        });

        const userName = await getCustomerName(
            uid,
            req.user?.email
        );

        
        const tokenNumber =
            await generateUniqueTokenNumber();

        const pendingOrder = new StallOrder({
            uid,
            userName,
            stallId: stall._id,
            items: orderItems,
            totalAmount: amountInPaise / 100,
            tokenNumber,
            razorpay_order_id: razorpayOrder.id,
            orderStatus: "PENDING",
            paymentStatus: "PENDING",
        });

        await pendingOrder.save();

        return res.status(200).json({
            order: razorpayOrder,
            totalAmount: amountInPaise / 100,
        });
    } catch (error) {
        console.error("Failed to create stall payment order:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            error:
                error.statusCode === 503
                    ? error.message
                    : "Failed to create stall payment order.",
        });
    }
};

export const verifyStallPayment = async (req, res) => {
    let session;

    try {
        const uid = req.user?.uid;

        if (!uid) {
            return res.status(401).json({
                success: false,
                error: "Authentication required.",
            });
        }

        if (!hasRazorpayConfig()) {
            return res.status(503).json({
                success: false,
                error: "Razorpay is not configured.",
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body ?? {};

        if (
            typeof razorpay_order_id !== "string" ||
            !razorpay_order_id.trim() ||
            typeof razorpay_payment_id !== "string" ||
            !razorpay_payment_id.trim() ||
            typeof razorpay_signature !== "string" ||
            !/^[a-f0-9]{64}$/i.test(razorpay_signature)
        ) {
            return res.status(400).json({
                success: false,
                error: "Missing or invalid Razorpay payment details.",
            });
        }

        const pendingOrder = await StallOrder.findOne({
            razorpay_order_id,
        });

        if (!pendingOrder) {
            return res.status(404).json({
                success: false,
                error: "Payment order not found.",
            });
        }

        if (pendingOrder.uid !== uid) {
            return res.status(403).json({
                success: false,
                error: "This payment order does not belong to you.",
            });
        }

        if (pendingOrder.paymentStatus === "SUCCESS") {
            if (
                pendingOrder.razorpay_payment_id !==
                razorpay_payment_id
            ) {
                return res.status(409).json({
                    success: false,
                    error: "This order has already been paid with a different payment.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Payment already verified.",
                tokenNumber: pendingOrder.tokenNumber,
                order: pendingOrder,
            });
        }

        if (pendingOrder.paymentStatus !== "PENDING") {
            return res.status(409).json({
                success: false,
                error: "This order is not awaiting payment verification.",
            });
        }
        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        const expectedBuffer = Buffer.from(
            expectedSignature,
            "hex"
        );

        const receivedBuffer = Buffer.from(
            razorpay_signature,
            "hex"
        );

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(
                expectedBuffer,
                receivedBuffer
            )
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid payment signature.",
            });
        }

        const razorpay = createRazorpayClient();

        const razorpayOrder =
            await razorpay.orders.fetch(razorpay_order_id);

        const expectedAmountInPaise = toPaise(
            pendingOrder.totalAmount
        );

        if (
            razorpayOrder.notes?.uid !== uid ||
            razorpayOrder.notes?.stallId !==
            pendingOrder.stallId.toString() ||
            razorpayOrder.amount !== expectedAmountInPaise ||
            razorpayOrder.currency !== "INR"
        ) {
            return res.status(400).json({
                success: false,
                error: "Razorpay order details do not match Eventra's saved order.",
            });
        }

        const payment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        if (
            payment.order_id !== razorpay_order_id ||
            payment.status !== "captured" ||
            payment.amount !== razorpayOrder.amount ||
            payment.currency !== "INR"
        ) {
            return res.status(400).json({
                success: false,
                error: "Payment has not been successfully captured.",
            });
        }

        session = await mongoose.startSession();

        let verifiedOrder = null;
        let alreadyProcessed = false;

        await session.withTransaction(async () => {
            const claimedOrder = await StallOrder.findOne({
                _id: pendingOrder._id,
                paymentStatus: "PENDING",
            }).session(session);

            if (!claimedOrder) {
                const latestOrder = await StallOrder.findById(
                    pendingOrder._id
                ).session(session);

                if (
                    latestOrder?.paymentStatus === "SUCCESS" &&
                    latestOrder.razorpay_payment_id ===
                    razorpay_payment_id
                ) {
                    verifiedOrder = latestOrder;
                    alreadyProcessed = true;
                    return;
                }

                throw Object.assign(
                    new Error(
                        "This order is already being processed."
                    ),
                    { statusCode: 409 }
                );
            }

            claimedOrder.razorpay_payment_id =
                razorpay_payment_id;
            claimedOrder.razorpay_signature =
                razorpay_signature;
            claimedOrder.paymentStatus = "SUCCESS";

            await claimedOrder.save({ session });

            const cart = await StallCart.findOne({
                userId: uid,
                stallId: claimedOrder.stallId,
            }).session(session);

            if (cart) {
                for (const purchasedItem of claimedOrder.items) {
                    const cartItem = cart.items.find(
                        (item) =>
                            item.itemId.toString() ===
                            purchasedItem.itemId.toString()
                    );

                    if (!cartItem) {
                        continue;
                    }

                    cartItem.quantity -= purchasedItem.quantity;
                }

                cart.items = cart.items.filter(
                    (item) => item.quantity > 0
                );

                const remainingTotalInPaise =
                    cart.items.reduce((sum, item) => {
                        return (
                            sum +
                            toPaise(item.price) * item.quantity
                        );
                    }, 0);

                cart.totalPrice =
                    remainingTotalInPaise / 100;

                await cart.save({ session });
            }

            verifiedOrder = claimedOrder;
        });

        if (alreadyProcessed) {
            return res.status(200).json({
                success: true,
                message: "Payment already verified.",
                tokenNumber: verifiedOrder.tokenNumber,
                order: verifiedOrder,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully.",
            tokenNumber: verifiedOrder.tokenNumber,
            order: verifiedOrder,
        });
    } catch (error) {
        console.error("Failed to verify stall payment:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            error:
                error.statusCode === 409
                    ? error.message
                    : "Failed to verify stall payment.",
        });
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

export const getStallOrders = async (req, res) => {
    try {
        const { stallId } = req.params;

        if (!req.user?.uid) {
            return res.status(401).json({
                success: false,
                error: "Authentication required.",
            });
        }

        if (!mongoose.isValidObjectId(stallId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid stall ID.",
            });
        }

        const stall = await Stall.findById(stallId);

        if (!stall) {
            return res.status(404).json({
                success: false,
                error: "Stall not found.",
            });
        }

        if (!canManageStall(stall, req.user)) {
            return res.status(403).json({
                success: false,
                error: "You cannot access orders for this stall.",
            });
        }

        const orders = await StallOrder.find({
            stallId,
            paymentStatus: "SUCCESS",
        }).sort({ createdAt: -1 });

        const totalSales = orders.reduce(
            (sum, order) =>
                sum + Number(order.totalAmount || 0),
            0
        );

        return res.status(200).json({
            success: true,
            message:
                orders.length === 0
                    ? "No orders found for this stall."
                    : undefined,
            stallId,
            totalSales: Math.round(totalSales * 100) / 100,
            orderCount: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Failed to fetch stall orders:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to fetch stall orders.",
        });
    }
};

export const getUserStallOrders = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!req.user?.uid) {
            return res.status(401).json({
                success: false,
                error: "Authentication required.",
            });
        }

        if (uid !== req.user.uid) {
            return res.status(403).json({
                success: false,
                error: "You cannot access another user's orders.",
            });
        }

        const orders = await StallOrder.find({
            uid,
            paymentStatus: "SUCCESS",
        })
            .sort({ createdAt: -1 })
            .populate("stallId", "name")
            .lean();

        return res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error(
            "Failed to fetch user stall orders:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Failed to fetch user stall orders.",
        });
    }
};