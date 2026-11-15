import { Link, useLocation } from 'react-router-dom'

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
            <main className="min-h-[70vh] px-4 py-20 text-center text-white">
                <h1 className="text-2xl font-bold">
                    Payment Details Unavailable
                </h1>

                <p className="mt-3 text-gray-400">
                    Please check your orders to confirm your payment status.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                    <Link to="/bookings" className="rounded-lg bg-purple-600 px-5 py-2">
                        My Bookings
                    </Link>

                    <Link to="/stall-orders" className="rounded-lg border border-white/20 px-5 py-2">
                        My Stall Orders
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-[70vh] px-4 py-16 text-white">
            <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="text-center">
                    <div className="text-5xl text-green-400">✓</div>

                    <h1 className="mt-4 text-3xl font-bold">
                        Payment Successful!
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        Your payment has been verified.
                    </p>
                </div>

                {isEventPayment && (
                    <section className="mt-8">
                        <p className="text-sm text-gray-400">
                            Ticket Order ID
                        </p>

                        <p className="mt-1 text-xl font-bold text-purple-300">
                            {order.ticketOrderId}
                        </p>

                        <div className="mt-5">
                            <p className="text-sm text-gray-400">
                                Amount Paid
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {formatPrice(order.amount)}
                            </p>
                        </div>

                        <p className="mt-5 text-sm text-gray-400">
                            Visit My Bookings to view your booking details.
                        </p>
                    </section>
                )}

                {isStallPayment && (
                    <section className="mt-8">
                        <div className="rounded-xl bg-green-500/10 p-6 text-center">
                            <p className="text-sm text-gray-300">
                                Your Stall Token Number
                            </p>

                            <p className="mt-2 text-5xl font-bold tracking-widest text-green-400">
                                {confirmedToken}
                            </p>

                            {stallName && (
                                <p className="mt-3 text-sm text-gray-400">
                                    {stallName}
                                </p>
                            )}
                        </div>

                        <div className="mt-5">
                            <p className="text-sm text-gray-400">
                                Amount Paid
                            </p>

                            <p className="mt-1 text-2xl font-bold">
                                {formatPrice(order.totalAmount)}
                            </p>
                        </div>

                        <p className="mt-5 text-sm text-gray-400">
                            Keep your token number available when collecting your order.
                        </p>
                    </section>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        to={isEventPayment ? '/bookings' : '/stall-orders'}
                        className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium hover:bg-purple-700"
                    >
                        {isEventPayment ? 'My Bookings' : 'My Stall Orders'}
                    </Link>

                    <Link
                        to="/"
                        className="rounded-lg border border-white/20 px-5 py-3 text-sm font-medium hover:bg-white/10"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default PaymentSuccessPage
