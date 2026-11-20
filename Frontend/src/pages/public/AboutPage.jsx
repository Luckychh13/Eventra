
import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./AboutPage.css";

function AboutHeroSection() {
    return (
        <section className="about-hero">
            <div className="about-hero__glow about-hero__glow--one" />
            <div className="about-hero__glow about-hero__glow--two" />

            <div className="about-hero__content">
                <span className="about-eyebrow">The Story of Eventra</span>

                <h1>
                    Celebrating Talent,
                    <br />
                    Creativity, <span>&amp; Unity.</span>
                </h1>

                <p>
                    A celebration of ideas, talent, culture, and collaboration.
                    Discover the spirit behind our events and the people who make
                    every experience memorable.
                </p>

                <Link to="/eventSchedules" className="about-primary-button">
                    Discover Our Events <span>↗</span>
                </Link>
            </div>

            <div className="about-hero__bottom">
                <span>CREATIVITY</span>
                <span className="about-hero__bottom-line" />
                <span>COMMUNITY</span>
                <span className="about-hero__bottom-line" />
                <span>CELEBRATION</span>
            </div>
        </section>
    );
}

function EventDetailsSection() {
    const details = [
        {
            number: "01",
            title: "Dates",
            description:
                "Event dates and schedules are announced through the official event listings.",
        },
        {
            number: "02",
            title: "Location",
            description:
                "Venue information is shared with each event announcement.",
        },
        {
            number: "03",
            title: "Timings",
            description:
                "Check individual event schedules for performance and activity timings.",
        },
    ];

    const highlights = [
        "Main stage and live performances",
        "Cultural and creative activities",
        "Technology and innovation events",
        "Sports and interactive experiences",
        "Food, entertainment, and social spaces",
    ];

    return (
        <section className="about-section about-details">
            <div className="about-container">
                <div className="about-section-heading">
                    <span className="about-eyebrow about-eyebrow--light">
                        Plan Your Experience
                    </span>
                    <h2>
                        Event <span>Details.</span>
                    </h2>
                    <p>
                        Everything you need to know about the event experience.
                    </p>
                </div>

                <div className="about-details__grid">
                    {details.map((detail) => (
                        <article className="about-detail-card" key={detail.title}>
                            <span className="about-detail-card__number">
                                {detail.number}
                            </span>
                            <h3>{detail.title}</h3>
                            <p>{detail.description}</p>
                        </article>
                    ))}
                </div>

                <div className="about-highlights">
                    <div>
                        <span className="about-eyebrow">The Experience</span>
                        <h3>What to Expect</h3>
                        <p>
                            A little something for everyone, brought together
                            under one celebration.
                        </p>
                    </div>

                    <ul>
                        {highlights.map((highlight) => (
                            <li key={highlight}>
                                <span className="about-check">✦</span>
                                {highlight}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

function AboutDescriptionSection() {
    const highlights = [
        "Creative and cultural experiences",
        "Opportunities to showcase talent",
        "Collaboration and teamwork",
        "Memorable performances and activities",
    ];

    return (
        <section className="about-section about-story">
            <div className="about-container about-story__grid">
                <div className="about-story__content">
                    <span className="about-eyebrow about-eyebrow--light">
                        Our Story
                    </span>

                    <h2>
                        More Than Just an <span>Event.</span>
                    </h2>

                    <p>
                        Eventra brings people together through celebrations of
                        creativity, culture, innovation, and talent. It creates a
                        platform for participants to express themselves, explore new
                        interests, and connect with others.
                    </p>

                    <p>
                        From exciting performances to engaging activities, every
                        experience contributes to an atmosphere of enthusiasm,
                        teamwork, and shared memories.
                    </p>

                    <Link to="/gallery" className="about-text-link">
                        Explore the memories <span>↗</span>
                    </Link>
                </div>

                <div className="about-story-card">
                    <div className="about-story-card__decoration">✳</div>
                    <span className="about-eyebrow">Why Eventra?</span>
                    <h3>What Makes It Special?</h3>

                    <ul>
                        {highlights.map((highlight) => (
                            <li key={highlight}>
                                <span>✦</span>
                                {highlight}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

function PreviousEventsSection() {
    const experiences = [
        {
            number: "01",
            symbol: "✳",
            title: "Performances",
            description:
                "Live performances that bring energy, expression, and creativity to the stage.",
        },
        {
            number: "02",
            symbol: "◇",
            title: "Competitions",
            description:
                "Opportunities for participants to challenge themselves and showcase their abilities.",
        },
        {
            number: "03",
            symbol: "✦",
            title: "Celebrations",
            description:
                "Shared experiences that bring communities together through culture and collaboration.",
        },
    ];

    return (
        <section className="about-section about-experiences">
            <div className="about-container">
                <div className="about-section-heading">
                    <span className="about-eyebrow about-eyebrow--light">
                        Moments That Matter
                    </span>
                    <h2>
                        Moments Worth <span>Remembering.</span>
                    </h2>
                    <p>
                        A look at the experiences and activities that define
                        our celebrations.
                    </p>
                </div>

                <div className="about-experiences__grid">
                    {experiences.map((experience) => (
                        <article
                            className="about-experience-card"
                            key={experience.title}
                        >
                            <div className="about-experience-card__top">
                                <span>{experience.number}</span>
                                <span className="about-experience-card__symbol">
                                    {experience.symbol}
                                </span>
                            </div>

                            <h3>{experience.title}</h3>
                            <p>{experience.description}</p>
                        </article>
                    ))}
                </div>

                <div className="about-experiences__action">
                    <Link to="/gallery" className="about-primary-button">
                        Explore Gallery <span>↗</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}

function PrincipalSection() {
    return (
        <section className="about-section about-messages">
            <div className="about-container">
                <div className="about-section-heading">
                    <span className="about-eyebrow about-eyebrow--light">
                        Words That Inspire
                    </span>
                    <h2>
                        A Message from <span>Our Leaders.</span>
                    </h2>
                </div>

                <div className="about-messages__grid">
                    <article className="about-message-card">
                        <span className="about-message-card__quote">“</span>
                        <h3>
                            Chairman&apos;s <span>Message</span>
                        </h3>
                        <p>
                            Our annual fest stands as a true reflection of our
                            institution&apos;s values — creativity, unity, and excellence.
                            Each year, our students bring fresh ideas and immense
                            enthusiasm, turning this event into something extraordinary.
                            I congratulate every participant and organizer for their
                            dedication and passion.
                        </p>
                        <span className="about-message-card__role">
                            Chairman
                        </span>
                    </article>

                    <article className="about-message-card about-message-card--featured">
                        <span className="about-message-card__quote">“</span>
                        <h3>
                            Principal&apos;s <span>Message</span>
                        </h3>
                        <p>
                            Our fest is not just an event — it is a celebration of
                            passion, teamwork, and excellence. Watching our students
                            innovate, lead, and perform fills us with pride. This
                            festival brings the entire campus together and creates
                            memories that last a lifetime.
                        </p>
                        <span className="about-message-card__role">
                            Principal
                        </span>
                    </article>
                </div>
            </div>
        </section>
    );
}

function OrganizersSection() {
    const responsibilities = [
        {
            number: "01",
            title: "Event Coordination",
            description:
                "Planning activities and coordinating the overall event experience.",
        },
        {
            number: "02",
            title: "Cultural Activities",
            description:
                "Supporting performances, creative activities, and cultural programs.",
        },
        {
            number: "03",
            title: "Technical Operations",
            description:
                "Managing the technical arrangements required for event activities.",
        },
    ];

    return (
        <section className="about-section about-organizers">
            <div className="about-container">
                <div className="about-section-heading">
                    <span className="about-eyebrow about-eyebrow--light">
                        Behind the Scenes
                    </span>
                    <h2>
                        Meet the <span>Organizers.</span>
                    </h2>
                    <p>
                        The coordination and planning that help bring every
                        event together.
                    </p>
                </div>

                <div className="about-organizers__grid">
                    {responsibilities.map((item) => (
                        <article
                            className="about-organizer-card"
                            key={item.title}
                        >
                            <span className="about-organizer-card__number">
                                {item.number}
                            </span>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TeamLeadersSection() {
    return (
        <section className="about-final">
            <div className="about-final__glow" />

            <div className="about-final__content">
                <span className="about-eyebrow">The People Behind the Experience</span>

                <h2>
                    Together, We Make It <span>Happen.</span>
                </h2>

                <p>
                    Every successful event is built through teamwork, dedication,
                    creativity, and the contributions of everyone involved.
                </p>

                <Link to="/eventSchedules" className="about-primary-button">
                    Explore Events <span>↗</span>
                </Link>
            </div>
        </section>
    );
}

export default function AboutPage() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <main className="about-page">
            <AboutHeroSection />
            <EventDetailsSection />
            <AboutDescriptionSection />
            <PreviousEventsSection />
            <PrincipalSection />
            <OrganizersSection />
            <TeamLeadersSection />
        </main>
    );
}
