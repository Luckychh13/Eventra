
import api from './api.js'

export const createEventOrder = async () => {
    const response = await api.post(
        '/api/razorpay/events/create-order'
    )

    return response.data
}

export const verifyEventPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) => {
    const response = await api.post(
        '/api/razorpay/events/verify-payment',
        {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        }
    )

    return response.data
}

export const getUserOrders = async (uid) => {
    const response = await api.get(
        `/api/razorpay/events/user-orders/${encodeURIComponent(uid)}`
    )

    return response.data
}

export const getAllEventOrders = async () => {
    const response = await api.get(
        '/api/razorpay/events/all-orders'
    )

    return response.data
}

export const allotEventTicket = async (orderId) => {
    const response = await api.put(
        `/api/razorpay/events/allot/${orderId}`
    )

    return response.data
}
