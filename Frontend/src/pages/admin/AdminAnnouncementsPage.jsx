import { useEffect, useState } from "react";

import {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../../services/api/announcementService.js";

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

function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingAnnouncementId, setDeletingAnnouncementId] =
        useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [search, setSearch] = useState("");

    const [editingAnnouncementId, setEditingAnnouncementId] =
        useState(null);

    const [formData, setFormData] = useState({
        title: "",
        message: "",
    });

    useEffect(() => {
        let isActive = true;

        getAnnouncements()
            .then((data) => {
                if (isActive) {
                    setAnnouncements(data);
                }
            })
            .catch((err) => {
                if (isActive) {
                    setError(
                        getErrorMessage(
                            err,
                            "Failed to load announcements."
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

    const refreshAnnouncements = async () => {
        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Operation completed, but failed to refresh announcements."
                )
            );
        }
    };

    const searchTerm = search.trim().toLowerCase();

    const filteredAnnouncements = announcements.filter(
        (announcement) =>
            announcement.title?.toLowerCase().includes(searchTerm) ||
            announcement.message?.toLowerCase().includes(searchTerm) ||
            announcement.createdBy?.toLowerCase().includes(searchTerm)
    );

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setEditingAnnouncementId(null);

        setFormData({
            title: "",
            message: "",
        });
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncementId(announcement._id);

        setFormData({
            title: announcement.title || "",
            message: announcement.message || "",
        });

        setError("");
        setSuccessMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            setError("Title and message are required.");
            return;
        }

        const payload = {
            title: formData.title.trim(),
            message: formData.message.trim(),
        };

        try {
            setSaving(true);
            setError("");
            setSuccessMessage("");

            if (editingAnnouncementId) {
                await updateAnnouncement(
                    editingAnnouncementId,
                    payload
                );

                setSuccessMessage(
                    "Announcement updated successfully."
                );
            } else {
                await createAnnouncement(payload);

                setSuccessMessage(
                    "Announcement created successfully."
                );
            }

            resetForm();
            await refreshAnnouncements();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to save announcement."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (announcement) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${announcement.title}"?`
        );

        if (!confirmed) return;

        try {
            setDeletingAnnouncementId(announcement._id);
            setError("");
            setSuccessMessage("");

            await deleteAnnouncement(announcement._id);

            if (editingAnnouncementId === announcement._id) {
                resetForm();
            }

            setSuccessMessage(
                "Announcement deleted successfully."
            );

            await refreshAnnouncements();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to delete announcement."
                )
            );
        } finally {
            setDeletingAnnouncementId(null);
        }
    };

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Manage Announcements
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                    Create and manage announcements for Eventra users.
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

            {/* Create / Edit form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5"
            >
                <h2 className="text-lg font-medium text-white">
                    {editingAnnouncementId
                        ? "Edit Announcement"
                        : "Create Announcement"}
                </h2>

                {/* Title */}
                <div>
                    <label
                        htmlFor="announcement-title"
                        className="mb-1 block text-sm text-gray-300"
                    >
                        Title *
                    </label>

                    <input
                        id="announcement-title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter announcement title"
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                </div>

                {/* Message */}
                <div>
                    <label
                        htmlFor="announcement-message"
                        className="mb-1 block text-sm text-gray-300"
                    >
                        Message *
                    </label>

                    <textarea
                        id="announcement-message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        placeholder="Write your announcement..."
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                </div>

                {/* Form actions */}
                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingAnnouncementId
                                ? "Update Announcement"
                                : "Publish Announcement"}
                    </button>

                    {editingAnnouncementId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg border border-white/20 px-5 py-2 text-sm text-gray-300 hover:bg-white/10"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Announcement listing */}
            <section className="space-y-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-medium text-white">
                        All Announcements ({announcements.length})
                    </h2>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search announcements..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 sm:max-w-xs"
                    />
                </div>

                {/* Loading, error, and empty states */}
                {loading ? (
                    <p className="py-8 text-center text-gray-400">
                        Loading announcements...
                    </p>
                ) : error && announcements.length === 0 ? (
                    <p className="py-8 text-center text-gray-400">
                        Unable to load announcements.
                    </p>
                ) : filteredAnnouncements.length === 0 ? (
                    <p className="rounded-xl border border-white/10 p-8 text-center text-gray-400">
                        {announcements.length === 0
                            ? "No announcements have been published yet."
                            : "No announcements match your search."}
                    </p>
                ) : (
                    <div className="space-y-4">

                        {filteredAnnouncements.map((announcement) => (
                            <article
                                key={announcement._id}
                                className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-5"
                            >
                                {/* Announcement details */}
                                <div>
                                    <h3 className="text-lg font-medium text-white">
                                        {announcement.title}
                                    </h3>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                                        {announcement.message}
                                    </p>
                                </div>

                                {/* Metadata */}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-gray-500">
                                    <span>
                                        By: {announcement.createdBy || "Admin"}
                                    </span>

                                    <span>
                                        Published: {formatDate(announcement.createdAt)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(announcement)}
                                        disabled={
                                            deletingAnnouncementId === announcement._id
                                        }
                                        className="rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-50"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(announcement)}
                                        disabled={
                                            deletingAnnouncementId === announcement._id
                                        }
                                        className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {deletingAnnouncementId === announcement._id
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>
                                </div>
                            </article>
                        ))}

                    </div>
                )}
            </section>
        </div>
    );
}

export default AdminAnnouncementsPage;
