
import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../../services/api/adminService.js";
import "./AdminUsersPage.css";

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatRole = (role) => {
    if (!role) return "User";

    return role.charAt(0).toUpperCase() + role.slice(1);
};

const getInitials = (name) => {
    if (!name || name === "Unknown") return "?";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
};

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isActive = true;

        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();

                if (isActive) {
                    setUsers(Array.isArray(response.users) ? response.users : []);
                    setError("");
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to load users."
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isActive = false;
        };
    }, [reloadKey]);

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return users.filter((user) => {
            const role = (user.role || "user").toLowerCase();

            const matchesRole =
                roleFilter === "all" || role === roleFilter;

            const matchesSearch =
                !query ||
                [user.name, user.email, user.role].some((value) =>
                    (value || "").toLowerCase().includes(query)
                );

            return matchesRole && matchesSearch;
        });
    }, [users, searchTerm, roleFilter]);

    const handleRefresh = () => {
        setLoading(true);
        setError("");
        setReloadKey((current) => current + 1);
    };

    return (
        <section className="users-page">
            <div className="users-page-header">
                <div>
                    <div className="users-eyebrow">USER MANAGEMENT</div>
                    <h1>Users</h1>
                    <p>
                        Manage and monitor registered accounts across Eventra.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="users-refresh-button"
                >
                    <span className={loading ? "users-refresh-icon spinning" : "users-refresh-icon"}>
                        ↻
                    </span>
                    {loading ? "Loading..." : "Refresh Users"}
                </button>
            </div>

            <div className="users-stats-grid">
                <article className="users-stat-card">
                    <div className="users-stat-top">
                        <span className="users-stat-label">Total registered users</span>
                        <span className="users-stat-icon">US</span>
                    </div>
                    <strong>{users.length.toLocaleString("en-IN")}</strong>
                    <span className="users-stat-caption">
                        All accounts registered on Eventra
                    </span>
                </article>

                <article className="users-stat-card users-stat-card-accent">
                    <div className="users-stat-top">
                        <span className="users-stat-label">Matching users</span>
                        <span className="users-stat-icon">FL</span>
                    </div>
                    <strong>{filteredUsers.length.toLocaleString("en-IN")}</strong>
                    <span className="users-stat-caption">
                        Accounts matching current filters
                    </span>
                </article>
            </div>

            <div className="users-toolbar">
                <div className="users-search-wrapper">
                    <span className="users-search-icon">⌕</span>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search by name, email, or role..."
                        aria-label="Search users"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="users-role-filter"
                    aria-label="Filter users by role"
                >
                    <option value="all">All roles</option>
                    <option value="user">Users</option>
                    <option value="stallowner">Stall Owners</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {error && (
                <div className="users-error">
                    <div>
                        <strong>Unable to load users</strong>
                        <p>{error}</p>
                    </div>

                    <button type="button" onClick={handleRefresh}>
                        Try again
                    </button>
                </div>
            )}

            <div className="users-table-card">
                <div className="users-table-heading">
                    <div>
                        <h2>Registered accounts</h2>
                        <p>Account details and activity information</p>
                    </div>

                    <span className="users-result-count">
                        {filteredUsers.length} results
                    </span>
                </div>

                {loading ? (
                    <div className="users-state">
                        <span className="users-loader" />
                        <p>Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="users-state">
                        <span className="users-empty-icon">◎</span>
                        <strong>No users found</strong>
                        <p>Try changing your search or role filter.</p>
                    </div>
                ) : (
                    <div className="users-table-scroll">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Email status</th>
                                    <th>Joined</th>
                                    <th>Last sign-in</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.uid}>
                                        <td>
                                            <div className="users-identity">
                                                {user.photoURL ? (
                                                    <img
                                                        src={user.photoURL}
                                                        alt=""
                                                        className="users-avatar"
                                                    />
                                                ) : (
                                                    <div className="users-avatar users-avatar-fallback">
                                                        {getInitials(user.name)}
                                                    </div>
                                                )}

                                                <div className="users-identity-details">
                                                    <strong>{user.name || "Unknown"}</strong>
                                                    <span>{user.email || "No email"}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className={`users-role-badge users-role-${(user.role || "user").toLowerCase()}`}>
                                                {formatRole(user.role)}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`users-verification ${user.emailVerified ? "is-verified" : "is-unverified"}`}>
                                                <span />
                                                {user.emailVerified ? "Verified" : "Not verified"}
                                            </span>
                                        </td>

                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>{formatDate(user.lastSignIn)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminUsersPage;
