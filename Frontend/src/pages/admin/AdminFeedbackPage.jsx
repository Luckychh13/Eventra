import { useEffect, useState } from "react";
import {
    getAllFeedback,
} from "../../services/api/feedbackService.js";

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
                    setFeedbacks(data);
                }
            })
            .catch((err) => {
                if (isActive) {
                    setError(
                        getErrorMessage(
                            err,
                            "Failed to load feedback."
                        )
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

    const filteredFeedbacks = feedbacks.filter((item) => {
        return (
            item.name?.toLowerCase().includes(searchTerm) ||
            item.email?.toLowerCase().includes(searchTerm) ||
            item.feedback?.toLowerCase().includes(searchTerm)
        );
    });

    const averageRating = feedbacks.length > 0
        ? (
            feedbacks.reduce(
                (total, item) => total + Number(item.rating || 0),
                0
            ) / feedbacks.length
        ).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Feedback Management
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                    Review feedback submitted by Eventra users.
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {/* Feedback statistics */}
            {!loading && !error && (
                <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm text-gray-400">
                            Total Feedback
                        </p>

                        <h2 className="mt-2 text-3xl font-semibold text-white">
                            {feedbacks.length}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm text-gray-400">
                            Average Rating
                        </p>

                        <h2 className="mt-2 text-3xl font-semibold text-white">
                            {averageRating}
                            <span className="ml-2 text-lg text-yellow-400">
                                ★
                            </span>
                            <span className="ml-1 text-sm font-normal text-gray-400">
                                / 5
                            </span>
                        </h2>
                    </div>

                </div>
            )}

            {/* Feedback listing */}
            <section className="space-y-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <h2 className="text-lg font-medium text-white">
                        All Feedback ({feedbacks.length})
                    </h2>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search name, email, or feedback..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 sm:max-w-sm"
                    />

                </div>

                {/* Loading, error, and empty states */}
                {loading ? (
                    <p className="py-8 text-center text-gray-400">
                        Loading feedback...
                    </p>
                ) : error ? (
                    <p className="py-8 text-center text-gray-400">
                        Unable to load feedback.
                    </p>
                ) : filteredFeedbacks.length === 0 ? (
                    <p className="rounded-xl border border-white/10 p-8 text-center text-gray-400">
                        {feedbacks.length === 0
                            ? "No feedback has been submitted yet."
                            : "No feedback matches your search."}
                    </p>
                ) : (
                    <div className="space-y-4">

                        {filteredFeedbacks.map((item) => (
                            <article
                                key={item._id}
                                className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5"
                            >

                                {/* User information */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <h3 className="font-medium text-white">
                                            {item.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-400">
                                            {item.email}
                                        </p>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg tracking-wide text-yellow-400">
                                            {"★".repeat(
                                                Math.min(
                                                    5,
                                                    Math.max(
                                                        0,
                                                        Number(item.rating) || 0
                                                    )
                                                )
                                            )}
                                            {"☆".repeat(
                                                5 - Math.min(
                                                    5,
                                                    Math.max(
                                                        0,
                                                        Number(item.rating) || 0
                                                    )
                                                )
                                            )}
                                        </span>

                                        <span className="text-sm text-gray-400">
                                            {item.rating}/5
                                        </span>
                                    </div>

                                </div>

                                {/* Feedback message */}
                                <div className="rounded-lg bg-black/20 p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                                        {item.feedback}
                                    </p>
                                </div>

                                {/* Submission date */}
                                <div className="border-t border-white/10 pt-3">
                                    <p className="text-xs text-gray-500">
                                        Submitted: {formatDate(item.createdAt)}
                                    </p>
                                </div>

                            </article>
                        ))}

                    </div>
                )}

            </section>
        </div>
    );
}

export default AdminFeedbackPage;
