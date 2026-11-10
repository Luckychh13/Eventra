import api from './api.js'

export const getEventPricings = async (eventId) => {
    const response = await api.get(`/api/pricing/event/${eventId}`)

    return response.data
}