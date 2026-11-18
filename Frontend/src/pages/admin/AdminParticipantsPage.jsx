import { useCallback, useEffect, useRef, useState } from "react";
import {
    createParticipant,
    getParticipants,
    updateParticipant,
    deleteParticipant,
} from "../../services/api/participantService.js";
import "./AdminParticipantsPage.css";

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        fallback
    );
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

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
    const photoInputRef = useRef(null);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const editingParticipant = participants.find(
        (participant) => participant._id === editingId
    );

    const loadParticipants = useCallback(async () => {
        try {
            const data = await getParticipants();
            setParticipants(data.participants || []);
        } catch (err) {
            setError(
                getErrorMessage(err, "Failed to load participants.")
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
                        getErrorMessage(err, "Failed to load participants.")
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

        if (photoInputRef.current) {
            photoInputRef.current.value = "";
        }
    };

    const handleEdit = (participant) => {
        setEditingId(participant._id);

        setFormData({
            name: participant.name || "",
            tagNumber: participant.tagNumber || "",
            details: participant.details || "",
        });

        setPhoto(null);

        if (photoInputRef.current) {
            photoInputRef.current.value = "";
        }

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
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
                getErrorMessage(err, "Failed to save participant.")
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
                getErrorMessage(err, "Failed to delete participant.")
            );
        } finally {
            setDeletingId(null);
        }
    };

    const searchValue = search.trim().toLowerCase();

    const filteredParticipants = participants.filter((participant) => (
        participant.name?.toLowerCase().includes(searchValue) ||
        participant.tagNumber?.toLowerCase().includes(searchValue)
    ));

    const totalVotes = participants.reduce(
        (total, participant) => total + (participant.votes || 0),
        0
    );

    return (
        <main className="admin-participants-page">
            <header className="admin-participants-header">
                <div>
                    <span className="admin-participants-eyebrow">
                        EVENT MANAGEMENT
                    </span>

                    <h1>Participants</h1>

                    <p>
                        Manage participant profiles, photos, and registration
                        details.
                    </p>
                </div>

                <div className="admin-participants-stats">
                    <div className="admin-participant-stat">
                        <span>Total participants</span>
                        <strong>{participants.length}</strong>
                    </div>

                    <div className="admin-participant-stat">
                        <span>Total votes</span>
                        <strong>{totalVotes.toLocaleString("en-IN")}</strong>
                    </div>
                </div>
            </header>

            {(error || success) && (
                <div
                    className={`admin-participants-alert ${error ? "is-error" : "is-success"
                        }`}
                    role={error ? "alert" : "status"}
                >
                    <span>{error || success}</span>

                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                        }}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="admin-participants-layout">
                <section className="admin-participant-form-card">
                    <div className="admin-participant-section-heading">
                        <div>
                            <span className="admin-participants-eyebrow">
                                {editingId ? "UPDATE PROFILE" : "NEW REGISTRATION"}
                            </span>

                            <h2>
                                {editingId
                                    ? "Edit participant"
                                    : "Add participant"}
                            </h2>
                        </div>

                        {editingId && (
                            <span className="admin-participant-edit-badge">
                                Editing
                            </span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="admin-participant-form-fields">
                            <div className="admin-participant-field">
                                <label htmlFor="participant-name">
                                    Participant name <span>*</span>
                                </label>

                                <input
                                    id="participant-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter participant name"
                                />
                            </div>

                            <div className="admin-participant-field">
                                <label htmlFor="participant-tag">
                                    Tag number <span>*</span>
                                </label>

                                <input
                                    id="participant-tag"
                                    name="tagNumber"
                                    value={formData.tagNumber}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. EVT-001"
                                />

                                <small>
                                    Each participant must have a unique tag
                                    number.
                                </small>
                            </div>

                            <div className="admin-participant-field">
                                <label htmlFor="participant-details">
                                    Details
                                </label>

                                <textarea
                                    id="participant-details"
                                    name="details"
                                    value={formData.details}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Add participant details..."
                                />
                            </div>

                            <div className="admin-participant-field">
                                <label htmlFor="participant-photo">
                                    Participant photo
                                </label>

                                <div className="admin-participant-upload">
                                    <input
                                        ref={photoInputRef}
                                        id="participant-photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) =>
                                            setPhoto(
                                                event.target.files?.[0] || null
                                            )
                                        }
                                    />

                                    <p>
                                        {photo
                                            ? photo.name
                                            : editingId
                                                ? "Choose a replacement photo (optional)"
                                                : "Choose a photo (optional)"}
                                    </p>
                                </div>

                                {editingId && (
                                    <small>
                                        Leave the file field empty to keep the
                                        existing photo.
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="admin-participant-form-actions">
                            <button
                                type="submit"
                                className="admin-participant-primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Save changes"
                                        : "Add participant"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="admin-participant-secondary-button"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {editingParticipant?.photoUrl && (
                        <div className="admin-participant-current-photo">
                            <span>Current photo</span>

                            <img
                                src={editingParticipant.photoUrl}
                                alt={editingParticipant.name}
                            />
                        </div>
                    )}
                </section>

                <section className="admin-participant-list-section">
                    <div className="admin-participant-list-heading">
                        <div>
                            <span className="admin-participants-eyebrow">
                                PARTICIPANT DIRECTORY
                            </span>

                            <h2>All participants</h2>

                            <p>
                                Showing {filteredParticipants.length} of{" "}
                                {participants.length} participants
                            </p>
                        </div>

                        <div className="admin-participant-search">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search name or tag..."
                                aria-label="Search participants"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-participants-state">
                            Loading participants...
                        </div>
                    ) : error && participants.length === 0 ? (
                        <div className="admin-participants-state">
                            Unable to load participants.
                        </div>
                    ) : filteredParticipants.length === 0 ? (
                        <div className="admin-participants-state">
                            {participants.length === 0
                                ? "No participants have been added yet."
                                : "No participants match your search."}
                        </div>
                    ) : (
                        <div className="admin-participant-grid">
                            {filteredParticipants.map((participant) => (
                                <article
                                    key={participant._id}
                                    className="admin-participant-card"
                                >
                                    <div className="admin-participant-photo">
                                        {participant.photoUrl ? (
                                            <img
                                                src={participant.photoUrl}
                                                alt={participant.name}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="admin-participant-no-photo">
                                                <span>
                                                    {participant.name
                                                        ?.charAt(0)
                                                        .toUpperCase() || "?"}
                                                </span>

                                                <small>No photo available</small>
                                            </div>
                                        )}
                                    </div>

                                    <div className="admin-participant-card-content">
                                        <div className="admin-participant-card-title">
                                            <div>
                                                <h3>{participant.name}</h3>

                                                <span className="admin-participant-tag">
                                                    {participant.tagNumber}
                                                </span>
                                            </div>

                                            <div className="admin-participant-votes">
                                                <strong>
                                                    {(participant.votes || 0)
                                                        .toLocaleString("en-IN")}
                                                </strong>
                                                <span>Votes</span>
                                            </div>
                                        </div>

                                        {participant.details && (
                                            <p className="admin-participant-details">
                                                {participant.details}
                                            </p>
                                        )}

                                        <div className="admin-participant-card-meta">
                                            <span>
                                                Added {formatDate(participant.createdAt)}
                                            </span>
                                        </div>

                                        <div className="admin-participant-card-actions">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(participant)
                                                }
                                                disabled={
                                                    deletingId === participant._id
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-participant-delete-button"
                                                onClick={() =>
                                                    handleDelete(participant)
                                                }
                                                disabled={
                                                    deletingId === participant._id
                                                }
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
        </main>
    );
}

export default AdminParticipantsPage;