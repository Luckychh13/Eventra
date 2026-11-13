import api from './api.js'

export const getAllUsers = async () => {
    const response = await api.get('/api/users/all')
    return response.data
}

export const getAdmins = async () => {
    const response = await api.get('/api/admin/list-admins')
    return response.data
}

export const makeAdmin = async (email) => {
    const response = await api.post('/api/admin/make-admin', {
        email,
    })

    return response.data
}

export const removeAdmin = async (email) => {
    const response = await api.post('/api/admin/remove-admin', {
        email,
    })

    return response.data
}