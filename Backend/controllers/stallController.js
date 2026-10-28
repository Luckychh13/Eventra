
import QRCode from "qrcode";

import Stall from "../models/Stall.js";
import User from "../models/User.js";
import StallOrder from "../models/StallOrder.js";

import { getFirebaseAuth } from "../config/firebase.js";

import cloudinary, {
    configureCloudinary,
    hasCloudinaryConfig,
} from "../config/cloudinary.js";

import { uploadBuffer } from "../utils/cloudinaryUpload.js";

const deleteCloudinaryImage = async (imageUrl) => {
    if (!imageUrl || !hasCloudinaryConfig()) {
        return;
    }

    const uploadMarker = "/upload/";
    const uploadIndex = imageUrl.indexOf(uploadMarker);

    if (uploadIndex === -1) {
        return;
    }

    let publicId = imageUrl.slice(
        uploadIndex + uploadMarker.length
    );

    // Remove Cloudinary's version prefix, such as v123456/.
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove the file extension.
    publicId = publicId.replace(/\.[^/.]+$/, "");

    configureCloudinary();
    await cloudinary.uploader.destroy(publicId);
};

export const createStall = async (req, res, next) => {
    try {
        const {
            name,
            email,
            ownerName,
            category,
            location,
            description,
        } = req.body;

        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Stall name and owner email are required.",
            });
        }

        const firebaseAuth = getFirebaseAuth();
        const owner = await firebaseAuth.getUserByEmail(
            email.trim()
        );

        await firebaseAuth.setCustomUserClaims(owner.uid, {
            ...owner.customClaims,
            role: "stallOwner",
        });

        const resolvedOwnerName =
            ownerName?.trim() || owner.displayName || email.trim();

        await User.findOneAndUpdate(
            { email: email.trim() },
            {
                uid: owner.uid,
                name: resolvedOwnerName,
                email: email.trim(),
                role: "stallOwner",
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        let imageUrl = "";

        if (req.file) {
            const uploadedImage = await uploadBuffer(
                req.file.buffer,
                "fest_stalls"
            );

            imageUrl = uploadedImage.secure_url;
        }

        const stall = await Stall.create({
            name: name.trim(),
            ownerName: resolvedOwnerName,
            ownerUID: owner.uid,
            ownerEmail: email.trim(),
            category,
            location,
            description,
            imageUrl,
        });

        stall.qrCodeDataUrl = await QRCode.toDataURL(
            `${process.env.FRONTEND_URL}/stall/${stall._id}`
        );

        await stall.save();

        return res.status(201).json({
            success: true,
            message: "Stall created successfully.",
            stall,
        });
    } catch (error) {
        return next(error);
    }
};

export const getStalls = async (req, res, next) => {
    try {
        const stalls = await Stall.find().sort({
            createdAt: -1,
        });

        return res.json(stalls);
    } catch (error) {
        return next(error);
    }
};

