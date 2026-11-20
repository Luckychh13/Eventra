
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import useStall from '../../hooks/useStall.js'
import useStallCart from '../../hooks/useStallCart.js'
import {
    createStallOrder,
    verifyStallPayment,
} from '../../services/api/stallPaymentService.js'
import './StallCartPage.css'

const formatPrice = (value) => {
    const amount = Number(value)

    if (!Number.isFinite(amount)) return '₹0'

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount)
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

    const navigate = useNavigate()

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

                        const confirmedTokenNumber =
                            result?.tokenNumber ?? result?.order?.tokenNumber

                        if (!result?.success || !result?.order || confirmedTokenNumber == null) {
                            throw new Error(
                                result?.error || 'Payment verification could not be confirmed.'
                            )
                        }

                        paymentVerified = true

                        refreshCart()

                        navigate('/success', {
                            replace: true,
                            state: {
                                paymentType: 'stall',
                                order: result.order,
                                tokenNumber: confirmedTokenNumber,
                                stallName: stall?.name,
                            },
                        })
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

                retry: {
                    enabled: false,
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
                navigate('/cancel', {
                    replace: true,
                    state: {
                        message:
                            response.error?.description ||
                            response.error?.reason ||
                            'Your stall payment could not be completed.',
                        returnTo: `/stall/${id}/cart`,
                        returnLabel: 'Return to Stall Cart',
                    },
                })

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
            <main className="stall-cart-page stall-cart-page--state">
                <div className="stall-cart-state-card">
                    <span className="stall-cart-spinner" />
                    <p>Loading your stall cart...</p>
                </div>
            </main>
        )
    }

    if (stallError || cartError) {
        return (
            <main className="stall-cart-page stall-cart-page--state">
                <div className="stall-cart-state-card stall-cart-state-card--error">
                    <span className="stall-cart-state-icon">!</span>
                    <h1>Unable to load your cart</h1>
                    <p>{stallError || cartError}</p>

                    <Link
                        to={`/stall/${id}`}
                        className="stall-cart-primary-link"
                    >
                        Back to Stall
                        <span>↗</span>
                    </Link>
                </div>
            </main>
        )
    }

    const items = cart?.items || []

    const totalItems = items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    )

    return (
        <main className="stall-cart-page">
            <div className="stall-cart-glow stall-cart-glow--one" />
            <div className="stall-cart-glow stall-cart-glow--two" />

            <div className="stall-cart-container">
                <Link
                    to={`/stall/${id}`}
                    className="stall-cart-back-link"
                >
                    <span>←</span>
                    Back to Stall
                </Link>

                <header className="stall-cart-header">
                    <div>
                        <span className="stall-cart-eyebrow">
                            YOUR STALL SELECTION
                        </span>

                        <h1>Your Stall Cart<span>.</span></h1>

                        <p>{stall?.name || 'Selected Stall'}</p>
                    </div>

                    <div className="stall-cart-item-count">
                        <span className="stall-cart-count-icon">▤</span>
                        <div>
                            <strong>{totalItems}</strong>
                            <span>{totalItems === 1 ? 'ITEM' : 'ITEMS'}</span>
                        </div>
                    </div>
                </header>

                {items.length > 0 && (
                    <div className="stall-cart-toolbar">
                        <span>
                            Review your items before placing your order.
                        </span>

                        <button
                            type="button"
                            onClick={clearCart}
                            disabled={actionLoading || checkoutLoading}
                            className="stall-cart-clear-button"
                        >
                            Clear Cart
                        </button>
                    </div>
                )}

                {actionError && (
                    <div
                        role="alert"
                        className="stall-cart-alert stall-cart-alert--error"
                    >
                        <span>!</span>
                        {actionError}
                    </div>
                )}

                {checkoutError && (
                    <div
                        role="alert"
                        className="stall-cart-alert stall-cart-alert--error"
                    >
                        <span>!</span>
                        {checkoutError}
                    </div>
                )}

                {checkoutMessage && (
                    <div
                        role="status"
                        className="stall-cart-alert stall-cart-alert--success"
                    >
                        <div>
                            <span>✓</span>
                            <p>{checkoutMessage}</p>
                        </div>

                        {tokenNumber !== null && (
                            <strong>
                                Your Stall Token Number: {tokenNumber}
                            </strong>
                        )}
                    </div>
                )}

                {items.length === 0 ? (
                    <section className="stall-cart-empty">
                        <div className="stall-cart-empty-icon">▤</div>

                        <span className="stall-cart-section-label">
                            YOUR ORDER STARTS HERE
                        </span>

                        <h2>Your cart is empty</h2>

                        <p>
                            Explore this stall's menu and add some items.
                            Your next favourite bite could be waiting here.
                        </p>

                        <Link
                            to={`/stall/${id}`}
                            className="stall-cart-primary-link"
                        >
                            Explore Menu
                            <span>↗</span>
                        </Link>
                    </section>
                ) : (
                    <div className="stall-cart-layout">
                        <section className="stall-cart-items-section">
                            <div className="stall-cart-section-heading">
                                <h2>Selected Items</h2>
                                <span>{items.length} {items.length === 1 ? 'PRODUCT' : 'PRODUCTS'}</span>
                            </div>

                            <div className="stall-cart-items-list">
                                {items.map((item) => (
                                    <article
                                        key={item.itemId}
                                        className="stall-cart-item-card"
                                    >
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="stall-cart-item-image"
                                            />
                                        ) : (
                                            <div className="stall-cart-item-placeholder">
                                                <span>◇</span>
                                                <small>No image</small>
                                            </div>
                                        )}

                                        <div className="stall-cart-item-info">
                                            <h3>{item.name}</h3>

                                            <p>
                                                {formatPrice(item.price)} each
                                            </p>

                                            <strong>
                                                Subtotal:{' '}
                                                {formatPrice(
                                                    Number(item.price) * Number(item.quantity)
                                                )}
                                            </strong>
                                        </div>

                                        <div className="stall-cart-item-actions">
                                            <div className="stall-cart-quantity-control">
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
                                                    aria-label={`Decrease ${item.name} quantity`}
                                                >
                                                    −
                                                </button>

                                                <span>{item.quantity}</span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.itemId,
                                                            Number(item.quantity) + 1
                                                        )
                                                    }
                                                    disabled={actionLoading || checkoutLoading}
                                                    aria-label={`Increase ${item.name} quantity`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.itemId)}
                                                disabled={actionLoading || checkoutLoading}
                                                className="stall-cart-remove-button"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <aside className="stall-cart-summary">
                            <div className="stall-cart-summary-heading">
                                <span className="stall-cart-section-label">
                                    YOUR ORDER
                                </span>
                                <h2>Order Summary</h2>
                            </div>

                            <div className="stall-cart-summary-line">
                                <span>Total Items</span>
                                <strong>{totalItems}</strong>
                            </div>

                            <div className="stall-cart-summary-divider" />

                            <div className="stall-cart-summary-total">
                                <span>Total</span>
                                <strong>{formatPrice(cart?.totalPrice)}</strong>
                            </div>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={
                                    checkoutLoading ||
                                    actionLoading ||
                                    items.length === 0
                                }
                                className="stall-cart-checkout-button"
                            >
                                {checkoutLoading
                                    ? 'Processing...'
                                    : 'Proceed to Checkout'}
                                {!checkoutLoading && <span>↗</span>}
                            </button>

                            <div className="stall-cart-secure-note">
                                <span>◇</span>
                                <p>Secure checkout powered by Razorpay</p>
                            </div>

                            <p className="stall-cart-summary-note">
                                Final item prices are verified by the backend
                                during checkout.
                            </p>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    )
}

export default StallCartPage
