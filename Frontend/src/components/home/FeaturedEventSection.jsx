function FeaturedEventSection({ events, loading, error }) {
    if (loading) {
        return <p>Loading featured event...</p>
    }

    if (error) {
        return <p role="alert">{error}</p>
    }

    if (events.length === 0) {
        return null
    }

    const featuredEvent = events[0]

    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-bold">
                    Featured Event
                </h2>

                <article className="rounded-lg border border-gray-700 p-6">
                    {featuredEvent.imageUrl && (
                        <img
                            src={featuredEvent.imageUrl}
                            alt={featuredEvent.title}
                            className="mb-4 h-64 w-full rounded-md object-cover"
                        />
                    )}

                    <h3 className="text-xl font-bold">
                        {featuredEvent.title}
                    </h3>

                    <p className="mt-2">
                        {featuredEvent.day} · {featuredEvent.date}
                    </p>

                    <p>{featuredEvent.time}</p>
                    <p>{featuredEvent.location}</p>

                    {featuredEvent.description && (
                        <p className="mt-3 text-gray-400">
                            {featuredEvent.description}
                        </p>
                    )}
                </article>
            </div>
        </section>
    )
}

export default FeaturedEventSection