export const getStallById = async (req, res, next) => {
    try {
        const stall = await Stall.findById(req.params.id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        return res.json(stall);
    } catch (error) {
        return next(error);
    }
};

export const updateStall = async (req, res, next) => {
    try {
        const stall = await Stall.findById(req.params.id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        for (const field of [
            "name",
            "category",
            "location",
            "description",
        ]) {
            if (req.body[field] !== undefined) {
                stall[field] = req.body[field];
            }
        }

        if (req.file) {
            const uploadedImage = await uploadBuffer(
                req.file.buffer,
                "fest_stalls"
            );

            const oldImageUrl = stall.imageUrl;
            stall.imageUrl = uploadedImage.secure_url;

            await stall.save();

            if (oldImageUrl) {
                await deleteCloudinaryImage(oldImageUrl);
            }

            return res.json({
                success: true,
                message: "Stall updated successfully.",
                stall,
            });
        }

        await stall.save();

        return res.json({
            success: true,
            message: "Stall updated successfully.",
            stall,
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteStall = async (req, res, next) => {
    try {
        const stall = await Stall.findById(req.params.id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        await Stall.findByIdAndDelete(stall._id);

        await Promise.allSettled([
            deleteCloudinaryImage(stall.imageUrl),
            ...stall.menu.map((item) =>
                deleteCloudinaryImage(item.imageUrl)
            ),
        ]);

        return res.json({
            success: true,
            message: "Stall deleted successfully.",
        });
    } catch (error) {
        return next(error);
    }
};


const canManageStall = (stall, user) => {
    return (
        user?.admin === true ||
        user?.role === "admin" ||
        (
            user?.role === "stallOwner" &&
            stall.ownerUID === user.uid
        )
    );
};

export const addItem = async (req, res, next) => {
    try {
        const { name, price, description } = req.body;

        if (!name?.trim() || price === undefined || price === "") {
            return res.status(400).json({
                success: false,
                message: "Item name and price are required.",
            });
        }

        const parsedPrice = Number(price);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number.",
            });
        }

        const stall = await Stall.findById(req.params.id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        if (!canManageStall(stall, req.user)) {
            return res.status(403).json({
                success: false,
                message: "You cannot manage this stall.",
            });
        }

        let imageUrl = "";

        if (req.file) {
            const uploadedImage = await uploadBuffer(
                req.file.buffer,
                "fest_stalls/items"
            );

            imageUrl = uploadedImage.secure_url;
        }

        stall.menu.push({
            name: name.trim(),
            price: parsedPrice,
            description,
            imageUrl,
        });

        await stall.save();

        return res.status(201).json({
            success: true,
            message: "Menu item added successfully.",
            menu: stall.menu,
        });
    } catch (error) {
        return next(error);
    }
};

export const updateItem = async (req, res, next) => {
    try {
        const stall = await Stall.findById(req.params.id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        if (!canManageStall(stall, req.user)) {
            return res.status(403).json({
                success: false,
                message: "You cannot manage this stall.",
            });
        }

        const item = stall.menu.id(req.params.itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found.",
            });
        }

        if (req.body.name !== undefined) {
            if (!req.body.name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Item name cannot be empty.",
                });
            }

            item.name = req.body.name.trim();
        }

        if (req.body.price !== undefined && req.body.price !== "") {
            const parsedPrice = Number(req.body.price);

            if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a valid non-negative number.",
                });
            }

            item.price = parsedPrice;
        }

        if (req.body.description !== undefined) {
            item.description = req.body.description;
        }

        let oldImageUrl;

        if (req.file) {
            const uploadedImage = await uploadBuffer(
                req.file.buffer,
                "fest_stalls/items"
            );

            oldImageUrl = item.imageUrl;
            item.imageUrl = uploadedImage.secure_url;
        }

        await stall.save();

        if (oldImageUrl) {
            await deleteCloudinaryImage(oldImageUrl);
        }

        return res.json({
            success: true,
            message: "Menu item updated successfully.",
            menu: stall.menu,
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteItem = async (req, res, next) => {
    try {
        const stall = await Stall.findById(req.params.id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        if (!canManageStall(stall, req.user)) {
            return res.status(403).json({
                success: false,
                message: "You cannot manage this stall.",
            });
        }

        const item = stall.menu.id(req.params.itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found.",
            });
        }

        const oldImageUrl = item.imageUrl;

        item.deleteOne();
        await stall.save();

        if (oldImageUrl) {
            await deleteCloudinaryImage(oldImageUrl);
        }

        return res.json({
            success: true,
            message: "Menu item deleted successfully.",
            menu: stall.menu,
        });
    } catch (error) {
        return next(error);
    }
};


export const generateToken = async (req, res, next) => {
    try {
        const { visitorName, mobile, email } = req.body;

        if (!visitorName?.trim() || !mobile?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Visitor name and mobile are required.",
            });
        }

        const stall = await Stall.findById(req.params.id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        stall.currentToken += 1;

        const token = {
            tokenNumber: stall.currentToken,
            visitorName: visitorName.trim(),
            mobile: mobile.trim(),
            email: email?.trim() || "",
            timestamp: new Date(),
        };

        stall.tokens.push(token);
        await stall.save();

        return res.status(201).json({
            success: true,
            message: "Token generated successfully.",
            tokenNumber: token.tokenNumber,
            token,
        });
    } catch (error) {
        return next(error);
    }
};

export const resetTokens = async (req, res, next) => {
    try {
        const stall = await Stall.findById(req.params.id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "Stall not found.",
            });
        }

        if (!canManageStall(stall, req.user)) {
            return res.status(403).json({
                success: false,
                message: "You cannot reset tokens for this stall.",
            });
        }

        stall.currentToken = 0;
        stall.tokens = [];

        await stall.save();

        return res.json({
            success: true,
            message: "Tokens reset successfully.",
            stall,
        });
    } catch (error) {
        return next(error);
    }
};

export const getMyStalls = async (req, res, next) => {
    try {
        const { uid, role, admin } = req.user;

        if (role === "admin" || admin === true) {
            const stalls = await Stall.find().sort({ createdAt: -1 });

            return res.json({
                success: true,
                role: "admin",
                stalls,
            });
        }

        if (role === "stallOwner") {
            const stalls = await Stall.find({
                ownerUID: uid,
            }).sort({ createdAt: -1 });

            return res.json({
                success: true,
                role,
                stalls,
            });
        }

        return res.status(403).json({
            success: false,
            message: "Unauthorized to view stalls.",
        });
    } catch (error) {
        return next(error);
    }
};

export const getOwnerDashboard = async (req, res, next) => {
    try {
        const stalls = await Stall.find({
            ownerUID: req.user.uid,
        });

        const stallIds = stalls.map((stall) => stall._id);

        const orders = await StallOrder.find({
            stallId: { $in: stallIds },
        }).sort({ createdAt: -1 });

        const totalEarnings = orders.reduce(
            (total, order) => total + (order.totalAmount || 0),
            0
        );

        return res.json({
            success: true,
            stalls,
            orders,
            totalEarnings,
            orderCount: orders.length,
        });
    } catch (error) {
        return next(error);
    }
};

export const markOrderCompleted = async (req, res, next) => {
    try {
        const order = await StallOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        const stall = await Stall.findById(order.stallId);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: "The stall associated with this order was not found.",
            });
        }

        if (!canManageStall(stall, req.user)) {
            return res.status(403).json({
                success: false,
                message: "You cannot update this order.",
            });
        }

        order.orderStatus = "COMPLETED";
        await order.save();

        return res.json({
            success: true,
            message: "Order marked as completed.",
            order,
        });
    } catch (error) {
        return next(error);
    }
};
