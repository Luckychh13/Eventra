import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents } from "../../services/api/eventService.js";
import "./EventSchedulePage.css";

const ORBIT_SPEED = 0.0035;
const SELECTION_SPEED = 0.15;
const MIN_SELECTION_SPEED = 0.025;
const ORBIT_INTERVAL = 32;

const FULL_CIRCLE = Math.PI * 2;
const FRONT_ANGLE = Math.PI / 2;
const LINEAR_LAYOUT_THRESHOLD = 6;

const getEventDay = (event) => event.day || "Other";

function EventScheduleHero() {
    return (
        <section className="event-schedule__hero">
            <div className="event-schedule__hero-content">
                <p className="event-schedule__eyebrow">
                    Discover What's Happening
                </p>

                <h1>
                    Experience the
                    <br />
                    <span>Festival of Excitement</span>
                </h1>

                <p className="event-schedule__hero-description">
                    Explore the festival schedule, discover unforgettable
                    performances, and plan your experience. Find the events
                    that inspire you and make every moment count.
                </p>
            </div>
        </section>
    );
}

function EventCard({
    event,
    navigate,
    onSelect,
    isSelected,
    style,
    linear = false,
}) {
    return (
        <article
            className={`event-schedule__card ${linear ? "event-schedule__card--linear" : ""} ${isSelected ? "is-selected" : ""}`}
            data-event-id={event._id}
            style={style}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelect(event)}
            onKeyDown={(keyEvent) => {
                if (keyEvent.target !== keyEvent.currentTarget) {
                    return;
                }

                if (
                    keyEvent.key === "Enter" ||
                    keyEvent.key === " "
                ) {
                    keyEvent.preventDefault();
                    onSelect(event);
                }
            }}
        >
            {event.imageUrl ? (
                <img
                    src={event.imageUrl}
                    alt={event.title || "Event"}
                    loading="lazy"
                    className="event-schedule__card-image"
                />
            ) : (
                <div className="event-schedule__card-placeholder">
                    No event image
                </div>
            )}

            <div className="event-schedule__card-overlay" />

            <div className="event-schedule__card-content">
                <span className="event-schedule__card-tag">
                    {event.day || "Festival Event"}
                </span>

                <h3>{event.title}</h3>

                <p className="event-schedule__card-description">
                    {event.description ||
                        "A memorable experience curated for inspiration, creativity, and innovation."}
                </p>

                <div className="event-schedule__card-meta">
                    <span>{event.time || "Time TBA"}</span>
                    <span>{event.date || "Date TBA"}</span>
                </div>

                <button
                    type="button"
                    className="event-schedule__card-button"
                    onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        navigate(`/pricing/${event._id}`);
                    }}
                >
                    Explore Event
                </button>
            </div>
        </article>
    );
}

