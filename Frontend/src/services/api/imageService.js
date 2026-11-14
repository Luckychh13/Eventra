
import api from "./api.js";

export const getImages = async () => {
    const response = await api.get("/api/images");
    return response.data.images;
};

export const createImage = async (formData) => {
    const response = await api.post("/api/images", formData);
    return response.data.newImage;
};
export const updateImage = async (imageId, formData) => {
    const response = await api.put(`/api/images/${imageId}`, formData);
    return response.data.img;
};

export const deleteImage = async (imageId) => {
    const response = await api.delete(`/api/images/${imageId}`);
    return response.data;
};
