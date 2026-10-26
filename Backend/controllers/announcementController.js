import Announcement from "../models/Announcement.js";

export const createAnnouncement = async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                error: "Title and message are required",
            });
        }

        const announcement = await Announcement.create({
            title,
            message,
            createdBy: req.user?.uid || "Admin",
        });

        const io = req.app.get("io");
        if (io) {
            io.emit("newAnnouncement", announcement);
        }

        return res.status(201).json({
            message: "Announcement created successfully",
            announcement,
        });
    } catch (error) {
        console.error("Create Announcement Error:", error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
};

export const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({ announcements });
    } catch (error) {
        console.error("Fetch Announcements Error:", error);

        return res.status(500).json({
            error: "Failed to fetch announcements",
        });
    }
};

export const editAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message } = req.body;

        const updated = await Announcement.findByIdAndUpdate(
            id,
            { title, message },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updated) {
            return res.status(404).json({
                error: "Announcement not found",
            });
        }

        return res.status(200).json({
            message: "Announcement updated successfully",
            updated,
        });
    } catch (error) {
        console.error("Edit Announcement Error:", error);

        return res.status(500).json({
            error: "Failed to update announcement",
        });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Announcement.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                error: "Announcement not found",
            });
        }

        return res.status(200).json({
            message: "Announcement deleted successfully",
        });
    } catch (error) {
        console.error("Delete Announcement Error:", error);

        return res.status(500).json({
            error: "Failed to delete announcement",
        });
    }
};