import { useEffect } from "react";
import { Link } from "react-router-dom";

function AboutHeroSection() {
    return (
        <section className="relative overflow-hidden bg-gray-950 px-6 py-24 text-white sm:py-32">
            <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />

            <div className="relative mx-auto max-w-4xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-pink-400">
                    About Eventra
                </p>

                <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
                    Celebrating Talent, Creativity,{" "}
                    <span className="text-pink-400">&amp; Unity</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
                    A celebration of ideas, talent, culture, and collaboration.
                    Discover the spirit behind our events and the people who make
                    every experience memorable.
                </p>
            </div>
        </section>
    );
}

function EventDetailsSection() {
    const details = [
        {
            title: "Dates",
            description:
                "Event dates and schedules are announced through the official event listings.",
        },
        {
            title: "Location",
            description:
                "Venue information is shared with each event announcement.",
        },
        {
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
        <section className="bg-gray-900 px-6 py-20 text-white">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        Event <span className="text-pink-400">Details</span>
                    </h2>
                    <p className="mt-4 text-gray-400">
                        Everything you need to know about the event experience.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {details.map((detail) => (
                        <div
                            key={detail.title}
                            className="rounded-xl border border-white/10 bg-white/5 p-6"
                        >
                            <h3 className="text-xl font-semibold text-pink-400">
                                {detail.title}
                            </h3>
                            <p className="mt-3 leading-relaxed text-gray-300">
                                {detail.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
                    <h3 className="text-xl font-semibold">What to Expect</h3>
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                        {highlights.map((highlight) => (
                            <li key={highlight} className="flex gap-3 text-gray-300">
                                <span className="text-pink-400">✦</span>
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
        <section className="bg-gray-950 px-6 py-20 text-white">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-pink-400">
                        Our Story
                    </p>

                    <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                        More Than Just an <span className="text-pink-400">Event</span>
                    </h2>

                    <p className="mt-6 leading-relaxed text-gray-300">
                        Eventra brings people together through celebrations of
                        creativity, culture, innovation, and talent. It creates a
                        platform for participants to express themselves, explore new
                        interests, and connect with others.
                    </p>

                    <p className="mt-4 leading-relaxed text-gray-300">
                        From exciting performances to engaging activities, every
                        experience contributes to an atmosphere of enthusiasm,
                        teamwork, and shared memories.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/50 to-pink-900/30 p-8">
                    <h3 className="text-2xl font-bold">What Makes It Special?</h3>

                    <ul className="mt-6 space-y-4">
                        {highlights.map((highlight) => (
                            <li key={highlight} className="flex items-start gap-3">
                                <span className="mt-1 text-pink-400">✦</span>
                                <span className="text-gray-200">{highlight}</span>
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
            title: "Performances",
            description:
                "Live performances that bring energy, expression, and creativity to the stage.",
        },
        {
            title: "Competitions",
            description:
                "Opportunities for participants to challenge themselves and showcase their abilities.",
        },
        {
            title: "Celebrations",
            description:
                "Shared experiences that bring communities together through culture and collaboration.",
        },
    ];

    return (
        <section className="bg-gray-900 px-6 py-20 text-white">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        Moments Worth <span className="text-pink-400">Remembering</span>
                    </h2>
                    <p className="mt-4 text-gray-400">
                        A look at the experiences and activities that define our celebrations.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {experiences.map((experience) => (
                        <article
                            key={experience.title}
                            className="rounded-xl border border-white/10 bg-gray-950 p-7"
                        >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/10 text-2xl text-pink-400">
                                ✦
                            </div>
                            <h3 className="text-xl font-semibold">{experience.title}</h3>
                            <p className="mt-3 leading-relaxed text-gray-400">
                                {experience.description}
                            </p>
                        </article>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        to="/gallery"
                        className="inline-flex rounded-lg bg-pink-500 px-6 py-3 font-semibold text-white transition hover:bg-pink-600"
                    >
                        Explore Gallery
                    </Link>
                </div>
            </div>
        </section>
    );
}

function PrincipalSection() {
    return (
        <section className="bg-gray-950 px-6 py-20 text-white">
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-8">
                    <h2 className="text-2xl font-bold">
                        Chairman&apos;s <span className="text-pink-400">Message</span>
                    </h2>

                    <p className="mt-5 leading-relaxed text-gray-300">
                        Our annual fest stands as a true reflection of our institution&apos;s
                        values — creativity, unity, and excellence. Each year, our
                        students bring fresh ideas and immense enthusiasm, turning this
                        event into something extraordinary. I congratulate every
                        participant and organizer for their dedication and passion.
                    </p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-8">
                    <h2 className="text-2xl font-bold">
                        Principal&apos;s <span className="text-pink-400">Message</span>
                    </h2>

                    <p className="mt-5 leading-relaxed text-gray-300">
                        Our fest is not just an event — it is a celebration of passion,
                        teamwork, and excellence. Watching our students innovate, lead,
                        and perform fills us with pride. This festival brings the entire
                        campus together and creates memories that last a lifetime.
                    </p>
                </article>
            </div>
        </section>
    );
}

function OrganizersSection() {
    const responsibilities = [
        {
            title: "Event Coordination",
            description:
                "Planning activities and coordinating the overall event experience.",
        },
        {
            title: "Cultural Activities",
            description:
                "Supporting performances, creative activities, and cultural programs.",
        },
        {
            title: "Technical Operations",
            description:
                "Managing the technical arrangements required for event activities.",
        },
    ];

    return (
        <section className="bg-gray-900 px-6 py-20 text-white">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        Meet the <span className="text-pink-400">Organizers</span>
                    </h2>
                    <p className="mt-4 text-gray-400">
                        The coordination and planning that help bring every event together.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {responsibilities.map((item) => (
                        <article
                            key={item.title}
                            className="rounded-xl border border-white/10 bg-gray-950 p-7 text-center"
                        >
                            <h3 className="text-xl font-semibold text-pink-400">
                                {item.title}
                            </h3>
                            <p className="mt-3 leading-relaxed text-gray-400">
                                {item.description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TeamLeadersSection() {
    return (
        <section className="bg-gray-950 px-6 py-20 text-center text-white">
            <div className="mx-auto max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-widest text-pink-400">
                    The People Behind the Experience
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                    Together, We Make It <span className="text-pink-400">Happen</span>
                </h2>

                <p className="mt-5 leading-relaxed text-gray-300">
                    Every successful event is built through teamwork, dedication,
                    creativity, and the contributions of everyone involved.
                </p>

                <Link
                    to="/eventSchedules"
                    className="mt-8 inline-flex rounded-lg bg-pink-500 px-7 py-3 font-semibold text-white transition hover:bg-pink-600"
                >
                    Explore Events
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
        <>
            <AboutHeroSection />
            <EventDetailsSection />
            <AboutDescriptionSection />
            <PreviousEventsSection />
            <PrincipalSection />
            <OrganizersSection />
            <TeamLeadersSection />
        </>
    );
}
