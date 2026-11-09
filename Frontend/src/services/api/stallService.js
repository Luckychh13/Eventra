import api from './api.js'

export const getStalls = async () => {
    const response = await api.get('/api/stalls')
    return response.data
}

export const getStallById = async (stallId) => {
    const response = await api.get(`/api/stalls/${stallId}`)
    return response.data
}