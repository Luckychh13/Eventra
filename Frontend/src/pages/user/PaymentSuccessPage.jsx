
import { Link, useLocation } from 'react-router-dom'
import './PaymentSuccessPage.css'

const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(Number(amount ?? 0))
}

function PaymentSuccessPage() {
    const { state } = useLocation()

    const { paymentType, order, tokenNumber, stallName } = state || {}

    const isEventPayment =
        paymentType === 'event' && Boolean(order?.ticketOrderId)

    const isStallPayment =
        paymentType === 'stall' &&
        Boolean(order) &&
        (tokenNumber ?? order?.tokenNumber) != null

    const confirmedToken = tokenNumber ?? order?.tokenNumber

    if (!isEventPayment && !isStallPayment) {
        return (
            <main className="payment-success-page payment-success-page--fallback">
                <div className="payment-success-glow payment-success-glow--one" />

                <section className="payment-success-card payment-success-fallback-card">
                    <div className="payment-success-fallback-icon">?</div>

                    <span className="payment-success-eyebrow">
                        ORDER INFORMATION
                    </span>

                    <h1>Payment Details Unavailable</h1>

                    <p className="payment-success-description">
                        Please check your orders to confirm your payment status.
                    </p>

                    <div className="payment-success-fallback-links">
                        <Link to="/bookings" className="payment-success-primary-link">
                            My Bookings
                        </Link>

                        <Link to="/stall-orders" className="payment-success-secondary-link">
                            My Stall Orders
                        </Link>
                    </div>
                </section>
            </main>
        )
    }

    return (
        <main className="payment-success-page">
            <div className="payment-success-glow payment-success-glow--one" />
            <div className="payment-success-glow payment-success-glow--two" />

            <section className="payment-success-card">
                <div className="payment-success-icon">
                    <span>✓</span>
                </div>

                <span className="payment-success-eyebrow">
                    PAYMENT CONFIRMED
                </span>

                <h1>Payment Successful<span>.</span></h1>

                <p className="payment-success-description">
                    Your payment has been verified. Thank you for choosing Eventra.
                </p>

                {isEventPayment && (
                    <div className="payment-success-details">
                        <div className="payment-success-detail-heading">
                            <span className="payment-success-section-label">
                                EVENT BOOKING
                            </span>
                            <span className="payment-success-detail-mark">E</span>
                        </div>

                        <div className="payment-success-order-reference">
                            <span>Ticket Order ID</span>
                            <strong>{order.ticketOrderId}</strong>
                        </div>

                        <div className="payment-success-amount">
                            <span>Amount Paid</span>
                            <strong>{formatPrice(order.amount)}</strong>
                        </div>

                        <p className="payment-success-detail-note">
                            Your purchased tickets and booking information are
                            available in My Bookings.
                        </p>
                    </div>
                )}

                {isStallPayment && (
                    <div className="payment-success-details">
                        <div className="payment-success-detail-heading">
                            <span className="payment-success-section-label">
                                STALL ORDER
                            </span>
                            <span className="payment-success-detail-mark">S</span>
                        </div>

                        <div className="payment-success-token">
                            <span className="payment-success-token-label">
                                YOUR STALL TOKEN NUMBER
                            </span>

                            <strong>{confirmedToken}</strong>

                            {stallName && (
                                <span className="payment-success-stall-name">
                                    {stallName}
                                </span>
                            )}

                            <span className="payment-success-token-caption">
                                KEEP THIS NUMBER HANDY
                            </span>
                        </div>

                        <div className="payment-success-amount">
                            <span>Amount Paid</span>
                            <strong>{formatPrice(order.totalAmount)}</strong>
                        </div>

                        <p className="payment-success-detail-note">
                            Keep your token number available when collecting
                            your order from the stall.
                        </p>
                    </div>
                )}

                <div className="payment-success-actions">
                    <Link
                        to={isEventPayment ? '/bookings' : '/stall-orders'}
                        className="payment-success-primary-link"
                    >
                        {isEventPayment ? 'My Bookings' : 'My Stall Orders'}
                        <span>↗</span>
                    </Link>

                    <Link
                        to="/"
                        className="payment-success-secondary-link"
                    >
                        Back to Home
                    </Link>
                </div>

                <div className="payment-success-footer">
                    <span />
                    <p>EVENTRA · EVERY EXPERIENCE MATTERS</p>
                    <span />
                </div>
            </section>
        </main>
    )
}

export default PaymentSuccessPage
