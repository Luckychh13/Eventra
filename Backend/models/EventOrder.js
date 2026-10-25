import mongoose from "mongoose";
import { nanoid } from "nanoid";

const eventOrderSchema = new mongoose.Schema(
    {
        ticketOrderId: {
            type: String,
            required: true,
            unique: true,
            default: () => "TK-" + nanoid(8).toUpperCase(),
        },

        uid: {
            type: String,
            required: true,
        },

        items: [
            {
                eventId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Event",
                    required: true,
                },

                pricingId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Pricing",
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        razorpay_order_id: {
            type: String,
            required: true,
            unique: true,
        },

        razorpay_payment_id: {
            type: String,
        },

        razorpay_signature: {
            type: String,
        },

        paymentStatus: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED"],
            default: "PENDING",
        },

        isAlloted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const EventOrder = mongoose.model("EventOrder", eventOrderSchema);

export default EventOrder;