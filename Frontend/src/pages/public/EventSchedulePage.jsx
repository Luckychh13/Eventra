import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents } from "../../services/api/eventService.js";

function EventScheduleHero() {
    return (
        <section className="relative overflow-hidden bg-black px-6 pb-24 pt-8 text-white">
            {/* Background glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-pink-600/20 blur-[160px]" />
                <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-purple-700/20 blur-[180px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl text-center">
                <p className="mb-3 font-semibold uppercase tracking-[6px] text-pink-400">
                    // Event Schedule & Tickets //
                </p>

                <h1 className="mb-6 text-4xl font-extrabold leading-tight sm:text-6xl md:text-7xl">
                    Experience the
                    <br />
                    <span className="text-pink-500">
                        Festival of Excitement
                    </span>
                </h1>

                <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
                    Don't miss the most awaited events! Explore the
                    schedule, discover unforgettable performances, and
                    plan your festival experience.
                </p>

                <div className="mt-12 flex flex-wrap justify-center gap-6">
                    <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-600/10 via-purple-700/10 to-transparent px-8 py-6 backdrop-blur-sm">
                        <span className="mb-2 block text-3xl text-pink-400">
                            ◷
                        </span>
                        <h3 className="font-semibold text-white">
                            Event Schedule
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                            Explore every day
                        </p>
                    </div>

                    <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-700/10 via-pink-600/10 to-transparent px-8 py-6 backdrop-blur-sm">
                        <span className="mb-2 block text-3xl text-purple-400">
                            ⌖
                        </span>
                        <h3 className="font-semibold text-white">
                            Discover Events
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                            Find your experience
                        </p>
                    </div>

                    <div className="rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-600/10 via-purple-700/10 to-transparent px-8 py-6 backdrop-blur-sm">
                        <span className="mb-2 block text-3xl text-pink-400">
                            ◫
                        </span>
                        <h3 className="font-semibold text-white">
                            Book Tickets
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                            Reserve your place
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative sparkles */}
            <div className="absolute left-1/4 top-10 h-2 w-2 animate-ping rounded-full bg-pink-400" />
            <div className="absolute bottom-20 right-1/3 h-3 w-3 animate-ping rounded-full bg-purple-400" />
        </section>
    );
}

