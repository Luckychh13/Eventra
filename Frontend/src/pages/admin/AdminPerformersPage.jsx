import { useEffect, useRef, useState } from "react";
import {
    getPerformers,
    createPerformer,
    updatePerformer,
    deletePerformer,
} from "../../services/api/performerService.js";
import { getEvents } from "../../services/api/eventService.js";
import "./AdminPerformersPage.css";

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        fallback
    );
}

function AdminPerformersPage() {
    const [performers, setPerformers] = useState([]);
    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingPerformerId, setDeletingPerformerId] = useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [search, setSearch] = useState("");

    const [editingPerformerId, setEditingPerformerId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const imageInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        eventId: "",
        role: "Performer",
        day: "",
    });


    useEffect(() => {
        let isActive = true;

        Promise.all([
            getPerformers(),
            getEvents(),
        ])
            .then(([performersData, eventsData]) => {
                if (!isActive) return;

                setPerformers(
                    Array.isArray(performersData) ? performersData : []
                );

                setEvents(
                    Array.isArray(eventsData)
                        ? eventsData
                        : eventsData.events || []
                );
            })
            .catch((err) => {
                if (isActive) {
                    setError(
                        getErrorMessage(
                            err,
                            "Failed to load performers and events."
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

    // Release temporary preview URLs when they are replaced or the page unmounts.
    useEffect(() => {
        return () => {
            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const refreshPerformers = async () => {
        try {
            const data = await getPerformers();
            setPerformers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Operation completed, but failed to refresh performers."
                )
            );
        }
    };

    const filteredPerformers = performers.filter((performer) =>
        performer.name?.toLowerCase().includes(search.trim().toLowerCase())
    );

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const clearImageInput = () => {
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const resetForm = () => {
        setEditingPerformerId(null);
        setImageFile(null);
        setImagePreview("");

        setFormData({
            name: "",
            eventId: "",
            role: "Performer",
            day: "",
        });

        clearImageInput();
    };

    const handleEdit = (performer) => {
        setEditingPerformerId(performer._id);

        setFormData({
            name: performer.name || "",
            eventId:
                performer.eventId?._id ||
                performer.eventId ||
                "",
            role: performer.role || "Performer",
            day: performer.day || "",
        });

        setImageFile(null);
        setImagePreview(performer.image || "");
        clearImageInput();

        setError("");
        setSuccessMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.eventId ||
            !formData.day.trim()
        ) {
            setError("Name, event, and day are required.");
            return;
        }

        const payload = new FormData();

        payload.append("name", formData.name.trim());
        payload.append("eventId", formData.eventId);
        payload.append("role", formData.role.trim());
        payload.append("day", formData.day.trim());

        if (imageFile) {
            payload.append("image", imageFile);
        }

        try {
            setSaving(true);
            setError("");
            setSuccessMessage("");

            if (editingPerformerId) {
                await updatePerformer(editingPerformerId, payload);

                setSuccessMessage(
                    "Performer updated successfully."
                );
            } else {
                await createPerformer(payload);

                setSuccessMessage(
                    "Performer created successfully."
                );
            }

            resetForm();
            await refreshPerformers();
        } catch (err) {
            setError(
                getErrorMessage(err, "Failed to save performer.")
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (performer) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${performer.name}?`
        );

        if (!confirmed) return;

        try {
            setDeletingPerformerId(performer._id);
            setError("");
            setSuccessMessage("");

            await deletePerformer(performer._id);

            if (editingPerformerId === performer._id) {
                resetForm();
            }

            setSuccessMessage("Performer deleted successfully.");

            await refreshPerformers();
        } catch (err) {
            setError(
                getErrorMessage(err, "Failed to delete performer.")
            );
        } finally {
            setDeletingPerformerId(null);
        }
    };

    const getEventTitle = (performer) => {
        if (
            performer.eventId &&
            typeof performer.eventId === "object"
        ) {
            return performer.eventId.title || "Unknown event";
        }

        return (
            events.find((event) => event._id === performer.eventId)?.title ||
            "Unknown event"
        );
    };

    return (
        <main className="admin-performers-page">
            <header className="admin-performers-header">
                <div>
                    <span className="admin-performers-eyebrow">
                        EVENT MANAGEMENT
                    </span>

                    <h1>Performers</h1>

                    <p>
                        Manage performer profiles and associate them with
                        scheduled events.
                    </p>
                </div>

                <div className="admin-performers-stats">
                    <div className="admin-performer-stat">
                        <span>Total performers</span>
                        <strong>{performers.length}</strong>
                    </div>

                    <div className="admin-performer-stat">
                        <span>Available events</span>
                        <strong>{events.length}</strong>
                    </div>
                </div>
            </header>

            {(error || successMessage) && (
                <div
                    className={`admin-performers-alert ${error ? "is-error" : "is-success"
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

            <div className="admin-performers-layout">
                <section className="admin-performer-form-card">
                    <div className="admin-performer-section-heading">
                        <div>
                            <span className="admin-performers-eyebrow">
                                {editingPerformerId
                                    ? "UPDATE PROFILE"
                                    : "NEW PERFORMER"}
                            </span>

                            <h2>
                                {editingPerformerId
                                    ? "Edit performer"
                                    : "Add performer"}
                            </h2>
                        </div>

                        {editingPerformerId && (
                            <span className="admin-performer-edit-badge">
                                Editing
                            </span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="admin-performer-form-fields">
                            <div className="admin-performer-field">
                                <label htmlFor="performer-name">
                                    Performer name <span>*</span>
                                </label>

                                <input
                                    id="performer-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter performer name"
                                />
                            </div>

                            <div className="admin-performer-field">
                                <label htmlFor="performer-event">
                                    Associated event <span>*</span>
                                </label>

                                <select
                                    id="performer-event"
                                    name="eventId"
                                    value={formData.eventId}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading || events.length === 0}
                                >
                                    <option value="">
                                        Select an event
                                    </option>

                                    {events.map((event) => (
                                        <option
                                            key={event._id}
                                            value={event._id}
                                        >
                                            {event.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-performer-field">
                                <label htmlFor="performer-role">
                                    Performer role
                                </label>

                                <input
                                    id="performer-role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Singer, DJ, Dancer"
                                />
                            </div>

                            <div className="admin-performer-field">
                                <label htmlFor="performer-day">
                                    Performance day <span>*</span>
                                </label>

                                <input
                                    id="performer-day"
                                    name="day"
                                    value={formData.day}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Day 1"
                                />
                            </div>

                            <div className="admin-performer-field">
                                <label htmlFor="performer-image">
                                    Performer image
                                </label>

                                <div className="admin-performer-upload">
                                    <input
                                        ref={imageInputRef}
                                        id="performer-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />

                                    <p>
                                        {imageFile
                                            ? imageFile.name
                                            : editingPerformerId
                                                ? "Choose a replacement image (optional)"
                                                : "Choose an image (optional)"}
                                    </p>
                                </div>

                                {editingPerformerId && (
                                    <small>
                                        Leave this empty to keep the existing
                                        image.
                                    </small>
                                )}
                            </div>
                        </div>

                        {imagePreview && (
                            <div className="admin-performer-image-preview">
                                <span>
                                    {imageFile
                                        ? "Selected image preview"
                                        : "Current performer image"}
                                </span>

                                <img
                                    src={imagePreview}
                                    alt={
                                        formData.name ||
                                        "Performer preview"
                                    }
                                />
                            </div>
                        )}

                        {events.length === 0 && !loading && (
                            <p className="admin-performer-no-events">
                                No events are available. Create an event
                                before adding performers.
                            </p>
                        )}

                        <div className="admin-performer-form-actions">
                            <button
                                type="submit"
                                className="admin-performer-primary-button"
                                disabled={
                                    saving ||
                                    loading ||
                                    events.length === 0
                                }
                            >
                                {saving
                                    ? "Saving..."
                                    : editingPerformerId
                                        ? "Save changes"
                                        : "Add performer"}
                            </button>

                            {editingPerformerId && (
                                <button
                                    type="button"
                                    className="admin-performer-secondary-button"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="admin-performer-list-section">
                    <div className="admin-performer-list-heading">
                        <div>
                            <span className="admin-performers-eyebrow">
                                PERFORMER DIRECTORY
                            </span>

                            <h2>All performers</h2>

                            <p>
                                Showing {filteredPerformers.length} of{" "}
                                {performers.length} performers
                            </p>
                        </div>

                        <div className="admin-performer-search">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search performers..."
                                aria-label="Search performers"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-performers-state">
                            Loading performers...
                        </div>
                    ) : error && performers.length === 0 ? (
                        <div className="admin-performers-state">
                            Unable to load performers.
                        </div>
                    ) : filteredPerformers.length === 0 ? (
                        <div className="admin-performers-state">
                            {performers.length === 0
                                ? "No performers have been added yet."
                                : "No performers match your search."}
                        </div>
                    ) : (
                        <div className="admin-performer-grid">
                            {filteredPerformers.map((performer) => (
                                <article
                                    key={performer._id}
                                    className="admin-performer-card"
                                >
                                    <div className="admin-performer-photo">
                                        {performer.image ? (
                                            <img
                                                src={performer.image}
                                                alt={performer.name}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="admin-performer-no-photo">
                                                <span>
                                                    {performer.name
                                                        ?.charAt(0)
                                                        .toUpperCase() || "?"}
                                                </span>

                                                <small>No image available</small>
                                            </div>
                                        )}
                                    </div>

                                    <div className="admin-performer-card-content">
                                        <div className="admin-performer-card-title">
                                            <div>
                                                <h3>{performer.name}</h3>

                                                <span>
                                                    {performer.role || "Performer"}
                                                </span>
                                            </div>

                                            <span className="admin-performer-day">
                                                {performer.day}
                                            </span>
                                        </div>

                                        <div className="admin-performer-event-info">
                                            <span>Associated event</span>
                                            <strong>
                                                {getEventTitle(performer)}
                                            </strong>
                                        </div>

                                        <div className="admin-performer-card-actions">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(performer)
                                                }
                                                disabled={
                                                    deletingPerformerId ===
                                                    performer._id
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-performer-delete-button"
                                                onClick={() =>
                                                    handleDelete(performer)
                                                }
                                                disabled={
                                                    deletingPerformerId ===
                                                    performer._id
                                                }
                                            >
                                                {deletingPerformerId ===
                                                    performer._id
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

export default AdminPerformersPage;