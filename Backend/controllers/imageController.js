import mongoose from "mongoose";

import Image from "../models/Image.js";

import cloudinary, {
    configureCloudinary,
    hasCloudinaryConfig,
} from "../config/cloudinary.js";

import { uploadBuffer } from "../utils/cloudinaryUpload.js";

const validateImageId = (id) => {
    if (!mongoose.isValidObjectId(id)) {
        const error = new Error("Invalid image ID.");
        error.statusCode = 400;
        throw error;
    }
};

const parseTags = (tags) => {
    if (tags === undefined || tags === null || tags === "") {
        return [];
    }

    const tagList = Array.isArray(tags) ? tags : [tags];

    return tagList
        .flatMap((tag) =>
            typeof tag === "string" ? tag.split(",") : []
        )
        .map((tag) => tag.trim())
        .filter(Boolean);
};

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return;

    if (!hasCloudinaryConfig()) {
        const error = new Error("Cloudinary is not configured.");
        error.statusCode = 503;
        throw error;
    }

    configureCloudinary();

    return cloudinary.uploader.destroy(publicId);
};

export const createImage = async (req, res, next) => {
    let uploadedImage;

    try {
        const { title, description, tags, image } = req.body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Image title is required.",
            });
        }

        let imageUrl = typeof image === "string" ? image.trim() : "";
        let public_id = null;

        if (req.file) {
            uploadedImage = await uploadBuffer(
                req.file.buffer,
                "fest-images"
            );

            imageUrl = uploadedImage.secure_url;
            public_id = uploadedImage.public_id;
        }

        if (!imageUrl) {
            return res.status(400).json({
                message: "Image is required.",
            });
        }

        const newImage = await Image.create({
            title: title.trim(),
            description,
            tags: parseTags(tags),
            imageUrl,
            public_id,
        });

        return res.status(201).json({
            message: "Image uploaded successfully",
            newImage,
        });
    } catch (error) {
        if (uploadedImage?.public_id) {
            try {
                await deleteCloudinaryImage(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Failed to clean up uploaded image:", cleanupError);
            }
        }

        return next(error);
    }
};

export const getImages = async (req, res, next) => {
    try {
        const images = await Image.find().sort({
            createdAt: -1,
        });

        return res.status(200).json({ images });
    } catch (error) {
        return next(error);
    }
};

export const updateImage = async (req, res, next) => {
    let uploadedImage;

    try {
        const { id } = req.params;
        const { title, description, tags, image } = req.body;

        validateImageId(id);

        const img = await Image.findById(id);

        if (!img) {
            return res.status(404).json({
                message: "Image not found.",
            });
        }

        if (
            title !== undefined &&
            (typeof title !== "string" || !title.trim())
        ) {
            return res.status(400).json({
                message: "Image title cannot be empty.",
            });
        }

        const oldPublicId = img.public_id;

        if (req.file) {
            uploadedImage = await uploadBuffer(
                req.file.buffer,
                "fest-images"
            );

            img.imageUrl = uploadedImage.secure_url;
            img.public_id = uploadedImage.public_id;
        } else if (typeof image === "string" && image.trim()) {
            img.imageUrl = image.trim();
            img.public_id = null;
        }

        if (title !== undefined) {
            img.title = title.trim();
        }

        if (description !== undefined) {
            img.description = description;
        }

        if (tags !== undefined) {
            img.tags = parseTags(tags);
        }

        await img.save();

        if (oldPublicId && oldPublicId !== img.public_id) {
            try {
                await deleteCloudinaryImage(oldPublicId);
            } catch (cleanupError) {
                console.error("Failed to delete old Cloudinary image:", cleanupError);
            }
        }

        return res.status(200).json({
            message: "Image updated successfully",
            img,
        });
    } catch (error) {
        if (uploadedImage?.public_id) {
            try {
                await deleteCloudinaryImage(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Failed to clean up replacement image:", cleanupError);
            }
        }

        return next(error);
    }
};

export const deleteImage = async (req, res, next) => {
    try {
        const { id } = req.params;

        validateImageId(id);

        const img = await Image.findById(id);

        if (!img) {
            return res.status(404).json({
                message: "Image not found.",
            });
        }

        if (img.public_id) {
            await deleteCloudinaryImage(img.public_id);
        }

        await img.deleteOne();

        return res.status(200).json({
            message: "Image deleted successfully",
        });
    } catch (error) {
        return next(error);
    }
};