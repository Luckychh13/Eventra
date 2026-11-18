import { useCallback, useEffect, useRef, useState } from "react";
import {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent,
} from "../../services/api/eventService.js";
import "./AdminEventsPage.css";

const initialFormData = {
    title: "",
    day: "",
    date: "",
    location: "",
    time: "",
    description: "",
};

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        fallback
    );
}

function AdminEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const imageInputRef = useRef(null);

    const fetchEvents = useCallback(async () => {
        try {
            const response = await getEvents();
            setEvents(Array.isArray(response) ? response : []);
            setError("");
        } catch (err) {
            setError(
                getErrorMessage(err, "Failed to load events.")
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch. The active flag prevents state updates after unmount.
    useEffect(() => {
        let isActive = true;

        const loadEvents = async () => {
            try {
                const response = await getEvents();

                if (isActive) {
                    setEvents(Array.isArray(response) ? response : []);
                    setError("");
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        getErrorMessage(err, "Failed to load events.")
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        loadEvents();

        return () => {
            isActive = false;
        };
    }, []);

    // Release temporary browser image URLs when the preview changes or unmounts.
    useEffect(() => {
        return () => {
            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const clearImageInput = () => {
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const openCreateForm = () => {
        setEditingEvent(null);
        setFormData({ ...initialFormData });
        setSelectedImage(null);
        setImagePreview("");
        setFormError("");
        setActionError("");
        clearImageInput();
        setShowForm(true);
    };

    const openEditForm = (event) => {
        setEditingEvent(event);

        setFormData({
            title: event.title || "",
            day: event.day || "",
            date: event.date || "",
            location: event.location || "",
            time: event.time || "",
            description: event.description || "",
        });

        setSelectedImage(null);
        setImagePreview(event.imageUrl || "");
        setFormError("");
        setActionError("");
        clearImageInput();
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEvent(null);
        setFormData({ ...initialFormData });
        setSelectedImage(null);
        setImagePreview("");
        setFormError("");
        clearImageInput();
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.title.trim() ||
            !formData.day.trim() ||
            !formData.date.trim() ||
            !formData.location.trim() ||
            !formData.time.trim()
        ) {
            setFormError("Please complete all required event fields.");
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            const eventFormData = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                eventFormData.append(key, value);
            });

            if (selectedImage) {
                eventFormData.append("image", selectedImage);
            }

            if (editingEvent) {
                await updateEvent(editingEvent._id, eventFormData);
            } else {
                await createEvent(eventFormData);
            }

            closeForm();
            await fetchEvents();
        } catch (err) {
            setFormError(
                getErrorMessage(err, "Failed to save event.")
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (event) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${event.title}"?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(event._id);
            setActionError("");

            await deleteEvent(event._id);

            setEvents((currentEvents) =>
                currentEvents.filter((item) => item._id !== event._id)
            );

            if (editingEvent?._id === event._id) {
                closeForm();
            }
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Failed to delete event.")
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <main className="admin-events-page">
            <header className="admin-events-header">
                <div>
                    <span className="admin-events-eyebrow">
                        EVENT MANAGEMENT
                    </span>

                    <h1>Events</h1>

                    <p>
                        Create, update, and manage the events displayed on
                        Eventra.
                    </p>
                </div>

                <div className="admin-events-header-actions">
                    <button
                        type="button"
                        className="admin-events-refresh-button"
                        onClick={() => {
                            setLoading(true);
                            fetchEvents();
                        }}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Refresh events"}
                    </button>

                    <button
                        type="button"
                        className="admin-events-create-button"
                        onClick={openCreateForm}
                        disabled={saving}
                    >
                        + Create event
                    </button>
                </div>
            </header>

            {error && (
                <div className="admin-events-alert is-error" role="alert">
                    {error}
                </div>
            )}

            {actionError && (
                <div className="admin-events-alert is-error" role="alert">
                    {actionError}

                    <button
                        type="button"
                        onClick={() => setActionError("")}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            <section className="admin-events-summary">
                <div>
                    <span>Total events</span>
                    <strong>{events.length}</strong>
                </div>

                <span className="admin-events-summary-icon">
                    <span />
                </span>
            </section>

            {showForm && (
                <section className="admin-event-form-card">
                    <div className="admin-event-form-heading">
                        <div>
                            <span className="admin-events-eyebrow">
                                {editingEvent ? "UPDATE EVENT" : "NEW EVENT"}
                            </span>

                            <h2>
                                {editingEvent ? "Edit event" : "Create event"}
                            </h2>

                            <p>
                                {editingEvent
                                    ? "Update the event information below."
                                    : "Enter the details for your new event."}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="admin-event-close-button"
                            onClick={closeForm}
                            disabled={saving}
                            aria-label="Close form"
                        >
                            ×
                        </button>
                    </div>

                    {formError && (
                        <div
                            className="admin-events-alert is-error"
                            role="alert"
                        >
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit}>
                        <div className="admin-event-form-grid">
                            <div className="admin-event-field">
                                <label htmlFor="event-title">
                                    Event title <span>*</span>
                                </label>

                                <input
                                    id="event-title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter event title"
                                />
                            </div>

                            <div className="admin-event-field">
                                <label htmlFor="event-day">
                                    Day <span>*</span>
                                </label>

                                <input
                                    id="event-day"
                                    name="day"
                                    value={formData.day}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Day 1"
                                />
                            </div>

                            <div className="admin-event-field">
                                <label htmlFor="event-date">
                                    Date <span>*</span>
                                </label>

                                <input
                                    id="event-date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Use the existing event date format"
                                />
                            </div>

                            <div className="admin-event-field">
                                <label htmlFor="event-time">
                                    Time <span>*</span>
                                </label>

                                <input
                                    id="event-time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. 10:00 AM"
                                />
                            </div>

                            <div className="admin-event-field full-width">
                                <label htmlFor="event-location">
                                    Location <span>*</span>
                                </label>

                                <input
                                    id="event-location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter event location"
                                />
                            </div>

                            <div className="admin-event-field full-width">
                                <label htmlFor="event-description">
                                    Description
                                </label>

                                <textarea
                                    id="event-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Add details about this event..."
                                />
                            </div>

                            <div className="admin-event-field full-width">
                                <label htmlFor="event-image">
                                    Event image
                                </label>

                                <div className="admin-event-upload-area">
                                    <input
                                        ref={imageInputRef}
                                        id="event-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />

                                    <p>
                                        {selectedImage
                                            ? selectedImage.name
                                            : editingEvent
                                                ? "Choose a replacement image (optional)"
                                                : "Choose an event image (optional)"}
                                    </p>
                                </div>

                                {editingEvent && (
                                    <small className="admin-event-field-hint">
                                        Leave this empty to keep the current
                                        image.
                                    </small>
                                )}

                                {imagePreview && (
                                    <div className="admin-event-image-preview">
                                        <span>
                                            {selectedImage
                                                ? "Selected image preview"
                                                : "Current image"}
                                        </span>

                                        <img
                                            src={imagePreview}
                                            alt="Event preview"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="admin-event-form-actions">
                            <button
                                type="submit"
                                className="admin-events-create-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingEvent
                                        ? "Save changes"
                                        : "Create event"}
                            </button>

                            <button
                                type="button"
                                className="admin-events-cancel-button"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="admin-event-list-section">
                <div className="admin-event-list-heading">
                    <div>
                        <span className="admin-events-eyebrow">
                            EVENT DIRECTORY
                        </span>

                        <h2>All events</h2>

                        <p>
                            {events.length}{" "}
                            {events.length === 1 ? "event" : "events"} in your
                            event directory
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-events-state">
                        Loading events...
                    </div>
                ) : events.length === 0 ? (
                    <div className="admin-events-state">
                        <strong>No events found</strong>

                        <p>
                            Events will appear here once they are created.
                        </p>

                        <button
                            type="button"
                            className="admin-events-create-button"
                            onClick={openCreateForm}
                        >
                            Create your first event
                        </button>
                    </div>
                ) : (
                    <div className="admin-event-grid">
                        {events.map((event) => (
                            <article
                                key={event._id}
                                className="admin-event-card"
                            >
                                <div className="admin-event-card-image">
                                    {event.imageUrl ? (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.title}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="admin-event-no-image">
                                            <span>
                                                {event.title?.charAt(0) || "E"}
                                            </span>
                                            <small>No event image</small>
                                        </div>
                                    )}
                                </div>

                                <div className="admin-event-card-content">
                                    <div className="admin-event-card-heading">
                                        <span className="admin-event-day">
                                            {event.day}
                                        </span>
                                    </div>

                                    <h3>{event.title}</h3>

                                    <div className="admin-event-information">
                                        <div>
                                            <span className="admin-event-info-mark" />
                                            <p>{event.date}</p>
                                        </div>

                                        <div>
                                            <span className="admin-event-info-mark" />
                                            <p>{event.time}</p>
                                        </div>

                                        <div>
                                            <span className="admin-event-info-mark" />
                                            <p>{event.location}</p>
                                        </div>
                                    </div>

                                    {event.description && (
                                        <p className="admin-event-description">
                                            {event.description}
                                        </p>
                                    )}

                                    <div className="admin-event-card-actions">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(event)}
                                            disabled={deletingId === event._id}
                                        >
                                            Edit event
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-event-delete-button"
                                            onClick={() => handleDelete(event)}
                                            disabled={deletingId === event._id}
                                        >
                                            {deletingId === event._id
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
        </main>
    );
}

export default AdminEventsPage;