import api from "./api.js";

export const getEventPricings = async (eventId) => {
    const response = await api.get(`/api/pricing/event/${eventId}`);
    return response.data;
};

export const createTierPricings = async (eventId, tiers) => {
    const response = await api.post("/api/pricing/create", {
        eventId,
        tiers,
    });

    return response.data;
};

export const updatePricing = async (pricingId, data) => {
    const response = await api.put(
        `/api/pricing/update/${pricingId}`,
        data
    );

    return response.data;
};

export const applyOffer = async (pricingId, offerPercentage, offerExpiry) => {
    const response = await api.put(
        `/api/pricing/offer/${pricingId}`,
        {
            offerPercentage,
            offerExpiry,
        }
    );

    return response.data;
};

export const removeOffer = async (pricingId) => {
    const response = await api.delete(
        `/api/pricing/offer/${pricingId}`
    );

    return response.data;
};

export const deletePricing = async (pricingId) => {
    const response = await api.delete(`/api/pricing/${pricingId}`);
    return response.data;
};
