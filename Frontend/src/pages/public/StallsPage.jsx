import { Link } from 'react-router-dom'
import useStalls from '../../hooks/useStalls.js'
import './StallsPage.css'

function StallsPage() {
    const { stalls, loading, error } = useStalls()

    return (
        <main className="stalls-page">
            <section className="stalls-hero">
                <div className="stalls-hero__content">
                    <span className="stalls-eyebrow">THE EVENT MARKETPLACE</span>
                    <h1>
                        Explore <span>Stalls.</span>
                    </h1>
                    <p>
                        Discover amazing stalls, explore their menus, and find
                        something worth experiencing.
                    </p>
                </div>

                <div className="stalls-hero__decoration" aria-hidden="true">
                    <span className="stalls-hero__orb stalls-hero__orb--one" />
                    <span className="stalls-hero__orb stalls-hero__orb--two" />
                    <span className="stalls-hero__orbit" />
                </div>
            </section>

            <section className="stalls-content">
                <div className="stalls-section-heading">
                    <div>
                        <span className="stalls-section-heading__eyebrow">
                            FIND YOUR FAVOURITE
                        </span>
                        <h2>Discover the stalls</h2>
                    </div>

                    {!loading && !error && stalls.length > 0 && (
                        <span className="stalls-count">
                            {stalls.length} {stalls.length === 1 ? 'STALL' : 'STALLS'}
                        </span>
                    )}
                </div>

                {loading && (
                    <div className="stalls-state">
                        <span className="stalls-loader" />
                        <p>Finding the best stalls for you...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="stalls-state stalls-state--error" role="alert">
                        <span className="stalls-state__icon">!</span>
                        <h3>Unable to load stalls</h3>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && stalls.length === 0 && (
                    <div className="stalls-state">
                        <span className="stalls-state__icon">✦</span>
                        <h3>No stalls available yet</h3>
                        <p>There are no stalls to explore right now. Check back soon!</p>
                    </div>
                )}

                {!loading && !error && stalls.length > 0 && (
                    <div className="stalls-grid">
                        {stalls.map((stall, index) => (
                            <article
                                key={stall._id}
                                className="stall-card"
                                style={{ '--stall-index': index }}
                            >
                                <div className="stall-card__image-wrap">
                                    {stall.imageUrl ? (
                                        <img
                                            src={stall.imageUrl}
                                            alt={stall.name}
                                            className="stall-card__image"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="stall-card__image-placeholder">
                                            <span>✦</span>
                                            <p>Image coming soon</p>
                                        </div>
                                    )}

                                    {stall.category && (
                                        <span className="stall-card__category">
                                            {stall.category}
                                        </span>
                                    )}
                                </div>

                                <div className="stall-card__body">
                                    <div className="stall-card__heading">
                                        <h3>{stall.name}</h3>
                                        {stall.location && (
                                            <span className="stall-card__location">
                                                <span aria-hidden="true">⌖</span>
                                                {stall.location}
                                            </span>
                                        )}
                                    </div>

                                    <p className="stall-card__description">
                                        {stall.description ||
                                            'Explore the available items at this stall.'}
                                    </p>

                                    <div className="stall-card__footer">
                                        <span className="stall-card__menu-count">
                                            <span aria-hidden="true">✧</span>
                                            {Array.isArray(stall.menu)
                                                ? `${stall.menu.length} menu items`
                                                : 'Menu available'}
                                        </span>

                                        <Link
                                            to={`/stall/${stall._id}`}
                                            className="stall-card__link"
                                        >
                                            Explore Stall
                                            <span aria-hidden="true">↗</span>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}

export default StallsPage