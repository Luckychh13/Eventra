
import { Link } from 'react-router-dom'
import useUserStallOrders from '../../hooks/useUserStallOrders.js'
import './MyStallOrdersPage.css'

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

const getOrderStatusClass = (status) => {
    const styles = {
        PENDING: 'stall-order-status--pending',
        COMPLETED: 'stall-order-status--completed',
    }

    return styles[status] || 'stall-order-status--unknown'
}

const getPaymentStatusClass = (status) => {
    const styles = {
        SUCCESS: 'stall-payment-status--success',
        PAID: 'stall-payment-status--success',
        COMPLETED: 'stall-payment-status--success',
        PENDING: 'stall-payment-status--pending',
        FAILED: 'stall-payment-status--failed',
    }

    return styles[status] || 'stall-payment-status--unknown'
}

function MyStallOrdersPage() {
    const {
        orders,
        loading,
        error,
        refreshing,
        lastRefreshedAt,
        refreshOrders,
    } = useUserStallOrders()

    return (
        <main className="my-stall-orders-page">
            <div className="my-stall-orders-glow my-stall-orders-glow--one" />
            <div className="my-stall-orders-glow my-stall-orders-glow--two" />

            <div className="my-stall-orders-container">
                <header className="stall-orders-header">
                    <span className="stall-orders-eyebrow">
                        YOUR STALL EXPERIENCE
                    </span>

                    <div className="stall-orders-heading-row">
                        <div>
                            <h1>My Stall Orders<span>.</span></h1>

                            <p>
                                Track your purchases, queue token numbers,
                                and order details.
                            </p>
                        </div>

                        {!loading && !error && orders.length > 0 && (
                            <div className="stall-orders-count">
                                <span className="stall-orders-count-icon">▤</span>

                                <div>
                                    <strong>{orders.length}</strong>
                                    <span>
                                        {orders.length === 1 ? 'ORDER' : 'ORDERS'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!loading && !error && (
                        <div className="stall-orders-refresh-wrapper">
                            <button
                                type="button"
                                onClick={refreshOrders}
                                disabled={refreshing}
                                className="stall-orders-refresh"
                            >
                                <span
                                    className={
                                        refreshing
                                            ? 'stall-orders-refresh-icon--spinning'
                                            : ''
                                    }
                                >
                                    ↻
                                </span>

                                {refreshing ? 'Refreshing...' : 'Refresh Orders'}
                            </button>

                            {lastRefreshedAt && !refreshing && (
                                <p className="stall-orders-refresh-feedback" role="status">
                                    <span>✓</span>
                                    You're all caught up. Last checked at{' '}
                                    {lastRefreshedAt.toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            )}
                        </div>
                    )}
                </header>

                {loading && (
                    <div className="stall-orders-state-card">
                        <span className="stall-orders-spinner" />
                        <p>Loading your stall orders...</p>
                    </div>
                )}

                {!loading && error && (
                    <div
                        role="alert"
                        className="stall-orders-state-card stall-orders-state-card--error"
                    >
                        <span className="stall-orders-state-icon">!</span>
                        <h2>Unable to load your orders</h2>
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={refreshOrders}
                            className="stall-orders-action-button"
                        >
                            Try Again
                            <span>↻</span>
                        </button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <section className="stall-orders-empty">
                        <div className="stall-orders-empty-icon">▤</div>

                        <span className="stall-orders-section-label">
                            YOUR NEXT ORDER AWAITS
                        </span>

                        <h2>No stall orders yet</h2>

                        <p>
                            Your successful stall purchases will appear here.
                            Explore the stalls and discover something delicious.
                        </p>

                        <Link
                            to="/stalls"
                            className="stall-orders-action-button"
                        >
                            Explore Stalls
                            <span>↗</span>
                        </Link>
                    </section>
                )}

                {!loading && !error && orders.length > 0 && (
                    <section className="stall-orders-list">
                        <div className="stall-orders-list-heading">
                            <h2>Order History</h2>
                            <span>YOUR PURCHASES</span>
                        </div>

                        {orders.map((order) => {
                            const orderStatus = String(
                                order.orderStatus || 'PENDING'
                            ).toUpperCase()

                            const paymentStatus = String(
                                order.paymentStatus || 'UNKNOWN'
                            ).toUpperCase()

                            const orderStatusClass =
                                getOrderStatusClass(orderStatus)

                            const paymentStatusClass =
                                getPaymentStatusClass(paymentStatus)

                            return (
                                <article
                                    key={order._id}
                                    className="stall-order-card"
                                >
                                    <div className="stall-order-header">
                                        <div className="stall-order-stall-info">
                                            <span className="stall-order-mark">S</span>

                                            <div>
                                                <span className="stall-order-label">
                                                    STALL
                                                </span>

                                                <h3>
                                                    {order.stallId?.name ||
                                                        'Stall details unavailable'}
                                                </h3>

                                                <p>
                                                    Ordered on {formatDate(order.createdAt)}
                                                </p>

                                                <p className="stall-order-id">
                                                    Order ID: {order._id}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="stall-order-statuses">
                                            <span
                                                className={`stall-order-status ${orderStatusClass}`}
                                            >
                                                <span />
                                                {orderStatus}
                                            </span>

                                            <span
                                                className={`stall-payment-status ${paymentStatusClass}`}
                                            >
                                                Payment {paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="stall-order-token">
                                        <div className="stall-order-token-icon">#</div>

                                        <div className="stall-order-token-info">
                                            <span>YOUR STALL TOKEN NUMBER</span>
                                            <strong>
                                                {order.tokenNumber ?? 'Not available'}
                                            </strong>
                                        </div>

                                        <span className="stall-order-token-caption">
                                            KEEP THIS NUMBER HANDY
                                        </span>
                                    </div>

                                    <div className="stall-order-items">
                                        <div className="stall-order-items-heading">
                                            <h4>Purchased Items</h4>
                                            <span>
                                                {order.items?.length || 0}{' '}
                                                {(order.items?.length || 0) === 1
                                                    ? 'ITEM'
                                                    : 'ITEMS'}
                                            </span>
                                        </div>

                                        <div className="stall-order-items-list">
                                            {order.items?.map((item, index) => (
                                                <div
                                                    key={
                                                        item._id ||
                                                        `${order._id}-${index}`
                                                    }
                                                    className="stall-order-item"
                                                >
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="stall-order-item-image"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="stall-order-item-placeholder">
                                                            <span>◇</span>
                                                            <small>No image</small>
                                                        </div>
                                                    )}

                                                    <div className="stall-order-item-info">
                                                        <h5>{item.name}</h5>

                                                        <p>
                                                            Quantity: {item.quantity}
                                                        </p>

                                                        <p>
                                                            Price per item: {formatPrice(item.price)}
                                                        </p>
                                                    </div>

                                                    <div className="stall-order-item-total">
                                                        <span>ITEM TOTAL</span>
                                                        <strong>
                                                            {formatPrice(
                                                                Number(item.price) *
                                                                Number(item.quantity)
                                                            )}
                                                        </strong>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="stall-order-total">
                                        <span>Total Paid</span>
                                        <strong>
                                            {formatPrice(order.totalAmount)}
                                        </strong>
                                    </div>

                                    <div className="stall-order-footer">
                                        <span>
                                            <span className="stall-order-footer-dot" />
                                            EVENTRA STALL ORDER
                                        </span>

                                        <span>
                                            Keep your token number ready when
                                            collecting your order.
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

export default MyStallOrdersPage
