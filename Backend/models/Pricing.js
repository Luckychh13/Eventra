import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },

        ticketType: {
            type: String,
            enum: ["GOLDEN", "SILVER", "BRONZE"],
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        finalPrice: {
            type: Number,
            default: function () {
                return this.price;
            },
        },

        totalTickets: {
            type: Number,
            required: true,
        },

        ticketsSold: {
            type: Number,
            default: 0,
        },

        offer: {
            percentage: Number,
            expiry: Date,
            active: {
                type: Boolean,
                default: false,
            },
        },
    },
    { timestamps: true }
);

const Pricing = mongoose.model("Pricing", pricingSchema);

export default Pricing;