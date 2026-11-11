import useCart from '../../hooks/useCart.js'
import { useState } from 'react'
import useAuth from '../../hooks/useAuth.js'
import {
    createEventOrder,
    verifyEventPayment,
} from '../../services/api/eventPaymentService.js'

const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(Number(amount ?? 0))
}

const getEffectivePrice = (pricing) => {
    if (!pricing) return 0

    const offerIsValid =
        pricing.offer?.active === true &&
        pricing.offer?.expiry &&
        new Date(pricing.offer.expiry) > new Date()

    return Number(
        offerIsValid
            ? pricing.finalPrice ?? pricing.price
            : pricing.price ?? 0
    )
}

function CartPage() {
    const {
        cart,
        loading,
        error,
        actionError,
        actionLoading,
        updateQuantity,
        removeItem,
        refreshCart,
    } = useCart()

    const { user } = useAuth()

    const [checkoutLoading, setCheckoutLoading] = useState(false)
    const [checkoutError, setCheckoutError] = useState('')
    const [checkoutMessage, setCheckoutMessage] = useState('')

    const handleCheckout = async () => {
        setCheckoutError('')
        setCheckoutMessage('')

        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
            setCheckoutError('Razorpay Key ID is not configured.')
            return
        }

        if (typeof window.Razorpay !== 'function') {
            setCheckoutError('Razorpay Checkout SDK is not loaded.')
            return
        }

        setCheckoutLoading(true)

        try {
            const { order } = await createEventOrder()

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Eventra',
                description: 'Event ticket purchase',
                order_id: order.id,

                prefill: {
                    name: user?.displayName || '',
                    email: user?.email || '',
                },

                handler: async (paymentResponse) => {
                    try {
                        const result = await verifyEventPayment(
                            paymentResponse
                        )

                        setCheckoutMessage(
                            result.message || 'Payment verified successfully!'
                        )

                        await refreshCart()
                    } catch (verificationError) {
                        setCheckoutError(
                            verificationError.response?.data?.error ||
                            'Payment details were received, but Eventra could not verify the order. Check your order status before attempting another payment.'
                        )
                    } finally {
                        setCheckoutLoading(false)
                    }
                },

                modal: {
                    ondismiss: () => {
                        setCheckoutLoading(false)
                        setCheckoutMessage(
                            'Checkout was closed. Check your order status before trying again if you completed a payment.'
                        )
                    },
                },
            }

            const razorpayInstance = new window.Razorpay(options)

            razorpayInstance.on('payment.failed', (response) => {
                setCheckoutError(
                    response.error?.description ||
                    'Payment failed. Your cart has not been cleared.'
                )

                setCheckoutLoading(false)
            })

            razorpayInstance.open()
        } catch (requestError) {
            setCheckoutError(
                requestError.response?.data?.error ||
                'Unable to initiate checkout. Please try again.'
            )

            setCheckoutLoading(false)
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
                <p>Loading your cart...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
                <h1 className="text-2xl font-bold">
                    Unable to load cart
                </h1>

                <p role="alert" className="mt-3 text-red-400">
                    {error}
                </p>
            </main>
        )
    }

    const items = cart?.items ?? []

    const groupedItems = items.reduce((groups, item) => {
        const event = item.pricingId?.event
        const eventId = event?._id?.toString() ?? 'unknown-event'

        if (!groups[eventId]) {
            groups[eventId] = {
                event,
                items: [],
            }
        }

        groups[eventId].items.push(item)

        return groups
    }, {})

    return (
        <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
            <div className="mx-auto max-w-5xl">

                <h1 className="text-3xl font-bold">
                    My Cart
                </h1>

                <p className="mt-2 text-gray-400">
                    Review your selected event tickets.
                </p>

                {actionError && (
                    <p
                        role="alert"
                        className="mt-6 text-red-400"
                    >
                        {actionError}
                    </p>
                )}

                {items.length === 0 ? (
                    <section className="mt-10 rounded-lg border border-white/10 p-8 text-center">
                        <h2 className="text-xl font-semibold">
                            Your cart is empty
                        </h2>

                        <p className="mt-3 text-gray-400">
                            Explore events and add tickets to your cart.
                        </p>
                    </section>
                ) : (
                    <>
                        <div className="mt-8 space-y-8">

                            {Object.entries(groupedItems).map(
                                ([eventId, group]) => (
                                    <section
                                        key={eventId}
                                        className="rounded-lg border border-white/10 p-6"
                                    >
                                        <h2 className="text-xl font-semibold">
                                            {group.event?.title || 'Event unavailable'}
                                        </h2>

                                        {group.event && (
                                            <div className="mt-2 space-y-1 text-sm text-gray-400">
                                                <p>
                                                    {group.event.day} · {group.event.date}
                                                </p>

                                                <p>{group.event.location}</p>
                                            </div>
                                        )}

                                        <div className="mt-6 space-y-5">
                                            {group.items.map((item) => {
                                                const pricing = item.pricingId
                                                const pricingId = pricing?._id
                                                const unitPrice = getEffectivePrice(pricing)
                                                const subtotal = unitPrice * item.quantity

                                                return (
                                                    <article
                                                        key={pricingId || `${eventId}-unavailable`}
                                                        className="border-t border-white/10 pt-5"
                                                    >
                                                        <div className="flex flex-col justify-between gap-4 sm:flex-row">

                                                            <div>
                                                                <h3 className="font-semibold">
                                                                    {pricing?.ticketType || 'Ticket unavailable'}
                                                                </h3>

                                                                <p className="mt-1 text-sm text-gray-400">
                                                                    {formatPrice(unitPrice)} per ticket
                                                                </p>

                                                                <p className="mt-2 font-medium">
                                                                    Subtotal: {formatPrice(subtotal)}
                                                                </p>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoading || !pricingId}
                                                                    onClick={() =>
                                                                        updateQuantity(pricingId, 'decrease')
                                                                    }
                                                                    className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
                                                                >
                                                                    -
                                                                </button>

                                                                <span className="min-w-6 text-center">
                                                                    {item.quantity}
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoading || !pricingId}
                                                                    onClick={() =>
                                                                        updateQuantity(pricingId, 'increase')
                                                                    }
                                                                    className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
                                                                >
                                                                    +
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={actionLoading || !pricingId}
                                                                    onClick={() =>
                                                                        removeItem(pricingId)
                                                                    }
                                                                    className="ml-2 text-red-400 disabled:opacity-40"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>

                                                        </div>
                                                    </article>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )
                            )}

                        </div>

                        <section className="mt-8 rounded-lg border border-white/10 p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Cart Total
                                </h2>

                                <p className="text-2xl font-bold">
                                    {formatPrice(cart?.totalPrice)}
                                </p>
                            </div>

                            {checkoutError && (
                                <p role="alert" className="mt-4 text-red-400">
                                    {checkoutError}
                                </p>
                            )}

                            {checkoutMessage && (
                                <p role="status" className="mt-4 text-green-400">
                                    {checkoutMessage}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={checkoutLoading || actionLoading || items.length === 0}
                                className="mt-6 rounded bg-eventra-purple px-6 py-3 text-white disabled:opacity-50"
                            >
                                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                            </button>

                            <p className="mt-3 text-sm text-gray-400">
                                Final ticket availability and pricing are
                                verified during checkout.
                            </p>
                        </section>
                    </>
                )}

            </div>
        </main>
    )
}

export default CartPage
