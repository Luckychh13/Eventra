import { useEffect, useState } from 'react'
import {
    getStalls,
    createStall,
    updateStall,
    deleteStall,
} from '../../services/api/stallService.js'

const initialForm = {
    name: '',
    email: '',
    ownerName: '',
    category: '',
    location: '',
    description: '',
}

function AdminStallsPage() {
    const [stalls, setStalls] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')

    const [form, setForm] = useState(initialForm)
    const [editingStallId, setEditingStallId] = useState(null)
    const [image, setImage] = useState(null)

    const [actionLoading, setActionLoading] = useState(false)
    const [actionError, setActionError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        let isActive = true

        const fetchStalls = async () => {
            try {
                setLoading(true)
                setLoadError('')

                const data = await getStalls()

                if (isActive) {
                    setStalls(Array.isArray(data) ? data : [])
                }
            } catch (error) {
                if (isActive) {
                    setLoadError(
                        error.response?.data?.message ||
                        'Failed to fetch stalls.'
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        fetchStalls()

        return () => {
            isActive = false
        }
    }, [refreshKey])

    const resetForm = () => {
        setForm(initialForm)
        setEditingStallId(null)
        setImage(null)
    }

    const handleChange = (event) => {
        const { name, value } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        setActionError('')
        setSuccessMessage('')

        if (!form.name.trim()) {
            setActionError('Stall name is required.')
            return
        }

        if (!editingStallId && !form.email.trim()) {
            setActionError('Owner email is required.')
            return
        }

        const formData = new FormData()

        formData.append('name', form.name.trim())
        formData.append('category', form.category.trim())
        formData.append('location', form.location.trim())
        formData.append('description', form.description.trim())

        if (!editingStallId) {
            formData.append('email', form.email.trim())
            formData.append('ownerName', form.ownerName.trim())
        }

        if (image) {
            formData.append('image', image)
        }

        setActionLoading(true)

        try {
            const response = editingStallId
                ? await updateStall(editingStallId, formData)
                : await createStall(formData)

            if (!response?.success || !response?.stall) {
                throw new Error(
                    response?.message || 'Unable to save stall.'
                )
            }

            if (editingStallId) {
                setStalls((previous) =>
                    previous.map((stall) =>
                        stall._id === editingStallId
                            ? response.stall
                            : stall
                    )
                )
            } else {
                setStalls((previous) => [
                    response.stall,
                    ...previous,
                ])
            }

            setSuccessMessage(
                response.message || 'Stall saved successfully.'
            )

            resetForm()
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to save stall.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const handleEdit = (stall) => {
        setEditingStallId(stall._id)

        setForm({
            name: stall.name || '',
            email: stall.ownerEmail || '',
            ownerName: stall.ownerName || '',
            category: stall.category || '',
            location: stall.location || '',
            description: stall.description || '',
        })

        setImage(null)
        setActionError('')
        setSuccessMessage('')

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    const handleDelete = async (stall) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete "${stall.name}"?`
        )

        if (!confirmed) return

        setActionLoading(true)
        setActionError('')
        setSuccessMessage('')

        try {
            const response = await deleteStall(stall._id)

            if (!response?.success) {
                throw new Error(
                    response?.message || 'Failed to delete stall.'
                )
            }

            setStalls((previous) =>
                previous.filter((item) => item._id !== stall._id)
            )

            if (editingStallId === stall._id) {
                resetForm()
            }

            setSuccessMessage(
                response.message || 'Stall deleted successfully.'
            )
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to delete stall.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="space-y-8">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-bold">
                    Stall Management
                </h1>

                <p className="mt-2 text-sm text-gray-400">
                    Create, update, and manage festival stalls.
                </p>
            </div>

            {/* Error and success messages */}
            {actionError && (
                <p
                    role="alert"
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400"
                >
                    {actionError}
                </p>
            )}

            {successMessage && (
                <p
                    role="status"
                    className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-400"
                >
                    {successMessage}
                </p>
            )}

            {/* Create/Edit form */}
            <section className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <h2 className="text-xl font-semibold">
                    {editingStallId ? 'Edit Stall' : 'Create New Stall'}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="mt-5 space-y-4"
                >
                    <div>
                        <label htmlFor="stall-name" className="mb-2 block text-sm text-gray-300">
                            Stall Name
                        </label>

                        <input
                            id="stall-name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter stall name"
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                        />
                    </div>

                    {!editingStallId && (
                        <>
                            <div>
                                <label htmlFor="owner-email" className="mb-2 block text-sm text-gray-300">
                                    Stall Owner Email
                                </label>

                                <input
                                    id="owner-email"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Existing Firebase user email"
                                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    This email must already exist in Firebase Authentication.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="owner-name" className="mb-2 block text-sm text-gray-300">
                                    Owner Name (Optional)
                                </label>

                                <input
                                    id="owner-name"
                                    name="ownerName"
                                    value={form.ownerName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                                />
                            </div>
                        </>
                    )}

                    {editingStallId && (
                        <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-gray-400">
                            Assigned owner: {form.ownerName || form.email}
                            <p className="mt-1 text-xs">
                                Owner reassignment is not supported by the current backend update API.
                            </p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="stall-category" className="mb-2 block text-sm text-gray-300">
                            Category
                        </label>

                        <input
                            id="stall-category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            placeholder="Food, Merchandise, etc."
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="stall-location" className="mb-2 block text-sm text-gray-300">
                            Location
                        </label>

                        <input
                            id="stall-location"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="Enter stall location"
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="stall-description" className="mb-2 block text-sm text-gray-300">
                            Description
                        </label>

                        <textarea
                            id="stall-description"
                            name="description"
                            rows={3}
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe the stall"
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="stall-image" className="mb-2 block text-sm text-gray-300">
                            Stall Image (Optional)
                        </label>

                        <input
                            id="stall-image"
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                                setImage(event.target.files?.[0] || null)
                            }
                            className="block w-full text-sm text-gray-400"
                        />

                        {image && (
                            <p className="mt-2 text-xs text-gray-400">
                                Selected: {image.name}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                        >
                            {actionLoading
                                ? 'Saving...'
                                : editingStallId
                                    ? 'Update Stall'
                                    : 'Create Stall'}
                        </button>

                        {editingStallId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={actionLoading}
                                className="rounded-lg border border-white/20 px-6 py-3 text-sm disabled:opacity-50"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {/* Stall listing */}
            <section>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">
                        Existing Stalls ({stalls.length})
                    </h2>

                    <button
                        type="button"
                        onClick={() => setRefreshKey((key) => key + 1)}
                        disabled={loading}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
                    >
                        Refresh
                    </button>
                </div>

                {loading && (
                    <p className="py-10 text-center text-gray-400">
                        Loading stalls...
                    </p>
                )}

                {!loading && loadError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                        <p className="text-sm text-red-400">{loadError}</p>
                        <button
                            type="button"
                            onClick={() => setRefreshKey((key) => key + 1)}
                            className="mt-3 text-sm text-purple-300"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !loadError && stalls.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-gray-400">
                        No stalls have been created yet.
                    </div>
                )}

                {!loading && !loadError && stalls.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {stalls.map((stall) => (
                            <article
                                key={stall._id}
                                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                            >
                                {stall.imageUrl ? (
                                    <img
                                        src={stall.imageUrl}
                                        alt={stall.name}
                                        className="h-48 w-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-48 items-center justify-center bg-black/20 text-sm text-gray-500">
                                        No stall image
                                    </div>
                                )}

                                <div className="p-5">
                                    <div className="flex flex-wrap justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {stall.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-400">
                                                {stall.category || 'Uncategorized'}
                                            </p>
                                        </div>

                                        <span className="text-xs text-gray-500">
                                            ID: {stall._id}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-1 text-sm text-gray-400">
                                        <p>Owner: {stall.ownerName || 'Not available'}</p>
                                        <p>Email: {stall.ownerEmail || 'Not available'}</p>
                                        <p>Location: {stall.location || 'Not available'}</p>
                                        <p>
                                            Menu items: {stall.menu?.length || 0}
                                        </p>
                                    </div>

                                    <p className="mt-3 text-sm text-gray-400">
                                        {stall.description || 'No description'}
                                    </p>

                                    {stall.qrCodeDataUrl && (
                                        <div className="mt-5 flex items-center gap-4 rounded-lg border border-white/10 bg-black/20 p-3">
                                            <img
                                                src={stall.qrCodeDataUrl}
                                                alt={`${stall.name} QR code`}
                                                className="h-24 w-24 rounded bg-white p-1"
                                            />

                                            <div>
                                                <p className="text-sm font-medium">
                                                    Stall QR Code
                                                </p>

                                                <a
                                                    href={stall.qrCodeDataUrl}
                                                    download={`stall-${stall._id}-qr.png`}
                                                    className="mt-2 inline-block text-sm text-purple-300 hover:text-purple-200"
                                                >
                                                    Download QR Code
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(stall)}
                                            disabled={actionLoading}
                                            className="rounded-lg border border-purple-500/40 px-4 py-2 text-sm text-purple-300 hover:bg-purple-500/10 disabled:opacity-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(stall)}
                                            disabled={actionLoading}
                                            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
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
        </div>
    )
}

export default AdminStallsPage