function EventsSection() {
    const [events, setEvents] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        let isActive = true;

        const fetchEvents = async () => {
            try {
                const data = await getEvents();

                if (isActive) {
                    setEvents(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        err.response?.data?.error ||
                        err.message ||
                        "Failed to load events."
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchEvents();

        return () => {
            isActive = false;
        };
    }, []);

    const groupedByDay = events.reduce((accumulator, event) => {
        const day = event.day || "Other";

        if (!accumulator[day]) {
            accumulator[day] = [];
        }

        accumulator[day].push(event);

        return accumulator;
    }, {});

    const days = Object.keys(groupedByDay);

    const activeDay =
        selectedDay && groupedByDay[selectedDay]
            ? selectedDay
            : days[0] || null;

    return (
        <section className="relative overflow-hidden bg-black py-20 text-white">

            {/* Background effects */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-pink-600/20 blur-[160px]" />
                <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-purple-700/20 blur-[180px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-pink-900/10 blur-3xl" />
            </div>

            {/* Section heading */}
            <div className="relative z-10 mb-16 px-4 text-center">
                <p className="text-sm uppercase tracking-widest text-pink-400">
                    // Event Schedule
                </p>

                <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                    Follow Our{" "}
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        Event Schedule
                    </span>
                </h2>
            </div>

            {/* Loading state */}
            {loading && (
                <p className="relative z-10 py-20 text-center text-gray-400">
                    Loading events...
                </p>
            )}

            {/* Error state */}
            {!loading && error && (
                <p className="relative z-10 py-20 text-center text-red-300">
                    {error}
                </p>
            )}

            {/* Empty state */}
            {!loading && !error && events.length === 0 && (
                <p className="relative z-10 py-20 text-center text-gray-400">
                    No events are currently scheduled.
                </p>
            )}

            {!loading && !error && events.length > 0 && (
                <>
                    {/* Day tabs */}
                    <div className="relative z-10 mb-16 flex flex-wrap justify-center gap-4 px-4 sm:gap-5">
                        {days.map((day, index) => {
                            const isSelected = activeDay === day;
                            const firstEvent = groupedByDay[day][0];

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => setSelectedDay(day)}
                                    aria-pressed={isSelected}
                                    className={`relative rounded-full px-7 py-4 text-base font-semibold shadow-md transition-all duration-300 sm:px-10 sm:py-5 sm:text-lg ${isSelected
                                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_25px_rgba(216,0,255,0.5)]"
                                        : "bg-[#12122a] text-gray-300 hover:bg-[#1c1c3a] hover:text-white"
                                        }`}
                                >
                                    <span className="flex flex-col items-center">
                                        <span>
                                            Day {index + 1}
                                        </span>

                                        <span
                                            className={`text-sm ${isSelected
                                                ? "text-gray-200"
                                                : "text-gray-500"
                                                }`}
                                        >
                                            {firstEvent?.date || "Date TBA"}
                                        </span>
                                    </span>

                                    {isSelected && (
                                        <span className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-pink-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Event timeline */}
                    <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">

                        {/* Central timeline line */}
                        <div className="absolute bottom-0 left-1/2 top-0 hidden w-[3px] -translate-x-1/2 bg-gradient-to-b from-pink-500 via-purple-500 to-transparent opacity-60 md:block" />

                        {groupedByDay[activeDay]?.map((event, index) => (
                            <div
                                key={event._id}
                                className="relative mb-16 grid grid-cols-1 items-center gap-6 md:mb-24 md:grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] md:gap-4"
                            >
                                {/* Event image */}
                                <div
                                    className={`group relative overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.25)] ${index % 2 === 0
                                        ? "md:col-start-3 md:row-start-1"
                                        : "md:col-start-1 md:row-start-1"
                                        }`}
                                >
                                    {event.imageUrl ? (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.title || "Event"}
                                            loading="lazy"
                                            className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-80"
                                        />
                                    ) : (
                                        <div className="flex h-72 w-full items-center justify-center bg-[#12122a] text-gray-500 md:h-80">
                                            No event image
                                        </div>
                                    )}
                                </div>

                                {/* Timeline connector */}
                                <div className="hidden items-center justify-center md:col-start-2 md:row-start-1 md:flex">
                                    <div className="z-10 h-8 w-8 animate-pulse rounded-full border-4 border-[#050512] bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_25px_rgba(216,0,255,0.8)]" />
                                </div>

                                {/* Event details */}
                                <div
                                    className={`rounded-3xl border border-purple-900/30 bg-[#0e0e26] p-6 shadow-xl transition-all duration-300 hover:border-pink-500/40 sm:p-8 ${index % 2 === 0
                                        ? "md:col-start-1 md:row-start-1"
                                        : "md:col-start-3 md:row-start-1"
                                        }`}
                                >
                                    <h3 className="mb-3 text-2xl font-bold tracking-wide text-white">
                                        {event.title}
                                    </h3>

                                    <p className="mb-6 leading-relaxed text-gray-400">
                                        {event.description ||
                                            "A memorable experience curated for inspiration, creativity, and innovation."}
                                    </p>

                                    <div className="mb-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <span className="text-pink-400">
                                                ◷
                                            </span>
                                            <span>
                                                {event.time || "Time TBA"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-400">
                                                ▦
                                            </span>
                                            <span>
                                                {event.date || "Date TBA"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-pink-400">
                                                ⌖
                                            </span>
                                            <span>
                                                {event.location || "Location TBA"}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/pricing/${event._id}`)
                                        }
                                        className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 font-semibold tracking-wide text-white shadow-[0_0_20px_rgba(216,0,255,0.4)] transition-all duration-300 hover:scale-105"
                                    >
                                        Buy Ticket
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

function EventSchedulePage() {
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, []);

    return (
        <>
            <EventScheduleHero />
            <EventsSection />
        </>
    );
}

export default EventSchedulePage;
