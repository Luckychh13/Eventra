
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCart from '../../hooks/useCart.js'
import useAuth from '../../hooks/useAuth.js'
import {
    createEventOrder,
    verifyEventPayment,
} from '../../services/api/eventPaymentService.js'
import './CartPage.css'

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
    const navigate = useNavigate()

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
                        const result = await verifyEventPayment(paymentResponse)

                        if (!result?.success || !result?.order?.ticketOrderId) {
                            throw new Error(
                                result?.message || 'Payment verification could not be confirmed.'
                            )
                        }

                        navigate('/success', {
                            replace: true,
                            state: {
                                paymentType: 'event',
                                order: result.order,
                            },
                        })

                        refreshCart().catch(() => { })
                    } catch (verificationError) {
                        setCheckoutError(
                            verificationError.response?.data?.error ||
                            'Payment details were received, but Eventra could not verify the order. Check your order status before attempting another payment.'
                        )
                    } finally {
                        setCheckoutLoading(false)
                    }
                },

                retry: {
                    enabled: false,
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
                navigate('/cancel', {
                    replace: true,
                    state: {
                        message:
                            response.error?.description ||
                            response.error?.reason ||
                            'Your event payment could not be completed.',
                        returnTo: '/cart',
                        returnLabel: 'Return to Cart',
                    },
                })

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
            <main className="cart-page cart-page--state">
                <div className="cart-state-card">
                    <span className="cart-loading-spinner" />
                    <p>Loading your cart...</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="cart-page cart-page--state">
                <div className="cart-state-card cart-state-card--error">
                    <span className="cart-state-icon">!</span>
                    <h1>Unable to load cart</h1>
                    <p role="alert">{error}</p>
                </div>
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
        <main className="cart-page">
            <div className="cart-page__glow cart-page__glow--one" />
            <div className="cart-page__glow cart-page__glow--two" />

            <div className="cart-container">
                <header className="cart-header">
                    <span className="cart-eyebrow">
                        YOUR EVENTRA SELECTION
                    </span>

                    <div className="cart-heading-row">
                        <div>
                            <h1>My Cart<span>.</span></h1>
                            <p>
                                Your next experience is just a few steps away.
                            </p>
                        </div>

                        <div className="cart-item-count">
                            <span className="cart-count-icon">▤</span>
                            <div>
                                <strong>{items.length}</strong>
                                <span>{items.length === 1 ? 'TICKET ITEM' : 'TICKET ITEMS'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {actionError && (
                    <div className="cart-alert cart-alert--error" role="alert">
                        <span>!</span>
                        {actionError}
                    </div>
                )}

                {items.length === 0 ? (
                    <section className="cart-empty">
                        <div className="cart-empty-icon">▤</div>
                        <span className="cart-section-label">NOTHING HERE YET</span>
                        <h2>Your cart is waiting for an adventure.</h2>
                        <p>
                            Explore upcoming events and add your favourite
                            tickets. Your next experience starts here.
                        </p>
                        <a href="/eventSchedules" className="cart-primary-link">
                            Explore Events <span>↗</span>
                        </a>
                    </section>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-events">
                            <div className="cart-list-heading">
                                <h2>Selected Tickets</h2>
                                <span>{items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}</span>
                            </div>

                            {Object.entries(groupedItems).map(
                                ([eventId, group]) => (
                                    <section
                                        key={eventId}
                                        className="cart-event-card"
                                    >
                                        <div className="cart-event-heading">
                                            <div className="cart-event-mark">E</div>

                                            <div className="cart-event-info">
                                                <span className="cart-section-label">
                                                    EVENT
                                                </span>
                                                <h3>
                                                    {group.event?.title || 'Event unavailable'}
                                                </h3>

                                                {group.event && (
                                                    <div className="cart-event-meta">
                                                        <span>
                                                            {group.event.day} · {group.event.date}
                                                        </span>
                                                        <span>{group.event.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="cart-ticket-list">
                                            {group.items.map((item) => {
                                                const pricing = item.pricingId
                                                const pricingId = pricing?._id
                                                const unitPrice = getEffectivePrice(pricing)
                                                const subtotal = unitPrice * item.quantity

                                                return (
                                                    <article
                                                        key={pricingId || `${eventId}-unavailable`}
                                                        className="cart-ticket"
                                                    >
                                                        <div className="cart-ticket-main">
                                                            <div className="cart-ticket-symbol">
                                                                ◈
                                                            </div>

                                                            <div className="cart-ticket-info">
                                                                <h4>
                                                                    {pricing?.ticketType || 'Ticket unavailable'}
                                                                </h4>
                                                                <p>
                                                                    {formatPrice(unitPrice)} per ticket
                                                                </p>
                                                                <strong>
                                                                    Subtotal: {formatPrice(subtotal)}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        <div className="cart-ticket-actions">
                                                            <div className="cart-quantity-control">
                                                                <button
                                                                    type="button"
                                                                    aria-label="Decrease quantity"
                                                                    disabled={actionLoading || !pricingId}
                                                                    onClick={() =>
                                                                        updateQuantity(pricingId, 'decrease')
                                                                    }
                                                                >
                                                                    −
                                                                </button>

                                                                <span>{item.quantity}</span>

                                                                <button
                                                                    type="button"
                                                                    aria-label="Increase quantity"
                                                                    disabled={actionLoading || !pricingId}
                                                                    onClick={() =>
                                                                        updateQuantity(pricingId, 'increase')
                                                                    }
                                                                >
                                                                    +
                                                                </button>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                className="cart-remove-button"
                                                                disabled={actionLoading || !pricingId}
                                                                onClick={() =>
                                                                    removeItem(pricingId)
                                                                }
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </article>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )
                            )}
                        </div>

                        <aside className="cart-summary">
                            <div className="cart-summary-top">
                                <span className="cart-section-label">
                                    YOUR ORDER
                                </span>
                                <h2>Order Summary</h2>
                            </div>

                            <div className="cart-summary-line">
                                <span>Ticket items</span>
                                <strong>{items.length}</strong>
                            </div>

                            <div className="cart-summary-line">
                                <span>Order subtotal</span>
                                <strong>{formatPrice(cart?.totalPrice)}</strong>
                            </div>

                            <div className="cart-summary-divider" />

                            <div className="cart-summary-total">
                                <span>Total Amount</span>
                                <strong>{formatPrice(cart?.totalPrice)}</strong>
                            </div>

                            {checkoutError && (
                                <div className="cart-alert cart-alert--error" role="alert">
                                    {checkoutError}
                                </div>
                            )}

                            {checkoutMessage && (
                                <div className="cart-alert cart-alert--success" role="status">
                                    {checkoutMessage}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={checkoutLoading || actionLoading || items.length === 0}
                                className="cart-checkout-button"
                            >
                                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                                {!checkoutLoading && <span>↗</span>}
                            </button>

                            <div className="cart-secure-note">
                                <span>◇</span>
                                <p>Secure checkout powered by Razorpay</p>
                            </div>

                            <p className="cart-summary-note">
                                Final ticket availability and pricing are
                                verified during checkout.
                            </p>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    )
}

export default CartPage
