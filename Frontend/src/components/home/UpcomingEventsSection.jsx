import { Link } from 'react-router-dom'

function UpcomingEventsSection({ events, loading, error }) {
    if (loading) {
        return <p>Loading events...</p>
    }

    if (error) {
        return <p role="alert">{error}</p>
    }

    if (events.length === 0) {
        return <p>No events are currently available.</p>
    }

    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-bold">
                    Upcoming Events
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <article
                            key={event._id}
                            className="overflow-hidden rounded-lg border border-gray-700 p-4"
                        >
                            {event.imageUrl && (
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="mb-4 h-48 w-full rounded-md object-cover"
                                />
                            )}

                            <h3 className="text-lg font-semibold">
                                {event.title}
                            </h3>

                            <p>{event.day} · {event.date}</p>
                            <p>{event.time}</p>
                            <p>{event.location}</p>

                            {event.description && (
                                <p className="mt-2 text-sm text-gray-400">
                                    {event.description}
                                </p>
                            )}

                            <Link
                                to={`/pricing/${event._id}`}
                                className="mt-4 inline-block rounded border border-white/20 px-4 py-2"
                            >
                                View Tickets
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default UpcomingEventsSection