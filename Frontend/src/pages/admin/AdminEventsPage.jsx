
import { useCallback, useEffect, useState } from "react";
import {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent,
} from "../../services/api/eventService.js";

const initialFormData = {
    title: "",
    day: "",
    date: "",
    location: "",
    time: "",
    description: "",
};

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

    const fetchEvents = useCallback(async () => {
        try {
            const response = await getEvents();
            setEvents(Array.isArray(response) ? response : []);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load events."
            );
        } finally {
            setLoading(false);
        }
    }, []);

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
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to load events."
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

    const openCreateForm = () => {
        setEditingEvent(null);
        setFormData({ ...initialFormData });
        setSelectedImage(null);
        setImagePreview("");
        setFormError("");
        setActionError("");
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
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEvent(null);
        setFormData({ ...initialFormData });
        setSelectedImage(null);
        setImagePreview("");
        setFormError("");
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
                err.response?.data?.message ||
                err.message ||
                "Failed to save event."
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
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete event."
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                        Event Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">
                        View and manage all events.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            fetchEvents();
                        }}
                        disabled={loading}
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                    >
                        Refresh Events
                    </button>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                        + Create Event
                    </button>
                </div>
            </div>

            {showForm && (
                <form
                    onSubmit={handleFormSubmit}
                    className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-5"
                >
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {editingEvent ? "Edit Event" : "Create Event"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            {editingEvent
                                ? "Update the event details below."
                                : "Enter the details for the new event."}
                        </p>
                    </div>

                    {formError && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
                            {formError}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-gray-300">
                                Event title *
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-gray-300">
                                Day *
                            </label>
                            <input
                                name="day"
                                value={formData.day}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-gray-300">
                                Date *
                            </label>
                            <input
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                placeholder="Use the date format expected by your existing events"
                                className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-gray-300">
                                Time *
                            </label>
                            <input
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm text-gray-300">
                                Location *
                            </label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm text-gray-300">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full rounded-lg border border-white/10 bg-[#171522] px-3 py-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm text-gray-300">
                                Event image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white"
                            />

                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Event preview"
                                    className="mt-3 h-48 w-full rounded-lg object-cover sm:w-80"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingEvent
                                    ? "Update Event"
                                    : "Create Event"}
                        </button>

                        <button
                            type="button"
                            onClick={closeForm}
                            disabled={saving}
                            className="rounded-lg border border-white/10 px-5 py-2 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-gray-400">Total events</p>
                <p className="mt-2 text-3xl font-bold text-white">
                    {events.length}
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {actionError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                    {actionError}
                </div>
            )}

            {loading ? (
                <div className="py-12 text-center text-sm text-gray-400">
                    Loading events...
                </div>
            ) : events.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                    <p className="font-medium text-white">No events found</p>
                    <p className="mt-1 text-sm text-gray-400">
                        Events will appear here once they are created.
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {events.map((event) => (
                        <article
                            key={event._id}
                            className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                        >
                            {event.imageUrl ? (
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="h-48 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-48 items-center justify-center bg-white/5 text-sm text-gray-500">
                                    No event image
                                </div>
                            )}

                            <div className="space-y-3 p-5">
                                <h2 className="text-lg font-semibold text-white">
                                    {event.title}
                                </h2>

                                <div className="space-y-1 text-sm text-gray-400">
                                    <p>{event.day} · {event.date}</p>
                                    <p>{event.time}</p>
                                    <p>{event.location}</p>
                                </div>

                                {event.description && (
                                    <p className="line-clamp-2 text-sm text-gray-400">
                                        {event.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => openEditForm(event)}
                                        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(event)}
                                        disabled={deletingId === event._id}
                                        className="rounded-lg border border-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
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
    );
}

export default AdminEventsPage;
