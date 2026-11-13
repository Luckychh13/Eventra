import api from './api.js'

export const getEvents = async () => {
    const response = await api.get('/api/events')

    return response.data
}

export const getEventById = async (eventId) => {
    const response = await api.get(`/api/events/${eventId}`)

    return response.data
}


export const createEvent = async (formData) => {
    const response = await api.post('/api/events', formData)

    return response.data
}

export const updateEvent = async (eventId, formData) => {
    const response = await api.put(`/api/events/${eventId}`, formData)

    return response.data
}

export const deleteEvent = async (eventId) => {
    const response = await api.delete(`/api/events/${eventId}`)

    return response.data
}
