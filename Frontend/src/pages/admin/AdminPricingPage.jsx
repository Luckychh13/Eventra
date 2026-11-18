import { useEffect, useState } from 'react'
import { getEvents } from '../../services/api/eventService.js'
import {
    getEventPricings,
    createTierPricings,
    updatePricing,
    applyOffer,
    removeOffer,
    deletePricing,
} from '../../services/api/pricingService.js'
import './AdminPricingPage.css'

const formatPrice = (value) => {
    const amount = Number(value)

    if (!Number.isFinite(amount)) return '₹0'

    return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`
}

const formatDate = (value) => {
    if (!value) return 'Date unavailable'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return 'Date unavailable'

    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

const getErrorMessage = (err, fallback) => (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    fallback
)

function AdminPricingPage() {
    const [events, setEvents] = useState([])
    const [selectedEventId, setSelectedEventId] = useState('')
    const [pricings, setPricings] = useState([])

    const [eventsLoading, setEventsLoading] = useState(true)
    const [pricingsLoading, setPricingsLoading] = useState(false)

    const [error, setError] = useState('')

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creating, setCreating] = useState(false)

    const [newPricing, setNewPricing] = useState({
        ticketType: 'GOLDEN',
        price: '',
        totalTickets: '',
    })

    const [editingPricingId, setEditingPricingId] = useState(null)
    const [editFormData, setEditFormData] = useState({
        price: '',
        totalTickets: '',
    })
    const [updating, setUpdating] = useState(false)

    const [offerPricingId, setOfferPricingId] = useState(null)
    const [offerFormData, setOfferFormData] = useState({
        percentage: '',
        expiry: '',
    })
    const [offerLoading, setOfferLoading] = useState(false)

    const [formError, setFormError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        let isActive = true

        const loadEvents = async () => {
            try {
                const response = await getEvents()

                if (isActive) {
                    const eventList = Array.isArray(response) ? response : []

                    setEvents(eventList)

                    if (eventList.length > 0) {
                        setSelectedEventId(eventList[0]._id)
                    }
                }
            } catch (err) {
                if (isActive) {
                    setError(getErrorMessage(err, 'Failed to load events.'))
                }
            } finally {
                if (isActive) {
                    setEventsLoading(false)
                }
            }
        }

        loadEvents()

        return () => {
            isActive = false
        }
    }, [])

    useEffect(() => {
        if (!selectedEventId) return

        let isActive = true

        const loadPricings = async () => {
            try {
                setPricingsLoading(true)
                setError('')

                const response = await getEventPricings(selectedEventId)

                if (isActive) {
                    setPricings(Array.isArray(response) ? response : [])
                }
            } catch (err) {
                if (isActive) {
                    setError(getErrorMessage(err, 'Failed to load pricing.'))
                    setPricings([])
                }
            } finally {
                if (isActive) {
                    setPricingsLoading(false)
                }
            }
        }

        loadPricings()

        return () => {
            isActive = false
        }
    }, [selectedEventId])

    const selectedEvent = events.find(
        (event) => event._id === selectedEventId
    )

    const totalTickets = pricings.reduce(
        (total, pricing) => total + (Number(pricing.totalTickets) || 0),
        0
    )

    const ticketsSold = pricings.reduce(
        (total, pricing) => total + (Number(pricing.ticketsSold) || 0),
        0
    )

    const ticketsRemaining = Math.max(totalTickets - ticketsSold, 0)

    const activeOffers = pricings.filter(
        (pricing) => pricing.offer?.active
    ).length

    const refreshPricings = async () => {
        if (!selectedEventId) return

        try {
            setPricingsLoading(true)
            setError('')

            const response = await getEventPricings(selectedEventId)
            setPricings(Array.isArray(response) ? response : [])
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to refresh pricing.'))
        } finally {
            setPricingsLoading(false)
        }
    }

    const handleCreatePricing = async (event) => {
        event.preventDefault()

        if (!selectedEventId) {
            setFormError('Please select an event.')
            return
        }

        const price = Number(newPricing.price)
        const ticketCount = Number(newPricing.totalTickets)

        if (
            newPricing.price === '' ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setFormError('Enter a valid ticket price.')
            return
        }

        if (
            newPricing.totalTickets === '' ||
            !Number.isInteger(ticketCount) ||
            ticketCount <= 0
        ) {
            setFormError('Total tickets must be a positive integer.')
            return
        }

        try {
            setCreating(true)
            setFormError('')
            setSuccessMessage('')

            await createTierPricings(selectedEventId, [
                {
                    ticketType: newPricing.ticketType,
                    price,
                    totalTickets: ticketCount,
                },
            ])

            const updatedPricings = await getEventPricings(selectedEventId)

            setPricings(
                Array.isArray(updatedPricings) ? updatedPricings : []
            )

            setNewPricing({
                ticketType: 'GOLDEN',
                price: '',
                totalTickets: '',
            })

            setShowCreateForm(false)
            setSuccessMessage('Ticket pricing created successfully.')
        } catch (err) {
            setFormError(
                getErrorMessage(err, 'Failed to create ticket pricing.')
            )
        } finally {
            setCreating(false)
        }
    }

    const openEditForm = (pricing) => {
        setEditingPricingId(pricing._id)
        setOfferPricingId(null)

        setEditFormData({
            price: String(pricing.price),
            totalTickets: String(pricing.totalTickets),
        })

        setFormError('')
        setSuccessMessage('')
    }

    const handleUpdatePricing = async (event, pricing) => {
        event.preventDefault()

        const price = Number(editFormData.price)
        const ticketCount = Number(editFormData.totalTickets)

        if (
            editFormData.price === '' ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setFormError('Enter a valid ticket price.')
            return
        }

        if (
            editFormData.totalTickets === '' ||
            !Number.isInteger(ticketCount) ||
            ticketCount < pricing.ticketsSold
        ) {
            setFormError(
                `Total tickets cannot be less than tickets already sold (${pricing.ticketsSold}).`
            )
            return
        }

        try {
            setUpdating(true)
            setFormError('')
            setSuccessMessage('')

            await updatePricing(pricing._id, {
                price,
                totalTickets: ticketCount,
            })

            const updatedPricings = await getEventPricings(selectedEventId)

            setPricings(
                Array.isArray(updatedPricings) ? updatedPricings : []
            )

            setEditingPricingId(null)
            setSuccessMessage('Ticket pricing updated successfully.')
        } catch (err) {
            setFormError(getErrorMessage(err, 'Failed to update pricing.'))
        } finally {
            setUpdating(false)
        }
    }

    const openOfferForm = (pricing) => {
        setOfferPricingId(pricing._id)
        setEditingPricingId(null)

        setOfferFormData({
            percentage: '',
            expiry: '',
        })

        setFormError('')
        setSuccessMessage('')
    }

    const handleApplyOffer = async (event, pricing) => {
        event.preventDefault()

        const percentage = Number(offerFormData.percentage)

        if (
            offerFormData.percentage === '' ||
            !Number.isFinite(percentage) ||
            percentage <= 0 ||
            percentage > 100
        ) {
            setFormError(
                'Offer percentage must be greater than 0 and at most 100.'
            )
            return
        }

        if (!offerFormData.expiry) {
            setFormError('Please select an offer expiry date and time.')
            return
        }

        const expiryDate = new Date(offerFormData.expiry)

        if (
            Number.isNaN(expiryDate.getTime()) ||
            expiryDate <= new Date()
        ) {
            setFormError('Offer expiry must be a future date and time.')
            return
        }

        try {
            setOfferLoading(true)
            setFormError('')
            setSuccessMessage('')

            await applyOffer(
                pricing._id,
                percentage,
                expiryDate.toISOString()
            )

            const updatedPricings = await getEventPricings(selectedEventId)

            setPricings(
                Array.isArray(updatedPricings) ? updatedPricings : []
            )

            setOfferPricingId(null)
            setSuccessMessage('Offer applied successfully.')
        } catch (err) {
            setFormError(getErrorMessage(err, 'Failed to apply offer.'))
        } finally {
            setOfferLoading(false)
        }
    }

    const handleRemoveOffer = async (pricing) => {
        const confirmed = window.confirm(
            `Remove the offer from ${pricing.ticketType} tickets?`
        )

        if (!confirmed) return

        try {
            setOfferLoading(true)
            setFormError('')
            setSuccessMessage('')

            await removeOffer(pricing._id)

            const updatedPricings = await getEventPricings(selectedEventId)

            setPricings(
                Array.isArray(updatedPricings) ? updatedPricings : []
            )

            setSuccessMessage('Offer removed successfully.')
        } catch (err) {
            setFormError(getErrorMessage(err, 'Failed to remove offer.'))
        } finally {
            setOfferLoading(false)
        }
    }

    const handleDeletePricing = async (pricing) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete the ${pricing.ticketType} pricing tier?`
        )

        if (!confirmed) return

        try {
            setFormError('')
            setSuccessMessage('')

            await deletePricing(pricing._id)

            const updatedPricings = await getEventPricings(selectedEventId)

            setPricings(
                Array.isArray(updatedPricings) ? updatedPricings : []
            )

            setSuccessMessage(
                `${pricing.ticketType} pricing deleted successfully.`
            )
        } catch (err) {
            setFormError(getErrorMessage(err, 'Failed to delete pricing.'))
        }
    }

    const handleEventChange = (event) => {
        setSelectedEventId(event.target.value)
        setEditingPricingId(null)
        setOfferPricingId(null)
        setShowCreateForm(false)
        setFormError('')
        setSuccessMessage('')
        setError('')
    }

    if (eventsLoading) {
        return (
            <section className="admin-pricing-page">
                <div className="pricing-state-card">
                    <span className="pricing-loader" />
                    <p>Loading events...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="admin-pricing-page">
            <header className="pricing-page-header">
                <div>
                    <span className="pricing-eyebrow">EVENT MANAGEMENT</span>
                    <h1>Event Pricing</h1>
                    <p>
                        Manage ticket tiers, inventory, and promotional offers
                        for your events.
                    </p>
                </div>

                <button
                    type="button"
                    className="pricing-button pricing-button-primary"
                    onClick={() => {
                        setShowCreateForm((current) => !current)
                        setFormError('')
                        setSuccessMessage('')
                    }}
                    disabled={!selectedEventId}
                >
                    <span className="pricing-button-symbol">
                        {showCreateForm ? '−' : '+'}
                    </span>
                    {showCreateForm ? 'Close Form' : 'Add Ticket Tier'}
                </button>
            </header>

            {error && (
                <div className="pricing-alert pricing-alert-error" role="alert">
                    <span className="pricing-alert-icon">!</span>
                    <div>
                        <strong>Unable to load pricing data</strong>
                        <p>{error}</p>
                    </div>
                    <button
                        type="button"
                        className="pricing-alert-action"
                        onClick={refreshPricings}
                        disabled={!selectedEventId || pricingsLoading}
                    >
                        Try again
                    </button>
                </div>
            )}

            {formError && (
                <div className="pricing-alert pricing-alert-error" role="alert">
                    <span className="pricing-alert-icon">!</span>
                    <p>{formError}</p>
                    <button
                        type="button"
                        className="pricing-alert-dismiss"
                        onClick={() => setFormError('')}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            {successMessage && (
                <div
                    className="pricing-alert pricing-alert-success"
                    role="status"
                >
                    <span className="pricing-alert-icon">✓</span>
                    <p>{successMessage}</p>
                    <button
                        type="button"
                        className="pricing-alert-dismiss"
                        onClick={() => setSuccessMessage('')}
                        aria-label="Dismiss success message"
                    >
                        ×
                    </button>
                </div>
            )}

            <section className="pricing-event-panel">
                <div className="pricing-event-copy">
                    <span className="pricing-section-label">CURRENT EVENT</span>
                    <h2>
                        {selectedEvent?.title || 'Choose an event'}
                    </h2>
                    <p>
                        Select an event to view and manage its ticket pricing.
                    </p>
                </div>

                <div className="pricing-event-select-wrap">
                    <label htmlFor="pricing-event-select">
                        Select event
                    </label>
                    <select
                        id="pricing-event-select"
                        value={selectedEventId}
                        onChange={handleEventChange}
                        disabled={events.length === 0}
                    >
                        {events.length === 0 && (
                            <option value="">No events available</option>
                        )}

                        {events.map((event) => (
                            <option key={event._id} value={event._id}>
                                {event.title}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {selectedEventId && (
                <>
                    <section className="pricing-overview-grid">
                        <article className="pricing-overview-card">
                            <div className="pricing-overview-top">
                                <span className="pricing-overview-icon">◇</span>
                                <span className="pricing-overview-label">
                                    Ticket tiers
                                </span>
                            </div>
                            <strong>{pricings.length}</strong>
                            <span className="pricing-overview-caption">
                                Configured for this event
                            </span>
                        </article>

                        <article className="pricing-overview-card">
                            <div className="pricing-overview-top">
                                <span className="pricing-overview-icon">▤</span>
                                <span className="pricing-overview-label">
                                    Total inventory
                                </span>
                            </div>
                            <strong>{totalTickets.toLocaleString('en-IN')}</strong>
                            <span className="pricing-overview-caption">
                                Tickets allocated
                            </span>
                        </article>

                        <article className="pricing-overview-card">
                            <div className="pricing-overview-top">
                                <span className="pricing-overview-icon">↗</span>
                                <span className="pricing-overview-label">
                                    Tickets sold
                                </span>
                            </div>
                            <strong>{ticketsSold.toLocaleString('en-IN')}</strong>
                            <span className="pricing-overview-caption">
                                Across all ticket tiers
                            </span>
                        </article>

                        <article className="pricing-overview-card">
                            <div className="pricing-overview-top">
                                <span className="pricing-overview-icon">%</span>
                                <span className="pricing-overview-label">
                                    Active offers
                                </span>
                            </div>
                            <strong>{activeOffers}</strong>
                            <span className="pricing-overview-caption">
                                Promotional offers running
                            </span>
                        </article>
                    </section>

                    <section className="pricing-inventory-strip">
                        <div>
                            <span className="pricing-section-label">
                                TICKET AVAILABILITY
                            </span>
                            <p>
                                <strong>
                                    {ticketsRemaining.toLocaleString('en-IN')}
                                </strong>
                                <span> tickets remaining</span>
                            </p>
                        </div>
                        <div className="pricing-inventory-total">
                            {ticketsSold.toLocaleString('en-IN')} sold
                            <span />
                            {totalTickets.toLocaleString('en-IN')} total
                        </div>
                    </section>

                    {showCreateForm && (
                        <form
                            className="pricing-form-panel"
                            onSubmit={handleCreatePricing}
                        >
                            <div className="pricing-form-heading">
                                <div>
                                    <span className="pricing-section-label">
                                        NEW TICKET CATEGORY
                                    </span>
                                    <h2>Create ticket tier</h2>
                                    <p>
                                        Set the ticket category, price, and
                                        available quantity.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="pricing-icon-button"
                                    onClick={() => setShowCreateForm(false)}
                                    aria-label="Close create form"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="pricing-form-grid">
                                <div className="pricing-field">
                                    <label htmlFor="create-ticket-type">
                                        Ticket type
                                    </label>
                                    <select
                                        id="create-ticket-type"
                                        value={newPricing.ticketType}
                                        onChange={(event) =>
                                            setNewPricing((current) => ({
                                                ...current,
                                                ticketType: event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="GOLDEN">GOLDEN</option>
                                        <option value="SILVER">SILVER</option>
                                        <option value="BRONZE">BRONZE</option>
                                    </select>
                                </div>

                                <div className="pricing-field">
                                    <label htmlFor="create-ticket-price">
                                        Ticket price (₹)
                                    </label>
                                    <input
                                        id="create-ticket-price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newPricing.price}
                                        onChange={(event) =>
                                            setNewPricing((current) => ({
                                                ...current,
                                                price: event.target.value,
                                            }))
                                        }
                                        placeholder="Enter ticket price"
                                    />
                                </div>

                                <div className="pricing-field">
                                    <label htmlFor="create-ticket-quantity">
                                        Total tickets
                                    </label>
                                    <input
                                        id="create-ticket-quantity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={newPricing.totalTickets}
                                        onChange={(event) =>
                                            setNewPricing((current) => ({
                                                ...current,
                                                totalTickets: event.target.value,
                                            }))
                                        }
                                        placeholder="Enter ticket quantity"
                                    />
                                </div>
                            </div>

                            <div className="pricing-form-actions">
                                <button
                                    type="submit"
                                    className="pricing-button pricing-button-primary"
                                    disabled={creating}
                                >
                                    {creating ? 'Creating...' : 'Create ticket tier'}
                                </button>
                                <button
                                    type="button"
                                    className="pricing-button pricing-button-secondary"
                                    onClick={() => setShowCreateForm(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    <section className="pricing-tiers-section">
                        <div className="pricing-section-heading">
                            <div>
                                <span className="pricing-section-label">
                                    CONFIGURATION
                                </span>
                                <h2>Ticket tiers</h2>
                                <p>
                                    View ticket prices, availability, and offers.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="pricing-button pricing-button-secondary pricing-refresh-button"
                                onClick={refreshPricings}
                                disabled={pricingsLoading}
                            >
                                <span className={pricingsLoading ? 'pricing-refresh-spinning' : ''}>
                                    ↻
                                </span>
                                Refresh
                            </button>
                        </div>

                        {pricingsLoading ? (
                            <div className="pricing-state-card">
                                <span className="pricing-loader" />
                                <p>Loading ticket tiers...</p>
                            </div>
                        ) : pricings.length === 0 ? (
                            <div className="pricing-empty-state">
                                <span className="pricing-empty-icon">◇</span>
                                <h3>No ticket tiers yet</h3>
                                <p>
                                    Create a ticket tier to start managing
                                    prices and ticket availability for this event.
                                </p>
                                <button
                                    type="button"
                                    className="pricing-button pricing-button-primary"
                                    onClick={() => setShowCreateForm(true)}
                                >
                                    + Add first ticket tier
                                </button>
                            </div>
                        ) : (
                            <div className="pricing-tier-grid">
                                {pricings.map((pricing) => {
                                    const completedSales =
                                        Number(pricing.ticketsSold) || 0
                                    const capacity =
                                        Number(pricing.totalTickets) || 0
                                    const remaining = Math.max(
                                        capacity - completedSales,
                                        0
                                    )
                                    const soldPercentage = capacity > 0
                                        ? Math.min(
                                            (completedSales / capacity) * 100,
                                            100
                                        )
                                        : 0
                                    const isEditing =
                                        editingPricingId === pricing._id
                                    const isApplyingOffer =
                                        offerPricingId === pricing._id
                                    const hasActiveOffer =
                                        Boolean(pricing.offer?.active)

                                    return (
                                        <article
                                            className={`pricing-tier-card pricing-tier-${pricing.ticketType.toLowerCase()}`}
                                            key={pricing._id}
                                        >
                                            {isEditing ? (
                                                <form
                                                    className="pricing-edit-form"
                                                    onSubmit={(event) =>
                                                        handleUpdatePricing(event, pricing)
                                                    }
                                                >
                                                    <div className="pricing-card-heading">
                                                        <div>
                                                            <span className="pricing-section-label">
                                                                EDIT TIER
                                                            </span>
                                                            <h3>
                                                                {pricing.ticketType} pricing
                                                            </h3>
                                                        </div>
                                                        <span className="pricing-tier-badge">
                                                            {pricing.ticketType}
                                                        </span>
                                                    </div>

                                                    <div className="pricing-field">
                                                        <label htmlFor={`edit-price-${pricing._id}`}>
                                                            Ticket price (₹)
                                                        </label>
                                                        <input
                                                            id={`edit-price-${pricing._id}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={editFormData.price}
                                                            onChange={(event) =>
                                                                setEditFormData((current) => ({
                                                                    ...current,
                                                                    price: event.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </div>

                                                    <div className="pricing-field">
                                                        <label htmlFor={`edit-quantity-${pricing._id}`}>
                                                            Total tickets
                                                        </label>
                                                        <input
                                                            id={`edit-quantity-${pricing._id}`}
                                                            type="number"
                                                            min={pricing.ticketsSold}
                                                            step="1"
                                                            value={editFormData.totalTickets}
                                                            onChange={(event) =>
                                                                setEditFormData((current) => ({
                                                                    ...current,
                                                                    totalTickets: event.target.value,
                                                                }))
                                                            }
                                                        />
                                                        <small>
                                                            Already sold: {completedSales}
                                                        </small>
                                                    </div>

                                                    <div className="pricing-form-actions">
                                                        <button
                                                            type="submit"
                                                            className="pricing-button pricing-button-primary"
                                                            disabled={updating}
                                                        >
                                                            {updating ? 'Saving...' : 'Save changes'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="pricing-button pricing-button-secondary"
                                                            onClick={() => {
                                                                setEditingPricingId(null)
                                                                setFormError('')
                                                            }}
                                                            disabled={updating}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="pricing-card-heading">
                                                        <div>
                                                            <span className="pricing-section-label">
                                                                TICKET CATEGORY
                                                            </span>
                                                            <h3>{pricing.ticketType}</h3>
                                                        </div>
                                                        <span className="pricing-tier-badge">
                                                            {pricing.ticketType}
                                                        </span>
                                                    </div>

                                                    <div className="pricing-card-price">
                                                        <span>Current ticket price</span>
                                                        <strong>
                                                            {formatPrice(
                                                                pricing.finalPrice ?? pricing.price
                                                            )}
                                                        </strong>
                                                        {hasActiveOffer && (
                                                            <span className="pricing-original-price">
                                                                {formatPrice(pricing.price)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="pricing-card-details">
                                                        <div>
                                                            <span>Original price</span>
                                                            <strong>
                                                                {formatPrice(pricing.price)}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span>Tickets sold</span>
                                                            <strong>
                                                                {completedSales.toLocaleString('en-IN')}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span>Tickets remaining</span>
                                                            <strong>
                                                                {remaining.toLocaleString('en-IN')}
                                                            </strong>
                                                        </div>
                                                        <div>
                                                            <span>Total capacity</span>
                                                            <strong>
                                                                {capacity.toLocaleString('en-IN')}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <div className="pricing-card-progress">
                                                        <div className="pricing-progress-heading">
                                                            <span>Sales progress</span>
                                                            <strong>
                                                                {soldPercentage.toFixed(0)}%
                                                            </strong>
                                                        </div>
                                                        <div
                                                            className="pricing-progress-track"
                                                            role="progressbar"
                                                            aria-label={`${pricing.ticketType} tickets sold`}
                                                            aria-valuenow={Math.round(soldPercentage)}
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        >
                                                            <span
                                                                style={{
                                                                    width: `${soldPercentage}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {hasActiveOffer ? (
                                                        <div className="pricing-offer-active">
                                                            <div className="pricing-offer-top">
                                                                <span className="pricing-offer-tag">
                                                                    OFFER ACTIVE
                                                                </span>
                                                                <strong>
                                                                    {pricing.offer.percentage}% OFF
                                                                </strong>
                                                            </div>
                                                            <p>
                                                                Expires: {formatDate(pricing.offer.expiry)}
                                                            </p>
                                                            <button
                                                                type="button"
                                                                className="pricing-text-button pricing-danger-text"
                                                                onClick={() => handleRemoveOffer(pricing)}
                                                                disabled={offerLoading}
                                                            >
                                                                {offerLoading
                                                                    ? 'Please wait...'
                                                                    : 'Remove offer'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="pricing-button pricing-button-offer"
                                                            onClick={() => openOfferForm(pricing)}
                                                        >
                                                            + Apply offer
                                                        </button>
                                                    )}

                                                    {isApplyingOffer && (
                                                        <form
                                                            className="pricing-offer-form"
                                                            onSubmit={(event) =>
                                                                handleApplyOffer(event, pricing)
                                                            }
                                                        >
                                                            <h4>Set promotional offer</h4>

                                                            <div className="pricing-field">
                                                                <label htmlFor={`offer-percent-${pricing._id}`}>
                                                                    Discount percentage
                                                                </label>
                                                                <div className="pricing-input-suffix">
                                                                    <input
                                                                        id={`offer-percent-${pricing._id}`}
                                                                        type="number"
                                                                        min="0.01"
                                                                        max="100"
                                                                        step="0.01"
                                                                        value={offerFormData.percentage}
                                                                        onChange={(event) =>
                                                                            setOfferFormData((current) => ({
                                                                                ...current,
                                                                                percentage: event.target.value,
                                                                            }))
                                                                        }
                                                                        placeholder="e.g. 20"
                                                                    />
                                                                    <span>%</span>
                                                                </div>
                                                            </div>

                                                            <div className="pricing-field">
                                                                <label htmlFor={`offer-expiry-${pricing._id}`}>
                                                                    Offer expiry
                                                                </label>
                                                                <input
                                                                    id={`offer-expiry-${pricing._id}`}
                                                                    type="datetime-local"
                                                                    value={offerFormData.expiry}
                                                                    onChange={(event) =>
                                                                        setOfferFormData((current) => ({
                                                                            ...current,
                                                                            expiry: event.target.value,
                                                                        }))
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="pricing-form-actions">
                                                                <button
                                                                    type="submit"
                                                                    className="pricing-button pricing-button-primary"
                                                                    disabled={offerLoading}
                                                                >
                                                                    {offerLoading ? 'Applying...' : 'Apply offer'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="pricing-button pricing-button-secondary"
                                                                    onClick={() => {
                                                                        setOfferPricingId(null)
                                                                        setFormError('')
                                                                    }}
                                                                    disabled={offerLoading}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}

                                                    <div className="pricing-card-actions">
                                                        <button
                                                            type="button"
                                                            className="pricing-button pricing-button-secondary"
                                                            onClick={() => openEditForm(pricing)}
                                                        >
                                                            Edit pricing
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="pricing-button pricing-button-delete"
                                                            onClick={() => handleDeletePricing(pricing)}
                                                        >
                                                            Delete tier
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </article>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}

            {!selectedEventId && events.length === 0 && (
                <div className="pricing-empty-state">
                    <span className="pricing-empty-icon">◇</span>
                    <h3>No events available</h3>
                    <p>
                        Create an event before configuring its ticket pricing.
                    </p>
                </div>
            )}
        </section>
    )
}

export default AdminPricingPage