
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import HeroSection from '../../components/home/HeroSection.jsx'
import AnnouncementsSection from '../../components/home/AnnouncementsSection.jsx'
import PerformersStallsSection from '../../components/home/PerformersStallsSection.jsx'
import FeaturedEventSection from '../../components/home/FeaturedEventSection.jsx'
import EditorialSection from '../../components/home/EditorialSection.jsx'
import useEvents from '../../hooks/useEvents.js'

import './HomePage.css'

function HomePage() {
    const { events, loading, error } = useEvents()
    const location = useLocation()

    useEffect(() => {
        const sections = document.querySelectorAll('.home-reveal')

        if (!('IntersectionObserver' in window)) {
            sections.forEach((section) => {
                section.classList.add('is-visible')
            })
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible')
                    } else {
                        entry.target.classList.remove('is-visible')
                    }
                })
            },
            {
                threshold: 0.12,
                rootMargin: '-5% 0px -5% 0px',
            }
        )

        sections.forEach((section) => observer.observe(section))

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (location.hash !== '#performers') return

        const frameId = requestAnimationFrame(() => {
            document.getElementById('performers')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        })

        return () => cancelAnimationFrame(frameId)
    }, [location.pathname, location.hash])

    return (
        <main className="home-shell">
            <div className="home-shell__atmosphere" aria-hidden="true" />

            <div className="home-shell__stream">
                <div className="home-reveal">
                    <HeroSection />
                </div>

                <div className="home-reveal">
                    <FeaturedEventSection
                        events={events}
                        loading={loading}
                        error={error}
                    />
                </div>

                <div className="home-reveal">
                    <EditorialSection />
                </div>

                <div className="home-reveal">
                    <AnnouncementsSection />
                </div>

                <div className="home-reveal">
                    <PerformersStallsSection />
                </div>
            </div>
        </main>
    )
}

export default HomePage
