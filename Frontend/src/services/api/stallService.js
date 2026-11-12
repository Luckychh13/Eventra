import api from './api.js'

export const getStalls = async () => {
    const response = await api.get('/api/stalls')
    return response.data
}

export const getStallById = async (stallId) => {
    const response = await api.get(`/api/stalls/${stallId}`)
    return response.data
}

export const getOwnerDashboard = async () => {
    const response = await api.get('/api/stalls/owner/dashboard')

    return response.data
}

export const markStallOrderCompleted = async (orderId) => {
    const response = await api.put(
        `/api/stalls/order/${encodeURIComponent(orderId)}/complete`
    )

    return response.data
}

export const addStallMenuItem = async (stallId, formData) => {
    const response = await api.post(
        `/api/stalls/${encodeURIComponent(stallId)}/item`,
        formData
    )

    return response.data
}

export const updateStallMenuItem = async (
    stallId,
    itemId,
    formData
) => {
    const response = await api.put(
        `/api/stalls/${encodeURIComponent(stallId)}/item/${encodeURIComponent(itemId)}`,
        formData
    )

    return response.data
}

export const deleteStallMenuItem = async (stallId, itemId) => {
    const response = await api.delete(
        `/api/stalls/${encodeURIComponent(stallId)}/item/${encodeURIComponent(itemId)}`
    )

    return response.data
}

export const resetStallTokens = async (stallId) => {
    const response = await api.post(
        `/api/stalls/${encodeURIComponent(stallId)}/reset`
    )

    return response.data
}

export const generateStallToken = async (stallId, visitorData) => {
    const response = await api.post(
        `/api/stalls/${encodeURIComponent(stallId)}/token`,
        visitorData
    )

    return response.data
}