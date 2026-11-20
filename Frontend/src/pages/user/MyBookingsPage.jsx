
import { Link } from 'react-router-dom'
import useUserOrders from '../../hooks/useUserOrders.js'
import './MyBookingsPage.css'

const formatPrice = (value) => {
    const amount = Number(value)

    if (!Number.isFinite(amount)) return '₹0'

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount)
}

const formatDate = (value) => {
    if (!value) return 'Date unavailable'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return 'Date unavailable'
    }

    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

const getPaymentStatusClass = (status) => {
    const statusStyles = {
        SUCCESS: 'bookings-status--success',
        PENDING: 'bookings-status--pending',
        FAILED: 'bookings-status--failed',
    }

    return statusStyles[status] || 'bookings-status--unknown'
}

function MyBookingsPage() {
    const { orders, loading, error, refreshOrders } = useUserOrders()

    return (
        <main className="my-bookings-page">
            <div className="my-bookings-glow my-bookings-glow--one" />
            <div className="my-bookings-glow my-bookings-glow--two" />

            <div className="my-bookings-container">
                <header className="bookings-header">
                    <span className="bookings-eyebrow">
                        YOUR EVENTRA JOURNEY
                    </span>

                    <div className="bookings-heading-row">
                        <div>
                            <h1>My Bookings<span>.</span></h1>
                            <p>
                                Your purchased tickets and event payment history,
                                all in one place.
                            </p>
                        </div>

                        {!loading && !error && orders.length > 0 && (
                            <div className="bookings-count">
                                <span className="bookings-count-icon">▤</span>
                                <div>
                                    <strong>{orders.length}</strong>
                                    <span>
                                        {orders.length === 1 ? 'BOOKING' : 'BOOKINGS'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {loading && (
                    <div className="bookings-state-card">
                        <span className="bookings-spinner" />
                        <p>Loading your bookings...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="bookings-state-card bookings-state-card--error">
                        <span className="bookings-state-icon">!</span>
                        <h2>Unable to load bookings</h2>
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={refreshOrders}
                            className="bookings-retry-button"
                        >
                            Try Again
                            <span>↻</span>
                        </button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <section className="bookings-empty">
                        <div className="bookings-empty-icon">▤</div>
                        <span className="bookings-section-label">
                            YOUR STORY STARTS HERE
                        </span>

                        <h2>No bookings yet</h2>

                        <p>
                            You haven't purchased any event tickets yet.
                            Discover an event and make your next experience
                            memorable.
                        </p>

                        <Link to="/" className="bookings-primary-link">
                            Explore Events
                            <span>↗</span>
                        </Link>
                    </section>
                )}

                {!loading && !error && orders.length > 0 && (
                    <section className="bookings-list">
                        <div className="bookings-list-heading">
                            <h2>Booking History</h2>
                            <span>YOUR PURCHASES</span>
                        </div>

                        {orders.map((order) => {
                            const status = String(
                                order.paymentStatus || 'UNKNOWN'
                            ).toUpperCase()

                            const statusClass = getPaymentStatusClass(status)

                            return (
                                <article
                                    key={order._id}
                                    className="booking-card"
                                >
                                    <div className="booking-card-header">
                                        <div className="booking-reference">
                                            <span className="booking-reference-icon">E</span>

                                            <div>
                                                <span className="booking-label">
                                                    BOOKING ID
                                                </span>

                                                <strong>
                                                    {order.ticketOrderId || order._id}
                                                </strong>

                                                <p>
                                                    Booked on {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="booking-payment">
                                            <span className={`bookings-status ${statusClass}`}>
                                                <span />
                                                {status}
                                            </span>

                                            <div className="booking-amount">
                                                <span className="booking-label">
                                                    TOTAL AMOUNT
                                                </span>
                                                <strong>{formatPrice(order.amount)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="booking-tickets">
                                        <div className="booking-tickets-heading">
                                            <h3>Ticket Details</h3>
                                            <span>
                                                {order.items?.length || 0}{' '}
                                                {(order.items?.length || 0) === 1
                                                    ? 'TICKET ITEM'
                                                    : 'TICKET ITEMS'}
                                            </span>
                                        </div>

                                        {order.items?.map((item, index) => {
                                            const event = item.eventId
                                            const pricing = item.pricingId

                                            return (
                                                <div
                                                    key={item._id || `${order._id}-${index}`}
                                                    className="booking-ticket-item"
                                                >
                                                    <div className="booking-ticket-symbol">
                                                        ◈
                                                    </div>

                                                    <div className="booking-ticket-info">
                                                        <h4>
                                                            {event?.title || 'Event details unavailable'}
                                                        </h4>

                                                        <div className="booking-ticket-meta">
                                                            <span>
                                                                <strong>Date</strong>
                                                                {event?.date
                                                                    ? formatDate(event.date)
                                                                    : 'Not available'}
                                                            </span>

                                                            <span>
                                                                <strong>Location</strong>
                                                                {event?.location || 'Not available'}
                                                            </span>

                                                            <span>
                                                                <strong>Ticket Type</strong>
                                                                {pricing?.ticketType || 'Not available'}
                                                            </span>

                                                            <span>
                                                                <strong>Quantity</strong>
                                                                {item.quantity}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="booking-ticket-price">
                                                        <span>
                                                            {formatPrice(item.price)} each
                                                        </span>
                                                        <strong>
                                                            {formatPrice(
                                                                Number(item.price) * Number(item.quantity)
                                                            )}
                                                        </strong>
                                                        <small>ITEM TOTAL</small>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="booking-card-footer">
                                        <span>
                                            <span className="booking-footer-dot" />
                                            EVENTRA BOOKING
                                        </span>
                                        <span>
                                            Booking details are shown as recorded
                                            at the time of purchase.
                                        </span>
                                    </div>
                                </article>
                            )
                        })}
                    </section>
                )}
            </div>
        </main>
    )
}

export default MyBookingsPage
