
import { Link } from 'react-router-dom'
import './HeroSection.css'

function HeroSection() {
    return (
        <section
            className="home-stage home-stage--glass eventra-hero"
            aria-labelledby="eventra-hero-title"
        >
            {/* Atmospheric background */}
            <div className="eventra-hero__glow" aria-hidden="true" />
            <div className="eventra-hero__ring" aria-hidden="true" />
            <div className="eventra-hero__ambient-dot" aria-hidden="true" />

            {/* Top metadata */}
            <div className="eventra-hero__top">
                <p className="eventra-hero__meta">
                    <span className="eventra-hero__meta-dot" />
                    Campus fest · Live this season
                </p>

                <p className="eventra-hero__meta eventra-hero__meta--right">
                    Events · Performers · Stalls
                </p>
            </div>

            {/* Main headline */}
            <div className="eventra-hero__stage">
                <div className="eventra-hero__eyebrow">
                    <span />
                    A CELEBRATION OF CULTURE & CREATIVITY
                </div>

                <h1
                    id="eventra-hero-title"
                    className="eventra-hero__title"
                >
                    <span className="eventra-hero__line">
                        Grand
                        <em className="serif-accent"> fest.</em>
                    </span>

                    <span className="eventra-hero__line eventra-hero__line--split">
                        <span>Annual nights</span>

                        <span
                            className="eventra-hero__orb"
                            aria-hidden="true"
                        >
                            <span className="eventra-hero__orb-core">E</span>
                        </span>

                        <span>
                            with
                            <em className="serif-accent"> elite acts</em>
                        </span>
                    </span>

                    <span className="eventra-hero__line">
                        and top stalls.
                    </span>
                </h1>

                <p className="eventra-hero__brand">
                    EVENTRA
                </p>

                <p className="eventra-hero__description">
                    Discover the performances, experiences and moments
                    that bring our campus together.
                </p>
            </div>

            {/* Actions */}
            <div className="eventra-hero__bottom">
                <Link
                    to="/eventSchedules"
                    className="btn-solid eventra-hero__primary"
                >
                    Explore events
                    <span aria-hidden="true">↗</span>
                </Link>

                <Link
                    to="/stalls"
                    className="eventra-hero__ghost-link"
                >
                    Discover stalls
                    <span aria-hidden="true">→</span>
                </Link>
            </div>

            {/* Decorative bottom indicator */}
            <div
                className="eventra-hero__scroll-indicator"
                aria-hidden="true"
            >
                <span />
                SCROLL TO EXPLORE
            </div>
        </section>
    )
}

export default HeroSection
