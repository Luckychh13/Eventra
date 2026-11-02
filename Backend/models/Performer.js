import mongoose from "mongoose";

const performerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        role: {
            type: String,
            default: "Performer",
            trim: true,
        },
        image: {
            type: String,
            default: null,
        },
        public_id: {
            type: String,
            default: null,
        },
        day: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Performer = mongoose.model("Performer", performerSchema);

export default Performer;
