import { useCallback, useEffect, useState } from "react";
import {
    createParticipant,
    getParticipants,
    updateParticipant,
    deleteParticipant,
} from "../../services/api/participantService.js";

function AdminParticipantsPage() {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        tagNumber: "",
        details: "",
    });
    const [photo, setPhoto] = useState(null);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadParticipants = useCallback(async () => {
        try {
            const data = await getParticipants();
            setParticipants(data.participants || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load participants."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isActive = true;

        getParticipants()
            .then((data) => {
                if (isActive) {
                    setParticipants(data.participants || []);
                }
            })
            .catch((err) => {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to load participants."
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

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: "",
            tagNumber: "",
            details: "",
        });
        setPhoto(null);
    };

    const handleEdit = (participant) => {
        setEditingId(participant._id);
        setFormData({
            name: participant.name || "",
            tagNumber: participant.tagNumber || "",
            details: participant.details || "",
        });
        setPhoto(null);
        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim() || !formData.tagNumber.trim()) {
            setError("Name and tag number are required.");
            return;
        }

        const payload = new FormData();
        payload.append("name", formData.name.trim());
        payload.append("tagNumber", formData.tagNumber.trim());
        payload.append("details", formData.details.trim());

        if (photo) {
            payload.append("photo", photo);
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (editingId) {
                await updateParticipant(editingId, payload);
                setSuccess("Participant updated successfully.");
            } else {
                await createParticipant(payload);
                setSuccess("Participant created successfully.");
            }

            resetForm();
            await loadParticipants();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to save participant."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (participant) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${participant.name}?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(participant._id);
            setError("");
            setSuccess("");

            await deleteParticipant(participant._id);

            if (editingId === participant._id) {
                resetForm();
            }

            setSuccess("Participant deleted successfully.");
            await loadParticipants();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete participant."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const filteredParticipants = participants.filter((participant) => {
        const searchValue = search.toLowerCase();

        return (
            participant.name?.toLowerCase().includes(searchValue) ||
            participant.tagNumber?.toLowerCase().includes(searchValue)
        );
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Participants
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                    Create, update, and manage event participants.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5"
            >
                <h2 className="text-lg font-medium text-white">
                    {editingId ? "Edit Participant" : "Add Participant"}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="participant-name"
                            className="mb-1 block text-sm text-gray-300"
                        >
                            Name *
                        </label>
                        <input
                            id="participant-name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                            placeholder="Participant name"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="participant-tag"
                            className="mb-1 block text-sm text-gray-300"
                        >
                            Tag Number *
                        </label>
                        <input
                            id="participant-tag"
                            name="tagNumber"
                            value={formData.tagNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                            placeholder="e.g. EVT-001"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="participant-details"
                        className="mb-1 block text-sm text-gray-300"
                    >
                        Details
                    </label>
                    <textarea
                        id="participant-details"
                        name="details"
                        value={formData.details}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                        placeholder="Participant details"
                    />
                </div>

                <div>
                    <label
                        htmlFor="participant-photo"
                        className="mb-1 block text-sm text-gray-300"
                    >
                        Photo {editingId ? "(optional replacement)" : "(optional)"}
                    </label>
                    <input
                        id="participant-photo"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            setPhoto(event.target.files?.[0] || null)
                        }
                        className="block w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
                    />
                    {photo && (
                        <p className="mt-1 text-xs text-gray-400">
                            Selected: {photo.name}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                                ? "Update Participant"
                                : "Add Participant"}
                    </button>

                    {editingId && (
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

            <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-medium text-white">
                        All Participants ({participants.length})
                    </h2>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search name or tag number..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 sm:max-w-xs"
                    />
                </div>

                {loading ? (
                    <p className="py-8 text-center text-gray-400">
                        Loading participants...
                    </p>
                ) : filteredParticipants.length === 0 ? (
                    <p className="rounded-xl border border-white/10 p-8 text-center text-gray-400">
                        No participants found.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredParticipants.map((participant) => (
                            <article
                                key={participant._id}
                                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                            >
                                {participant.photoUrl ? (
                                    <img
                                        src={participant.photoUrl}
                                        alt={participant.name}
                                        className="h-48 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-48 items-center justify-center bg-white/5 text-sm text-gray-500">
                                        No photo available
                                    </div>
                                )}

                                <div className="space-y-3 p-4">
                                    <div>
                                        <h3 className="font-medium text-white">
                                            {participant.name}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            Tag: {participant.tagNumber}
                                        </p>
                                    </div>

                                    {participant.details && (
                                        <p className="text-sm text-gray-300">
                                            {participant.details}
                                        </p>
                                    )}

                                    <p className="text-sm text-gray-400">
                                        Votes: {participant.votes ?? 0}
                                    </p>

                                    <div className="flex gap-3 border-t border-white/10 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(participant)}
                                            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(participant)}
                                            disabled={deletingId === participant._id}
                                            className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                                        >
                                            {deletingId === participant._id
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

export default AdminParticipantsPage;
