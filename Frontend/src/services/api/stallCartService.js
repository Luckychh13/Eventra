import api from './api.js'

const normalizeCart = (data) => {
    const cart = data?.cart ?? data

    return {
        ...cart,
        items: Array.isArray(cart?.items) ? cart.items : [],
        totalPrice: Number(cart?.totalPrice) || 0,
    }
}

export const getStallCart = async ({ uid, stallId }) => {
    const response = await api.get(
        `/api/stallCart/${encodeURIComponent(uid)}/${encodeURIComponent(stallId)}`
    )

    return normalizeCart(response.data)
}

export const addStallItemToCart = async ({ stallId, itemId }) => {
    const response = await api.post('/api/stallCart/add', {
        stallId,
        itemId,
    })

    return normalizeCart(response.data)
}

export const updateStallCartItem = async ({
    stallId,
    itemId,
    quantity,
}) => {
    const response = await api.put('/api/stallCart/update', {
        stallId,
        itemId,
        quantity,
    })

    return normalizeCart(response.data)
}

export const deleteStallCartItem = async ({ stallId, itemId }) => {
    const response = await api.delete('/api/stallCart/delete', {
        data: {
            stallId,
            itemId,
        },
    })

    return normalizeCart(response.data)
}

export const clearStallCart = async (stallId) => {
    const response = await api.delete('/api/stallCart/clear', {
        data: { stallId },
    })

    return response.data
}