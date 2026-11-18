
import { useCallback, useEffect, useState } from "react";
import {
    getAdmins,
    makeAdmin,
    removeAdmin,
} from "../../services/api/adminService.js";
import "./MakeAdminPage.css";

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
                    setAdmins(
                        Array.isArray(response.admins) ? response.admins : []
                    );
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
            setLoading(true);
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
            setLoading(true);
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
        <section className="make-admin-page">
            <div className="make-admin-header">
                <div>
                    <span className="make-admin-eyebrow">ACCESS CONTROL</span>
                    <h1>Admin Management</h1>
                    <p>
                        Promote registered users and manage administrator access.
                    </p>
                </div>

                <div className="make-admin-header-count">
                    <span>ACTIVE ADMINS</span>
                    <strong>{admins.length}</strong>
                </div>
            </div>

            {error && (
                <div className="make-admin-alert make-admin-alert-error">
                    <span className="make-admin-alert-icon">!</span>
                    <p>{error}</p>
                </div>
            )}

            {message && (
                <div className="make-admin-alert make-admin-alert-success">
                    <span className="make-admin-alert-icon">✓</span>
                    <p>{message}</p>
                </div>
            )}

            <article className="make-admin-promote-card">
                <div className="make-admin-card-heading">
                    <div className="make-admin-card-icon">+</div>
                    <div>
                        <h2>Promote a user</h2>
                        <p>
                            Grant administrator privileges to an existing account.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleMakeAdmin} className="make-admin-form">
                    <div className="make-admin-input-group">
                        <label htmlFor="admin-email">User email address</label>
                        <input
                            id="admin-email"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="user@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="make-admin-submit"
                    >
                        {submitting ? "Promoting..." : "Make Admin"}
                    </button>
                </form>

                <p className="make-admin-hint">
                    Only existing registered accounts can be promoted.
                </p>
            </article>

            <article className="make-admin-list-card">
                <div className="make-admin-list-header">
                    <div>
                        <h2>Current administrators</h2>
                        <p>Manage accounts with administrator privileges.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            fetchAdmins();
                        }}
                        disabled={loading}
                        className="make-admin-refresh"
                    >
                        <span>↻</span>
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                {loading ? (
                    <div className="make-admin-state">
                        <span className="make-admin-spinner" />
                        <p>Loading administrators...</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="make-admin-state">
                        <span className="make-admin-empty-icon">◎</span>
                        <strong>No administrators found</strong>
                        <p>Promoted accounts will appear here.</p>
                    </div>
                ) : (
                    <div className="make-admin-list">
                        {admins.map((admin) => (
                            <div key={admin.uid} className="make-admin-row">
                                <div className="make-admin-identity">
                                    <div className="make-admin-avatar">
                                        {(admin.displayName || "U")
                                            .trim()
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <strong>
                                            {admin.displayName || "Unknown"}
                                        </strong>
                                        <span>{admin.email}</span>
                                    </div>
                                </div>

                                <div className="make-admin-row-actions">
                                    <span className="make-admin-role-badge">
                                        Administrator
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAdmin(admin)}
                                        className="make-admin-remove"
                                    >
                                        Remove Admin
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </article>
        </section>
    );
}

export default MakeAdminPage;
