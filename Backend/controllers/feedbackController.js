import Feedback from "../models/Feedback.js";

export const addFeedback = async (req, res) => {
    try {
        const { name, email, rating, feedback } = req.body;

        if (!name || !email || !rating || !feedback) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const newFeedback = new Feedback({
            name,
            email,
            rating,
            feedback,
        });

        await newFeedback.save();

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
        });
    } catch (error) {
        console.error("Add Feedback Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            feedbacks,
        });
    } catch (error) {
        console.error("Get Feedback Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};