import express from "express";

import {
    createTierPricings,
    updatePricing,
    applyOffer,
    removeOffer,
    getEventPricings,
    deletePricing,
} from "../controllers/pricingController.js";

const router = express.Router();

router.post("/create", createTierPricings);
router.put("/update/:pricingId", updatePricing);
router.put("/offer/:pricingId", applyOffer);
router.delete("/offer/:pricingId", removeOffer);
router.get("/event/:eventId", getEventPricings);
router.delete("/:pricingId", deletePricing);

export default router;