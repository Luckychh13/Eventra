
import { useEffect, useState } from "react";
import {
    getLeaderboardStatus,
    toggleLeaderboard,
    scheduleLeaderboard,
} from "../../services/api/leaderboardService.js";
import "./AdminLeaderboardPage.css";

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
    const [isRevealScheduled, setIsRevealScheduled] = useState(false);

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

                setIsRevealScheduled(
                    data.isRevealScheduled === true
                );

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
            setIsRevealScheduled(false);

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

        if (parsedRevealTime <= new Date()) {
            setError("Reveal time must be in the future.");
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
            setIsLeaderboardLive(false);
            setIsRevealScheduled(
                data.config?.isRevealScheduled === true
            );

            setSuccessMessage(
                data.message ||
                "Leaderboard reveal scheduled successfully."
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
        <main className="admin-leaderboard-page">
            <header className="admin-leaderboard-header">
                <div>
                    <span className="admin-leaderboard-eyebrow">
                        EVENT CONTROL
                    </span>

                    <h1>Leaderboard</h1>

                    <p>
                        Manage leaderboard visibility and configure the
                        results reveal schedule.
                    </p>
                </div>

                {!loading && isLeaderboardLive !== null && (
                    <div
                        className={`admin-leaderboard-header-status ${isLeaderboardLive ? "is-live" : "is-inactive"
                            }`}
                    >
                        <span />
                        {isLeaderboardLive
                            ? "Currently live"
                            : "Currently inactive"}
                    </div>
                )}
            </header>

            {(error || successMessage) && (
                <div
                    className={`admin-leaderboard-alert ${error ? "is-error" : "is-success"
                        }`}
                    role={error ? "alert" : "status"}
                >
                    <span>{error || successMessage}</span>

                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setSuccessMessage("");
                        }}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="admin-leaderboard-layout">
                <section className="admin-leaderboard-status-card">
                    <div className="admin-leaderboard-section-heading">
                        <div>
                            <span className="admin-leaderboard-eyebrow">
                                VISIBILITY CONTROL
                            </span>

                            <h2>Leaderboard status</h2>
                        </div>

                        <div className="admin-leaderboard-status-icon">
                            <span />
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-leaderboard-state">
                            Loading leaderboard status...
                        </div>
                    ) : isLeaderboardLive === null ? (
                        <div className="admin-leaderboard-state">
                            Unable to retrieve leaderboard status.
                        </div>
                    ) : (
                        <>
                            <div
                                className={`admin-leaderboard-status-panel ${isLeaderboardLive
                                        ? "is-live"
                                        : "is-inactive"
                                    }`}
                            >
                                <div>
                                    <span className="admin-leaderboard-status-label">
                                        Current status
                                    </span>

                                    <strong>
                                        {isLeaderboardLive
                                            ? "Live"
                                            : "Inactive"}
                                    </strong>

                                    <p>
                                        {isLeaderboardLive
                                            ? "The public leaderboard endpoint is available."
                                            : "The public leaderboard is currently hidden."}
                                    </p>
                                </div>

                                <span className="admin-leaderboard-status-dot" />
                            </div>

                            <button
                                type="button"
                                onClick={handleToggleLeaderboard}
                                disabled={statusUpdating}
                                className={`admin-leaderboard-toggle-button ${isLeaderboardLive
                                        ? "deactivate"
                                        : "activate"
                                    }`}
                            >
                                {statusUpdating
                                    ? "Updating status..."
                                    : isLeaderboardLive
                                        ? "Deactivate leaderboard"
                                        : "Activate leaderboard"}
                            </button>

                            <p className="admin-leaderboard-helper">
                                {isLeaderboardLive
                                    ? "Deactivating will prevent public access to leaderboard results."
                                    : "Activating will make leaderboard results available through the public endpoint."}
                            </p>
                        </>
                    )}
                </section>

                <section className="admin-leaderboard-schedule-card">
                    <div className="admin-leaderboard-section-heading">
                        <div>
                            <span className="admin-leaderboard-eyebrow">
                                REVEAL CONFIGURATION
                            </span>

                            <h2>Schedule results reveal</h2>
                        </div>

                        <div className="admin-leaderboard-schedule-icon">
                            <span>⌁</span>
                        </div>
                    </div>

                    <p className="admin-leaderboard-description">
                        Choose when the leaderboard should automatically
                        become public.
                    </p>

                    <form
                        onSubmit={handleScheduleSubmit}
                        className="admin-leaderboard-schedule-form"
                    >
                        <div className="admin-leaderboard-field">
                            <label htmlFor="reveal-time">
                                Reveal date and time
                            </label>

                            <input
                                id="reveal-time"
                                type="datetime-local"
                                value={revealTime}
                                onChange={(event) =>
                                    setRevealTime(event.target.value)
                                }
                                min={toLocalDateTime(new Date())}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="admin-leaderboard-save-button"
                            disabled={scheduling || !revealTime}
                        >
                            {scheduling
                                ? "Saving schedule..."
                                : "Save reveal schedule"}
                        </button>
                    </form>

                    <p className="admin-leaderboard-helper">
                        The selected browser-local date and time is converted
                        to ISO format before being sent to the backend.
                    </p>
                </section>
            </div>

            <section className="admin-leaderboard-reveal-card">
                <div className="admin-leaderboard-reveal-heading">
                    <div>
                        <span className="admin-leaderboard-eyebrow">
                            SCHEDULE OVERVIEW
                        </span>

                        <h2>Current reveal schedule</h2>
                    </div>

                    <span className="admin-leaderboard-reveal-badge">
                        {isRevealScheduled
                            ? "Pending"
                            : scheduledRevealTime
                                ? "Not pending"
                                : "Not configured"}
                    </span>
                </div>

                {loading ? (
                    <div className="admin-leaderboard-state">
                        Loading schedule...
                    </div>
                ) : (
                    <div className="admin-leaderboard-reveal-information">
                        <div className="admin-leaderboard-reveal-date">
                            <span>Scheduled reveal date and time</span>

                            <strong>
                                {formatDateTime(scheduledRevealTime)}
                            </strong>
                        </div>

                        <div className="admin-leaderboard-reveal-note">
                            <span>Schedule status</span>

                            <p>
                                {isRevealScheduled
                                    ? "The leaderboard will automatically become public at the scheduled time. Manually activating or deactivating it cancels this pending reveal."
                                    : scheduledRevealTime
                                        ? "There is currently no automatic reveal pending. You can schedule another reveal or control visibility manually."
                                        : "No automatic leaderboard reveal is currently scheduled."}
                            </p>
                        </div>
                    </div>
                )}

                <p className="admin-leaderboard-helper">
                    Scheduled time is displayed in your browser's local
                    timezone.
                </p>
            </section>
        </main>
    );
}

export default AdminLeaderboardPage;
