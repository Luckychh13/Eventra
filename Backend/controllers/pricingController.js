import Pricing from "../models/Pricing.js";
import Event from "../models/Event.js";
import mongoose from "mongoose";

export const createTierPricings = async (req, res) => {
    try {
        const { eventId, tiers } = req.body;

        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({ error: "Invalid event ID" });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        if (!Array.isArray(tiers) || tiers.length === 0) {
            return res.status(400).json({
                error: "At least one pricing tier is required",
            });
        }

        const allowedTypes = ["GOLDEN", "SILVER", "BRONZE"];

        const normalizedTiers = [];

        for (const tier of tiers) {
            if (!tier || typeof tier !== "object" || Array.isArray(tier)) {
                return res.status(400).json({
                    error: "Each pricing tier must be an object",
                });
            }

            const { ticketType, price, totalTickets } = tier;
            const numericPrice = Number(price);
            const numericTotalTickets = Number(totalTickets);

            if (!allowedTypes.includes(ticketType)) {
                return res.status(400).json({
                    error: "Invalid ticket type",
                });
            }

            if (
                price === undefined ||
                price === null ||
                String(price).trim() === "" ||
                !Number.isFinite(numericPrice) ||
                numericPrice < 0
            ) {
                return res.status(400).json({
                    error: "Price must be a valid non-negative number",
                });
            }

            if (
                totalTickets === undefined ||
                totalTickets === null ||
                String(totalTickets).trim() === "" ||
                !Number.isInteger(numericTotalTickets) ||
                numericTotalTickets <= 0
            ) {
                return res.status(400).json({
                    error: "Total tickets must be a positive integer",
                });
            }

            normalizedTiers.push({
                ticketType,
                price: numericPrice,
                totalTickets: numericTotalTickets,
                event: eventId,
            });
        }

        const createdPricings = await Pricing.insertMany(normalizedTiers);

        const eventPricings = await Pricing.find({
            event: eventId,
        });

        const totalTickets = eventPricings.reduce(
            (total, tier) => total + tier.totalTickets,
            0
        );

        event.ticketsAvailable = totalTickets;
        await event.save();

        return res.status(201).json({
            message: "Tier pricings created successfully",
            pricings: createdPricings,
        });
    } catch (error) {
        console.error("Failed to create tier pricings:", error);
        return res.status(500).json({
            error: "Failed to create tier pricings",
        });
    }
};

export const updatePricing = async (req, res) => {
    try {
        const { pricingId } = req.params;
        const { price, totalTickets } = req.body;

        if (!mongoose.isValidObjectId(pricingId)) {
            return res.status(400).json({
                error: "Invalid pricing ID",
            });
        }

        const pricing = await Pricing.findById(pricingId);

        if (!pricing) {
            return res.status(404).json({
                error: "Pricing not found",
            });
        }

        const priceProvided = price !== undefined;
        const ticketsProvided = totalTickets !== undefined;

        if (!priceProvided && !ticketsProvided) {
            return res.status(400).json({
                error: "Provide price or totalTickets to update",
            });
        }

        let numericPrice;
        let numericTotalTickets;

        if (priceProvided) {
            numericPrice = Number(price);

            if (
                price === null ||
                String(price).trim() === "" ||
                !Number.isFinite(numericPrice) ||
                numericPrice < 0
            ) {
                return res.status(400).json({
                    error: "Price must be a valid non-negative number",
                });
            }
        }

        if (ticketsProvided) {
            numericTotalTickets = Number(totalTickets);

            if (
                totalTickets === null ||
                String(totalTickets).trim() === "" ||
                !Number.isInteger(numericTotalTickets) ||
                numericTotalTickets < 0
            ) {
                return res.status(400).json({
                    error: "Total tickets must be a non-negative integer",
                });
            }

            if (numericTotalTickets < pricing.ticketsSold) {
                return res.status(400).json({
                    error: "Total tickets cannot be less than tickets already sold",
                });
            }
        }

        let event = null;

        if (ticketsProvided) {
            event = await Event.findById(pricing.event);

            if (!event) {
                return res.status(404).json({
                    error: "Event not found for this pricing",
                });
            }
        }

        if (priceProvided) {
            pricing.price = numericPrice;

            if (pricing.offer?.active) {
                pricing.finalPrice =
                    numericPrice -
                    (numericPrice * pricing.offer.percentage) / 100;
            } else {
                pricing.finalPrice = numericPrice;
            }
        }

        if (ticketsProvided) {
            pricing.totalTickets = numericTotalTickets;
        }

        await pricing.save();

        if (ticketsProvided) {
            const eventPricings = await Pricing.find({
                event: pricing.event,
            });

            event.ticketsAvailable = eventPricings.reduce(
                (total, tier) => total + tier.totalTickets,
                0
            );

            await event.save();
        }

        return res.status(200).json({
            message: "Pricing updated successfully",
            pricing,
        });
    } catch (error) {
        console.error("Failed to update pricing:", error);

        return res.status(500).json({
            error: "Failed to update pricing",
        });
    }
};

