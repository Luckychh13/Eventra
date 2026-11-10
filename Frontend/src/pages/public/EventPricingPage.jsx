import { useEffect, useState } from 'react'
import { getEventById } from '../../services/api/eventService.js'
import { getEventPricings } from '../../services/api/pricingService.js'
import { Link, useParams } from 'react-router-dom'
import { addToCart } from '../../services/api/cartService.js'
import useAuth from '../../hooks/useAuth.js'

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
            <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
                <p>Loading event and ticket information...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
                <h1 className="text-2xl font-bold">
                    Unable to load event
                </h1>

                <p role="alert" className="mt-3 text-red-400">
                    {error}
                </p>
            </main>
        )
    }

    if (!event) {
        return (
            <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
                <p>Event information is unavailable.</p>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
            <div className="mx-auto max-w-7xl">

                <h1 className="text-3xl font-bold">
                    {event.title}
                </h1>

                <div className="mt-4 space-y-2 text-gray-400">
                    <p>{event.day} | {event.date}</p>
                    <p>{event.time}</p>
                    <p>{event.location}</p>
                </div>

                {event.description && (
                    <p className="mt-4">
                        {event.description}
                    </p>
                )}

                <section className="mt-10">

                    <h2 className="mb-6 text-2xl font-semibold">
                        Select Your Tickets
                    </h2>

                    {cartMessage && (
                        <p role="status" className="mb-4 text-green-400">
                            {cartMessage}
                        </p>
                    )}

                    {cartError && (
                        <p role="alert" className="mb-4 text-red-400">
                            {cartError}
                        </p>
                    )}

                    {pricings.length === 0 ? (
                        <p>
                            Ticket pricing is not available for this event yet.
                        </p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {pricings.map((pricing) => {
                                const availableTickets = Math.max(
                                    0,
                                    Number(pricing.totalTickets) -
                                    Number(pricing.ticketsSold)
                                )

                                const finalPrice = Number(
                                    pricing.finalPrice ?? pricing.price
                                )

                                return (
                                    <article
                                        key={pricing._id}
                                        className="rounded-lg border border-white/10 p-6"
                                    >
                                        <h3 className="text-xl font-bold">
                                            {pricing.ticketType}
                                        </h3>

                                        <div className="mt-4">
                                            {finalPrice < Number(pricing.price) && (
                                                <p className="text-sm text-gray-400 line-through">
                                                    {formatPrice(pricing.price)}
                                                </p>
                                            )}

                                            <p className="mt-1 text-2xl font-semibold">
                                                {formatPrice(finalPrice)}
                                            </p>
                                        </div>

                                        <p className="mt-4 text-sm text-gray-400">
                                            Available tickets: {availableTickets}
                                        </p>

                                        {availableTickets === 0 ? (
                                            <p className="mt-3 text-red-400">
                                                Sold Out
                                            </p>
                                        ) : (
                                            <div className="mt-5">
                                                {authLoading ? (
                                                    <p>Checking account...</p>
                                                ) : user ? (
                                                    <>
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    (quantities[pricing._id] ?? 1) <= 1
                                                                }
                                                                onClick={() => {
                                                                    setQuantities((current) => ({
                                                                        ...current,
                                                                        [pricing._id]: Math.max(
                                                                            1,
                                                                            (current[pricing._id] ?? 1) - 1
                                                                        ),
                                                                    }))
                                                                }}
                                                                className="rounded border px-3 py-1"
                                                            >
                                                                -
                                                            </button>

                                                            <span>
                                                                {quantities[pricing._id] ?? 1}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    (quantities[pricing._id] ?? 1) >= availableTickets
                                                                }
                                                                onClick={() => {
                                                                    setQuantities((current) => ({
                                                                        ...current,
                                                                        [pricing._id]: Math.min(
                                                                            availableTickets,
                                                                            (current[pricing._id] ?? 1) + 1
                                                                        ),
                                                                    }))
                                                                }}
                                                                className="rounded border px-3 py-1"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddToCart(pricing._id)}
                                                            disabled={addingPricingId === pricing._id}
                                                            className="mt-4 rounded border border-white/20 px-4 py-2 disabled:opacity-50"
                                                        >
                                                            {addingPricingId === pricing._id
                                                                ? 'Adding...'
                                                                : 'Add to Cart'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <Link
                                                        to="/login"
                                                        className="mt-4 inline-block underline"
                                                    >
                                                        Login to add tickets
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