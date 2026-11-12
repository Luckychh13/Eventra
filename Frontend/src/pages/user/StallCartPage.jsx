import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import useStall from '../../hooks/useStall.js'
import useStallCart from '../../hooks/useStallCart.js'
import {
    createStallOrder,
    verifyStallPayment,
} from '../../services/api/stallPaymentService.js'

const formatPrice = (value) => {
    const amount = Number(value)

    if (!Number.isFinite(amount)) return '₹0'

    return `₹${amount.toLocaleString('en-IN')}`
}

function StallCartPage() {
    const { id } = useParams()
    const { user } = useAuth()

    const {
        stall,
        loading: stallLoading,
        error: stallError,
    } = useStall(id)

    const {
        cart,
        loading: cartLoading,
        error: cartError,
        actionError,
        actionLoading,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
    } = useStallCart(id)

    const [checkoutLoading, setCheckoutLoading] = useState(false)
    const [checkoutError, setCheckoutError] = useState('')
    const [checkoutMessage, setCheckoutMessage] = useState('')
    const [tokenNumber, setTokenNumber] = useState(null)

    const handleCheckout = async () => {
        setCheckoutError('')
        setCheckoutMessage('')
        setTokenNumber(null)

        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
            setCheckoutError('Razorpay Key ID is not configured.')
            return
        }

        if (typeof window.Razorpay !== 'function') {
            setCheckoutError('Razorpay Checkout SDK is not loaded.')
            return
        }

        if (!cart?.items?.length) {
            setCheckoutError('Your stall cart is empty.')
            return
        }

        setCheckoutLoading(true)

        try {
            const orderData = await createStallOrder(id)
            const razorpayOrder = orderData.order

            if (!razorpayOrder?.id || !razorpayOrder?.amount) {
                throw new Error('Invalid Razorpay order received from backend.')
            }

            let paymentVerified = false

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency || 'INR',
                name: 'Eventra',
                description: `Order at ${stall?.name || 'Stall'}`,
                order_id: razorpayOrder.id,

                prefill: {
                    name: user?.displayName || '',
                    email: user?.email || '',
                },

                theme: {
                    color: '#5B46E8',
                },

                handler: async (paymentResponse) => {
                    try {
                        setCheckoutError('')
                        setCheckoutMessage('Payment received. Verifying your order...')

                        const result = await verifyStallPayment(paymentResponse)

                        if (!result?.success) {
                            throw new Error(
                                result?.error || 'Payment verification failed.'
                            )
                        }

                        paymentVerified = true

                        setTokenNumber(result.tokenNumber ?? null)
                        setCheckoutMessage(
                            result.message || 'Payment verified successfully!'
                        )

                        refreshCart()
                    } catch (verificationError) {
                        setCheckoutError(
                            verificationError.response?.data?.error ||
                            verificationError.message ||
                            'Payment was received, but Eventra could not verify your order. Check your order status before trying another payment.'
                        )
                    } finally {
                        setCheckoutLoading(false)
                    }
                },

                modal: {
                    ondismiss: () => {
                        if (!paymentVerified) {
                            setCheckoutMessage(
                                'Checkout closed. If you completed payment, check your order status before attempting another payment.'
                            )
                        }

                        setCheckoutLoading(false)
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
                requestError.message ||
                'Unable to initiate checkout. Please try again.'
            )

            setCheckoutLoading(false)
        }
    }

    if (stallLoading || cartLoading) {
        return (
            <main className="px-4 py-20 text-center text-gray-400">
                Loading your stall cart...
            </main>
        )
    }

    if (stallError || cartError) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-16 text-center text-white">
                <h1 className="text-2xl font-bold">
                    Unable to load your cart
                </h1>

                <p className="mt-3 text-sm text-red-400">
                    {stallError || cartError}
                </p>

                <Link
                    to={`/stall/${id}`}
                    className="mt-6 inline-block rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium hover:bg-purple-700"
                >
                    Back to Stall
                </Link>
            </main>
        )
    }

    const items = cart?.items || []

    const totalItems = items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    )

    return (
        <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 text-white sm:px-6 lg:px-8">

            <Link
                to={`/stall/${id}`}
                className="text-sm text-gray-400 transition hover:text-white"
            >
                ← Back to Stall
            </Link>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        Your Stall Cart
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        {stall?.name || 'Selected Stall'}
                    </p>
                </div>

                {items.length > 0 && (
                    <button
                        type="button"
                        onClick={clearCart}
                        disabled={actionLoading || checkoutLoading}
                        className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                        Clear Cart
                    </button>
                )}
            </div>

            {actionError && (
                <p
                    role="alert"
                    className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400"
                >
                    {actionError}
                </p>
            )}

            {checkoutError && (
                <p
                    role="alert"
                    className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400"
                >
                    {checkoutError}
                </p>
            )}

            {checkoutMessage && (
                <div className="mt-5 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <p className="text-sm text-green-400">
                        {checkoutMessage}
                    </p>

                    {tokenNumber !== null && (
                        <p className="mt-2 font-semibold text-white">
                            Your Stall Token Number: {tokenNumber}
                        </p>
                    )}
                </div>
            )}

            {items.length === 0 ? (
                <div className="mt-10 rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
                    <h2 className="text-xl font-semibold">
                        Your cart is empty
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                        Explore this stall's menu and add some items.
                    </p>

                    <Link
                        to={`/stall/${id}`}
                        className="mt-6 inline-block rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium hover:bg-purple-700"
                    >
                        Explore Menu
                    </Link>
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">

                    {/* Cart items */}
                    <section className="space-y-4">
                        {items.map((item) => (
                            <article
                                key={item.itemId}
                                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center"
                            >
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="h-24 w-full rounded-lg object-cover sm:w-28"
                                    />
                                ) : (
                                    <div className="flex h-24 w-full items-center justify-center rounded-lg bg-white/5 text-xs text-gray-500 sm:w-28">
                                        No image
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <h2 className="font-semibold">
                                        {item.name}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-400">
                                        {formatPrice(item.price)} each
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-purple-300">
                                        Subtotal: {formatPrice(
                                            Number(item.price) * Number(item.quantity)
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQuantity(
                                                    item.itemId,
                                                    Number(item.quantity) - 1
                                                )
                                            }
                                            disabled={
                                                actionLoading ||
                                                checkoutLoading ||
                                                Number(item.quantity) <= 1
                                            }
                                            className="h-8 w-8 rounded border border-white/20 disabled:opacity-40"
                                            aria-label={`Decrease ${item.name} quantity`}
                                        >
                                            −
                                        </button>

                                        <span className="min-w-5 text-center">
                                            {item.quantity}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQuantity(
                                                    item.itemId,
                                                    Number(item.quantity) + 1
                                                )
                                            }
                                            disabled={actionLoading || checkoutLoading}
                                            className="h-8 w-8 rounded border border-white/20 disabled:opacity-40"
                                            aria-label={`Increase ${item.name} quantity`}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.itemId)}
                                        disabled={actionLoading || checkoutLoading}
                                        className="text-sm text-red-400 hover:text-red-300 disabled:opacity-40"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>

                    {/* Cart summary */}
                    <aside className="h-fit rounded-xl border border-white/10 bg-white/5 p-5">
                        <h2 className="text-lg font-semibold">
                            Order Summary
                        </h2>

                        <div className="mt-5 flex justify-between text-sm text-gray-400">
                            <span>Total Items</span>
                            <span>{totalItems}</span>
                        </div>

                        <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                            <span className="font-semibold">
                                Total
                            </span>

                            <span className="text-xl font-bold text-purple-300">
                                {formatPrice(cart?.totalPrice)}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={
                                checkoutLoading ||
                                actionLoading ||
                                items.length === 0
                            }
                            className="mt-5 w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {checkoutLoading
                                ? 'Processing...'
                                : 'Proceed to Checkout'}
                        </button>

                        <p className="mt-3 text-xs text-gray-400">
                            Final item prices are verified by the backend during checkout.
                        </p>
                    </aside>
                </div>
            )}
        </main>
    )
}

export default StallCartPage
