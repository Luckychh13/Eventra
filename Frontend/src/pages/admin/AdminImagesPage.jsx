import { useEffect, useRef, useState } from "react";
import {
    getImages,
    createImage,
    updateImage,
    deleteImage,
} from "../../services/api/imageService.js";
import "./AdminImagesPage.css";

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        fallback
    );
}

function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function AdminImagesPage() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [search, setSearch] = useState("");

    const [editingImageId, setEditingImageId] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const imageInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: "",
    });

    const editingImage = images.find(
        (image) => image._id === editingImageId
    );

    useEffect(() => {
        let isActive = true;

        getImages()
            .then((imagesData) => {
                if (isActive) {
                    setImages(imagesData);
                }
            })
            .catch((err) => {
                if (isActive) {
                    setError(
                        getErrorMessage(err, "Failed to load images.")
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

    const refreshImages = async () => {
        try {
            const data = await getImages();
            setImages(data);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Operation completed, but failed to refresh images."
                )
            );
        }
    };

    const searchTerm = search.trim().toLowerCase();

    const filteredImages = images.filter((image) => {
        const tags = Array.isArray(image.tags) ? image.tags : [];

        return (
            image.title?.toLowerCase().includes(searchTerm) ||
            image.description?.toLowerCase().includes(searchTerm) ||
            tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm)
            )
        );
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setEditingImageId(null);
        setImageFile(null);

        setFormData({
            title: "",
            description: "",
            tags: "",
        });

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const handleEdit = (image) => {
        setEditingImageId(image._id);

        setFormData({
            title: image.title || "",
            description: image.description || "",
            tags: Array.isArray(image.tags)
                ? image.tags.join(", ")
                : "",
        });

        setImageFile(null);

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }

        setError("");
        setSuccessMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim()) {
            setError("Image title is required.");
            return;
        }

        if (!editingImageId && !imageFile) {
            setError("Please select an image to upload.");
            return;
        }

        const payload = new FormData();

        payload.append("title", formData.title.trim());
        payload.append("description", formData.description.trim());
        payload.append("tags", formData.tags);

        if (imageFile) {
            payload.append("image", imageFile);
        }

        try {
            setSaving(true);
            setError("");
            setSuccessMessage("");

            if (editingImageId) {
                await updateImage(editingImageId, payload);
                setSuccessMessage("Image updated successfully.");
            } else {
                await createImage(payload);
                setSuccessMessage("Image uploaded successfully.");
            }

            resetForm();
            await refreshImages();
        } catch (err) {
            setError(getErrorMessage(err, "Failed to save image."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (image) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${image.title}"?`
        );

        if (!confirmed) return;

        try {
            setDeletingImageId(image._id);
            setError("");
            setSuccessMessage("");

            await deleteImage(image._id);

            if (editingImageId === image._id) {
                resetForm();
            }

            setSuccessMessage("Image deleted successfully.");
            await refreshImages();
        } catch (err) {
            setError(getErrorMessage(err, "Failed to delete image."));
        } finally {
            setDeletingImageId(null);
        }
    };

    return (
        <main className="admin-images-page">
            <header className="admin-images-header">
                <div>
                    <span className="admin-images-eyebrow">
                        CONTENT MANAGEMENT
                    </span>

                    <h1>Image Gallery</h1>

                    <p>
                        Upload and manage the images displayed across your
                        event platform.
                    </p>
                </div>

                <div className="admin-images-total">
                    <span>Total images</span>
                    <strong>{images.length}</strong>
                </div>
            </header>

            {(error || successMessage) && (
                <div
                    className={`admin-images-alert ${error ? "is-error" : "is-success"
                        }`}
                    role="status"
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

            <div className="admin-images-layout">
                <section className="admin-image-form-card">
                    <div className="admin-image-section-heading">
                        <div>
                            <span className="admin-images-eyebrow">
                                {editingImageId ? "EDIT DETAILS" : "NEW UPLOAD"}
                            </span>

                            <h2>
                                {editingImageId
                                    ? "Update image"
                                    : "Add an image"}
                            </h2>
                        </div>

                        {editingImageId && (
                            <span className="admin-image-edit-badge">
                                Editing
                            </span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="admin-image-form-fields">
                            <div className="admin-image-field">
                                <label htmlFor="image-title">
                                    Image title <span>*</span>
                                </label>

                                <input
                                    id="image-title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Main stage performance"
                                    required
                                />
                            </div>

                            <div className="admin-image-field">
                                <label htmlFor="image-tags">
                                    Tags
                                </label>

                                <input
                                    id="image-tags"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="music, festival, stage"
                                />

                                <small>
                                    Separate multiple tags with commas.
                                </small>
                            </div>

                            <div className="admin-image-field">
                                <label htmlFor="image-description">
                                    Description
                                </label>

                                <textarea
                                    id="image-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Add a short description..."
                                />
                            </div>

                            <div className="admin-image-field">
                                <label htmlFor="image-file">
                                    Image file{" "}
                                    {!editingImageId && <span>*</span>}
                                </label>

                                <div className="admin-image-upload-area">
                                    <input
                                        ref={imageInputRef}
                                        id="image-file"
                                        type="file"
                                        accept="image/*"
                                        required={!editingImageId}
                                        onChange={(event) =>
                                            setImageFile(
                                                event.target.files?.[0] || null
                                            )
                                        }
                                    />

                                    <p>
                                        {imageFile
                                            ? imageFile.name
                                            : editingImageId
                                                ? "Choose a replacement image (optional)"
                                                : "Choose an image from your device"}
                                    </p>
                                </div>

                                {editingImageId && (
                                    <small>
                                        Leave this empty to keep the current
                                        image.
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="admin-image-form-actions">
                            <button
                                type="submit"
                                className="admin-image-primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingImageId
                                        ? "Save changes"
                                        : "Upload image"}
                            </button>

                            {editingImageId && (
                                <button
                                    type="button"
                                    className="admin-image-secondary-button"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {editingImage?.imageUrl && (
                        <div className="admin-image-current-preview">
                            <span>Current image</span>

                            <img
                                src={editingImage.imageUrl}
                                alt={editingImage.title}
                            />
                        </div>
                    )}
                </section>

                <section className="admin-image-gallery-section">
                    <div className="admin-image-gallery-heading">
                        <div>
                            <span className="admin-images-eyebrow">
                                YOUR LIBRARY
                            </span>

                            <h2>Uploaded images</h2>

                            <p>
                                Showing {filteredImages.length} of{" "}
                                {images.length} images
                            </p>
                        </div>

                        <div className="admin-image-search">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search images..."
                                aria-label="Search images"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-images-state">
                            Loading images...
                        </div>
                    ) : error && images.length === 0 ? (
                        <div className="admin-images-state">
                            Unable to load images.
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="admin-images-state">
                            {images.length === 0
                                ? "No images have been uploaded yet."
                                : "No images match your search."}
                        </div>
                    ) : (
                        <div className="admin-image-grid">
                            {filteredImages.map((image) => (
                                <article
                                    key={image._id}
                                    className="admin-image-card"
                                >
                                    <div className="admin-image-preview">
                                        <img
                                            src={image.imageUrl}
                                            alt={image.title}
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="admin-image-card-content">
                                        <div className="admin-image-card-title">
                                            <h3>{image.title}</h3>

                                            <span>
                                                {formatDate(image.createdAt)}
                                            </span>
                                        </div>

                                        {image.description && (
                                            <p className="admin-image-description">
                                                {image.description}
                                            </p>
                                        )}

                                        {image.tags?.length > 0 && (
                                            <div className="admin-image-tags">
                                                {image.tags.map((tag, index) => (
                                                    <span
                                                        key={`${tag}-${index}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="admin-image-card-actions">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(image)
                                                }
                                                disabled={
                                                    deletingImageId === image._id
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-image-delete-button"
                                                onClick={() =>
                                                    handleDelete(image)
                                                }
                                                disabled={
                                                    deletingImageId === image._id
                                                }
                                            >
                                                {deletingImageId === image._id
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

export default AdminImagesPage;