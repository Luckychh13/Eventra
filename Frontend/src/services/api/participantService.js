import api from './api.js'

export const getParticipants = async () => {
    const response = await api.get('/api/participants')
    return response.data
}

export const createParticipant = async (formData) => {
    const response = await api.post(
        '/api/participants',
        formData
    )

    return response.data
}

export const updateParticipant = async (id, formData) => {
    const response = await api.put(
        `/api/participants/${id}`,
        formData
    )

    return response.data
}

export const deleteParticipant = async (id) => {
    const response = await api.delete(
        `/api/participants/${id}`
    )

    return response.data
}