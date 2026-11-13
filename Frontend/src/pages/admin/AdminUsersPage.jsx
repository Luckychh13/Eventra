import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../../services/api/adminService.js";

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
        <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                        Users
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">
                        View registered users and their account information.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Refresh Users"}
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-gray-400">Total registered users</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {users.length}
                    </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-gray-400">Matching users</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {filteredUsers.length}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, email, or role..."
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
                />

                <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="rounded-lg border border-white/10 bg-[#171522] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >
                    <option value="all">All roles</option>
                    <option value="user">Users</option>
                    <option value="stallowner">Stall Owners</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {error && (
                <div className="flex flex-col gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-red-300">{error}</p>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="text-sm font-medium text-red-300 underline underline-offset-4"
                    >
                        Try again
                    </button>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-400">
                        Loading users...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="font-medium text-white">No users found</p>
                        <p className="mt-1 text-sm text-gray-400">
                            Try changing your search or role filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
                                <tr>
                                    <th className="px-5 py-4 font-medium">User</th>
                                    <th className="px-5 py-4 font-medium">Role</th>
                                    <th className="px-5 py-4 font-medium">Email status</th>
                                    <th className="px-5 py-4 font-medium">Joined</th>
                                    <th className="px-5 py-4 font-medium">Last sign-in</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/10">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.uid}
                                        className="transition hover:bg-white/[0.03]"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.photoURL ? (
                                                    <img
                                                        src={user.photoURL}
                                                        alt=""
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15 text-sm font-semibold text-purple-300">
                                                        {getInitials(user.name)}
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-medium text-white">
                                                        {user.name || "Unknown"}
                                                    </p>
                                                    <p className="mt-1 text-gray-400">
                                                        {user.email || "No email"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-gray-300">
                                            {formatRole(user.role)}
                                        </td>

                                        <td className="px-5 py-4">
                                            {user.emailVerified ? (
                                                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-300">
                                                    Not verified
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-gray-300">
                                            {formatDate(user.createdAt)}
                                        </td>

                                        <td className="px-5 py-4 text-gray-300">
                                            {formatDate(user.lastSignIn)}
                                        </td>
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