import { useCallback, useEffect, useState } from "react";
import {
    getAdmins,
    makeAdmin,
    removeAdmin,
} from "../../services/api/adminService.js";

function MakeAdminPage() {
    const [admins, setAdmins] = useState([]);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchAdmins = useCallback(async () => {
        try {
            const response = await getAdmins();
            setAdmins(Array.isArray(response.admins) ? response.admins : []);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load admins."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isActive = true;

        const loadAdmins = async () => {
            try {
                const response = await getAdmins();

                if (isActive) {
                    setAdmins(Array.isArray(response.admins) ? response.admins : []);
                    setError("");
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to load admins."
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        loadAdmins();

        return () => {
            isActive = false;
        };
    }, []);

    const handleMakeAdmin = async (event) => {
        event.preventDefault();

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter an email address.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setMessage("");

            const response = await makeAdmin(normalizedEmail);

            setMessage(response.message || "Admin privileges granted.");
            setEmail("");
            await fetchAdmins();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to promote user."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveAdmin = async (admin) => {
        const confirmed = window.confirm(
            `Remove admin privileges from ${admin.email}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            const response = await removeAdmin(admin.email);

            setMessage(response.message || "Admin privileges removed.");
            await fetchAdmins();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to remove admin."
            );
        }
    };

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    Admin Management
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                    Promote registered users and manage existing administrators.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {message && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-300">
                    {message}
                </div>
            )}

            <form
                onSubmit={handleMakeAdmin}
                className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6"
            >
                <div>
                    <h2 className="text-lg font-semibold text-white">
                        Promote a user
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Enter the email address of an existing registered account.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="user@example.com"
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Promoting..." : "Make Admin"}
                    </button>
                </div>
            </form>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Current Administrators
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            {admins.length} administrator(s)
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            fetchAdmins();
                        }}
                        disabled={loading}
                        className="text-sm font-medium text-purple-300 hover:text-purple-200 disabled:opacity-50"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p className="p-8 text-center text-sm text-gray-400">
                        Loading administrators...
                    </p>
                ) : admins.length === 0 ? (
                    <p className="p-8 text-center text-sm text-gray-400">
                        No administrators found.
                    </p>
                ) : (
                    <div className="divide-y divide-white/10">
                        {admins.map((admin) => (
                            <div
                                key={admin.uid}
                                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="font-medium text-white">
                                        {admin.displayName || "Unknown"}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-400">
                                        {admin.email}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleRemoveAdmin(admin)}
                                    className="self-start rounded-lg border border-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 sm:self-auto"
                                >
                                    Remove Admin
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default MakeAdminPage;
