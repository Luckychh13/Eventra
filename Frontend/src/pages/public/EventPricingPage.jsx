
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEventById } from '../../services/api/eventService.js'
import { getEventPricings } from '../../services/api/pricingService.js'
import { addToCart } from '../../services/api/cartService.js'
import useAuth from '../../hooks/useAuth.js'
import './EventPricingPage.css'

const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(Number(amount ?? 0))
}

function EventPricingPage() {
    const { eventId } = useParams()
    const { user, loading: authLoading } = useAuth()

    const [quantities, setQuantities] = useState({})
    const [addingPricingId, setAddingPricingId] = useState(null)
    const [cartMessage, setCartMessage] = useState('')
    const [cartError, setCartError] = useState('')

    const [event, setEvent] = useState(null)
    const [pricings, setPricings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isActive = true

        const fetchEventPricing = async () => {
            setLoading(true)
            setError('')

            try {
                const [eventData, pricingData] = await Promise.all([
                    getEventById(eventId),
                    getEventPricings(eventId),
                ])

                if (isActive) {
                    setEvent(eventData)
                    setPricings(pricingData)
                }
            } catch (requestError) {
                if (isActive) {
                    setError(
                        requestError.response?.data?.error ||
                        'Unable to load event and ticket information.'
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        fetchEventPricing()

        return () => {
            isActive = false
        }
    }, [eventId])

    const handleAddToCart = async (pricingId) => {
        if (!user) return

        const quantity = quantities[pricingId] ?? 1

        setAddingPricingId(pricingId)
        setCartMessage('')
        setCartError('')

        try {
            await addToCart({
                uid: user.uid,
                eventId,
                pricingId,
                quantity,
            })

            setCartMessage('Tickets added to your cart successfully.')
        } catch (requestError) {
            setCartError(
                requestError.response?.data?.error ||
                'Unable to add tickets to your cart.'
            )
        } finally {
            setAddingPricingId(null)
        }
    }

    if (loading) {
        return (
            <main className="event-pricing">
                <div className="event-pricing__state">
                    <span className="event-pricing__state-mark" />
                    <p>Loading event and ticket information...</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="event-pricing">
                <div className="event-pricing__state event-pricing__state--error">
                    <span className="event-pricing__eyebrow">
                        EVENT INFORMATION
                    </span>

                    <h1>Unable to load event</h1>

                    <p role="alert">{error}</p>
                </div>
            </main>
        )
    }

    if (!event) {
        return (
            <main className="event-pricing">
                <div className="event-pricing__state">
                    <span className="event-pricing__eyebrow">
                        EVENT INFORMATION
                    </span>

                    <h1>Event unavailable</h1>

                    <p>Event information is currently unavailable.</p>
                </div>
            </main>
        )
    }

    return (
        <main className="event-pricing">
            <div className="event-pricing__container">
                <section className="event-pricing__hero">
                    <div className="event-pricing__hero-content">
                        <p className="event-pricing__eyebrow">
                            YOUR FESTIVAL EXPERIENCE
                        </p>

                        <h1>{event.title}</h1>

                        {event.description && (
                            <p className="event-pricing__description">
                                {event.description}
                            </p>
                        )}

                        <div className="event-pricing__event-details">
                            <div className="event-pricing__detail">
                                <span>DATE</span>
                                <strong>
                                    {event.day || 'Festival Event'}
                                    {event.date ? ` · ${event.date}` : ''}
                                </strong>
                            </div>

                            <div className="event-pricing__detail">
                                <span>TIME</span>
                                <strong>{event.time || 'Time TBA'}</strong>
                            </div>

                            <div className="event-pricing__detail">
                                <span>VENUE</span>
                                <strong>
                                    {event.location || 'Venue TBA'}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="event-pricing__hero-visual">
                        {event.imageUrl ? (
                            <img
                                src={event.imageUrl}
                                alt={event.title || 'Event'}
                                className="event-pricing__hero-image"
                            />
                        ) : (
                            <div className="event-pricing__hero-placeholder">
                                <span>EVENTRA</span>
                                <p>Make moments memorable</p>
                            </div>
                        )}

                        <div className="event-pricing__hero-image-overlay" />
                    </div>
                </section>

                <section className="event-pricing__tickets">
                    <div className="event-pricing__section-heading">
                        <div>
                            <p className="event-pricing__eyebrow">
                                FIND YOUR PASS
                            </p>

                            <h2>Select Your Tickets</h2>

                            <p>
                                Choose the ticket that suits your festival
                                experience.
                            </p>
                        </div>

                        <span className="event-pricing__ticket-count">
                            {pricings.length} {pricings.length === 1 ? 'option' : 'options'}
                        </span>
                    </div>

                    {cartMessage && (
                        <p
                            role="status"
                            aria-live="polite"
                            className="event-pricing__feedback event-pricing__feedback--success"
                        >
                            {cartMessage}
                        </p>
                    )}

                    {cartError && (
                        <p
                            role="alert"
                            className="event-pricing__feedback event-pricing__feedback--error"
                        >
                            {cartError}
                        </p>
                    )}

                    {pricings.length === 0 ? (
                        <div className="event-pricing__empty">
                            <span className="event-pricing__empty-mark">✦</span>

                            <h3>Tickets coming soon</h3>

                            <p>
                                Ticket pricing is not available for this
                                event yet. Please check back later.
                            </p>
                        </div>
                    ) : (
                        <div className="event-pricing__grid">
                            {pricings.map((pricing) => {
                                const availableTickets = Math.max(
                                    0,
                                    Number(pricing.totalTickets) -
                                    Number(pricing.ticketsSold)
                                )

                                const finalPrice = Number(
                                    pricing.finalPrice ?? pricing.price
                                )

                                const quantity =
                                    quantities[pricing._id] ?? 1

                                const isSoldOut = availableTickets === 0
                                const isAdding =
                                    addingPricingId === pricing._id

                                const ticketType = String(
                                    pricing.ticketType || ''
                                ).toLowerCase()

                                const ticketTone = ticketType.includes('gold')
                                    ? 'gold'
                                    : ticketType.includes('silver')
                                        ? 'silver'
                                        : ticketType.includes('bronze')
                                            ? 'bronze'
                                            : 'default'

                                return (
                                    <article
                                        key={pricing._id}
                                        className={`event-pricing__ticket event-pricing__ticket--${ticketTone} ${isSoldOut ? 'is-sold-out' : ''}`}
                                    >
                                        <div className="event-pricing__ticket-top">
                                            <span className="event-pricing__ticket-label">
                                                FESTIVAL PASS
                                            </span>

                                            {isSoldOut && (
                                                <span className="event-pricing__sold-out-label">
                                                    SOLD OUT
                                                </span>
                                            )}
                                        </div>

                                        <h3>{pricing.ticketType}</h3>

                                        <div className="event-pricing__price">
                                            {finalPrice < Number(pricing.price) && (
                                                <span className="event-pricing__original-price">
                                                    {formatPrice(pricing.price)}
                                                </span>
                                            )}

                                            <strong>{formatPrice(finalPrice)}</strong>

                                            <span className="event-pricing__per-ticket">
                                                per ticket
                                            </span>
                                        </div>

                                        <div className="event-pricing__availability">
                                            <span>Ticket availability</span>
                                            <strong>
                                                {availableTickets} available
                                            </strong>
                                        </div>

                                        <div className="event-pricing__ticket-divider" />

                                        {isSoldOut ? (
                                            <p className="event-pricing__sold-out-message">
                                                This ticket type is currently
                                                sold out.
                                            </p>
                                        ) : (
                                            <div className="event-pricing__purchase">
                                                {authLoading ? (
                                                    <p className="event-pricing__auth-loading">
                                                        Checking account...
                                                    </p>
                                                ) : user ? (
                                                    <>
                                                        <div className="event-pricing__quantity-row">
                                                            <span>Quantity</span>

                                                            <div className="event-pricing__quantity">
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Decrease ${pricing.ticketType} quantity`}
                                                                    disabled={quantity <= 1}
                                                                    onClick={() => {
                                                                        setQuantities((current) => ({
                                                                            ...current,
                                                                            [pricing._id]: Math.max(
                                                                                1,
                                                                                (current[pricing._id] ?? 1) - 1
                                                                            ),
                                                                        }))
                                                                    }}
                                                                >
                                                                    −
                                                                </button>

                                                                <span aria-live="polite">
                                                                    {quantity}
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    aria-label={`Increase ${pricing.ticketType} quantity`}
                                                                    disabled={quantity >= availableTickets}
                                                                    onClick={() => {
                                                                        setQuantities((current) => ({
                                                                            ...current,
                                                                            [pricing._id]: Math.min(
                                                                                availableTickets,
                                                                                (current[pricing._id] ?? 1) + 1
                                                                            ),
                                                                        }))
                                                                    }}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddToCart(pricing._id)}
                                                            disabled={isAdding}
                                                            className="event-pricing__add-button"
                                                        >
                                                            {isAdding
                                                                ? 'Adding to cart...'
                                                                : 'Add to Cart'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <Link
                                                        to="/login"
                                                        className="event-pricing__login-button"
                                                    >
                                                        Login to add tickets
                                                        <span aria-hidden="true">→</span>
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

export default EventPricingPage
