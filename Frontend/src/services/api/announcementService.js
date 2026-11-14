import api from "./api.js";

export const getAnnouncements = async () => {
    const response = await api.get("/api/announcements");
    return response.data.announcements;
};

export const createAnnouncement = async (data) => {
    const response = await api.post("/api/announcements", data);
    return response.data.announcement;
};

export const updateAnnouncement = async (id, data) => {
    const response = await api.put(`/api/announcements/${id}`, data);
    return response.data.updated;
};

export const deleteAnnouncement = async (id) => {
    const response = await api.delete(`/api/announcements/${id}`);
    return response.data;
};
