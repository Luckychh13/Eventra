import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },
        public_id: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Image = mongoose.model("Image", imageSchema);

export default Image;