function EventsSection() {
    const [events, setEvents] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [targetEventId, setTargetEventId] = useState(null);
    const [orbitAngle, setOrbitAngle] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(1200);
    const [isStageHovered, setIsStageHovered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const orbitAngleRef = useRef(0);
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

    useEffect(() => {
        const updateWidth = () => {
            setViewportWidth(window.innerWidth);
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);

        return () => {
            window.removeEventListener("resize", updateWidth);
        };
    }, []);

    const groupedByDay = events.reduce((accumulator, event) => {
        const day = getEventDay(event);

        if (!accumulator[day]) {
            accumulator[day] = [];
        }

        accumulator[day].push(event);

        return accumulator;
    }, {});

    const days = Object.keys(groupedByDay);

    const selectedDayEvents = selectedDay
        ? groupedByDay[selectedDay] || []
        : [];

    const visibleEvents = selectedDay
        ? selectedDayEvents
        : events;

    const isLinearLayout =
        (selectedDay !== null &&
            selectedDayEvents.length > LINEAR_LAYOUT_THRESHOLD) ||
        viewportWidth <= 700;

    useEffect(() => {
        if (
            selectedEventId ||
            isLinearLayout ||
            events.length === 0 ||
            (isStageHovered && !targetEventId)
        ) {
            return undefined;
        }

        const activeEvents = selectedDay
            ? events.filter(
                (event) => getEventDay(event) === selectedDay
            )
            : events;

        if (activeEvents.length === 0) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            const currentAngle = orbitAngleRef.current;
            let nextAngle = currentAngle + ORBIT_SPEED;

            if (targetEventId) {
                const targetIndex = activeEvents.findIndex(
                    (event) => event._id === targetEventId
                );

                if (targetIndex === -1) {
                    setTargetEventId(null);
                    return;
                }

                const anglePerEvent =
                    FULL_CIRCLE / activeEvents.length;

                const targetAngle =
                    (currentAngle + targetIndex * anglePerEvent) %
                    FULL_CIRCLE;

                const distanceToFront =
                    (FRONT_ANGLE - targetAngle + FULL_CIRCLE) %
                    FULL_CIRCLE;

                const movementSpeed = Math.min(
                    SELECTION_SPEED,
                    Math.max(
                        MIN_SELECTION_SPEED,
                        distanceToFront * 0.12
                    )
                );

                if (distanceToFront <= movementSpeed) {
                    nextAngle =
                        (currentAngle + distanceToFront) %
                        FULL_CIRCLE;

                    orbitAngleRef.current = nextAngle;
                    setOrbitAngle(nextAngle);
                    setSelectedEventId(targetEventId);
                    setTargetEventId(null);

                    return;
                }

                nextAngle = currentAngle + movementSpeed;
            }

            nextAngle %= FULL_CIRCLE;

            orbitAngleRef.current = nextAngle;
            setOrbitAngle(nextAngle);
        }, ORBIT_INTERVAL);

        return () => {
            window.clearInterval(interval);
        };
    }, [
        events,
        selectedDay,
        targetEventId,
        selectedEventId,
        isLinearLayout,
        isStageHovered,
    ]);

    useEffect(() => {
        if (!isLinearLayout || !selectedEventId) {
            return;
        }

        const selectedCard = document.querySelector(
            `[data-event-id="${selectedEventId}"]`
        );

        selectedCard?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [isLinearLayout, selectedEventId, selectedDay]);

    const handleDaySelection = (day) => {
        const dayEvents = groupedByDay[day] || [];

        if (dayEvents.length === 0) {
            return;
        }

        setSelectedDay(day);

        if (
            dayEvents.length > LINEAR_LAYOUT_THRESHOLD ||
            viewportWidth <= 700
        ) {
            setTargetEventId(null);
            setSelectedEventId(dayEvents[0]._id);
            return;
        }

        setSelectedEventId(null);
        setTargetEventId(dayEvents[0]._id);
    };

    const handleEventSelection = (event) => {
        if (
            selectedEventId === event._id &&
            !targetEventId
        ) {
            return;
        }

        const eventDay = getEventDay(event);
        const dayEvents = groupedByDay[eventDay] || [];

        setSelectedDay(eventDay);

        if (
            dayEvents.length > LINEAR_LAYOUT_THRESHOLD ||
            viewportWidth <= 700
        ) {
            setTargetEventId(null);
            setSelectedEventId(event._id);
            return;
        }

        setSelectedEventId(null);
        setTargetEventId(event._id);
    };

    const handleResumeOrbit = () => {
        setSelectedDay(null);
        setSelectedEventId(null);
        setTargetEventId(null);
    };

    const stageWidth = Math.min(
        Math.max(viewportWidth - 32, 0),
        1180
    );

    const radiusX = Math.max(
        0,
        Math.min(
            380,
            stageWidth * 0.36,
            (stageWidth - 220 - 32) / 2
        )
    );

    const radiusY = 165;

    return (
        <section className="event-schedule__showcase">
            <div className="event-schedule__showcase-heading">
                <p className="event-schedule__eyebrow">
                    Your Festival Journey
                </p>

                <h2>Explore the Events</h2>

                <p>
                    Select a day to explore its events, or choose any
                    event card to bring it into focus.
                </p>
            </div>

            {loading && (
                <p className="event-schedule__status">
                    Loading events...
                </p>
            )}

            {!loading && error && (
                <p className="event-schedule__status event-schedule__status--error">
                    {error}
                </p>
            )}

            {!loading && !error && events.length === 0 && (
                <p className="event-schedule__status">
                    No events are currently scheduled.
                </p>
            )}

            {!loading && !error && events.length > 0 && (
                <>
                    <div className="event-schedule__days">
                        {days.map((day, index) => {
                            const isSelected = selectedDay === day;
                            const firstEvent = groupedByDay[day][0];

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDaySelection(day)}
                                    aria-pressed={isSelected}
                                    className={`event-schedule__day ${isSelected ? "is-active" : ""}`}
                                >
                                    <span className="event-schedule__day-label">
                                        Day {index + 1}
                                    </span>

                                    <span className="event-schedule__day-date">
                                        {firstEvent?.date || "Date TBA"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {isLinearLayout ? (
                        <div className="event-schedule__linear">
                            <div className="event-schedule__linear-heading">
                                <span>
                                    {selectedDay
                                        ? `Events for ${selectedDay}`
                                        : "All Festival Events"}
                                </span>

                                <p>
                                    {selectedDay
                                        ? `Browse all ${selectedDayEvents.length} events scheduled for this day`
                                        : "Browse the complete festival schedule"}
                                </p>
                            </div>

                            <div className="event-schedule__linear-track">
                                {visibleEvents.map((event) => (
                                    <EventCard
                                        key={event._id}
                                        event={event}
                                        navigate={navigate}
                                        onSelect={handleEventSelection}
                                        isSelected={
                                            selectedEventId === event._id
                                        }
                                        linear
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div
                            className="event-schedule__orbit-stage"
                            onMouseEnter={() => setIsStageHovered(true)}
                            onMouseLeave={() => setIsStageHovered(false)}
                        >
                            <div className="event-schedule__orbit-ring" />

                            <div className="event-schedule__orbit-center">
                                <span>EVENTRA</span>

                                <p>
                                    {selectedEventId
                                        ? "Selected experience"
                                        : selectedDay
                                            ? `Events for ${selectedDay}`
                                            : "A world of experiences"}
                                </p>
                            </div>

                            {visibleEvents.map((event, index) => {
                                const angle =
                                    orbitAngle +
                                    (index * FULL_CIRCLE) /
                                    visibleEvents.length;

                                const isSelected =
                                    selectedEventId === event._id;

                                const x = isSelected
                                    ? 0
                                    : Math.cos(angle) * radiusX;

                                const y = isSelected
                                    ? 0
                                    : Math.sin(angle) * radiusY;

                                const depth =
                                    (Math.sin(angle) + 1) / 2;

                                const scale = isSelected
                                    ? 1.04
                                    : 0.8 + depth * 0.2;

                                const style = {
                                    left: `calc(50% + ${x}px)`,
                                    top: `calc(50% + ${y}px)`,
                                    zIndex: isSelected
                                        ? 200
                                        : Math.round(depth * 100),
                                    opacity: isSelected
                                        ? 1
                                        : 0.72 + depth * 0.28,
                                    transform: `translate(-50%, -50%) scale(${scale})`,
                                };

                                return (
                                    <EventCard
                                        key={event._id}
                                        event={event}
                                        navigate={navigate}
                                        onSelect={handleEventSelection}
                                        isSelected={isSelected}
                                        style={style}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {selectedEventId && (
                        <button
                            type="button"
                            className="event-schedule__resume"
                            onClick={handleResumeOrbit}
                        >
                            {isLinearLayout
                                ? "Show All Events"
                                : "Resume Orbit"}
                        </button>
                    )}
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
        <main className="event-schedule">
            <EventScheduleHero />
            <EventsSection />
        </main>
    );
}

export default EventSchedulePage;