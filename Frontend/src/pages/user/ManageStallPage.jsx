
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useStallOwnerDashboard from '../../hooks/useStallOwnerDashboard.js'
import {
    addStallMenuItem,
    updateStallMenuItem,
    deleteStallMenuItem,
    resetStallTokens,
} from '../../services/api/stallService.js'

const formatPrice = (value) => {
    const amount = Number(value)

    return Number.isFinite(amount)
        ? new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(amount)
        : '₹0'
}

function ManageStallPage() {
    const { id } = useParams()

    const {
        dashboard,
        loading,
        error: dashboardError,
        refreshDashboard,
    } = useStallOwnerDashboard()

    const stall = dashboard?.stalls?.find(
        (ownedStall) => String(ownedStall._id) === String(id)
    )

    const error = dashboardError ||
        (dashboard && !stall
            ? 'This stall is not assigned to your account.'
            : '')

    const [menuData, setMenuData] = useState({
        stallId: null,
        items: null,
    })

    const [editingItemId, setEditingItemId] = useState(null)
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState(null)

    const [actionLoading, setActionLoading] = useState(false)
    const [actionError, setActionError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const menuItems =
        menuData.stallId === id && menuData.items !== null
            ? menuData.items
            : stall?.menu || []

    const tokenHistory = Array.isArray(stall?.tokens)
        ? [...stall.tokens].sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
        )
        : []

    const resetForm = () => {
        setEditingItemId(null)
        setName('')
        setPrice('')
        setDescription('')
        setImage(null)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        setActionError('')
        setSuccessMessage('')

        if (!name.trim()) {
            setActionError('Menu item name is required.')
            return
        }

        if (
            price.trim() === '' ||
            !Number.isFinite(Number(price)) ||
            Number(price) < 0
        ) {
            setActionError('Enter a valid non-negative price.')
            return
        }

        const formData = new FormData()

        formData.append('name', name.trim())
        formData.append('price', price)
        formData.append('description', description)

        if (image) {
            formData.append('image', image)
        }

        setActionLoading(true)

        try {
            const response = editingItemId
                ? await updateStallMenuItem(id, editingItemId, formData)
                : await addStallMenuItem(id, formData)

            if (!response?.success) {
                throw new Error(
                    response?.message || 'Unable to save menu item.'
                )
            }

            setMenuData({
                stallId: id,
                items: response.menu || [],
            })

            setSuccessMessage(
                response.message ||
                (editingItemId
                    ? 'Menu item updated successfully.'
                    : 'Menu item added successfully.')
            )

            resetForm()
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                error.message ||
                'Failed to save menu item.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const handleEdit = (item) => {
        setEditingItemId(item._id)
        setName(item.name || '')
        setPrice(String(item.price ?? ''))
        setDescription(item.description || '')
        setImage(null)

        setActionError('')
        setSuccessMessage('')

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    const handleDelete = async (itemId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this menu item?'
        )

        if (!confirmed) return

        setActionLoading(true)
        setActionError('')
        setSuccessMessage('')

        try {
            const response = await deleteStallMenuItem(id, itemId)

            if (!response?.success) {
                throw new Error(
                    response?.message || 'Unable to delete menu item.'
                )
            }

            setMenuData({
                stallId: id,
                items: response.menu || [],
            })

            if (editingItemId === itemId) {
                resetForm()
            }

            setSuccessMessage(
                response.message || 'Menu item deleted successfully.'
            )
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                error.message ||
                'Failed to delete menu item.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const handleResetTokens = async () => {
        const confirmed = window.confirm(
            'This will reset the token counter to zero and permanently delete all token history for this stall. This action cannot be undone. Continue?'
        )

        if (!confirmed) return

        setActionLoading(true)
        setActionError('')
        setSuccessMessage('')

        try {
            const response = await resetStallTokens(id)

            if (!response?.success) {
                throw new Error(
                    response?.message || 'Unable to reset stall tokens.'
                )
            }

            setSuccessMessage(
                response.message || 'Stall tokens reset successfully.'
            )

            refreshDashboard()
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                error.message ||
                'Failed to reset stall tokens.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <main className="px-4 py-20 text-center text-gray-400">
                Loading stall details...
            </main>
        )
    }

    if (error || !stall) {
        return (
            <main className="px-4 py-20 text-center text-white">
                <h1 className="text-2xl font-bold">
                    Unable to load stall
                </h1>

                <p className="mt-3 text-red-400">
                    {error || 'Stall not found.'}
                </p>

                <Link
                    to="/stall-dashboard"
                    className="mt-5 inline-block text-purple-300"
                >
                    Back to Dashboard
                </Link>
            </main>
        )
    }

    return (
        <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 text-white sm:px-6 lg:px-8">

            <Link
                to="/stall-dashboard"
                className="text-sm text-gray-400 hover:text-white"
            >
                ← Back to Dashboard
            </Link>

            <div className="mt-6">
                <h1 className="text-3xl font-bold">
                    Manage Menu
                </h1>

                <p className="mt-2 text-gray-400">
                    {stall.name}
                </p>
            </div>

            {actionError && (
                <p
                    role="alert"
                    className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400"
                >
                    {actionError}
                </p>
            )}

            {successMessage && (
                <p
                    role="status"
                    className="mt-6 rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-400"
                >
                    {successMessage}
                </p>
            )}

            {/* Add/Edit form */}
            <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <h2 className="text-xl font-semibold">
                    {editingItemId ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="mt-5 space-y-4"
                >
                    <div>
                        <label htmlFor="item-name" className="mb-2 block text-sm text-gray-300">
                            Item Name
                        </label>

                        <input
                            id="item-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                            placeholder="Enter item name"
                        />
                    </div>

                    <div>
                        <label htmlFor="item-price" className="mb-2 block text-sm text-gray-300">
                            Price (₹)
                        </label>

                        <input
                            id="item-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            required
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                            placeholder="Enter price"
                        />
                    </div>

                    <div>
                        <label htmlFor="item-description" className="mb-2 block text-sm text-gray-300">
                            Description
                        </label>

                        <textarea
                            id="item-description"
                            rows={3}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-purple-500"
                            placeholder="Describe this item"
                        />
                    </div>

                    <div>
                        <label htmlFor="item-image" className="mb-2 block text-sm text-gray-300">
                            Item Image (Optional)
                        </label>

                        <input
                            id="item-image"
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                                setImage(event.target.files?.[0] || null)
                            }
                            className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white"
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
                                : editingItemId
                                    ? 'Update Item'
                                    : 'Add Item'}
                        </button>

                        {editingItemId && (
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

            {/* Existing menu items */}
            <section className="mt-12">
                <h2 className="text-2xl font-bold">
                    Current Menu ({menuItems.length})
                </h2>

                {menuItems.length === 0 ? (
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
                        No menu items have been added yet.
                    </div>
                ) : (
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {menuItems.map((item) => (
                            <article
                                key={item._id}
                                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                            >
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="h-44 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-44 items-center justify-center bg-white/5 text-sm text-gray-500">
                                        No image available
                                    </div>
                                )}

                                <div className="p-5">
                                    <h3 className="text-lg font-semibold">
                                        {item.name}
                                    </h3>

                                    <p className="mt-2 font-medium text-purple-300">
                                        {formatPrice(item.price)}
                                    </p>

                                    <p className="mt-2 text-sm text-gray-400">
                                        {item.description || 'No description'}
                                    </p>

                                    <div className="mt-5 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(item)}
                                            disabled={actionLoading}
                                            className="rounded-lg border border-purple-500/40 px-4 py-2 text-sm text-purple-300 hover:bg-purple-500/10 disabled:opacity-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item._id)}
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

            {/* Queue Token History */}
            <section className="mt-12">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Queue Token History
                        </h2>

                        <p className="mt-2 text-sm text-gray-400">
                            Visitors who generated queue tokens at this stall.
                        </p>
                    </div>

                    <span className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-300">
                        {tokenHistory.length} Tokens
                    </span>
                </div>

                {tokenHistory.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                        <p className="text-gray-400">
                            No queue tokens have been generated yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tokenHistory.map((token, index) => (
                            <article
                                key={token._id || `${token.tokenNumber}-${index}`}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                            >
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Token Number
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-purple-300">
                                        #{token.tokenNumber}
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <p className="font-medium">
                                        {token.visitorName || 'Visitor'}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {token.timestamp
                                            ? new Date(token.timestamp).toLocaleString('en-IN', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })
                                            : 'Time unavailable'}
                                    </p>
                                </div>

                                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                                    Generated
                                </span>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Token management */}
            <section className="mt-12 rounded-xl border border-red-500/20 bg-red-500/5 p-5 sm:p-6">
                <h2 className="text-xl font-semibold">
                    Token Management
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    Resetting tokens sets the current token counter to zero
                    and permanently deletes the existing token history.
                </p>

                <button
                    type="button"
                    onClick={handleResetTokens}
                    disabled={actionLoading}
                    className="mt-5 rounded-lg border border-red-500/40 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                    Reset Stall Tokens
                </button>
            </section>
        </main>
    )
}

export default ManageStallPage
