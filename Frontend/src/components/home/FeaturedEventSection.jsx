
import { useState } from 'react'
import { Link } from 'react-router-dom'
import './FeaturedEventSection.css'

function FeaturedEventSection({ events, loading, error }) {
    const [selectedEventId, setSelectedEventId] = useState('')

    if (loading) {
        return (
            <section className="home-stage featured-stage">
                <p className="home-status">Loading featured event...</p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="home-stage featured-stage">
                <p className="home-status" role="alert">{error}</p>
            </section>
        )
    }

    if (!events || events.length === 0) {
        return null
    }

    const selectedEventIndex = events.findIndex(
        (event) => event._id === selectedEventId
    )

    const activeIndex = selectedEventIndex >= 0 ? selectedEventIndex : 0
    const featuredEvent = events[activeIndex]

    // Calculate each event's shortest circular distance.
    const getCircularOffset = (eventIndex) => {
        let offset = eventIndex - activeIndex
        const half = events.length / 2

        if (offset > half) {
            offset -= events.length
        } else if (offset < -half) {
            offset += events.length
        }

        return offset
    }

    // Calculate the visual position of each card.
    const getCardStyle = (eventIndex) => {
        const offset = getCircularOffset(eventIndex)
        const distance = Math.abs(offset)

        const scales = [1, 0.84, 0.68, 0.55]
        const scale = scales[distance] ?? 0.45

        return {
            '--card-x': `${offset * 125}px`,
            '--card-x-mobile': `${offset * 92}px`,
            '--card-y': `${distance * 13}px`,
            '--card-scale': scale,
            '--card-rotation': `${-offset * 11}deg`,
            opacity: distance > 3 ? 0 : 1 - Math.min(distance * 0.13, 0.45),
            zIndex: events.length - distance,
        }
    }

    const selectAdjacentEvent = (direction) => {
        const nextIndex =
            (activeIndex + direction + events.length) % events.length

        setSelectedEventId(events[nextIndex]._id)
    }

    return (
        <section className="home-stage featured-stage">
            <div className="home-stage__inner featured-stage__inner">

                {/* Section introduction */}
                <header className="featured-stage__header">
                    <p className="home-kicker">
                        THIS SEASON'S SPOTLIGHT
                    </p>

                    <h2 className="home-title">
                        Featured
                        <em className="serif-accent"> event.</em>
                    </h2>

                    <p className="home-lede">
                        One highlight from the fest. Explore the event
                        collection below and bring another experience
                        into focus.
                    </p>
                </header>

                {/* Main featured event */}
                <article
                    key={featuredEvent._id}
                    className="featured-spotlight"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {featuredEvent.imageUrl ? (
                        <img
                            src={featuredEvent.imageUrl}
                            alt={featuredEvent.title}
                            className="featured-spotlight__image"
                        />
                    ) : (
                        <div
                            className="featured-spotlight__fallback"
                            aria-hidden="true"
                        />
                    )}

                    <div
                        className="featured-spotlight__shade"
                        aria-hidden="true"
                    />

                    <div className="featured-spotlight__content">
                        <span className="featured-spotlight__eyebrow">
                            <span />
                            CURRENTLY IN THE SPOTLIGHT
                        </span>

                        <h3 className="featured-spotlight__title">
                            {featuredEvent.title}
                        </h3>

                        <div className="featured-spotlight__meta">
                            {featuredEvent.day && featuredEvent.date && (
                                <span>
                                    {featuredEvent.day} · {featuredEvent.date}
                                </span>
                            )}

                            {featuredEvent.time && (
                                <span>{featuredEvent.time}</span>
                            )}

                            {featuredEvent.location && (
                                <span>{featuredEvent.location}</span>
                            )}
                        </div>

                        {featuredEvent.description && (
                            <p className="featured-spotlight__description">
                                {featuredEvent.description}
                            </p>
                        )}

                        <Link
                            to={`/pricing/${featuredEvent._id}`}
                            className="btn-accent featured-spotlight__action"
                        >
                            View tickets
                            <span aria-hidden="true">↗</span>
                        </Link>
                    </div>

                    <span className="featured-spotlight__index" aria-hidden="true">
                        {String(activeIndex + 1).padStart(2, '0')}
                        <span> / {String(events.length).padStart(2, '0')}</span>
                    </span>
                </article>

                {/* Animated event carousel */}
                <div className="featured-rail-section">

                    <div className="featured-rail-section__heading">
                        <div>
                            <p className="home-kicker">
                                DISCOVER WHAT'S NEXT
                            </p>

                            <h3 className="featured-rail-section__title">
                                Explore the lineup
                            </h3>
                        </div>

                        <div className="featured-rail-section__controls">
                            <span className="featured-rail-section__count">
                                {String(events.length).padStart(2, '0')} EVENTS
                            </span>

                            <button
                                type="button"
                                onClick={() => selectAdjacentEvent(-1)}
                                disabled={events.length < 2}
                                aria-label="Previous event"
                                className="featured-carousel__arrow"
                            >
                                ←
                            </button>

                            <button
                                type="button"
                                onClick={() => selectAdjacentEvent(1)}
                                disabled={events.length < 2}
                                aria-label="Next event"
                                className="featured-carousel__arrow"
                            >
                                →
                            </button>
                        </div>
                    </div>

                    <div
                        className="featured-carousel"
                        role="group"
                        aria-label="Explore festival events"
                    >
                        {events.map((event, index) => {
                            const offset = getCircularOffset(index)
                            const distance = Math.abs(offset)
                            const isSelected = index === activeIndex
                            const isOnStage = distance <= 3

                            return (
                                <button
                                    key={event._id}
                                    type="button"
                                    onClick={() => setSelectedEventId(event._id)}
                                    aria-pressed={isSelected}
                                    aria-hidden={!isOnStage}
                                    tabIndex={isOnStage ? 0 : -1}
                                    aria-label={`Select ${event.title}`}
                                    data-distance={distance}
                                    style={getCardStyle(index)}
                                    className={`featured-carousel__card ${isSelected ? 'is-active' : ''
                                        }`}
                                >
                                    {event.imageUrl ? (
                                        <img
                                            src={event.imageUrl}
                                            alt=""
                                            className="featured-carousel__image"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div
                                            className="featured-carousel__fallback"
                                            aria-hidden="true"
                                        />
                                    )}

                                    <div
                                        className="featured-carousel__shade"
                                        aria-hidden="true"
                                    />

                                    <div className="featured-carousel__copy">
                                        <div className="featured-carousel__topline">
                                            <span className="featured-carousel__number serif-accent">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>

                                            {isSelected && (
                                                <span className="featured-carousel__active-mark">
                                                    SELECTED
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <span className="featured-carousel__label">
                                                {isSelected
                                                    ? 'Currently featured'
                                                    : 'Explore event'}
                                            </span>

                                            <strong className="featured-carousel__title">
                                                {event.title}
                                            </strong>

                                            <span className="featured-carousel__date">
                                                {event.day} · {event.date}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <p className="featured-carousel__hint">
                        Select an event to bring it into focus
                    </p>

                </div>
            </div>
        </section>
    )
}

export default FeaturedEventSection
