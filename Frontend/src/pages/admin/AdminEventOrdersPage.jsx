import { useCallback, useEffect, useState } from "react";
import {
    getAllEventOrders,
    allotEventTicket,
} from "../../services/api/eventPaymentService.js";
import "./AdminEventOrdersPage.css";

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

function AdminEventOrdersPage() {
    const [orders, setOrders] = useState([]);

    const [summary, setSummary] = useState({
        totalOrders: 0,
        totalTickets: 0,
        totalRevenue: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [actionError, setActionError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const refreshOrders = useCallback(() => {
        setRefreshKey((previousKey) => previousKey + 1);
    }, []);

    useEffect(() => {
        let isActive = true;

        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getAllEventOrders();

                if (!response?.success) {
                    throw new Error(
                        response?.error ||
                        response?.message ||
                        "Failed to fetch event orders."
                    );
                }

                if (isActive) {
                    setOrders(
                        Array.isArray(response.orders)
                            ? response.orders
                            : []
                    );

                    setSummary({
                        totalOrders: Number(response.totalOrders) || 0,
                        totalTickets: Number(response.totalTickets) || 0,
                        totalRevenue: Number(response.totalRevenue) || 0,
                    });
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.error ||
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to fetch event orders."
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

    const handleAllotTicket = async (order) => {
        const confirmed = window.confirm(
            `Are you sure you want to mark order "${order.ticketOrderId || order.orderId}" as allotted?`
        );

        if (!confirmed) return;

        try {
            setUpdatingOrderId(order.orderId);
            setActionError("");
            setSuccessMessage("");

            const response = await allotEventTicket(order.orderId);

            if (!response?.success) {
                throw new Error(
                    response?.error ||
                    response?.message ||
                    "Failed to allot ticket."
                );
            }

            setOrders((previousOrders) =>
                previousOrders.map((item) =>
                    item.orderId === order.orderId
                        ? { ...item, isAlloted: true }
                        : item
                )
            );

            setSuccessMessage(
                response.message || "Ticket allotted successfully."
            );
        } catch (err) {
            setActionError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Failed to allot ticket."
            );
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const pendingOrders = orders.filter(
        (order) => order.paymentStatus === "PENDING"
    ).length;

    const successfulOrders = orders.filter(
        (order) => order.paymentStatus === "SUCCESS"
    ).length;

    const failedOrders = orders.filter(
        (order) => order.paymentStatus === "FAILED"
    ).length;

    const allottedOrders = orders.filter(
        (order) => order.isAlloted === true
    ).length;

    const stats = [
        {
            label: "Total orders",
            value: summary.totalOrders.toLocaleString("en-IN"),
        },
        {
            label: "Tickets purchased",
            value: summary.totalTickets.toLocaleString("en-IN"),
        },
        {
            label: "Successful payments",
            value: successfulOrders.toLocaleString("en-IN"),
        },
        {
            label: "Pending payments",
            value: pendingOrders.toLocaleString("en-IN"),
        },
        {
            label: "Failed payments",
            value: failedOrders.toLocaleString("en-IN"),
        },
        {
            label: "Allotted orders",
            value: allottedOrders.toLocaleString("en-IN"),
        },
        {
            label: "Recorded order amount",
            value: formatPrice(summary.totalRevenue),
        },
    ];

    return (
        <main className="admin-event-orders-page">
            <header className="admin-event-orders-header">
                <div>
                    <span className="admin-event-orders-eyebrow">
                        SALES MANAGEMENT
                    </span>

                    <h1>Event Orders</h1>

                    <p>
                        Monitor ticket purchases, payment statuses, and ticket
                        allotment.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-event-orders-refresh"
                    onClick={refreshOrders}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh orders"}
                </button>
            </header>

            {(actionError || successMessage) && (
                <div
                    className={`admin-event-orders-alert ${actionError ? "is-error" : "is-success"
                        }`}
                    role={actionError ? "alert" : "status"}
                >
                    <span>{actionError || successMessage}</span>

                    <button
                        type="button"
                        onClick={() => {
                            setActionError("");
                            setSuccessMessage("");
                        }}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            <section className="admin-event-orders-stats">
                {stats.map((stat) => (
                    <article
                        key={stat.label}
                        className="admin-event-orders-stat-card"
                    >
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                    </article>
                ))}
            </section>

            <section className="admin-event-orders-list-section">
                <div className="admin-event-orders-list-heading">
                    <div>
                        <span className="admin-event-orders-eyebrow">
                            TRANSACTION RECORDS
                        </span>

                        <h2>All event orders</h2>

                        <p>
                            Each order may contain tickets for multiple events.
                        </p>
                    </div>

                    <span className="admin-event-orders-count">
                        {orders.length}{" "}
                        {orders.length === 1 ? "order" : "orders"}
                    </span>
                </div>

                {loading ? (
                    <div className="admin-event-orders-state">
                        Loading event orders...
                    </div>
                ) : error ? (
                    <div className="admin-event-orders-state">
                        <strong>Unable to load event orders</strong>

                        <p>{error}</p>

                        <button
                            type="button"
                            className="admin-event-orders-retry"
                            onClick={refreshOrders}
                        >
                            Try again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="admin-event-orders-state">
                        <strong>No event orders found</strong>

                        <p>
                            Customer ticket purchases will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="admin-event-orders-list">
                        {orders.map((order) => {
                            const paymentStatus = String(
                                order.paymentStatus || "UNKNOWN"
                            ).toUpperCase();

                            const statusClass = [
                                "SUCCESS",
                                "PENDING",
                                "FAILED",
                            ].includes(paymentStatus)
                                ? paymentStatus.toLowerCase()
                                : "unknown";

                            const successful = paymentStatus === "SUCCESS";
                            const allotted = order.isAlloted === true;

                            return (
                                <article
                                    key={order.orderId}
                                    className="admin-event-order-card"
                                >
                                    <div className="admin-event-order-header">
                                        <div className="admin-event-order-identity">
                                            <span>Ticket order ID</span>

                                            <h3>
                                                {order.ticketOrderId ||
                                                    order.orderId}
                                            </h3>

                                            <p>
                                                User ID:{" "}
                                                {order.userId || "Unavailable"}
                                            </p>

                                            <time>
                                                {formatDate(order.createdAt)}
                                            </time>
                                        </div>

                                        <div className="admin-event-order-payment">
                                            <strong>
                                                {formatPrice(order.amount)}
                                            </strong>

                                            <span
                                                className={`admin-event-payment-badge is-${statusClass}`}
                                            >
                                                {paymentStatus}
                                            </span>

                                            <span
                                                className={`admin-event-allotment-badge ${allotted
                                                    ? "is-allotted"
                                                    : "is-not-allotted"
                                                    }`}
                                            >
                                                {allotted
                                                    ? "Ticket allotted"
                                                    : "Not allotted"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="admin-event-order-items">
                                        <div className="admin-event-order-items-heading">
                                            <h4>Purchased tickets</h4>

                                            <span>
                                                {order.items?.length || 0}{" "}
                                                {order.items?.length === 1
                                                    ? "item"
                                                    : "items"}
                                            </span>
                                        </div>

                                        {order.items?.length > 0 ? (
                                            <div className="admin-event-order-item-list">
                                                {order.items.map((item, index) => (
                                                    <div
                                                        key={`${order.orderId}-${item.eventId || item.title}-${index}`}
                                                        className="admin-event-order-item"
                                                    >
                                                        <div className="admin-event-order-item-details">
                                                            <strong>
                                                                {item.title ||
                                                                    "Unknown event"}
                                                            </strong>

                                                            <span>
                                                                {item.ticketName ||
                                                                    "General"}{" "}
                                                                × {item.quantity}
                                                            </span>

                                                            <small>
                                                                {item.date ||
                                                                    "Date unavailable"}
                                                                {" · "}
                                                                {item.location ||
                                                                    "Location unavailable"}
                                                            </small>
                                                        </div>

                                                        <div className="admin-event-order-item-prices">
                                                            <span>
                                                                {formatPrice(
                                                                    item.price
                                                                )}{" "}
                                                                each
                                                            </span>

                                                            <strong>
                                                                {formatPrice(
                                                                    item.subtotal
                                                                )}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="admin-event-order-no-items">
                                                No ticket items available.
                                            </p>
                                        )}
                                    </div>

                                    <div className="admin-event-order-footer">
                                        {successful && !allotted && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAllotTicket(order)
                                                }
                                                disabled={
                                                    updatingOrderId !== null
                                                }
                                                className="admin-event-allot-button"
                                            >
                                                {updatingOrderId === order.orderId
                                                    ? "Allotting..."
                                                    : "Allot ticket"}
                                            </button>
                                        )}

                                        {allotted && (
                                            <span className="admin-event-allotted-note">
                                                <span />
                                                Already allotted
                                            </span>
                                        )}

                                        {!successful && !allotted && (
                                            <span className="admin-event-pending-note">
                                                Payment must succeed before
                                                allotment.
                                            </span>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <p className="admin-event-orders-footnote">
                Recorded order amount is the sum of stored order amounts,
                including orders with pending or failed payment statuses.
            </p>
        </main>
    );
}

export default AdminEventOrdersPage;