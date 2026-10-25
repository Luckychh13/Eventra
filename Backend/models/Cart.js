import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    pricingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pricing",
        required: true,
    },

    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },
});

const cartSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
        },

        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },

        items: [cartItemSchema],

        totalPrice: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
