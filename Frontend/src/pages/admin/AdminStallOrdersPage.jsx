import { useCallback, useEffect, useState } from "react";
import { getMyStalls } from "../../services/api/stallService.js";
import { getStallOrders } from "../../services/api/stallPaymentService.js";
import "./AdminStallOrdersPage.css";

const formatPrice = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        fallback
    );
}

function AdminStallOrdersPage() {
    const [dashboardData, setDashboardData] = useState({
        stalls: [],
        orders: [],
        totalSales: 0,
        orderCount: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [partialErrors, setPartialErrors] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshOrders = useCallback(() => {
        setRefreshKey((previousKey) => previousKey + 1);
    }, []);

    useEffect(() => {
        let isActive = true;

        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");
                setPartialErrors([]);

                const stallResponse = await getMyStalls();

                if (!stallResponse?.success) {
                    throw new Error(
                        stallResponse?.message ||
                        "Failed to fetch stalls."
                    );
                }

                const stalls = Array.isArray(stallResponse.stalls)
                    ? stallResponse.stalls
                    : [];

                const results = await Promise.allSettled(
                    stalls.map(async (stall) => {
                        const response = await getStallOrders(stall._id);

                        if (!response?.success) {
                            throw new Error(
                                response?.error ||
                                `Failed to fetch orders for ${stall.name}.`
                            );
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
                        };
                    })
                );

                const successfulResults = results
                    .filter((result) => result.status === "fulfilled")
                    .map((result) => result.value);

                const failedResults = results.flatMap(
                    (result, index) => {
                        if (result.status !== "rejected") {
                            return [];
                        }

                        const stall = stalls[index];

                        return [{
                            stallName: stall?.name || "Unknown stall",
                            message: getErrorMessage(
                                result.reason,
                                "Unable to fetch orders."
                            ),
                        }];
                    }
                );

                const orders = successfulResults.flatMap(
                    (result) => result.orders
                );

                orders.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );

                const totalSales = successfulResults.reduce(
                    (total, result) => total + result.totalSales,
                    0
                );

                const orderCount = successfulResults.reduce(
                    (total, result) => total + result.orderCount,
                    0
                );

                if (isActive) {
                    setDashboardData({
                        stalls,
                        orders,
                        totalSales,
                        orderCount,
                    });

                    setPartialErrors(failedResults);
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        getErrorMessage(
                            err,
                            "Failed to fetch stall orders."
                        )
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();

        return () => {
            isActive = false;
        };
    }, [refreshKey]);

    const {
        stalls,
        orders,
        totalSales,
        orderCount,
    } = dashboardData;

    const pendingCompletion = orders.filter(
        (order) => order.orderStatus === "PENDING"
    ).length;

    const stats = [
        {
            label: "Total stalls",
            value: stalls.length.toLocaleString("en-IN"),
        },
        {
            label: "Successful orders",
            value: orderCount.toLocaleString("en-IN"),
        },
        {
            label: "Confirmed sales",
            value: formatPrice(totalSales),
        },
        {
            label: "Awaiting completion",
            value: pendingCompletion.toLocaleString("en-IN"),
        },
    ];

    if (loading) {
        return (
            <main className="admin-stall-orders-page">
                <div className="admin-stall-orders-state">
                    Loading stall orders...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="admin-stall-orders-page">
                <header className="admin-stall-orders-header">
                    <div>
                        <span className="admin-stall-orders-eyebrow">
                            SALES MANAGEMENT
                        </span>

                        <h1>Stall Orders</h1>
                    </div>
                </header>

                <div className="admin-stall-orders-state is-error">
                    <strong>Unable to load stall orders</strong>
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={refreshOrders}
                        className="admin-stall-orders-refresh"
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="admin-stall-orders-page">
            <header className="admin-stall-orders-header">
                <div>
                    <span className="admin-stall-orders-eyebrow">
                        SALES MANAGEMENT
                    </span>

                    <h1>Stall Orders</h1>

                    <p>
                        Monitor customer purchases and order completion across
                        all festival stalls.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refreshOrders}
                    className="admin-stall-orders-refresh"
                >
                    Refresh orders
                </button>
            </header>

            {partialErrors.length > 0 && (
                <div
                    className="admin-stall-orders-warning"
                    role="alert"
                >
                    <div>
                        <strong>
                            Some stall orders could not be loaded.
                        </strong>

                        <p>
                            Sales and order totals below are incomplete.
                        </p>
                    </div>

                    <div className="admin-stall-orders-warning-list">
                        {partialErrors.map((item, index) => (
                            <p key={`${item.stallName}-${index}`}>
                                <strong>{item.stallName}:</strong>{" "}
                                {item.message}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            <section className="admin-stall-orders-stats">
                {stats.map((stat) => (
                    <article
                        key={stat.label}
                        className="admin-stall-orders-stat-card"
                    >
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                    </article>
                ))}
            </section>

            <section className="admin-stall-orders-list-section">
                <div className="admin-stall-orders-list-heading">
                    <div>
                        <span className="admin-stall-orders-eyebrow">
                            TRANSACTION RECORDS
                        </span>

                        <h2>All stall orders</h2>

                        <p>
                            Only successfully paid orders are displayed.
                        </p>
                    </div>

                    <span className="admin-stall-orders-count">
                        {orders.length}{" "}
                        {orders.length === 1 ? "order" : "orders"}
                    </span>
                </div>

                {orders.length === 0 ? (
                    <div className="admin-stall-orders-state">
                        <strong>No successful stall orders</strong>

                        <p>
                            Successful customer purchases will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="admin-stall-orders-list">
                        {orders.map((order) => {
                            const completed =
                                order.orderStatus === "COMPLETED";

                            const paymentStatus = String(
                                order.paymentStatus || "UNKNOWN"
                            ).toUpperCase();

                            return (
                                <article
                                    key={order._id}
                                    className="admin-stall-order-card"
                                >
                                    <div className="admin-stall-order-header">
                                        <div className="admin-stall-order-identity">
                                            <span>Stall</span>

                                            <h3>
                                                {order.stallName ||
                                                    "Unknown stall"}
                                            </h3>

                                            <p>
                                                Customer:{" "}
                                                {order.userName || "Customer"}
                                            </p>

                                            <strong className="admin-stall-order-token">
                                                Token #{order.tokenNumber}
                                            </strong>

                                            <time>
                                                {formatDate(order.createdAt)}
                                            </time>
                                        </div>

                                        <div className="admin-stall-order-status">
                                            <strong>
                                                {formatPrice(order.totalAmount)}
                                            </strong>

                                            <span className="admin-stall-payment-badge">
                                                {paymentStatus}
                                            </span>

                                            <span
                                                className={`admin-stall-completion-badge ${completed
                                                    ? "is-completed"
                                                    : "is-pending"
                                                    }`}
                                            >
                                                {completed
                                                    ? "Completed"
                                                    : "Awaiting completion"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="admin-stall-order-items">
                                        <div className="admin-stall-order-items-heading">
                                            <h4>Purchased items</h4>

                                            <span>
                                                {order.items?.length || 0}{" "}
                                                {order.items?.length === 1
                                                    ? "item"
                                                    : "items"}
                                            </span>
                                        </div>

                                        {order.items?.length > 0 ? (
                                            <div className="admin-stall-order-item-list">
                                                {order.items.map((item, index) => (
                                                    <div
                                                        key={
                                                            item._id ||
                                                            `${order._id}-${index}`
                                                        }
                                                        className="admin-stall-order-item"
                                                    >
                                                        <div className="admin-stall-order-item-info">
                                                            <strong>
                                                                {item.name ||
                                                                    "Unnamed item"}
                                                            </strong>

                                                            <span>
                                                                {formatPrice(
                                                                    item.price
                                                                )}{" "}
                                                                ×{" "}
                                                                {item.quantity}
                                                            </span>
                                                        </div>

                                                        <strong className="admin-stall-order-item-total">
                                                            {formatPrice(
                                                                Number(item.price) *
                                                                Number(item.quantity)
                                                            )}
                                                        </strong>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="admin-stall-order-no-items">
                                                No purchased items available.
                                            </p>
                                        )}
                                    </div>

                                    <div className="admin-stall-order-footer">
                                        <span>
                                            Payment: {paymentStatus}
                                        </span>

                                        <span
                                            className={
                                                completed
                                                    ? "is-completed"
                                                    : "is-pending"
                                            }
                                        >
                                            Order: {order.orderStatus || "PENDING"}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default AdminStallOrdersPage;