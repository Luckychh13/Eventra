import Razorpay from "razorpay";
import Cart from "../models/Cart.js";
import crypto from "node:crypto";
import mongoose from "mongoose";
import EventOrder from "../models/EventOrder.js";
import Pricing from "../models/Pricing.js";
import Event from "../models/Event.js";

const getEffectivePrice = (pricing) => {
    const offerIsValid =
        pricing.offer?.active === true &&
        pricing.offer?.expiry &&
        new Date(pricing.offer.expiry) > new Date();

    return offerIsValid
        ? pricing.finalPrice ?? pricing.price
        : pricing.price;
};

export const createEventOrder = async (req, res) => {
    try {
        const uid = req.user?.uid;

        if (!uid) {
            return res.status(401).json({
                error: "Authentication required",
            });
        }

        if (
            !process.env.RAZORPAY_KEY_ID ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {
            return res.status(503).json({
                error: "Razorpay is not configured",
            });
        }

        const cart = await Cart.findOne({ uid }).populate(
            "items.pricingId"
        );

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                error: "Cart is empty",
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const pricing = item.pricingId;

            if (!pricing) {
                return res.status(400).json({
                    error: "A ticket pricing record no longer exists",
                });
            }

            if (
                pricing.event.toString() !== cart.eventId.toString()
            ) {
                return res.status(400).json({
                    error: "Cart contains a ticket for another event",
                });
            }

            if (
                !Number.isInteger(item.quantity) ||
                item.quantity < 1
            ) {
                return res.status(400).json({
                    error: "Invalid ticket quantity",
                });
            }

            const availableTickets =
                pricing.totalTickets - pricing.ticketsSold;

            if (item.quantity > availableTickets) {
                return res.status(400).json({
                    error: `Not enough ${pricing.ticketType} tickets available`,
                });
            }

            const price = getEffectivePrice(pricing);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    error: "Invalid ticket price",
                });
            }

            totalAmount += item.quantity * price;

            orderItems.push({
                eventId: cart.eventId,
                pricingId: pricing._id,
                quantity: item.quantity,
                price,
            });
        }

        const amountInPaise = Math.round(totalAmount * 100);

        if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
            return res.status(400).json({
                error: "Cart total must be greater than zero",
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `event_${Date.now()}`,
            notes: {
                uid,
                eventId: cart.eventId.toString(),
            },
        });

        const pendingOrder = new EventOrder({
            uid,
            items: orderItems,
            amount: amountInPaise / 100,
            razorpay_order_id: order.id,
            paymentStatus: "PENDING",
        });

        await pendingOrder.save();

        return res.status(200).json({
            order,
            totalAmount: amountInPaise / 100,
        });
    } catch (error) {
        console.error("Failed to create Razorpay order:", error);

        return res.status(500).json({
            error: "Failed to create payment order",
        });
    }
};

