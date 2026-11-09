import api from './api.js'

export const getAnnouncements = async () => {
    const response = await api.get('/api/announcements')
    return response.data.announcements
}