import { useEffect, useRef, useState } from "react";
import {
    getStalls,
    createStall,
    updateStall,
    deleteStall,
} from "../../services/api/stallService.js";
import "./AdminStallsPage.css";

const initialForm = {
    name: "",
    email: "",
    ownerName: "",
    category: "",
    location: "",
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

function AdminStallsPage() {
    const [stalls, setStalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [form, setForm] = useState({ ...initialForm });
    const [editingStallId, setEditingStallId] = useState(null);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [refreshKey, setRefreshKey] = useState(0);

    const imageInputRef = useRef(null);

    useEffect(() => {
        let isActive = true;

        const fetchStalls = async () => {
            try {
                setLoading(true);
                setLoadError("");

                const data = await getStalls();

                if (isActive) {
                    setStalls(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (isActive) {
                    setLoadError(
                        getErrorMessage(err, "Failed to fetch stalls.")
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchStalls();

        return () => {
            isActive = false;
        };
    }, [refreshKey]);

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

    const resetForm = () => {
        setForm({ ...initialForm });
        setEditingStallId(null);
        setImage(null);
        setImagePreview("");
        clearImageInput();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleEdit = (stall) => {
        setEditingStallId(stall._id);

        setForm({
            name: stall.name || "",
            email: stall.ownerEmail || "",
            ownerName: stall.ownerName || "",
            category: stall.category || "",
            location: stall.location || "",
            description: stall.description || "",
        });

        setImage(null);
        setImagePreview(stall.imageUrl || "");
        clearImageInput();

        setActionError("");
        setSuccessMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setActionError("");
        setSuccessMessage("");

        if (!form.name.trim()) {
            setActionError("Stall name is required.");
            return;
        }

        if (!editingStallId && !form.email.trim()) {
            setActionError("Owner email is required.");
            return;
        }

        const formData = new FormData();

        formData.append("name", form.name.trim());
        formData.append("category", form.category.trim());
        formData.append("location", form.location.trim());
        formData.append("description", form.description.trim());

        if (!editingStallId) {
            formData.append("email", form.email.trim());
            formData.append("ownerName", form.ownerName.trim());
        }

        if (image) {
            formData.append("image", image);
        }

        setActionLoading(true);

        try {
            const response = editingStallId
                ? await updateStall(editingStallId, formData)
                : await createStall(formData);

            if (!response?.success || !response?.stall) {
                throw new Error(
                    response?.message || "Unable to save stall."
                );
            }

            if (editingStallId) {
                setStalls((previous) =>
                    previous.map((stall) =>
                        stall._id === editingStallId
                            ? response.stall
                            : stall
                    )
                );
            } else {
                setStalls((previous) => [
                    response.stall,
                    ...previous,
                ]);
            }

            setSuccessMessage(
                response.message || "Stall saved successfully."
            );

            resetForm();
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Failed to save stall.")
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (stall) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete "${stall.name}"?`
        );

        if (!confirmed) return;

        setActionLoading(true);
        setActionError("");
        setSuccessMessage("");

        try {
            const response = await deleteStall(stall._id);

            if (!response?.success) {
                throw new Error(
                    response?.message || "Failed to delete stall."
                );
            }

            setStalls((previous) =>
                previous.filter((item) => item._id !== stall._id)
            );

            if (editingStallId === stall._id) {
                resetForm();
            }

            setSuccessMessage(
                response.message || "Stall deleted successfully."
            );
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Failed to delete stall.")
            );
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <main className="admin-stalls-page">
            <header className="admin-stalls-header">
                <div>
                    <span className="admin-stalls-eyebrow">
                        FESTIVAL MANAGEMENT
                    </span>

                    <h1>Stalls</h1>

                    <p>
                        Manage festival stalls, owner assignments, and stall
                        QR codes.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-stalls-refresh-button"
                    onClick={() => setRefreshKey((key) => key + 1)}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh stalls"}
                </button>
            </header>

            {(actionError || successMessage) && (
                <div
                    className={`admin-stalls-alert ${actionError ? "is-error" : "is-success"
                        }`}
                    role={actionError ? "alert" : "status"}
                >
                    <span>{actionError || successMessage}</span>

                    <button
                        type="button"
                        onClick={() => {
                            setActionError("");
                            setSuccessMessage("");
                        }}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            <section className="admin-stalls-summary">
                <div>
                    <span>Total stalls</span>
                    <strong>{stalls.length}</strong>
                    <p>Registered festival stalls</p>
                </div>

                <span className="admin-stalls-summary-icon">
                    <span />
                </span>
            </section>

            <section className="admin-stall-form-card">
                <div className="admin-stall-form-heading">
                    <div>
                        <span className="admin-stalls-eyebrow">
                            {editingStallId ? "UPDATE STALL" : "NEW STALL"}
                        </span>

                        <h2>
                            {editingStallId
                                ? "Edit stall details"
                                : "Create a stall"}
                        </h2>

                        <p>
                            {editingStallId
                                ? "Update the stall's information and appearance."
                                : "Register a stall and assign its owner."}
                        </p>
                    </div>

                    {editingStallId && (
                        <span className="admin-stall-edit-badge">
                            Editing
                        </span>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="admin-stall-form-grid">
                        <div className="admin-stall-field">
                            <label htmlFor="stall-name">
                                Stall name <span>*</span>
                            </label>

                            <input
                                id="stall-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter stall name"
                            />
                        </div>

                        {!editingStallId && (
                            <div className="admin-stall-field">
                                <label htmlFor="owner-email">
                                    Stall owner email <span>*</span>
                                </label>

                                <input
                                    id="owner-email"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Existing Firebase user email"
                                />

                                <small>
                                    This email must already exist in Firebase
                                    Authentication.
                                </small>
                            </div>
                        )}

                        {!editingStallId && (
                            <div className="admin-stall-field">
                                <label htmlFor="owner-name">
                                    Owner name
                                </label>

                                <input
                                    id="owner-name"
                                    name="ownerName"
                                    value={form.ownerName}
                                    onChange={handleChange}
                                    placeholder="Enter owner name (optional)"
                                />
                            </div>
                        )}

                        {editingStallId && (
                            <div className="admin-stall-owner-info">
                                <span>Assigned stall owner</span>
                                <strong>
                                    {form.ownerName || "Name unavailable"}
                                </strong>
                                <p>{form.email || "Email unavailable"}</p>
                                <small>
                                    Owner reassignment is not supported by the
                                    current backend update endpoint.
                                </small>
                            </div>
                        )}

                        <div className="admin-stall-field">
                            <label htmlFor="stall-category">
                                Category
                            </label>

                            <input
                                id="stall-category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                placeholder="Food, merchandise, etc."
                            />
                        </div>

                        <div className="admin-stall-field">
                            <label htmlFor="stall-location">
                                Location
                            </label>

                            <input
                                id="stall-location"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Enter stall location"
                            />
                        </div>

                        <div className="admin-stall-field full-width">
                            <label htmlFor="stall-description">
                                Description
                            </label>

                            <textarea
                                id="stall-description"
                                name="description"
                                rows={4}
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the stall..."
                            />
                        </div>

                        <div className="admin-stall-field full-width">
                            <label htmlFor="stall-image">
                                Stall image
                            </label>

                            <div className="admin-stall-upload-area">
                                <input
                                    ref={imageInputRef}
                                    id="stall-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />

                                <p>
                                    {image
                                        ? image.name
                                        : editingStallId
                                            ? "Choose a replacement image (optional)"
                                            : "Choose an image (optional)"}
                                </p>
                            </div>

                            {editingStallId && (
                                <small>
                                    Leave this empty to keep the existing
                                    image.
                                </small>
                            )}

                            {imagePreview && (
                                <div className="admin-stall-image-preview">
                                    <span>
                                        {image
                                            ? "Selected image preview"
                                            : "Current stall image"}
                                    </span>

                                    <img
                                        src={imagePreview}
                                        alt={form.name || "Stall preview"}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="admin-stall-form-actions">
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="admin-stall-primary-button"
                        >
                            {actionLoading
                                ? "Saving..."
                                : editingStallId
                                    ? "Save changes"
                                    : "Create stall"}
                        </button>

                        {editingStallId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={actionLoading}
                                className="admin-stall-secondary-button"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="admin-stall-list-section">
                <div className="admin-stall-list-heading">
                    <div>
                        <span className="admin-stalls-eyebrow">
                            STALL DIRECTORY
                        </span>

                        <h2>Existing stalls</h2>

                        <p>
                            {stalls.length}{" "}
                            {stalls.length === 1 ? "stall" : "stalls"} registered
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-stalls-state">
                        Loading stalls...
                    </div>
                ) : loadError ? (
                    <div className="admin-stalls-state">
                        <p>{loadError}</p>

                        <button
                            type="button"
                            className="admin-stalls-refresh-button"
                            onClick={() => setRefreshKey((key) => key + 1)}
                        >
                            Try again
                        </button>
                    </div>
                ) : stalls.length === 0 ? (
                    <div className="admin-stalls-state">
                        <strong>No stalls have been created yet.</strong>
                        <p>Newly registered stalls will appear here.</p>
                    </div>
                ) : (
                    <div className="admin-stall-grid">
                        {stalls.map((stall) => (
                            <article
                                key={stall._id}
                                className="admin-stall-card"
                            >
                                <div className="admin-stall-card-image">
                                    {stall.imageUrl ? (
                                        <img
                                            src={stall.imageUrl}
                                            alt={stall.name}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="admin-stall-no-image">
                                            <span>
                                                {stall.name?.charAt(0) || "S"}
                                            </span>
                                            <small>No stall image</small>
                                        </div>
                                    )}
                                </div>

                                <div className="admin-stall-card-content">
                                    <div className="admin-stall-card-heading">
                                        <div>
                                            <h3>{stall.name}</h3>
                                            <span>
                                                {stall.category ||
                                                    "Uncategorized"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="admin-stall-details">
                                        <div>
                                            <span>Owner</span>
                                            <strong>
                                                {stall.ownerName ||
                                                    "Not available"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Owner email</span>
                                            <strong>
                                                {stall.ownerEmail ||
                                                    "Not available"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Location</span>
                                            <strong>
                                                {stall.location ||
                                                    "Not available"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Menu items</span>
                                            <strong>
                                                {stall.menu?.length || 0}
                                            </strong>
                                        </div>
                                    </div>

                                    {stall.description && (
                                        <p className="admin-stall-description">
                                            {stall.description}
                                        </p>
                                    )}

                                    {stall.qrCodeDataUrl && (
                                        <div className="admin-stall-qr-section">
                                            <img
                                                src={stall.qrCodeDataUrl}
                                                alt={`${stall.name} QR code`}
                                            />

                                            <div>
                                                <strong>Stall QR code</strong>

                                                <p>
                                                    Scan to open this stall's
                                                    page.
                                                </p>

                                                <a
                                                    href={stall.qrCodeDataUrl}
                                                    download={`stall-${stall._id}-qr.png`}
                                                >
                                                    Download QR code
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className="admin-stall-card-actions">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(stall)}
                                            disabled={actionLoading}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-stall-delete-button"
                                            onClick={() => handleDelete(stall)}
                                            disabled={actionLoading}
                                        >
                                            Delete
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

export default AdminStallsPage;