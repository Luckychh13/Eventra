import { Link } from 'react-router-dom'
import useUserOrders from '../../hooks/useUserOrders.js'

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

const paymentStatusStyles = {
    SUCCESS: 'bg-green-500/10 text-green-400 border-green-500/20',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function MyBookingsPage() {
    const { orders, loading, error, refreshOrders } = useUserOrders()

    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-10 text-white sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">My Bookings</h1>
                <p className="mt-2 text-sm text-gray-400">
                    View your purchased event tickets and payment details.
                </p>
            </div>

            {loading && (
                <div className="py-16 text-center text-gray-400">
                    Loading your bookings...
                </div>
            )}

            {!loading && error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
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

            {!loading && !error && orders.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
                    <h2 className="text-xl font-semibold">No bookings yet</h2>

                    <p className="mt-2 text-sm text-gray-400">
                        You haven't purchased any event tickets yet.
                    </p>

                    <Link
                        to="/"
                        className="mt-6 inline-block rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium hover:bg-purple-700"
                    >
                        Explore Events
                    </Link>
                </div>
            )}

            {!loading && !error && orders.length > 0 && (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const status = String(
                            order.paymentStatus || 'UNKNOWN'
                        ).toUpperCase()

                        const statusClass =
                            paymentStatusStyles[status] ||
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'

                        return (
                            <article
                                key={order._id}
                                className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6"
                            >
                                {/* Order information */}
                                <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Booking ID
                                        </p>

                                        <p className="mt-1 font-medium">
                                            {order.ticketOrderId || order._id}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-400">
                                            Booked on {formatDate(order.createdAt)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}
                                        >
                                            {status}
                                        </span>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Total Amount
                                            </p>

                                            <p className="mt-1 text-lg font-semibold">
                                                {formatPrice(order.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Purchased ticket items */}
                                <div className="mt-5 space-y-4">
                                    {order.items?.map((item, index) => {
                                        const event = item.eventId
                                        const pricing = item.pricingId

                                        return (
                                            <div
                                                key={item._id || `${order._id}-${index}`}
                                                className="rounded-lg border border-white/10 bg-black/20 p-4"
                                            >
                                                <h3 className="font-semibold">
                                                 {event?.title || 'Event details unavailable'}
                                                </h3>

                                                <div className="mt-2 space-y-1 text-sm text-gray-400">
                                                    <p>
                                                        Date: {event?.date ? formatDate(event.date) : 'Not available'}
                                                    </p>

                                                    <p>
                                                        Location: {event?.location || 'Not available'}
                                                    </p>

                                                    <p>
                                                        Ticket Type: {pricing?.ticketType || 'Not available'}
                                                    </p>

                                                    <p>
                                                        Quantity: {item.quantity}
                                                    </p>

                                                    <p>
                                                        Price per ticket: {formatPrice(item.price)}
                                                    </p>
                                                </div>

                                                <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm">
                                                    <span className="text-gray-400">
                                                        Item Total
                                                    </span>

                                                    <span className="font-semibold">
                                                        {formatPrice(
                                                            Number(item.price) * Number(item.quantity)
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export default MyBookingsPage
