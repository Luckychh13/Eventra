import { useEffect, useState } from "react";
import {
    getPerformers,
    createPerformer,
    updatePerformer,
    deletePerformer,
} from "../../services/api/performerService.js";

import { getEvents } from "../../services/api/eventService.js";

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

                setPerformers(performersData);
                setEvents(
                    Array.isArray(eventsData)
                        ? eventsData
                        : eventsData.events || []
                );
            })
            .catch((err) => {
                if (isActive) {
                    setError(
                        getErrorMessage(err, "Failed to load initial data.")
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

    const refreshPerformers = async () => {
        try {
            const data = await getPerformers();
            setPerformers(data);
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
        performer.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setEditingPerformerId(null);
        setImageFile(null);

        setFormData({
            name: "",
            eventId: "",
            role: "Performer",
            day: "",
        });
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
        setError("");
        setSuccessMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
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

            setSuccessMessage(
                "Performer deleted successfully."
            );

            await refreshPerformers();
        } catch (err) {
            setError(
                getErrorMessage(err, "Failed to delete performer.")
            );
        } finally {
            setDeletingPerformerId(null);
        }
    };

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Manage Performers
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                    Add, edit, and manage event performers.
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

            {/* Add / Edit form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5"
            >
                <h2 className="text-lg font-medium text-white">
                    {editingPerformerId
                        ? "Edit Performer"
                        : "Add Performer"}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">

                    {/* Performer name */}
                    <div>
                        <label
                            htmlFor="performer-name"
                            className="mb-1 block text-sm text-gray-300"
                        >
                            Performer Name *
                        </label>

                        <input
                            id="performer-name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter performer name"
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Event dropdown */}
                    <div>
                        <label
                            htmlFor="performer-event"
                            className="mb-1 block text-sm text-gray-300"
                        >
                            Event *
                        </label>

                        <select
                            id="performer-event"
                            name="eventId"
                            value={formData.eventId}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                        >
                            <option value="">
                                Select an event
                            </option>

                            {events.map((event) => (
                                <option
                                    key={event._id}
                                    value={event._id}
                                    className="bg-gray-900"
                                >
                                    {event.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Role */}
                    <div>
                        <label
                            htmlFor="performer-role"
                            className="mb-1 block text-sm text-gray-300"
                        >
                            Role
                        </label>

                        <input
                            id="performer-role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            placeholder="e.g. Singer, DJ, Dancer"
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Day */}
                    <div>
                        <label
                            htmlFor="performer-day"
                            className="mb-1 block text-sm text-gray-300"
                        >
                            Performance Day *
                        </label>

                        <input
                            id="performer-day"
                            name="day"
                            value={formData.day}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Day 1"
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                        />
                    </div>

                </div>

                {/* Image upload */}
                <div>
                    <label
                        htmlFor="performer-image"
                        className="mb-1 block text-sm text-gray-300"
                    >
                        Performer Image (optional)
                    </label>

                    <input
                        id="performer-image"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            setImageFile(event.target.files?.[0] || null)
                        }
                        className="block w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
                    />

                    {imageFile && (
                        <p className="mt-1 text-xs text-gray-400">
                            Selected: {imageFile.name}
                        </p>
                    )}

                    {editingPerformerId && (
                        <p className="mt-1 text-xs text-gray-400">
                            Leave the image field empty to keep the existing image.
                        </p>
                    )}
                </div>

                {/* Form actions */}
                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={saving || events.length === 0}
                        className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingPerformerId
                                ? "Update Performer"
                                : "Add Performer"}
                    </button>

                    {editingPerformerId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg border border-white/20 px-5 py-2 text-sm text-gray-300 hover:bg-white/10"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {events.length === 0 && !loading && (
                    <p className="text-sm text-yellow-400">
                        No events are available. Create an event before adding performers.
                    </p>
                )}
            </form>

            {/* Performer listing */}
            <section className="space-y-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-medium text-white">
                        All Performers ({performers.length})
                    </h2>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search performers..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 sm:max-w-xs"
                    />
                </div>

                {/* Loading, error, empty and success states */}
                {loading ? (
                    <p className="py-8 text-center text-gray-400">
                        Loading performers...
                    </p>
                ) : error && performers.length === 0 ? (
                    <p className="py-8 text-center text-gray-400">
                        Unable to load performers.
                    </p>
                ) : filteredPerformers.length === 0 ? (
                    <p className="rounded-xl border border-white/10 p-8 text-center text-gray-400">
                        {performers.length === 0
                            ? "No performers have been added yet."
                            : "No performers match your search."}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {filteredPerformers.map((performer) => (
                            <article
                                key={performer._id}
                                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                            >

                                {/* Performer image */}
                                {performer.image ? (
                                    <img
                                        src={performer.image}
                                        alt={performer.name}
                                        loading="lazy"
                                        className="h-48 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-48 items-center justify-center bg-white/5 text-sm text-gray-500">
                                        No image available
                                    </div>
                                )}

                                <div className="space-y-3 p-4">

                                    {/* Performer details */}
                                    <div>
                                        <h3 className="font-medium text-white">
                                            {performer.name}
                                        </h3>

                                        <p className="text-sm text-gray-400">
                                            Role: {performer.role || "Performer"}
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            Day: {performer.day}
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            Event: {
                                                performer.eventId?.title ||
                                                events.find(
                                                    (event) =>
                                                        event._id === performer.eventId
                                                )?.title ||
                                                "Unknown event"
                                            }
                                        </p>
                                    </div>

                                    {/* Edit and delete actions */}
                                    <div className="flex gap-3 border-t border-white/10 pt-3">

                                        <button
                                            type="button"
                                            onClick={() => handleEdit(performer)}
                                            disabled={deletingPerformerId === performer._id}
                                            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(performer)}
                                            disabled={deletingPerformerId === performer._id}
                                            className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deletingPerformerId === performer._id
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
    );
}

export default AdminPerformersPage;
