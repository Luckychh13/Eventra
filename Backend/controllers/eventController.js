import { Readable } from "node:stream";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import cloudinary, {
    hasCloudinaryConfig,
    configureCloudinary
} from "../config/cloudinary.js";

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const validateEventId = (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw createError("Invalid event ID", 400);
    }
};

const uploadEventImage = async (file) => {
    if (!hasCloudinaryConfig()) {
        throw createError(
            "Image uploads are not configured. Set the Cloudinary environment variables.",
            503
        );
    }
    configureCloudinary();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "events", resource_type: "image" },
            (error, result) => {
                if (error) return reject(error);
                if (!result?.secure_url) {
                    return reject(new Error("Cloudinary did not return an image URL."));
                }

                resolve(result.secure_url);
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);
    });
};

const validateRequiredFields = (body) => {
    const requiredFields = ["title", "day", "date", "location", "time"];

    const missingFields = requiredFields.filter(
        (field) =>
            typeof body[field] !== "string" || !body[field].trim()
    );

    if (missingFields.length > 0) {
        throw createError(
            `Required fields are missing: ${missingFields.join(", ")}`,
            400
        );
    }
};

const validateTicketCount = (value, fieldName) => {
    const count = Number(value);

    if (!Number.isInteger(count) || count < 0) {
        throw createError(`${fieldName} must be a non-negative integer.`, 400);
    }

    return count;
};

export const addEvent = async (req, res, next) => {
    try {
        validateRequiredFields(req.body);

        const {
            title, day, date, location, time, description,
        } = req.body;

        const existingEvent = await Event.findOne({
            title: title.trim(),
            date: date.trim(),
            time: time.trim(),
            location: location.trim(),
        });

        if (existingEvent) {
            throw createError(
                "An event with the same title, date, time, and location already exists.",
                409
            );
        }
        const imageUrl = req.file
            ? await uploadEventImage(req.file)
            : "";

        const event = await Event.create({
            title: title.trim(),
            day: day.trim(),
            date: date.trim(),
            location: location.trim(),
            time: time.trim(),
            description: description ?? "",
            imageUrl,
        });

        return res.status(201).json({
            message: "Event created successfully",
            event,
        });
    } catch (error) {
        return next(error);
    }
};

export const getEvents = async (req, res, next) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        return res.status(200).json(events);
    } catch (error) {
        return next(error);
    }
};

export const getEventById = async (req, res, next) => {
    try {
        validateEventId(req.params.id);

        const event = await Event.findById(req.params.id);

        if (!event) {
            throw createError("Event not found", 404);
        }

        return res.status(200).json(event);
    } catch (error) {
        return next(error);
    }
};

export const editEvent = async (req, res, next) => {
    try {
        validateEventId(req.params.id);

        const event = await Event.findById(req.params.id);

        if (!event) {
            throw createError("Event not found", 404);
        }

        const editableFields = [
            "title",
            "day",
            "date",
            "location",
            "time",
            "description",
        ];

        for (const field of editableFields) {
            if (req.body[field] !== undefined) {
                if (
                    field !== "description" &&
                    (typeof req.body[field] !== "string" ||
                        !req.body[field].trim())
                ) {
                    throw createError(`${field} cannot be empty.`, 400);
                }

                event[field] =
                    typeof req.body[field] === "string"
                        ? req.body[field].trim()
                        : req.body[field];
            }
        }

        if (req.body.ticketsAvailable !== undefined) {
            event.ticketsAvailable = validateTicketCount(
                req.body.ticketsAvailable,
                "ticketsAvailable"
            );
        }

        if (req.body.ticketsSold !== undefined) {
            event.ticketsSold = validateTicketCount(
                req.body.ticketsSold,
                "ticketsSold"
            );
        }

        if (req.file) {
            event.imageUrl = await uploadEventImage(req.file);
        }

        const duplicateEvent = await Event.findOne({
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            _id: { $ne: event._id },
        });

        if (duplicateEvent) {
            throw createError(
                "An event with the same title, date, time, and location already exists.",
                409
            );
        }

        await event.save();

        return res.status(200).json({
            message: "Event updated successfully",
            event,
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteEvent = async (req, res, next) => {
    try {
        validateEventId(req.params.id);

        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            throw createError("Event not found", 404);
        }

        return res.status(200).json({
            message: "Event deleted successfully",
        });
    } catch (error) {
        return next(error);
    }
};