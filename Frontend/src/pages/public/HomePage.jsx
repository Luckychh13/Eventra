import HeroSection from '../../components/home/HeroSection.jsx'
import UpcomingEventsSection from '../../components/home/UpcomingEventsSection.jsx'
import AnnouncementsSection from '../../components/home/AnnouncementsSection.jsx'
import PerformersStallsSection from '../../components/home/PerformersStallsSection.jsx'
import FeaturedEventSection from '../../components/home/FeaturedEventSection.jsx'
import EditorialSection from '../../components/home/EditorialSection.jsx'
import WhyEventraSection from '../../components/home/WhyEventraSection.jsx'

import useEvents from '../../hooks/useEvents.js'
function HomePage() {
    const { events, loading, error } = useEvents()

    return (
        <main>
            <HeroSection />
            <FeaturedEventSection
                events={events}
                loading={loading}
                error={error}
            />
            <UpcomingEventsSection
                events={events}
                loading={loading}
                error={error}
            />
            <EditorialSection />
            <WhyEventraSection />
            <AnnouncementsSection />
            <PerformersStallsSection />

        </main>
    )
}

export default HomePage