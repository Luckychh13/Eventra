
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getImages } from '../../services/api/imageService.js'
import './EditorialSection.css'

const editorialFrames = [
    {
        id: 'one',
        label: 'Stage lights',
        number: '01',
    },
    {
        id: 'two',
        label: 'Crowd energy',
        number: '02',
    },
    {
        id: 'three',
        label: 'Late nights',
        number: '03',
    },
]

function EditorialSection() {
    const sectionRef = useRef(null)

    const [isVisible, setIsVisible] = useState(false)
    const [galleryImages, setGalleryImages] = useState([])

    // Fetch images using the existing gallery API.
    useEffect(() => {
        let isActive = true

        const fetchGalleryImages = async () => {
            try {
                const data = await getImages()

                if (isActive) {
                    setGalleryImages(
                        Array.isArray(data)
                            ? data.filter((item) => item?.imageUrl)
                            : []
                    )
                }
            } catch (error) {
                console.error(
                    'Unable to load editorial gallery images:',
                    error
                )
            }
        }

        fetchGalleryImages()

        return () => {
            isActive = false
        }
    }, [])

    // Reveal the section when it enters the viewport.
    useEffect(() => {
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

        let animationFrameId

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    animationFrameId = requestAnimationFrame(() => {
                        setIsVisible(true)
                    })

                    observer.unobserve(entry.target)
                }
            },
            {
                threshold: 0.12,
            }
        )

        observer.observe(section)

        return () => {
            observer.disconnect()

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            className={`home-stage editorial-stage ${isVisible ? 'is-visible' : ''
                }`}
            aria-labelledby="editorial-heading"
        >
            <div
                className="editorial-stage__atmosphere"
                aria-hidden="true"
            />

            <div className="home-stage__inner editorial-stage__inner">

                {/* Editorial storytelling */}
                <div className="editorial-stage__copy">

                    <p className="home-kicker editorial-stage__eyebrow">
                        <span />
                        FOUNDED FOR CAMPUS NIGHTS
                    </p>

                    <h2
                        id="editorial-heading"
                        className="home-title editorial-stage__title"
                    >
                        Campus
                        <em className="serif-accent">
                            {' '}fest culture.
                        </em>
                    </h2>

                    <p className="home-lede editorial-stage__description">
                        Every festival begins with an idea and comes alive
                        through creativity, talent, friendships, and shared
                        nights. Eventra gathers those moments so campus life
                        is easier to discover.
                    </p>

                    <div className="editorial-stage__themes">
                        <span>CREATIVITY</span>
                        <span>COMMUNITY</span>
                        <span>EXPRESSION</span>
                    </div>

                    <Link
                        to="/gallery"
                        className="btn-ghost editorial-stage__action"
                    >
                        View gallery
                        <span aria-hidden="true">↗</span>
                    </Link>

                    <div className="editorial-stage__edition">
                        <span>EVENTRA JOURNAL</span>
                        <span>01 — 03</span>
                    </div>

                </div>

                {/* Gallery composition */}
                <div
                    className="editorial-stage__gallery"
                    aria-label="Festival gallery preview"
                >

                    {editorialFrames.map((frame, index) => {
                        const image = galleryImages[index]

                        return (
                            <article
                                key={frame.id}
                                className={`editorial-frame editorial-frame--${frame.id}`}
                            >

                                <div className="editorial-frame__visual">
                                    {image?.imageUrl ? (
                                        <img
                                            src={image.imageUrl}
                                            alt=""
                                            loading="lazy"
                                            className="editorial-frame__image"
                                        />
                                    ) : (
                                        <div
                                            className={`editorial-frame__fallback editorial-frame__fallback--${frame.id}`}
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>

                                <div
                                    className="editorial-frame__shade"
                                    aria-hidden="true"
                                />

                                <span className="editorial-frame__index">
                                    {frame.number}
                                </span>

                                <span className="editorial-frame__label">
                                    {frame.label}
                                </span>

                                {index === 1 && (
                                    <span className="editorial-frame__caption">
                                        MOMENTS THAT MATTER
                                    </span>
                                )}

                            </article>
                        )
                    })}

                </div>

            </div>
        </section>
    )
}

export default EditorialSection