export const verifyEventPayment = async (req, res) => {
    let session;

    try {
        const uid = req.user?.uid;

        if (!uid) {
            return res.status(401).json({
                error: "Authentication required",
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string" ||
            !/^[a-f0-9]{64}$/i.test(razorpay_signature)
        ) {
            return res.status(400).json({
                error: "Missing or invalid Razorpay payment details",
            });
        }

        if (
            !process.env.RAZORPAY_KEY_ID ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {
            return res.status(503).json({
                error: "Razorpay is not configured",
            });
        }

        const pendingOrder = await EventOrder.findOne({
            razorpay_order_id,
        });

        if (!pendingOrder) {
            return res.status(404).json({
                error: "Payment order not found",
            });
        }

        if (pendingOrder.uid !== uid) {
            return res.status(403).json({
                error: "This payment order does not belong to you",
            });
        }
        if (pendingOrder.paymentStatus === "SUCCESS") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                order: pendingOrder,
            });
        }

        if (pendingOrder.paymentStatus !== "PENDING") {
            return res.status(409).json({
                error: "This order is not awaiting payment verification",
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const receivedBuffer = Buffer.from(razorpay_signature, "hex");

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                error: "Invalid payment signature",
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const razorpayOrder =
            await razorpay.orders.fetch(razorpay_order_id);

        if (
            razorpayOrder.notes?.uid !== uid ||
            razorpayOrder.amount !== Math.round(pendingOrder.amount * 100) ||
            razorpayOrder.currency !== "INR"
        ) {
            return res.status(400).json({
                error: "Razorpay order details do not match Eventra's order",
            });
        }

        const payment =
            await razorpay.payments.fetch(razorpay_payment_id);

        if (
            payment.order_id !== razorpay_order_id ||
            payment.status !== "captured" ||
            payment.amount !== razorpayOrder.amount ||
            payment.currency !== "INR"
        ) {
            return res.status(400).json({
                error: "Payment has not been successfully captured",
            });
        }

        if (!pendingOrder.items.length) {
            return res.status(400).json({
                error: "The saved order contains no ticket items",
            });
        }

        const eventId = pendingOrder.items[0].eventId;
        const totalTickets = pendingOrder.items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        if (
            pendingOrder.items.some(
                (item) =>
                    item.eventId.toString() !== eventId.toString() ||
                    !Number.isInteger(item.quantity) ||
                    item.quantity < 1 ||
                    !Number.isFinite(item.price) ||
                    item.price < 0
            )
        ) {
            return res.status(400).json({
                error: "The saved order contains invalid ticket items",
            });
        }

        session = await mongoose.startSession();
        session.startTransaction();

        try {
            const claimedOrder = await EventOrder.findOne({
                _id: pendingOrder._id,
                paymentStatus: "PENDING",
            }).session(session);

            if (!claimedOrder) {
                throw Object.assign(
                    new Error("Order is already being processed"),
                    { statusCode: 409 }
                );
            }

            for (const item of pendingOrder.items) {
                const updatedPricing = await Pricing.findOneAndUpdate(
                    {
                        _id: item.pricingId,
                        event: item.eventId,
                        $expr: {
                            $gte: [
                                { $subtract: ["$totalTickets", "$ticketsSold"] },
                                item.quantity,
                            ],
                        },
                    },
                    {
                        $inc: { ticketsSold: item.quantity },
                    },
                    {
                        new: true,
                        session,
                    }
                );

                if (!updatedPricing) {
                    throw Object.assign(
                        new Error("Not enough tickets available"),
                        { statusCode: 409 }
                    );
                }
            }

            const updatedEvent = await Event.findOneAndUpdate(
                {
                    _id: eventId,
                    ticketsAvailable: { $gte: totalTickets },
                },
                {
                    $inc: {
                        ticketsAvailable: -totalTickets,
                        ticketsSold: totalTickets,
                    },
                },
                {
                    new: true,
                    session,
                }
            );

            if (!updatedEvent) {
                throw Object.assign(
                    new Error("Event ticket availability is insufficient"),
                    { statusCode: 409 }
                );
            }

            claimedOrder.razorpay_payment_id = razorpay_payment_id;
            claimedOrder.razorpay_signature = razorpay_signature;
            claimedOrder.paymentStatus = "SUCCESS";

            await claimedOrder.save({ session });

           
            const cart = await Cart.findOne({ uid }).session(session);

            if (cart) {
                for (const purchasedItem of pendingOrder.items) {
                    const cartItem = cart.items.find(
                        (item) =>
                            item.pricingId.toString() ===
                            purchasedItem.pricingId.toString()
                    );

                    if (!cartItem) {
                        continue;
                    }

                    cartItem.quantity -= purchasedItem.quantity;

                    if (cartItem.quantity <= 0) {
                        cart.items = cart.items.filter(
                            (item) =>
                                item.pricingId.toString() !==
                                purchasedItem.pricingId.toString()
                        );
                    }
                }

                const remainingPricingIds = cart.items.map(
                    (item) => item.pricingId
                );

                const remainingPricings = await Pricing.find({
                    _id: { $in: remainingPricingIds },
                }).session(session);

                cart.totalPrice = cart.items.reduce((sum, item) => {
                    const pricing = remainingPricings.find(
                        (entry) =>
                            entry._id.toString() === item.pricingId.toString()
                    );

                    const price = pricing
                        ? getEffectivePrice(pricing)
                        : 0;

                    return sum + item.quantity * price;
                }, 0);

                await cart.save({ session });
            }

            await session.commitTransaction();

            return res.status(201).json({
                success: true,
                message: "Payment verified, order saved, and cart updated",
                order: {
                    _id: claimedOrder._id,
                    ticketOrderId: claimedOrder.ticketOrderId,
                    amount: claimedOrder.amount,
                    items: claimedOrder.items,
                },
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
            session = null;
        }
    } catch (error) {
        if (session?.inTransaction()) {
            await session.abortTransaction();
            await session.endSession();
        }

        console.error("Failed to verify event payment:", error);

        return res.status(error.statusCode || 500).json({
            error:
                error.statusCode === 409
                    ? error.message
                    : "Failed to verify payment",
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid || uid !== req.user?.uid) {
            return res.status(403).json({
                success: false,
                error: "You cannot access another user's orders",
            });
        }

        const orders = await EventOrder.find({ uid })
            .sort({ createdAt: -1 })
            .populate("items.eventId", "title date location")
            .populate("items.pricingId", "ticketType finalPrice price");

        return res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("Failed to fetch user orders:", error);

        return res.status(500).json({
            error: "Failed to fetch user orders",
        });
    }
};

export const getEventOrders = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({
                error: "Invalid event ID",
            });
        }

        const orders = await EventOrder.find({
            "items.eventId": eventId,
        }).sort({ createdAt: -1 });

        if (orders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No orders found for this event.",
                totalTickets: 0,
                totalRevenue: 0,
                orders: [],
            });
        }

        const totalTickets = orders.reduce(
            (sum, order) =>
                sum +
                order.items.reduce(
                    (itemTotal, item) => itemTotal + (item.quantity || 1),
                    0
                ),
            0
        );

        const totalRevenue = orders.reduce(
            (sum, order) => sum + (order.amount || 0),
            0
        );

        return res.status(200).json({
            success: true,
            eventId,
            totalTickets,
            totalRevenue,
            orderCount: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Failed to fetch event orders:", error);

        return res.status(500).json({
            error: "Failed to fetch event orders",
        });
    }
};

export const getAllEventOrders = async (req, res) => {
    try {
        const orders = await EventOrder.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "items.eventId",
                model: Event,
                select: "title day date location",
            })
            .populate({
                path: "items.pricingId",
                select: "ticketType finalPrice price",
            })
            .lean();

        if (orders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No event orders found.",
                totalTickets: 0,
                totalRevenue: 0,
                totalOrders: 0,
                orders: [],
            });
        }

        const totalTickets = orders.reduce(
            (sum, order) =>
                sum +
                order.items.reduce(
                    (itemTotal, item) => itemTotal + (item.quantity || 1),
                    0
                ),
            0
        );

        const totalRevenue = orders.reduce(
            (sum, order) => sum + (order.amount || 0),
            0
        );

        const detailedOrders = orders.map((order) => ({
            orderId: order._id,
            ticketOrderId: order.ticketOrderId,
            userId: order.uid,
            amount: order.amount,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            isAlloted: order.isAlloted,
            items: order.items.map((item) => {
                const price =
                    item.pricingId?.finalPrice ??
                    item.pricingId?.price ??
                    item.price ??
                    0;

                const quantity = item.quantity || 1;

                return {
                    eventId: item.eventId?._id ?? item.eventId,
                    title: item.eventId?.title || "Unknown Event",
                    date: item.eventId?.date || "N/A",
                    location: item.eventId?.location || "N/A",
                    ticketName: item.pricingId?.ticketType || "General",
                    quantity,
                    price,
                    subtotal: price * quantity,
                };
            }),
        }));

        return res.status(200).json({
            success: true,
            message: "All event orders fetched successfully",
            totalOrders: orders.length,
            totalTickets,
            totalRevenue,
            orders: detailedOrders,
        });
    } catch (error) {
        console.error("Failed to fetch all event orders:", error);

        return res.status(500).json({
            error: "Failed to fetch all event orders",
        });
    }
};

export const allotEventTicket = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({
                error: "Invalid order ID",
            });
        }

        const order = await EventOrder.findById(orderId);

        if (!order) {
            return res.status(404).json({
                error: "Order not found",
            });
        }

        order.isAlloted = true;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Ticket Alloted Successfully",
            order: {
                _id: order._id,
                isAlloted: order.isAlloted,
            },
        });
    } catch (error) {
        console.error("Failed to allot event ticket:", error);

        return res.status(500).json({
            error: "Failed to allot event ticket",
        });
    }
};