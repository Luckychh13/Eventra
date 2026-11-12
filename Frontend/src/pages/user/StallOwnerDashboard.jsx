
import { useState } from 'react'
import { Link } from 'react-router-dom'
import useStallOwnerDashboard from '../../hooks/useStallOwnerDashboard.js'
import { markStallOrderCompleted } from '../../services/api/stallService.js'

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

function StallOwnerDashboard() {
    const {
        dashboard,
        loading,
        error,
        refreshDashboard,
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
            <main className="px-4 py-20 text-center text-gray-400">
                Loading stall owner dashboard...
            </main>
        )
    }

    if (error) {
        return (
            <main className="mx-auto max-w-7xl px-4 py-16 text-center text-white">
                <h1 className="text-2xl font-bold">
                    Unable to load dashboard
                </h1>

                <p className="mt-3 text-sm text-red-400">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={refreshDashboard}
                    className="mt-5 rounded-lg bg-purple-600 px-5 py-2.5 text-sm hover:bg-purple-700"
                >
                    Try Again
                </button>
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
        },
        {
            label: 'Total Orders',
            value: orders.length,
        },
        {
            label: 'Confirmed Sales',
            value: formatPrice(confirmedSales),
        },
        {
            label: 'Awaiting Completion',
            value: awaitingCompletion,
        },
    ]

    return (
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 text-white sm:px-6 lg:px-8">

            {/* Dashboard heading */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        Stall Owner Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        Manage your stalls and monitor customer orders.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refreshDashboard}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white/5"
                >
                    Refresh Dashboard
                </button>
            </div>

            {actionError && (
                <p
                    role="alert"
                    className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400"
                >
                    {actionError}
                </p>
            )}

            {actionMessage && (
                <p
                    role="status"
                    className="mt-5 rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-400"
                >
                    {actionMessage}
                </p>
            )}

            {/* Dashboard statistics */}
            <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statistics.map((statistic) => (
                    <article
                        key={statistic.label}
                        className="rounded-xl border border-white/10 bg-white/5 p-5"
                    >
                        <p className="text-sm text-gray-400">
                            {statistic.label}
                        </p>

                        <p className="mt-3 text-2xl font-bold">
                            {statistic.value}
                        </p>
                    </article>
                ))}
            </section>

            {/* Owned stalls */}
            <section className="mt-12">
                <h2 className="text-2xl font-bold">
                    My Stalls
                </h2>

                {stalls.length === 0 ? (
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                        <p className="text-gray-400">
                            No stalls have been assigned to your account yet.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {stalls.map((stall) => (
                            <article
                                key={stall._id}
                                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                            >
                                {stall.imageUrl ? (
                                    <img
                                        src={stall.imageUrl}
                                        alt={stall.name}
                                        className="h-44 w-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-44 items-center justify-center bg-white/5 text-sm text-gray-500">
                                        No image available
                                    </div>
                                )}

                                <div className="p-5">
                                    <h3 className="text-lg font-semibold">
                                        {stall.name}
                                    </h3>

                                    {stall.category && (
                                        <p className="mt-1 text-sm text-purple-300">
                                            {stall.category}
                                        </p>
                                    )}

                                    <p className="mt-3 text-sm text-gray-400">
                                        {stall.location || 'Location unavailable'}
                                    </p>

                                    <p className="mt-2 text-sm text-gray-400">
                                        {Array.isArray(stall.menu)
                                            ? stall.menu.length
                                            : 0} menu items
                                    </p>

                                    <Link
                                        to={`/stall/${stall._id}`}
                                        className="mt-5 inline-block rounded-lg border border-purple-500/40 px-4 py-2 text-sm text-purple-300 transition hover:bg-purple-500/10"
                                    >
                                        View Stall
                                    </Link>

                                    <Link
                                        to={`/stall-dashboard/stalls/${stall._id}/manage`}
                                        className="mt-3 inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-700"
                                    >
                                        Manage Menu
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Recent orders */}
            <section className="mt-12">
                <h2 className="text-2xl font-bold">
                    Recent Orders
                </h2>

                {orders.length === 0 ? (
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                        <p className="text-gray-400">
                            No orders have been placed at your stalls yet.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 space-y-4">
                        {orders.slice(0, 10).map((order) => {
                            const isPaid =
                                order.paymentStatus === 'SUCCESS'

                            const isCompleted =
                                order.orderStatus === 'COMPLETED'

                            return (
                                <article
                                    key={order._id}
                                    className="rounded-xl border border-white/10 bg-white/5 p-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Customer
                                            </p>

                                            <h3 className="mt-1 font-semibold">
                                                {order.userName || 'Customer'}
                                            </h3>

                                            <p className="mt-2 text-sm text-gray-400">
                                                Token: {order.tokenNumber}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-400">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-bold">
                                                {formatPrice(order.totalAmount)}
                                            </p>

                                            <p className={`mt-2 text-xs ${isPaid
                                                ? 'text-green-400'
                                                : 'text-yellow-400'
                                                }`}>
                                                Payment: {order.paymentStatus}
                                            </p>

                                            <p className={`mt-1 text-xs ${isCompleted
                                                ? 'text-green-400'
                                                : 'text-yellow-400'
                                                }`}>
                                                Order: {order.orderStatus}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t border-white/10 pt-4">
                                        <p className="mb-2 text-sm font-medium">
                                            Purchased Items
                                        </p>

                                        <div className="space-y-1">
                                            {order.items?.map((item, index) => (
                                                <p
                                                    key={
                                                        item._id ||
                                                        `${order._id}-${index}`
                                                    }
                                                    className="text-sm text-gray-400"
                                                >
                                                    {item.name} × {item.quantity}
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    {isPaid && !isCompleted && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMarkCompleted(order._id)
                                            }
                                            disabled={processingOrderId !== null}
                                            className="mt-5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {processingOrderId === order._id
                                                ? 'Updating...'
                                                : 'Mark as Completed'}
                                        </button>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>
        </main>
    )
}

export default StallOwnerDashboard
