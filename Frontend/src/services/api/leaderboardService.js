
import api from "./api.js";

export const getLeaderboardStatus = async () => {
    const response = await api.get("/api/leaderboard/status");
    return response.data;
};

export const toggleLeaderboard = async (isLive) => {
    const response = await api.post("/api/leaderboard/toggle", {
        isLive,
    });

    return response.data;
};

export const scheduleLeaderboard = async (revealTime) => {
    const response = await api.post("/api/leaderboard/schedule", {
        revealTime,
    });

    return response.data;
};
