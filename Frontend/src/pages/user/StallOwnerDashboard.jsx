
import { useState } from 'react'
import { Link } from 'react-router-dom'
import useStallOwnerDashboard from '../../hooks/useStallOwnerDashboard.js'
import { markStallOrderCompleted } from '../../services/api/stallService.js'
import './StallOwnerDashboard.css'

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

function StallOwnerDashboard() {
    const {
        dashboard,
        loading,
        refreshing,
        error,
        refreshDashboard,
        lastRefreshedAt

    } = useStallOwnerDashboard()

    const [processingOrderId, setProcessingOrderId] = useState(null)
    const [actionError, setActionError] = useState('')
    const [actionMessage, setActionMessage] = useState('')


    const handleMarkCompleted = async (orderId) => {
        setProcessingOrderId(orderId)
        setActionError('')
        setActionMessage('')

        try {
            const response = await markStallOrderCompleted(orderId)

            if (!response?.success) {
                throw new Error(
                    response?.message || 'Failed to update order.'
                )
            }

            setActionMessage(
                response.message || 'Order marked as completed.'
            )

            refreshDashboard()
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                error.message ||
                'Failed to mark order as completed.'
            )
        } finally {
            setProcessingOrderId(null)
        }
    }

    if (loading) {
        return (
            <main className="stall-owner-page stall-owner-page--state">
                <div className="stall-owner-state-card">
                    <span className="stall-owner-spinner" />
                    <p>Loading stall owner dashboard...</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="stall-owner-page stall-owner-page--state">
                <div className="stall-owner-state-card stall-owner-state-card--error">
                    <span className="stall-owner-state-icon">!</span>
                    <h1>Unable to load dashboard</h1>
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={refreshDashboard}
                        disabled={refreshing}
                        className="stall-owner-refresh-button"
                    >
                        <span className={refreshing ? 'stall-owner-refresh-icon--spinning' : ''}>
                            ↻
                        </span>
                        {refreshing ? 'Refreshing...' : 'Refresh Dashboard'}
                    </button>
                </div>
            </main>
        )
    }

    const stalls = dashboard?.stalls || []
    const orders = dashboard?.orders || []

    const successfulOrders = orders.filter(
        (order) => order.paymentStatus === 'SUCCESS'
    )

    const confirmedSales = successfulOrders.reduce(
        (total, order) => total + Number(order.totalAmount || 0),
        0
    )

    const awaitingCompletion = successfulOrders.filter(
        (order) => order.orderStatus === 'PENDING'
    ).length

    const statistics = [
        {
            label: 'My Stalls',
            value: stalls.length,
            icon: 'S',
            tone: 'teal',
        },
        {
            label: 'Total Orders',
            value: orders.length,
            icon: '▤',
            tone: 'aqua',
        },
        {
            label: 'Confirmed Sales',
            value: formatPrice(confirmedSales),
            icon: '₹',
            tone: 'coral',
        },
        {
            label: 'Awaiting Completion',
            value: awaitingCompletion,
            icon: '◷',
            tone: 'gold',
        },
    ]

    const lastCheckedText = lastRefreshedAt
        ? lastRefreshedAt.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        })
        : ''

    return (
        <main className="stall-owner-page">
            <div className="stall-owner-glow stall-owner-glow--one" />
            <div className="stall-owner-glow stall-owner-glow--two" />

            <div className="stall-owner-container">
                <header className="stall-owner-header">
                    <div>
                        <span className="stall-owner-eyebrow">
                            STALL OWNER WORKSPACE
                        </span>

                        <h1>Stall Owner Dashboard<span>.</span></h1>

                        <p>
                            Manage your stalls, monitor customer orders,
                            and keep your business moving.
                        </p>
                    </div>

                    <div className="stall-owner-refresh-wrapper">
                        <button
                            type="button"
                            onClick={refreshDashboard}
                            disabled={refreshing}
                            className="stall-owner-refresh-button"
                        >
                            <span className={refreshing ? 'stall-owner-refresh-icon--spinning' : ''}>
                                ↻
                            </span>
                            {refreshing ? 'Refreshing...' : 'Refresh Dashboard'}
                        </button>

                        {lastRefreshedAt && !refreshing && (
                            <p className="stall-owner-refresh-feedback" role="status">
                                <span>✓</span>
                                You're all caught up. Last checked at {lastCheckedText}.
                            </p>
                        )}
                    </div>
                </header>

                {actionError && (
                    <div
                        role="alert"
                        className="stall-owner-alert stall-owner-alert--error"
                    >
                        <span>!</span>
                        {actionError}
                    </div>
                )}

                {actionMessage && (
                    <div
                        role="status"
                        className="stall-owner-alert stall-owner-alert--success"
                    >
                        <span>✓</span>
                        {actionMessage}
                    </div>
                )}

                <section className="stall-owner-statistics">
                    {statistics.map((statistic) => (
                        <article
                            key={statistic.label}
                            className={`stall-owner-stat-card stall-owner-stat-card--${statistic.tone}`}
                        >
                            <div className="stall-owner-stat-top">
                                <span>{statistic.label}</span>
                                <div className="stall-owner-stat-icon">
                                    {statistic.icon}
                                </div>
                            </div>

                            <strong>{statistic.value}</strong>
                        </article>
                    ))}
                </section>

                <section className="stall-owner-stalls-section">
                    <div className="stall-owner-section-heading">
                        <div>
                            <span className="stall-owner-section-label">
                                YOUR BUSINESS
                            </span>

                            <h2>My Stalls</h2>

                            <p>
                                View your stalls and manage their menus.
                            </p>
                        </div>

                        <span className="stall-owner-section-count">
                            {stalls.length} {stalls.length === 1 ? 'STALL' : 'STALLS'}
                        </span>
                    </div>

                    {stalls.length === 0 ? (
                        <div className="stall-owner-empty">
                            <div className="stall-owner-empty-icon">S</div>
                            <h3>No stalls assigned yet</h3>
                            <p>
                                No stalls have been assigned to your account yet.
                            </p>
                        </div>
                    ) : (
                        <div className="stall-owner-stall-grid">
                            {stalls.map((stall) => (
                                <article
                                    key={stall._id}
                                    className="stall-owner-stall-card"
                                >
                                    {stall.imageUrl ? (
                                        <img
                                            src={stall.imageUrl}
                                            alt={stall.name}
                                            className="stall-owner-stall-image"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="stall-owner-stall-image-placeholder">
                                            <span>S</span>
                                            <small>STALL</small>
                                        </div>
                                    )}

                                    <div className="stall-owner-stall-body">
                                        <div className="stall-owner-stall-title">
                                            <h3>{stall.name}</h3>

                                            {stall.category && (
                                                <span>{stall.category}</span>
                                            )}
                                        </div>

                                        <p className="stall-owner-stall-location">
                                            <span>⌖</span>
                                            {stall.location || 'Location unavailable'}
                                        </p>

                                        <div className="stall-owner-menu-count">
                                            <span>MENU ITEMS</span>
                                            <strong>
                                                {Array.isArray(stall.menu)
                                                    ? stall.menu.length
                                                    : 0}
                                            </strong>
                                        </div>

                                        <div className="stall-owner-stall-actions">
                                            <Link
                                                to={`/stall/${stall._id}`}
                                                className="stall-owner-view-link"
                                            >
                                                View Stall
                                            </Link>

                                            <Link
                                                to={`/stall-dashboard/stalls/${stall._id}/manage`}
                                                className="stall-owner-manage-link"
                                            >
                                                Manage Menu
                                                <span>↗</span>
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="stall-owner-orders-section">
                    <div className="stall-owner-section-heading">
                        <div>
                            <span className="stall-owner-section-label">
                                CUSTOMER ACTIVITY
                            </span>

                            <h2>Recent Orders</h2>

                            <p>
                                Review customer purchases and update their
                                completion status.
                            </p>
                        </div>

                        <span className="stall-owner-section-count">
                            {orders.length} {orders.length === 1 ? 'ORDER' : 'ORDERS'}
                        </span>
                    </div>

                    {orders.length === 0 ? (
                        <div className="stall-owner-empty">
                            <div className="stall-owner-empty-icon">▤</div>
                            <h3>No orders yet</h3>
                            <p>
                                Customer orders from your stalls will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="stall-owner-order-list">
                            {orders.slice(0, 10).map((order) => {
                                const isPaid =
                                    order.paymentStatus === 'SUCCESS'

                                const isCompleted =
                                    order.orderStatus === 'COMPLETED'

                                return (
                                    <article
                                        key={order._id}
                                        className="stall-owner-order-card"
                                    >
                                        <div className="stall-owner-order-header">
                                            <div className="stall-owner-customer">
                                                <div className="stall-owner-customer-avatar">
                                                    {(order.userName || 'C')
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <span>CUSTOMER</span>
                                                    <h3>
                                                        {order.userName || 'Customer'}
                                                    </h3>

                                                    <p>{formatDate(order.createdAt)}</p>
                                                </div>
                                            </div>

                                            <div className="stall-owner-order-total">
                                                <span>ORDER TOTAL</span>
                                                <strong>
                                                    {formatPrice(order.totalAmount)}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="stall-owner-order-meta">
                                            <div className="stall-owner-token-detail">
                                                <span>QUEUE TOKEN</span>
                                                <strong>
                                                    #{order.tokenNumber ?? '—'}
                                                </strong>
                                            </div>

                                            <div className="stall-owner-order-statuses">
                                                <span className={`stall-owner-status ${isPaid
                                                    ? 'stall-owner-status--success'
                                                    : 'stall-owner-status--pending'
                                                    }`}>
                                                    <span />
                                                    Payment: {order.paymentStatus}
                                                </span>

                                                <span className={`stall-owner-status ${isCompleted
                                                    ? 'stall-owner-status--success'
                                                    : 'stall-owner-status--pending'
                                                    }`}>
                                                    <span />
                                                    Order: {order.orderStatus}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="stall-owner-purchased-items">
                                            <h4>Purchased Items</h4>

                                            <div>
                                                {order.items?.map((item, index) => (
                                                    <p
                                                        key={
                                                            item._id ||
                                                            `${order._id}-${index}`
                                                        }
                                                    >
                                                        <span>{item.name}</span>
                                                        <strong>
                                                            × {item.quantity}
                                                        </strong>
                                                    </p>
                                                ))}
                                            </div>
                                        </div>

                                        {isPaid && !isCompleted && (
                                            <div className="stall-owner-order-action">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleMarkCompleted(order._id)
                                                    }
                                                    disabled={processingOrderId !== null}
                                                    className="stall-owner-complete-button"
                                                >
                                                    {processingOrderId === order._id
                                                        ? 'Updating...'
                                                        : 'Mark as Completed'}
                                                    {processingOrderId !== order._id && (
                                                        <span>✓</span>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {isCompleted && (
                                            <div className="stall-owner-completed-note">
                                                <span>✓</span>
                                                Order completed
                                            </div>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

export default StallOwnerDashboard
