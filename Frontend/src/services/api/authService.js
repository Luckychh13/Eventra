import api from './api.js'

export const getCurrentUser = async () => {
    const response = await api.get('/api/auth/me')

    return response.data.user
}