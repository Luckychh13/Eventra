
import { useEffect, useRef, useState } from 'react'
import { getAnnouncements } from '../../services/api/announcementService.js'
import './AnnouncementsSection.css'

function formatAnnouncementDate(value) {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

function AnnouncementsSection() {
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isVisible, setIsVisible] = useState(false)

    const sectionRef = useRef(null)

    // Fetch announcements.
    useEffect(() => {
        let isActive = true

        const fetchAnnouncements = async () => {
            try {
                setLoading(true)
                setError('')

                const data = await getAnnouncements()

                if (isActive) {
                    setAnnouncements(
                        Array.isArray(data) ? data : []
                    )
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        'Failed to fetch announcements. Please try again.'
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        fetchAnnouncements()

        return () => {
            isActive = false
        }
    }, [])

    // Reveal the section when it enters the viewport.
    useEffect(() => {
        if (loading || error || announcements.length === 0) return

        const section = sectionRef.current

        if (!section) return

        const prefersReducedMotion =
            window.matchMedia?.(
                '(prefers-reduced-motion: reduce)'
            ).matches ?? false

        if (
            prefersReducedMotion ||
            !('IntersectionObserver' in window)
        ) {
            const frameId = requestAnimationFrame(() => {
                setIsVisible(true)
            })

            return () => cancelAnimationFrame(frameId)
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(entry.target)
                }
            },
            {
                threshold: 0,
                rootMargin: '0px 0px -8% 0px',
            }
        )

        observer.observe(section)

        return () => observer.disconnect()
    }, [loading, error, announcements.length])

    // Loading state.
    if (loading) {
        return (
            <section className="home-stage announcements-stage">
                <p className="home-status">
                    Loading announcements...
                </p>
            </section>
        )
    }

    // Error state.
    if (error) {
        return (
            <section className="home-stage announcements-stage">
                <p className="home-status" role="alert">
                    {error}
                </p>
            </section>
        )
    }

    // Empty state.
    if (announcements.length === 0) {
        return (
            <section className="home-stage announcements-stage">
                <p className="home-status">
                    No announcements are available right now.
                </p>
            </section>
        )
    }

    const featuredAnnouncement = announcements[0]
    const remainingAnnouncements = announcements.slice(1)

    return (
        <section
            ref={sectionRef}
            className={`home-stage announcements-stage ${isVisible ? 'is-visible' : ''
                }`}
            aria-labelledby="announcements-heading"
        >
            <div className="home-stage__inner announcements-stage__inner">

                {/* Section introduction */}
                <header className="announcements-stage__intro">
                    <p className="home-kicker announcements-stage__eyebrow">
                        <span />
                        FESTIVAL BULLETIN
                    </p>

                    <h2
                        id="announcements-heading"
                        className="home-title announcements-stage__title"
                    >
                        Stay in the know
                        <em className="serif-accent">
                            {' '}with Eventra.
                        </em>
                    </h2>

                    <p className="home-lede">
                        Festival notices, schedule changes, and the
                        updates that keep the day running smoothly.
                    </p>
                </header>

                {/* Announcement board */}
                <div className="announcements-stage__board">

                    {/* Featured announcement */}
                    <article className="announcement-lead">

                        <div className="announcement-lead__decoration" aria-hidden="true" />

                        <div className="announcement-lead__content">

                            <p className="announcement-lead__label">
                                <span />
                                FEATURED NOTICE
                            </p>

                            <h3 className="announcement-lead__title">
                                {featuredAnnouncement.title}
                            </h3>

                            <p className="announcement-lead__message">
                                {featuredAnnouncement.message}
                            </p>

                        </div>

                        <div className="announcement-lead__footer">
                            <span>OFFICIAL EVENTRA UPDATE</span>

                            {featuredAnnouncement.createdAt && (
                                <time dateTime={featuredAnnouncement.createdAt}>
                                    {formatAnnouncementDate(
                                        featuredAnnouncement.createdAt
                                    )}
                                </time>
                            )}
                        </div>

                        <span
                            className="announcement-lead__number"
                            aria-hidden="true"
                        >
                            01
                        </span>

                    </article>

                    {/* Scrollable announcement list */}
                    <div
                        className="announcement-list"
                        role="region"
                        aria-label="More announcements"
                        tabIndex={0}
                    >
                        {remainingAnnouncements.length > 0 ? (
                            remainingAnnouncements.map((announcement, index) => (
                                <article
                                    key={announcement._id}
                                    className="announcement-row"
                                    style={{
                                        '--announcement-order': index,
                                    }}
                                >
                                    <div className="announcement-row__main">

                                        <div className="announcement-row__top">
                                            <p className="announcement-row__index">
                                                NOTICE {String(index + 2).padStart(2, '0')}
                                            </p>
                                        </div>

                                        <h3 className="announcement-row__title">
                                            {announcement.title}
                                        </h3>

                                        <p className="announcement-row__message">
                                            {announcement.message}
                                        </p>

                                        <span className="announcement-row__author">
                                            OFFICIAL EVENTRA UPDATE
                                        </span>

                                    </div>

                                    {announcement.createdAt && (
                                        <time
                                            className="announcement-row__date"
                                            dateTime={announcement.createdAt}
                                        >
                                            {formatAnnouncementDate(
                                                announcement.createdAt
                                            )}
                                        </time>
                                    )}
                                </article>
                            ))
                        ) : (
                            <div className="announcement-list__empty">
                                <span>✦</span>
                                <p>You're all caught up.</p>
                                <small>More festival updates will appear here.</small>
                            </div>
                        )}
                    </div>

                </div>

                {/* Section footer */}
                <div className="announcements-stage__footer">
                    <span>EVENTRA BULLETIN</span>

                    <span>
                        {String(announcements.length).padStart(2, '0')} UPDATES
                    </span>
                </div>

            </div>
        </section>
    )
}

export default AnnouncementsSection
