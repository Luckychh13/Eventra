
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useStallOwnerDashboard from '../../hooks/useStallOwnerDashboard.js'
import {
    addStallMenuItem,
    updateStallMenuItem,
    deleteStallMenuItem,
    resetStallTokens,
} from '../../services/api/stallService.js'
import './ManageStallPage.css'

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
            <main className="manage-stall-page manage-stall-page--state">
                <div className="manage-stall-state-card">
                    <span className="manage-stall-spinner" />
                    <p>Loading stall details...</p>
                </div>
            </main>
        )
    }

    if (error || !stall) {
        return (
            <main className="manage-stall-page manage-stall-page--state">
                <div className="manage-stall-state-card manage-stall-state-card--error">
                    <span className="manage-stall-state-icon">!</span>
                    <h1>Unable to load stall</h1>
                    <p>{error || 'Stall not found.'}</p>

                    <Link
                        to="/stall-dashboard"
                        className="manage-stall-primary-link"
                    >
                        Back to Dashboard
                        <span>↗</span>
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="manage-stall-page">
            <div className="manage-stall-glow manage-stall-glow--one" />
            <div className="manage-stall-glow manage-stall-glow--two" />

            <div className="manage-stall-container">
                <Link
                    to="/stall-dashboard"
                    className="manage-stall-back-link"
                >
                    <span>←</span>
                    Back to Dashboard
                </Link>

                <header className="manage-stall-header">
                    <div>
                        <span className="manage-stall-eyebrow">
                            STALL OWNER WORKSPACE
                        </span>

                        <h1>Manage Your Stall<span>.</span></h1>

                        <p>
                            Keep your menu updated and stay on top of visitor
                            queue activity.
                        </p>
                    </div>

                    <div className="manage-stall-header-mark">
                        <span>STALL</span>
                        <strong>MANAGEMENT</strong>
                    </div>
                </header>

                <section className="manage-stall-identity">
                    <div className="manage-stall-identity-icon">S</div>

                    <div className="manage-stall-identity-info">
                        <span>MANAGING STALL</span>
                        <h2>{stall.name}</h2>
                    </div>

                    <div className="manage-stall-identity-count">
                        <strong>{menuItems.length}</strong>
                        <span>MENU ITEMS</span>
                    </div>
                </section>

                {actionError && (
                    <div
                        role="alert"
                        className="manage-stall-alert manage-stall-alert--error"
                    >
                        <span>!</span>
                        {actionError}
                    </div>
                )}

                {successMessage && (
                    <div
                        role="status"
                        className="manage-stall-alert manage-stall-alert--success"
                    >
                        <span>✓</span>
                        {successMessage}
                    </div>
                )}

                <section className="manage-stall-panel manage-stall-form-panel">
                    <div className="manage-stall-section-heading">
                        <div>
                            <span className="manage-stall-section-label">
                                {editingItemId ? 'UPDATE YOUR OFFERING' : 'GROW YOUR MENU'}
                            </span>

                            <h2>
                                {editingItemId ? 'Edit Menu Item' : 'Add Menu Item'}
                            </h2>

                            <p>
                                Add the details visitors will see when
                                exploring your stall.
                            </p>
                        </div>

                        <div className="manage-stall-heading-icon">＋</div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="manage-stall-form"
                    >
                        <div className="manage-stall-form-grid">
                            <div className="manage-stall-field">
                                <label htmlFor="item-name">
                                    Item Name
                                </label>

                                <input
                                    id="item-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                    placeholder="e.g. Classic Veg Burger"
                                />
                            </div>

                            <div className="manage-stall-field">
                                <label htmlFor="item-price">
                                    Price (₹)
                                </label>

                                <div className="manage-stall-price-input">
                                    <span>₹</span>
                                    <input
                                        id="item-price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(event) => setPrice(event.target.value)}
                                        required
                                        placeholder="Enter price"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="manage-stall-field">
                            <label htmlFor="item-description">
                                Description
                            </label>

                            <textarea
                                id="item-description"
                                rows={4}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Describe the item, its ingredients, or what makes it special..."
                            />
                        </div>

                        <div className="manage-stall-field">
                            <label htmlFor="item-image">
                                Item Image <span>OPTIONAL</span>
                            </label>

                            <div className="manage-stall-file-area">
                                <input
                                    id="item-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setImage(event.target.files?.[0] || null)
                                    }
                                />

                                <p>
                                    Choose an image to make your menu item stand out.
                                </p>

                                {image && (
                                    <div className="manage-stall-selected-file">
                                        <span>✓</span>
                                        {image.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="manage-stall-form-actions">
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="manage-stall-submit-button"
                            >
                                {actionLoading
                                    ? 'Saving...'
                                    : editingItemId
                                        ? 'Update Menu Item'
                                        : 'Add Menu Item'}
                                {!actionLoading && <span>↗</span>}
                            </button>

                            {editingItemId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={actionLoading}
                                    className="manage-stall-cancel-button"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="manage-stall-menu-section">
                    <div className="manage-stall-section-heading manage-stall-menu-heading">
                        <div>
                            <span className="manage-stall-section-label">
                                WHAT YOU OFFER
                            </span>

                            <h2>Current Menu</h2>

                            <p>
                                Manage the items visitors can order from your stall.
                            </p>
                        </div>

                        <span className="manage-stall-count-pill">
                            {menuItems.length} {menuItems.length === 1 ? 'ITEM' : 'ITEMS'}
                        </span>
                    </div>

                    {menuItems.length === 0 ? (
                        <div className="manage-stall-empty">
                            <div className="manage-stall-empty-icon">◇</div>
                            <h3>Your menu is waiting to be filled.</h3>
                            <p>
                                Add your first menu item using the form above.
                                It will appear here once saved.
                            </p>
                        </div>
                    ) : (
                        <div className="manage-stall-menu-grid">
                            {menuItems.map((item) => (
                                <article
                                    key={item._id}
                                    className="manage-stall-menu-card"
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="manage-stall-menu-image"
                                        />
                                    ) : (
                                        <div className="manage-stall-menu-image-placeholder">
                                            <span>◇</span>
                                            <p>No image available</p>
                                        </div>
                                    )}

                                    <div className="manage-stall-menu-card-body">
                                        <div className="manage-stall-menu-card-top">
                                            <h3>{item.name}</h3>
                                            <strong>{formatPrice(item.price)}</strong>
                                        </div>

                                        <p className="manage-stall-menu-description">
                                            {item.description || 'No description'}
                                        </p>

                                        <div className="manage-stall-menu-actions">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(item)}
                                                disabled={actionLoading}
                                                className="manage-stall-edit-button"
                                            >
                                                Edit Item
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item._id)}
                                                disabled={actionLoading}
                                                className="manage-stall-delete-button"
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

                <section className="manage-stall-token-section">
                    <div className="manage-stall-section-heading manage-stall-token-heading">
                        <div>
                            <span className="manage-stall-section-label">
                                VISITOR ACTIVITY
                            </span>

                            <h2>Queue Token History</h2>

                            <p>
                                Visitors who generated queue tokens at this stall.
                            </p>
                        </div>

                        <span className="manage-stall-count-pill">
                            {tokenHistory.length} {tokenHistory.length === 1 ? 'TOKEN' : 'TOKENS'}
                        </span>
                    </div>

                    {tokenHistory.length === 0 ? (
                        <div className="manage-stall-empty manage-stall-token-empty">
                            <div className="manage-stall-empty-icon">#</div>
                            <h3>No queue activity yet.</h3>
                            <p>
                                Generated visitor tokens will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="manage-stall-token-list">
                            {tokenHistory.map((token, index) => (
                                <article
                                    key={token._id || `${token.tokenNumber}-${index}`}
                                    className="manage-stall-token-card"
                                >
                                    <div className="manage-stall-token-number">
                                        <span>TOKEN NUMBER</span>
                                        <strong>#{token.tokenNumber}</strong>
                                    </div>

                                    <div className="manage-stall-token-visitor">
                                        <strong>{token.visitorName || 'Visitor'}</strong>

                                        <span>
                                            {token.timestamp
                                                ? new Date(token.timestamp).toLocaleString('en-IN', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })
                                                : 'Time unavailable'}
                                        </span>
                                    </div>

                                    <span className="manage-stall-token-status">
                                        <span />
                                        Generated
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="manage-stall-reset-panel">
                    <div className="manage-stall-reset-icon">!</div>

                    <div className="manage-stall-reset-content">
                        <span className="manage-stall-section-label">
                            ADVANCED ACTION
                        </span>

                        <h2>Token Management</h2>

                        <p>
                            Resetting tokens sets the current token counter to
                            zero and permanently deletes the existing token
                            history. This action cannot be undone.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetTokens}
                        disabled={actionLoading}
                        className="manage-stall-reset-button"
                    >
                        Reset Stall Tokens
                    </button>
                </section>
            </div>
        </main>
    )
}

export default ManageStallPage
