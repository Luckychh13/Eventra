import { useEffect, useRef, useState } from "react";
import {
    getImages,
    createImage,
    updateImage,
    deleteImage,
} from "../../services/api/imageService.js";

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        fallback
    );
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
                        getErrorMessage(
                            err,
                            "Failed to load images."
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
        const tags = Array.isArray(image.tags)
            ? image.tags
            : [];

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

                setSuccessMessage(
                    "Image updated successfully."
                );
            } else {
                await createImage(payload);

                setSuccessMessage(
                    "Image uploaded successfully."
                );
            }

            resetForm();
            await refreshImages();
        } catch (err) {
            setError(
                getErrorMessage(err, "Failed to save image.")
            );
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

            setSuccessMessage(
                "Image deleted successfully."
            );

            await refreshImages();
        } catch (err) {
            setError(
                getErrorMessage(err, "Failed to delete image.")
            );
        } finally {
            setDeletingImageId(null);
        }
    };

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Manage Images
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                    Upload, organize, edit, and manage event gallery images.
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

            {/* Upload / Edit form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5"
            >
                <h2 className="text-lg font-medium text-white">
                    {editingImageId
                        ? "Edit Image"
                        : "Upload New Image"}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="image-title"
                            className="mb-1 block text-sm text-gray-300"
                        >
                            Image Title *
                        </label>

                        <input
                            id="image-title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter image title"
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label
                            htmlFor="image-tags"
                            className="mb-1 block text-sm text-gray-300"
                        >
                            Tags
                        </label>

                        <input
                            id="image-tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="festival, music, stage"
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Separate tags with commas.
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label
                        htmlFor="image-description"
                        className="mb-1 block text-sm text-gray-300"
                    >
                        Description
                    </label>

                    <textarea
                        id="image-description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter image description"
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                </div>

                {/* Image file */}
                <div>
                    <label
                        htmlFor="image-file"
                        className="mb-1 block text-sm text-gray-300"
                    >
                        Image File {editingImageId ? "(optional replacement)" : "*"}
                    </label>

                    <input
                        ref={imageInputRef}
                        id="image-file"
                        type="file"
                        accept="image/*"
                        required={!editingImageId}
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

                    {editingImageId && (
                        <p className="mt-1 text-xs text-gray-400">
                            Leave the file field empty to keep the existing image.
                        </p>
                    )}
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
                            : editingImageId
                                ? "Update Image"
                                : "Upload Image"}
                    </button>

                    {editingImageId && (
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

            {/* Image listing */}
            <section className="space-y-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-medium text-white">
                        All Images ({images.length})
                    </h2>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search title or tags..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 sm:max-w-xs"
                    />
                </div>

                {/* Loading, empty and error states */}
                {loading ? (
                    <p className="py-8 text-center text-gray-400">
                        Loading images...
                    </p>
                ) : error && images.length === 0 ? (
                    <p className="py-8 text-center text-gray-400">
                        Unable to load images.
                    </p>
                ) : filteredImages.length === 0 ? (
                    <p className="rounded-xl border border-white/10 p-8 text-center text-gray-400">
                        {images.length === 0
                            ? "No images have been uploaded yet."
                            : "No images match your search."}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {filteredImages.map((image) => (
                            <article
                                key={image._id}
                                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                            >

                                {/* Image preview */}
                                <img
                                    src={image.imageUrl}
                                    alt={image.title}
                                    loading="lazy"
                                    className="h-52 w-full object-cover"
                                />

                                <div className="space-y-3 p-4">

                                    {/* Image information */}
                                    <div>
                                        <h3 className="font-medium text-white">
                                            {image.title}
                                        </h3>

                                        {image.description && (
                                            <p className="mt-1 text-sm text-gray-400">
                                                {image.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {image.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {image.tags.map((tag, index) => (
                                                <span
                                                    key={`${tag}-${index}`}
                                                    className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-300"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 border-t border-white/10 pt-3">

                                        <button
                                            type="button"
                                            onClick={() => handleEdit(image)}
                                            disabled={deletingImageId === image._id}
                                            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(image)}
                                            disabled={deletingImageId === image._id}
                                            className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
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
    );
}

export default AdminImagesPage;
