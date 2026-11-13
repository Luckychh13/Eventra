import { useCallback, useEffect, useState } from 'react'
import {
    getMyStalls,
} from '../../services/api/stallService.js'
import {
    getStallOrders,
} from '../../services/api/stallPaymentService.js'

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

function AdminStallOrdersPage() {
    const [dashboardData, setDashboardData] = useState({
        stalls: [],
        orders: [],
        totalSales: 0,
        orderCount: 0,
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [partialErrors, setPartialErrors] = useState([])
    const [refreshKey, setRefreshKey] = useState(0)

    const refreshOrders = useCallback(() => {
        setRefreshKey((previousKey) => previousKey + 1)
    }, [])

    useEffect(() => {
        let isActive = true

        const fetchOrders = async () => {
            try {
                setLoading(true)
                setError('')
                setPartialErrors([])

                // Step 1: Retrieve all stalls accessible to the admin.
                const stallResponse = await getMyStalls()

                if (!stallResponse?.success) {
                    throw new Error(
                        stallResponse?.message ||
                        'Failed to fetch stalls.'
                    )
                }

                const stalls = Array.isArray(stallResponse.stalls)
                    ? stallResponse.stalls
                    : []

                // Step 2: Fetch successful orders for every stall.
                const results = await Promise.allSettled(
                    stalls.map(async (stall) => {
                        const response = await getStallOrders(stall._id)

                        if (!response?.success) {
                            throw new Error(
                                response?.error ||
                                `Failed to fetch orders for ${stall.name}.`
                            )
                        }

                        return {
                            stall,
                            orders: Array.isArray(response.orders)
                                ? response.orders.map((order) => ({
                                    ...order,
                                    stallName: stall.name,
                                }))
                                : [],
                            totalSales: Number(response.totalSales) || 0,
                            orderCount: Number(response.orderCount) || 0,
                        }
                    })
                )

                const successfulResults = results
                    .filter((result) => result.status === 'fulfilled')
                    .map((result) => result.value)

                const failedResults = results
                    .filter((result) => result.status === 'rejected')
                    .map((result, index) => ({
                        message:
                            result.reason?.response?.data?.error ||
                            result.reason?.message ||
                            `Unable to fetch orders for one stall.`,
                        // The corresponding stall is identified separately below.
                        index,
                    }))

                const orders = successfulResults.flatMap(
                    (result) => result.orders
                )

                orders.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                )

                const totalSales = successfulResults.reduce(
                    (total, result) => total + result.totalSales,
                    0
                )

                const orderCount = successfulResults.reduce(
                    (total, result) => total + result.orderCount,
                    0
                )

                if (isActive) {
                    setDashboardData({
                        stalls,
                        orders,
                        totalSales,
                        orderCount,
                    })

                    setPartialErrors(failedResults)
                }
            } catch (error) {
                if (isActive) {
                    setError(
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        'Failed to fetch stall orders.'
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

    const {
        stalls,
        orders,
        totalSales,
        orderCount,
    } = dashboardData

    const pendingCompletion = orders.filter(
        (order) => order.orderStatus === 'PENDING'
    ).length

    if (loading) {
        return (
            <div className="py-20 text-center text-gray-400">
                Loading stall orders...
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-16 text-center">
                <h1 className="text-2xl font-bold">
                    Unable to load stall orders
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
                        Stall Orders
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        Monitor customer purchases across all stalls.
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

            {/* Partial loading warning */}
            {partialErrors.length > 0 && (
                <div
                    role="alert"
                    className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4"
                >
                    <p className="font-medium text-yellow-400">
                        Some stall orders could not be loaded.
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                        The sales and order totals below are incomplete.
                    </p>
                </div>
            )}

            {/* Statistics */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: 'Total Stalls',
                        value: stalls.length,
                    },
                    {
                        label: 'Successful Orders',
                        value: orderCount,
                    },
                    {
                        label: 'Confirmed Sales',
                        value: formatPrice(totalSales),
                    },
                    {
                        label: 'Awaiting Completion',
                        value: pendingCompletion,
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

            {/* Orders */}
            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        All Stall Orders ({orders.length})
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                        Only successfully paid orders are displayed.
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                        <h3 className="font-semibold">
                            No successful stall orders
                        </h3>

                        <p className="mt-2 text-sm text-gray-400">
                            Successful customer purchases will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const completed =
                                order.orderStatus === 'COMPLETED'

                            return (
                                <article
                                    key={order._id}
                                    className="rounded-xl border border-white/10 bg-white/5 p-5"
                                >
                                    <div className="flex flex-wrap justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Stall
                                            </p>

                                            <h3 className="mt-1 text-lg font-semibold">
                                                {order.stallName}
                                            </h3>

                                            <p className="mt-2 text-sm text-gray-400">
                                                Customer: {order.userName || 'Customer'}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-400">
                                                Token Number: #{order.tokenNumber}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xl font-bold">
                                                {formatPrice(order.totalAmount)}
                                            </p>

                                            <span className="mt-2 inline-block rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                                                {order.paymentStatus}
                                            </span>

                                            <p className={`mt-2 text-xs ${completed
                                                    ? 'text-green-400'
                                                    : 'text-yellow-400'
                                                }`}>
                                                Order: {order.orderStatus}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 border-t border-white/10 pt-4">
                                        <h4 className="mb-3 text-sm font-semibold">
                                            Purchased Items
                                        </h4>

                                        <div className="space-y-2">
                                            {order.items?.map((item, index) => (
                                                <div
                                                    key={
                                                        item._id ||
                                                        `${order._id}-${index}`
                                                    }
                                                    className="flex justify-between gap-3 text-sm"
                                                >
                                                    <span className="text-gray-400">
                                                        {item.name} × {item.quantity}
                                                    </span>

                                                    <span>
                                                        {formatPrice(
                                                            Number(item.price) *
                                                            Number(item.quantity)
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
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

export default AdminStallOrdersPage