import api from './api.js'

export const createStallOrder = async (stallId) => {
    const response = await api.post(
        '/api/stallPayment/create-order',
        { stallId }
    )

    return response.data
}

export const verifyStallPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) => {
    const response = await api.post(
        '/api/stallPayment/verify-payment',
        {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        }
    )

    return response.data
}

export const getUserStallOrders = async (uid) => {
    const response = await api.get(
        `/api/stallPayment/user-orders/${encodeURIComponent(uid)}`
    )

    return response.data
}

export const getStallOrders = async (stallId) => {
    const response = await api.get(
        `/api/stallPayment/stall/${encodeURIComponent(stallId)}`
    )

    return response.data
}