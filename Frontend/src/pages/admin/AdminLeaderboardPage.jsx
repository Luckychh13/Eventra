
import { useEffect, useState } from "react";

import {
    getLeaderboardStatus,
    toggleLeaderboard,
    scheduleLeaderboard,
} from "../../services/api/leaderboardService.js";

function toLocalDateTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const timezoneOffset = date.getTimezoneOffset();
    const localDate = new Date(
        date.getTime() - timezoneOffset * 60 * 1000
    );

    return localDate.toISOString().slice(0, 16);
}

function formatDateTime(value) {
    if (!value) return "Not scheduled";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        fallback
    );
}

function AdminLeaderboardPage() {
    const [isLeaderboardLive, setIsLeaderboardLive] = useState(null);
    const [scheduledRevealTime, setScheduledRevealTime] = useState(null);

    const [revealTime, setRevealTime] = useState("");

    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [scheduling, setScheduling] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        let isActive = true;

        getLeaderboardStatus()
            .then((data) => {
                if (!isActive) return;

                setIsLeaderboardLive(data.isLeaderboardLive === true);

                setScheduledRevealTime(
                    data.leaderboardRevealTime ?? null
                );

                setRevealTime(
                    toLocalDateTime(data.leaderboardRevealTime)
                );
            })
            .catch((err) => {
                if (isActive) {
                    setError(
                        getErrorMessage(
                            err,
                            "Failed to load leaderboard status."
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

    const handleToggleLeaderboard = async () => {
        if (isLeaderboardLive === null) return;

        const nextStatus = !isLeaderboardLive;

        try {
            setStatusUpdating(true);
            setError("");
            setSuccessMessage("");

            const data = await toggleLeaderboard(nextStatus);

            setIsLeaderboardLive(nextStatus);

            setSuccessMessage(
                data.message ||
                `Leaderboard ${nextStatus ? "activated" : "deactivated"} successfully.`
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to update leaderboard status."
                )
            );
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleScheduleSubmit = async (event) => {
        event.preventDefault();

        if (!revealTime) {
            setError("Please select a reveal date and time.");
            return;
        }

        const parsedRevealTime = new Date(revealTime);

        if (Number.isNaN(parsedRevealTime.getTime())) {
            setError("Please select a valid reveal date and time.");
            return;
        }

        try {
            setScheduling(true);
            setError("");
            setSuccessMessage("");

            const data = await scheduleLeaderboard(
                parsedRevealTime.toISOString()
            );

            const savedRevealTime =
                data.config?.leaderboardRevealTime ||
                parsedRevealTime.toISOString();

            setScheduledRevealTime(savedRevealTime);
            setRevealTime(toLocalDateTime(savedRevealTime));

            setSuccessMessage(
                data.message || "Leaderboard reveal scheduled successfully."
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to schedule leaderboard reveal."
                )
            );
        } finally {
            setScheduling(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Leaderboard Management
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                    Control leaderboard visibility and schedule result reveals.
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {/* Success message */}
            {successMessage && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                    {successMessage}
                </div>
            )}

            {/* Leaderboard status card */}
            <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">

                <div>
                    <h2 className="text-lg font-medium text-white">
                        Leaderboard Status
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                        Control whether participants can view the leaderboard.
                    </p>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-400">
                        Loading leaderboard status...
                    </p>
                ) : isLeaderboardLive === null ? (
                    <p className="text-sm text-gray-400">
                        Unable to retrieve leaderboard status.
                    </p>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-4">

                            <div>
                                <p className="text-sm text-gray-400">
                                    Current status
                                </p>

                                <span
                                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${isLeaderboardLive
                                            ? "bg-green-500/10 text-green-400"
                                            : "bg-gray-500/10 text-gray-400"
                                        }`}
                                >
                                    {isLeaderboardLive ? "Live" : "Inactive"}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleToggleLeaderboard}
                                disabled={statusUpdating}
                                className={`rounded-lg px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${isLeaderboardLive
                                        ? "bg-red-600 hover:bg-red-500"
                                        : "bg-purple-600 hover:bg-purple-500"
                                    }`}
                            >
                                {statusUpdating
                                    ? "Updating..."
                                    : isLeaderboardLive
                                        ? "Deactivate Leaderboard"
                                        : "Activate Leaderboard"}
                            </button>

                        </div>

                        <p className="text-xs text-gray-500">
                            Activating the leaderboard makes its public endpoint available.
                            Deactivating it hides the leaderboard from public access.
                        </p>
                    </>
                )}
            </section>

            {/* Schedule reveal form */}
            <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">

                <div>
                    <h2 className="text-lg font-medium text-white">
                        Schedule Leaderboard Reveal
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                        Set the date and time for the leaderboard reveal.
                    </p>
                </div>

                <form
                    onSubmit={handleScheduleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label
                            htmlFor="reveal-time"
                            className="mb-1 block text-sm text-gray-300"
                        >
                            Reveal Date and Time
                        </label>

                        <input
                            id="reveal-time"
                            type="datetime-local"
                            value={revealTime}
                            onChange={(event) =>
                                setRevealTime(event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500 sm:max-w-md"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={scheduling || !revealTime}
                        className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {scheduling
                            ? "Scheduling..."
                            : "Save Reveal Schedule"}
                    </button>
                </form>

                <p className="text-xs text-gray-500">
                    The selected local date and time will be converted to ISO format before being sent to the backend.
                </p>
            </section>

            {/* Scheduled reveal information */}
            <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">

                <h2 className="text-lg font-medium text-white">
                    Scheduled Reveal Information
                </h2>

                {loading ? (
                    <p className="text-sm text-gray-400">
                        Loading schedule...
                    </p>
                ) : (
                    <div>
                        <p className="text-sm text-gray-400">
                            Currently scheduled reveal time
                        </p>

                        <p className="mt-2 text-base font-medium text-white">
                            {formatDateTime(scheduledRevealTime)}
                        </p>
                    </div>
                )}

                <p className="text-xs text-gray-500">
                    Displayed in your browser's local timezone.
                </p>
            </section>

        </div>
    );
}

export default AdminLeaderboardPage;
