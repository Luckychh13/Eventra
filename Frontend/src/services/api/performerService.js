import api from './api.js'

export const getPerformers = async () => {
    const response = await api.get('/api/performers')
    return response.data.performers
}

export const getPerformersByEvent = async (eventId) => {
    const response = await api.get(`/api/performers/event/${eventId}`)
    return response.data.performers
}

export const getPerformerById = async (performerId) => {
    const response = await api.get(`/api/performers/${performerId}`)
    return response.data.performer
}

export const createPerformer = async (formData) => {
    const response = await api.post('/api/performers', formData)
    return response.data.performer
}

export const updatePerformer = async (performerId, formData) => {
    const response = await api.put(
        `/api/performers/${performerId}`,
        formData
    )
    return response.data.performer
}

export const deletePerformer = async (performerId) => {
    const response = await api.delete(`/api/performers/${performerId}`)
    return response.data
}