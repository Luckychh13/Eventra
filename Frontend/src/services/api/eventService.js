import api from './api.js'

export const getEvents = async () => {
    const response = await api.get('/api/events')

    return response.data
}

export const getEventById = async (eventId) => {
    const response = await api.get(`/api/events/${eventId}`)

    return response.data
}