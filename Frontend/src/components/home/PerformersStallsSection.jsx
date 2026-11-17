
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPerformers } from '../../services/api/performerService.js'
import { getStalls } from '../../services/api/stallService.js'
import './PerformersStallsSection.css'

function PerformersStallsSection() {
    const [performers, setPerformers] = useState([])
    const [stalls, setStalls] = useState([])
    const [performersLoading, setPerformersLoading] = useState(true)
    const [stallsLoading, setStallsLoading] = useState(true)
    const [performersError, setPerformersError] = useState('')
    const [stallsError, setStallsError] = useState('')
    const railRef = useRef(null)

    useEffect(() => {
        let isActive = true

        const fetchPerformers = async () => {
            try {
                const data = await getPerformers()
                if (isActive) setPerformers(data)
            } catch (err) {
                if (isActive) {
                    setPerformersError(
                        err.response?.data?.message || 'Failed to fetch performers.'
                    )
                }
            } finally {
                if (isActive) setPerformersLoading(false)
            }
        }

        const fetchStalls = async () => {
            try {
                const data = await getStalls()
                if (isActive) setStalls(data)
            } catch (err) {
                if (isActive) {
                    setStallsError(
                        err.response?.data?.message || 'Failed to fetch stalls.'
                    )
                }
            } finally {
                if (isActive) setStallsLoading(false)
            }
        }

        fetchPerformers()
        fetchStalls()

        return () => {
            isActive = false
        }
    }, [])

    const scrollRail = (direction) => {
        const rail = railRef.current
        if (!rail) return

        rail.scrollBy({ left: direction * 320, behavior: 'smooth' })
    }

    return (
        <>
            <section id="performers" className="home-stage lineup-stage scroll-mt-24">
                <div className="home-stage__inner">
                    <header className="lineup-stage__header">
                        <div>
                            <p className="home-kicker">Exclusive to the fest</p>
                            <h2 className="home-title">
                                Private nights for
                                <em className="serif-accent"> unique energy.</em>
                            </h2>
                        </div>

                        {!performersLoading &&
                            !performersError &&
                            performers.length > 0 && (
                                <div className="lineup-stage__controls">
                                    <button
                                        type="button"
                                        className="lineup-nav"
                                        aria-label="Scroll performers left"
                                        onClick={() => scrollRail(-1)}
                                    >
                                        ←
                                    </button>

                                    <button
                                        type="button"
                                        className="lineup-nav"
                                        aria-label="Scroll performers right"
                                        onClick={() => scrollRail(1)}
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                    </header>

                    {performersLoading ? (
                        <p className="home-status">Loading performers...</p>
                    ) : performersError ? (
                        <p className="home-status" role="alert">
                            {performersError}
                        </p>
                    ) : performers.length === 0 ? (
                        <p className="home-status">
                            No performers are available right now.
                        </p>
                    ) : (
                        <div className="performer-rail" ref={railRef}>
                            {performers.map((performer, index) => (
                                <article
                                    key={performer._id}
                                    className={`performer-tile ${index % 2 === 0 ? 'is-tall' : ''
                                        }`}
                                >
                                    {performer.image ? (
                                        <img
                                            src={performer.image}
                                            alt={performer.name}
                                            className="performer-tile__image"
                                        />
                                    ) : (
                                        <div
                                            className="performer-tile__fallback"
                                            aria-hidden="true"
                                        />
                                    )}

                                    <div className="performer-tile__shade" />

                                    <div className="performer-tile__copy">
                                        <h3>{performer.name}</h3>
                                        <p>
                                            {[performer.role, performer.day]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="home-stage stalls-stage">
                <div className="home-stage__inner">
                    <header className="lineup-stage__header">
                        <div>
                            <p className="home-kicker">Around the grounds</p>
                            <h2 className="home-title">
                                Stalls
                                <em className="serif-accent"> worth finding.</em>
                            </h2>
                            <p className="home-lede">
                                Food, crafts, and festival favorites across campus.
                            </p>
                        </div>
                    </header>

                    {stallsLoading ? (
                        <p className="home-status">Loading stalls...</p>
                    ) : stallsError ? (
                        <p className="home-status" role="alert">
                            {stallsError}
                        </p>
                    ) : stalls.length === 0 ? (
                        <p className="home-status">
                            No stalls are available right now.
                        </p>
                    ) : (
                        <div className="stall-grid">
                            {stalls.map((stall) => (
                                <Link
                                    key={stall._id}
                                    to={`/stall/${stall._id}`}
                                    className="stall-tile"
                                    aria-label={`View details for ${stall.name}`}
                                >
                                    {stall.imageUrl ? (
                                        <img
                                            src={stall.imageUrl}
                                            alt={stall.name}
                                            className="stall-tile__image"
                                        />
                                    ) : (
                                        <div
                                            className="stall-tile__fallback"
                                            aria-hidden="true"
                                        />
                                    )}

                                    <div className="stall-tile__body">
                                        <h3>{stall.name}</h3>

                                        <p className="stall-tile__meta">
                                            {[stall.category, stall.location]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>

                                        {stall.description && (
                                            <p className="stall-tile__description">
                                                {stall.description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default PerformersStallsSection
