import api from "./api.js";

export const getAllFeedback = async () => {
    const response = await api.get("/api/feedback");
    return response.data.feedbacks;
};

