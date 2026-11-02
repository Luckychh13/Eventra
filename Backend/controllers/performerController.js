import mongoose from "mongoose";

import Performer from "../models/Performer.js";
import Event from "../models/Event.js";

import { uploadBuffer } from "../utils/cloudinaryUpload.js";

import cloudinary, {
    configureCloudinary,
    hasCloudinaryConfig,
} from "../config/cloudinary.js";

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const validatePerformerId = (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw createError("Invalid performer ID.", 400);
    }
};

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return;

    if (!hasCloudinaryConfig()) {
        throw createError("Cloudinary is not configured.", 503);
    }

    configureCloudinary();

    return cloudinary.uploader.destroy(publicId);
};

export const addPerformer = async (req, res, next) => {
    let uploadedImage;

    try {
        const { name, eventId, role, day } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof eventId !== "string" ||
            !eventId.trim() ||
            typeof day !== "string" ||
            !day.trim()
        ) {
            return res.status(400).json({
                message: "Name, event ID, and day are required.",
            });
        }

        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID.",
            });
        }
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found.",
            });
        }

        let imageUrl = null;
        let public_id = null;

        if (req.file) {
            if (!hasCloudinaryConfig()) {
                throw createError("Cloudinary is not configured.", 503);
            }

            uploadedImage = await uploadBuffer(
                req.file.buffer,
                "performers"
            );

            imageUrl = uploadedImage.secure_url;
            public_id = uploadedImage.public_id;
        }

        const performer = await Performer.create({
            name: name.trim(),
            eventId,
            role: typeof role === "string" && role.trim()
                ? role.trim()
                : "Performer",
            day: day.trim(),
            image: imageUrl,
            public_id,
        });

        return res.status(201).json({
            success: true,
            performer,
        });

    } catch (error) {
        if (uploadedImage?.public_id) {
            try {
                await deleteCloudinaryImage(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up performer image:",
                    cleanupError
                );
            }
        }

        return next(error);
    }
};

export const getAllPerformers = async (req, res, next) => {
    try {
        const performers = await Performer.find()
            .populate("eventId", "title date")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            performers,
        });
    } catch (error) {
        return next(error);
    }
};

export const getPerformersByEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID.",
            });
        }

        const performers = await Performer.find({ eventId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            performers,
        });
    } catch (error) {
        return next(error);
    }
};

export const getPerformerById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid performer ID.",
            });
        }

        const performer = await Performer.findById(id)
            .populate("eventId", "title date");

        if (!performer) {
            return res.status(404).json({
                message: "Performer not found.",
            });
        }

        return res.status(200).json({
            success: true,
            performer,
        });
    } catch (error) {
        return next(error);
    }
};

export const updatePerformer = async (req, res, next) => {
    let uploadedImage;

    try {
        const { id } = req.params;
        const { name, eventId, role, day } = req.body;

        validatePerformerId(id);

        const performer = await Performer.findById(id);

        if (!performer) {
            return res.status(404).json({
                message: "Performer not found.",
            });
        }

        if (
            name !== undefined &&
            (typeof name !== "string" || !name.trim())
        ) {
            return res.status(400).json({
                message: "Performer name cannot be empty.",
            });
        }

        if (
            day !== undefined &&
            (typeof day !== "string" || !day.trim())
        ) {
            return res.status(400).json({
                message: "Performer day cannot be empty.",
            });
        }

        if (eventId !== undefined) {
            if (
                typeof eventId !== "string" ||
                !mongoose.isValidObjectId(eventId)
            ) {
                return res.status(400).json({
                    message: "Invalid event ID.",
                });
            }

            const event = await Event.findById(eventId);

            if (!event) {
                return res.status(404).json({
                    message: "Event not found.",
                });
            }
        }

        if (role !== undefined && typeof role !== "string") {
            return res.status(400).json({
                message: "Invalid performer role.",
            });
        }

        const oldPublicId = performer.public_id;

        if (req.file) {
            if (!hasCloudinaryConfig()) {
                throw createError("Cloudinary is not configured.", 503);
            }

            uploadedImage = await uploadBuffer(
                req.file.buffer,
                "performers"
            );

            performer.image = uploadedImage.secure_url;
            performer.public_id = uploadedImage.public_id;
        }

        if (name !== undefined) {
            performer.name = name.trim();
        }

        if (eventId !== undefined) {
            performer.eventId = eventId;
        }

        if (role !== undefined) {
            performer.role = role.trim() || "Performer";
        }

        if (day !== undefined) {
            performer.day = day.trim();
        }

        await performer.save();


        if (oldPublicId && oldPublicId !== performer.public_id) {
            try {
                await deleteCloudinaryImage(oldPublicId);
            } catch (cleanupError) {
                console.error(
                    "Failed to delete old performer image:",
                    cleanupError
                );
            }
        }

        return res.status(200).json({
            success: true,
            performer,
        });

    } catch (error) {
        if (uploadedImage?.public_id) {
            try {
                await deleteCloudinaryImage(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up replacement image:",
                    cleanupError
                );
            }
        }

        return next(error);
    }
};

export const deletePerformer = async (req, res, next) => {
    try {
        const { id } = req.params;

        validatePerformerId(id);

        const performer = await Performer.findById(id);

        if (!performer) {
            return res.status(404).json({
                message: "Performer not found.",
            });
        }

        await performer.deleteOne();

        if (performer.public_id) {
            try {
                await deleteCloudinaryImage(performer.public_id);
            } catch (cleanupError) {
                console.error(
                    "Failed to delete performer image from Cloudinary:",
                    cleanupError
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Deleted successfully.",
        });

    } catch (error) {
        return next(error);
    }
};