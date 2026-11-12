import { Link } from 'react-router-dom'
import useUserStallOrders from '../../hooks/useUserStallOrders.js'

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

const orderStatusStyles = {
    PENDING: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
    COMPLETED: 'border-green-500/20 bg-green-500/10 text-green-400',
}

function MyStallOrdersPage() {
    const { orders, loading, error, refreshOrders } =
        useUserStallOrders()

    return (
        <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 text-white sm:px-6 lg:px-8">

            {/* Page heading */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        My Stall Orders
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        View your purchases, token numbers, and order status.
                    </p>
                </div>

                {!loading && !error && orders.length > 0 && (
                    <button
                        type="button"
                        onClick={refreshOrders}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white/5"
                    >
                        Refresh Orders
                    </button>
                )}
            </div>

            {/* Loading state */}
            {loading && (
                <div className="py-16 text-center text-gray-400">
                    Loading your stall orders...
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center"
                >
                    <p className="text-red-400">{error}</p>

                    <button
                        type="button"
                        onClick={refreshOrders}
                        className="mt-4 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium hover:bg-purple-700"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && orders.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
                    <h2 className="text-xl font-semibold">
                        No stall orders yet
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                        Your successful stall purchases will appear here.
                    </p>

                    <Link
                        to="/stalls"
                        className="mt-6 inline-block rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium hover:bg-purple-700"
                    >
                        Explore Stalls
                    </Link>
                </div>
            )}

            {/* Orders list */}
            {!loading && !error && orders.length > 0 && (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const orderStatus = String(
                            order.orderStatus || 'PENDING'
                        ).toUpperCase()

                        const statusClass =
                            orderStatusStyles[orderStatus] ||
                            'border-gray-500/20 bg-gray-500/10 text-gray-400'

                        return (
                            <article
                                key={order._id}
                                className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6"
                            >
                                {/* Order header */}
                                <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Stall
                                        </p>

                                        <h2 className="mt-1 text-xl font-semibold">
                                            {order.stallId?.name ||
                                                'Stall details unavailable'}
                                        </h2>

                                        <p className="mt-2 text-sm text-gray-400">
                                            Ordered on {formatDate(order.createdAt)}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-400">
                                            Order ID: {order._id}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}
                                        >
                                            {orderStatus}
                                        </span>

                                        <span className="text-sm text-green-400">
                                            Payment {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Token number */}
                                <div className="mt-5 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                                    <p className="text-xs text-gray-400">
                                        Your Stall Token Number
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-purple-300">
                                        {order.tokenNumber ?? 'Not available'}
                                    </p>
                                </div>

                                {/* Purchased items */}
                                <div className="mt-5">
                                    <h3 className="mb-4 font-semibold">
                                        Purchased Items
                                    </h3>

                                    <div className="space-y-4">
                                        {order.items?.map((item, index) => (
                                            <div
                                                key={
                                                    item._id ||
                                                    `${order._id}-${index}`
                                                }
                                                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center"
                                            >
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="h-20 w-full rounded-lg object-cover sm:w-24"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white/5 text-xs text-gray-500 sm:w-24">
                                                        No image
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium">
                                                        {item.name}
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-400">
                                                        Quantity: {item.quantity}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-400">
                                                        Price per item: {formatPrice(item.price)}
                                                    </p>
                                                </div>

                                                <p className="font-semibold">
                                                    {formatPrice(
                                                        Number(item.price) *
                                                        Number(item.quantity)
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order total */}
                                <div className="mt-5 flex justify-between border-t border-white/10 pt-4">
                                    <span className="font-medium text-gray-400">
                                        Total Paid
                                    </span>

                                    <span className="text-xl font-bold">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export default MyStallOrdersPage
