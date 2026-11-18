import { useEffect, useState } from "react";
import { getAllFeedback } from "../../services/api/feedbackService.js";
import "./AdminFeedbackPage.css";

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        fallback
    );
}

function formatDate(value) {
    if (!value) return "Unknown date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function getValidRating(value) {
    const rating = Number(value);

    if (!Number.isFinite(rating)) return 0;

    return Math.min(5, Math.max(0, Math.round(rating)));
}

function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        let isActive = true;

        getAllFeedback()
            .then((data) => {
                if (isActive) {
                    setFeedbacks(Array.isArray(data) ? data : []);
                }
            })
            .catch((err) => {
                if (isActive) {
                    setError(
                        getErrorMessage(err, "Failed to load feedback.")
                    );
                }
            })
            .finally(() => {
                if (isActive) {
                    setLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

    const searchTerm = search.trim().toLowerCase();

    const filteredFeedbacks = feedbacks.filter((item) => (
        item.name?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm) ||
        item.feedback?.toLowerCase().includes(searchTerm)
    ));

    const averageRating = feedbacks.length > 0
        ? (
            feedbacks.reduce(
                (total, item) => total + (Number(item.rating) || 0),
                0
            ) / feedbacks.length
        ).toFixed(1)
        : "0.0";

    return (
        <main className="admin-feedback-page">
            <header className="admin-feedback-header">
                <div>
                    <span className="admin-feedback-eyebrow">
                        USER EXPERIENCE
                    </span>

                    <h1>Feedback</h1>

                    <p>
                        Review ratings and comments submitted by Eventra users.
                    </p>
                </div>

                <div className="admin-feedback-header-count">
                    <span>Total submissions</span>
                    <strong>{feedbacks.length}</strong>
                </div>
            </header>

            {error && (
                <div className="admin-feedback-alert" role="alert">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            {!loading && !error && (
                <section className="admin-feedback-stats">
                    <div className="admin-feedback-stat-card">
                        <div>
                            <span>Total feedback</span>
                            <strong>{feedbacks.length}</strong>
                            <p>Submissions received</p>
                        </div>

                        <div className="admin-feedback-stat-icon">
                            <span />
                        </div>
                    </div>

                    <div className="admin-feedback-stat-card">
                        <div>
                            <span>Average rating</span>

                            <div className="admin-feedback-average">
                                <strong>{averageRating}</strong>
                                <span className="admin-feedback-average-star">
                                    ★
                                </span>
                                <small>/ 5</small>
                            </div>

                            <p>Across all submissions</p>
                        </div>

                        <div className="admin-feedback-stat-icon rating-icon">
                            ★
                        </div>
                    </div>
                </section>
            )}

            <section className="admin-feedback-list-section">
                <div className="admin-feedback-list-heading">
                    <div>
                        <span className="admin-feedback-eyebrow">
                            CUSTOMER REVIEWS
                        </span>

                        <h2>All feedback</h2>

                        <p>
                            Showing {filteredFeedbacks.length} of{" "}
                            {feedbacks.length} submissions
                        </p>
                    </div>

                    <div className="admin-feedback-search">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search name, email, or message..."
                            aria-label="Search feedback"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="admin-feedback-state">
                        Loading feedback...
                    </div>
                ) : error ? (
                    <div className="admin-feedback-state">
                        Unable to load feedback.
                    </div>
                ) : filteredFeedbacks.length === 0 ? (
                    <div className="admin-feedback-state">
                        {feedbacks.length === 0
                            ? "No feedback has been submitted yet."
                            : "No feedback matches your search."}
                    </div>
                ) : (
                    <div className="admin-feedback-list">
                        {filteredFeedbacks.map((item) => {
                            const rating = getValidRating(item.rating);

                            return (
                                <article
                                    key={item._id}
                                    className="admin-feedback-card"
                                >
                                    <div className="admin-feedback-card-header">
                                        <div className="admin-feedback-user">
                                            <div className="admin-feedback-avatar">
                                                {item.name
                                                    ?.trim()
                                                    .charAt(0)
                                                    .toUpperCase() || "?"}
                                            </div>

                                            <div className="admin-feedback-user-info">
                                                <h3>{item.name}</h3>
                                                <p>{item.email}</p>
                                            </div>
                                        </div>

                                        <div className="admin-feedback-rating">
                                            <div
                                                className="admin-feedback-stars"
                                                aria-label={`${rating} out of 5 stars`}
                                            >
                                                <span className="filled">
                                                    {"★".repeat(rating)}
                                                </span>

                                                <span className="empty">
                                                    {"★".repeat(5 - rating)}
                                                </span>
                                            </div>

                                            <strong>{rating}/5</strong>
                                        </div>
                                    </div>

                                    <div className="admin-feedback-message">
                                        <p>{item.feedback}</p>
                                    </div>

                                    <footer className="admin-feedback-card-footer">
                                        <span>
                                            Submitted {formatDate(item.createdAt)}
                                        </span>
                                    </footer>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default AdminFeedbackPage;