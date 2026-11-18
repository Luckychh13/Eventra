import { useEffect, useState } from "react";
import {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../../services/api/announcementService.js";
import "./AdminAnnouncementsPage.css";

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
        <main className="admin-announcements-page">
            <header className="admin-announcements-header">
                <div>
                    <span className="admin-announcements-eyebrow">
                        CONTENT MANAGEMENT
                    </span>

                    <h1>Announcements</h1>

                    <p>
                        Publish updates and important information for
                        Eventra users.
                    </p>
                </div>

                <div className="admin-announcements-total">
                    <span>Total announcements</span>
                    <strong>{announcements.length}</strong>
                </div>
            </header>

            {(error || successMessage) && (
                <div
                    className={`admin-announcements-alert ${error ? "is-error" : "is-success"
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

            <div className="admin-announcements-layout">
                <section className="admin-announcement-form-card">
                    <div className="admin-announcement-section-heading">
                        <div>
                            <span className="admin-announcements-eyebrow">
                                {editingAnnouncementId
                                    ? "EDIT CONTENT"
                                    : "NEW MESSAGE"}
                            </span>

                            <h2>
                                {editingAnnouncementId
                                    ? "Edit announcement"
                                    : "Create announcement"}
                            </h2>
                        </div>

                        {editingAnnouncementId && (
                            <span className="admin-announcement-edit-badge">
                                Editing
                            </span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="admin-announcement-form-fields">
                            <div className="admin-announcement-field">
                                <label htmlFor="announcement-title">
                                    Announcement title <span>*</span>
                                </label>

                                <input
                                    id="announcement-title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter a clear title"
                                />
                            </div>

                            <div className="admin-announcement-field">
                                <label htmlFor="announcement-message">
                                    Message <span>*</span>
                                </label>

                                <textarea
                                    id="announcement-message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={8}
                                    placeholder="Write your announcement..."
                                />

                                <small>
                                    This message will be visible to Eventra
                                    users.
                                </small>
                            </div>
                        </div>

                        <div className="admin-announcement-form-actions">
                            <button
                                type="submit"
                                className="admin-announcement-primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingAnnouncementId
                                        ? "Save changes"
                                        : "Publish announcement"}
                            </button>

                            {editingAnnouncementId && (
                                <button
                                    type="button"
                                    className="admin-announcement-secondary-button"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="admin-announcement-list-section">
                    <div className="admin-announcement-list-heading">
                        <div>
                            <span className="admin-announcements-eyebrow">
                                PUBLISHED CONTENT
                            </span>

                            <h2>All announcements</h2>

                            <p>
                                Showing {filteredAnnouncements.length} of{" "}
                                {announcements.length} announcements
                            </p>
                        </div>

                        <div className="admin-announcement-search">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search announcements..."
                                aria-label="Search announcements"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-announcements-state">
                            Loading announcements...
                        </div>
                    ) : error && announcements.length === 0 ? (
                        <div className="admin-announcements-state">
                            Unable to load announcements.
                        </div>
                    ) : filteredAnnouncements.length === 0 ? (
                        <div className="admin-announcements-state">
                            {announcements.length === 0
                                ? "No announcements have been published yet."
                                : "No announcements match your search."}
                        </div>
                    ) : (
                        <div className="admin-announcement-list">
                            {filteredAnnouncements.map((announcement) => (
                                <article
                                    key={announcement._id}
                                    className="admin-announcement-card"
                                >
                                    <div className="admin-announcement-card-top">
                                        <span className="admin-announcement-indicator">
                                            <span />
                                            Published
                                        </span>

                                        <span className="admin-announcement-date">
                                            {formatDate(
                                                announcement.createdAt
                                            )}
                                        </span>
                                    </div>

                                    <div className="admin-announcement-card-body">
                                        <h3>{announcement.title}</h3>

                                        <p>
                                            {announcement.message}
                                        </p>
                                    </div>

                                    <div className="admin-announcement-card-footer">
                                        <span className="admin-announcement-author">
                                            By{" "}
                                            <strong>
                                                {announcement.createdBy ||
                                                    "Admin"}
                                            </strong>
                                        </span>

                                        <div className="admin-announcement-card-actions">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(announcement)
                                                }
                                                disabled={
                                                    deletingAnnouncementId ===
                                                    announcement._id
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-announcement-delete-button"
                                                onClick={() =>
                                                    handleDelete(announcement)
                                                }
                                                disabled={
                                                    deletingAnnouncementId ===
                                                    announcement._id
                                                }
                                            >
                                                {deletingAnnouncementId ===
                                                    announcement._id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default AdminAnnouncementsPage;