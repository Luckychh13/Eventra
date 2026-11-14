import { useCallback, useEffect, useState } from 'react'
import {
    getAllEventOrders,
    allotEventTicket,
} from '../../services/api/eventPaymentService.js'

const formatPrice = (value) => {
    const amount = Number(value)

    if (!Number.isFinite(amount)) return '₹0'

    return `₹${amount.toLocaleString('en-IN')}`
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

function AdminEventOrdersPage() {
    const [orders, setOrders] = useState([])
    const [summary, setSummary] = useState({
        totalOrders: 0,
        totalTickets: 0,
        totalRevenue: 0,
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [refreshKey, setRefreshKey] = useState(0)
    const [updatingOrderId, setUpdatingOrderId] = useState(null)
    const [actionError, setActionError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const refreshOrders = useCallback(() => {
        setRefreshKey((previousKey) => previousKey + 1)
    }, [])

    useEffect(() => {
        let isActive = true

        const fetchOrders = async () => {
            try {
                setLoading(true)
                setError('')

                const response = await getAllEventOrders()

                if (!response?.success) {
                    throw new Error(
                        response?.error ||
                        response?.message ||
                        'Failed to fetch event orders.'
                    )
                }

                if (isActive) {
                    setOrders(
                        Array.isArray(response.orders)
                            ? response.orders
                            : []
                    )

                    setSummary({
                        totalOrders: Number(response.totalOrders) || 0,
                        totalTickets: Number(response.totalTickets) || 0,
                        totalRevenue: Number(response.totalRevenue) || 0,
                    })
                }
            } catch (error) {
                if (isActive) {
                    setError(
                        error.response?.data?.error ||
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to fetch event orders.'
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        fetchOrders()

        return () => {
            isActive = false
        }
    }, [refreshKey])

    const handleAllotTicket = async (order) => {
        const confirmed = window.confirm(
            'Are you sure you want to mark this order as allotted?'
        )

        if (!confirmed) return

        try {
            setUpdatingOrderId(order.orderId)
            setActionError('')
            setSuccessMessage('')

            const response = await allotEventTicket(order.orderId)

            if (!response?.success) {
                throw new Error(
                    response?.error ||
                    response?.message ||
                    'Failed to allot ticket.'
                )
            }

            setOrders((previousOrders) =>
                previousOrders.map((item) =>
                    item.orderId === order.orderId
                        ? { ...item, isAlloted: true }
                        : item
                )
            )

            setSuccessMessage(
                response.message || 'Ticket allotted successfully.'
            )
        } catch (error) {
            setActionError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'Failed to allot ticket.'
            )
        } finally {
            setUpdatingOrderId(null)
        }
    }

    const pendingOrders = orders.filter(
        (order) => order.paymentStatus === 'PENDING'
    ).length

    const successfulOrders = orders.filter(
        (order) => order.paymentStatus === 'SUCCESS'
    ).length

    const allottedOrders = orders.filter(
        (order) => order.isAlloted
    ).length

    if (loading) {
        return (
            <div className="py-20 text-center text-gray-400">
                Loading event orders...
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-16 text-center">
                <h1 className="text-2xl font-bold">
                    Unable to load event orders
                </h1>

                <p className="mt-3 text-sm text-red-400">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={refreshOrders}
                    className="mt-5 rounded-lg bg-purple-600 px-5 py-2.5 text-sm hover:bg-purple-700"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Page heading */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Event Orders
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        Monitor event ticket purchases and allotment status.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refreshOrders}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
                >
                    Refresh Orders
                </button>
            </div>

            {/* Action feedback */}
            {actionError && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400"
                >
                    {actionError}
                </div>
            )}

            {successMessage && (
                <div
                    role="status"
                    className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-400"
                >
                    {successMessage}
                </div>
            )}

            {/* Statistics */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: 'Total Orders',
                        value: summary.totalOrders,
                    },
                    {
                        label: 'Tickets Purchased',
                        value: summary.totalTickets,
                    },
                    {
                        label: 'Successful Orders',
                        value: successfulOrders,
                    },
                    {
                        label: 'Pending Payments',
                        value: pendingOrders,
                    },
                    {
                        label: 'Allotted Orders',
                        value: allottedOrders,
                    },
                    {
                        label: 'Reported Order Amount',
                        value: formatPrice(summary.totalRevenue),
                    },
                ].map((stat) => (
                    <article
                        key={stat.label}
                        className="rounded-xl border border-white/10 bg-white/5 p-5"
                    >
                        <p className="text-sm text-gray-400">
                            {stat.label}
                        </p>

                        <p className="mt-3 text-2xl font-bold">
                            {stat.value}
                        </p>
                    </article>
                ))}
            </section>

            {/* Orders list */}
            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        All Event Orders ({orders.length})
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                        Each order can contain tickets for multiple events.
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                        <h3 className="font-semibold">
                            No event orders found
                        </h3>

                        <p className="mt-2 text-sm text-gray-400">
                            Customer ticket purchases will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const successful =
                                order.paymentStatus === 'SUCCESS'

                            const allotted = order.isAlloted

                            return (
                                <article
                                    key={order.orderId}
                                    className="rounded-xl border border-white/10 bg-white/5 p-5"
                                >
                                    {/* Order header */}
                                    <div className="flex flex-wrap justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500">
                                                Ticket Order ID
                                            </p>

                                            <h3 className="mt-1 break-all font-semibold">
                                                {order.ticketOrderId || order.orderId}
                                            </h3>

                                            <p className="mt-2 text-sm text-gray-400">
                                                User ID: {order.userId || 'Unavailable'}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <p className="text-xl font-bold">
                                                {formatPrice(order.amount)}
                                            </p>

                                            <span
                                                className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs ${successful
                                                        ? 'border-green-500/20 bg-green-500/10 text-green-400'
                                                        : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                                                    }`}
                                            >
                                                {order.paymentStatus || 'UNKNOWN'}
                                            </span>

                                            <p
                                                className={`mt-2 text-xs ${allotted
                                                        ? 'text-green-400'
                                                        : 'text-yellow-400'
                                                    }`}
                                            >
                                                {allotted
                                                    ? 'Ticket Allotted'
                                                    : 'Not Allotted'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Purchased items */}
                                    <div className="mt-5 border-t border-white/10 pt-4">
                                        <h4 className="mb-3 text-sm font-semibold">
                                            Purchased Tickets
                                        </h4>

                                        <div className="space-y-3">
                                            {order.items?.map((item, index) => (
                                                <div
                                                    key={`${order.orderId}-${item.eventId}-${index}`}
                                                    className="rounded-lg bg-black/10 p-3"
                                                >
                                                    <div className="flex flex-wrap justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.title || 'Unknown Event'}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {item.ticketName || 'General'} × {item.quantity}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {item.date || 'Date unavailable'}
                                                                {' · '}
                                                                {item.location || 'Location unavailable'}
                                                            </p>
                                                        </div>

                                                        <div className="text-right text-sm">
                                                            <p>
                                                                {formatPrice(item.price)} each
                                                            </p>

                                                            <p className="mt-1 font-semibold">
                                                                {formatPrice(item.subtotal)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Allotment action */}
                                    <div className="mt-5 flex justify-end border-t border-white/10 pt-4">
                                        {successful && !allotted && (
                                            <button
                                                type="button"
                                                onClick={() => handleAllotTicket(order)}
                                                disabled={updatingOrderId === order.orderId}
                                                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updatingOrderId === order.orderId
                                                    ? 'Allotting...'
                                                    : 'Allot Ticket'}
                                            </button>
                                        )}

                                        {allotted && (
                                            <span className="text-sm text-green-400">
                                                Already allotted
                                            </span>
                                        )}

                                        {!successful && !allotted && (
                                            <span className="text-sm text-gray-500">
                                                Payment must succeed before allotment
                                            </span>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}

export default AdminEventOrdersPage
