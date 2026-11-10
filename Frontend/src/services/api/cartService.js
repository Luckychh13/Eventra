import api from './api.js'

export const getCart = async (uid) => {
    const response = await api.get(`/api/cart/${encodeURIComponent(uid)}`)

    return response.data
}

export const addToCart = async ({
    uid,
    eventId,
    pricingId,
    quantity = 1,
}) => {
    const response = await api.post('/api/cart/add', {
        uid,
        eventId,
        pricingId,
        quantity,
    })

    return response.data.cart
}

export const updateCartItem = async ({
    uid,
    pricingId,
    action,
}) => {
    const response = await api.put('/api/cart/update', {
        uid,
        pricingId,
        action,
    })

    return response.data.cart
}

export const removeCartItem = async ({
    uid,
    pricingId,
}) => {
    const response = await api.delete('/api/cart/delete', {
        data: {
            uid,
            pricingId,
        },
    })

    return response.data.cart
}