export const applyOffer = async (req, res) => {
    try {
        const { pricingId } = req.params;
        const { offerPercentage, offerExpiry } = req.body;

        if (!mongoose.isValidObjectId(pricingId)) {
            return res.status(400).json({
                error: "Invalid pricing ID",
            });
        }

        const percentage = Number(offerPercentage);

        if (
            offerPercentage === undefined ||
            offerPercentage === null ||
            String(offerPercentage).trim() === "" ||
            !Number.isFinite(percentage) ||
            percentage <= 0 ||
            percentage > 100
        ) {
            return res.status(400).json({
                error: "Offer percentage must be greater than 0 and at most 100",
            });
        }

        if (!offerExpiry || !Number.isFinite(Date.parse(offerExpiry))) {
            return res.status(400).json({
                error: "A valid offer expiry date is required",
            });
        }

        const expiryDate = new Date(offerExpiry);

        if (expiryDate <= new Date()) {
            return res.status(400).json({
                error: "Offer expiry must be in the future",
            });
        }

        const pricing = await Pricing.findById(pricingId);

        if (!pricing) {
            return res.status(404).json({
                error: "Pricing not found",
            });
        }

        pricing.offer = {
            percentage,
            expiry: expiryDate,
            active: true,
        };

        pricing.finalPrice =
            pricing.price - (pricing.price * percentage) / 100;

        await pricing.save();

        return res.status(200).json({
            message: "Offer applied successfully",
            pricing,
        });
    } catch (error) {
        console.error("Failed to apply pricing offer:", error);

        return res.status(500).json({
            error: "Failed to apply pricing offer",
        });
    }
};

export const removeOffer = async (req, res) => {
    try {
        const { pricingId } = req.params;

        if (!mongoose.isValidObjectId(pricingId)) {
            return res.status(400).json({
                error: "Invalid pricing ID",
            });
        }

        const pricing = await Pricing.findById(pricingId);

        if (!pricing) {
            return res.status(404).json({
                error: "Pricing not found",
            });
        }

        pricing.offer = null;
        pricing.finalPrice = pricing.price;

        await pricing.save();

        return res.status(200).json({
            message: "Offer removed successfully",
            pricing,
        });
    } catch (error) {
        console.error("Failed to remove pricing offer:", error);

        return res.status(500).json({
            error: "Failed to remove pricing offer",
        });
    }
};

export const getEventPricings = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({
                error: "Invalid event ID",
            });
        }

        const pricings = await Pricing.find({ event: eventId });

        return res.status(200).json(pricings);
    } catch (error) {
        console.error("Failed to fetch event pricing:", error);

        return res.status(500).json({
            error: "Failed to fetch event pricing",
        });
    }
};

export const deletePricing = async (req, res) => {
    try {
        const { pricingId } = req.params;

        if (!mongoose.isValidObjectId(pricingId)) {
            return res.status(400).json({
                error: "Invalid pricing ID",
            });
        }

        const pricing = await Pricing.findById(pricingId);

        if (!pricing) {
            return res.status(404).json({
                error: "Pricing not found",
            });
        }

        const event = await Event.findById(pricing.event);

        await Pricing.findByIdAndDelete(pricingId);

        if (event) {
            const remainingPricings = await Pricing.find({
                event: event._id,
            });

            event.ticketsAvailable = remainingPricings.reduce(
                (total, tier) => total + tier.totalTickets,
                0
            );

            await event.save();
        }

        return res.status(200).json({
            message: "Pricing deleted successfully",
        });
    } catch (error) {
        console.error("Failed to delete pricing:", error);

        return res.status(500).json({
            error: "Failed to delete pricing",
        });
    }
};