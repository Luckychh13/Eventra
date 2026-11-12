import { Link } from 'react-router-dom'
import useStalls from '../../hooks/useStalls.js'

function StallsPage() {
    const { stalls, loading, error } = useStalls()

    return (
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 text-white sm:px-6 lg:px-8">

            {/* Page heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold sm:text-4xl">
                    Explore Stalls
                </h1>

                <p className="mt-2 text-sm text-gray-400">
                    Discover stalls and explore their menus.
                </p>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="py-16 text-center text-gray-400">
                    Loading stalls...
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center"
                >
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && stalls.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
                    <h2 className="text-xl font-semibold">
                        No stalls available
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                        There are no stalls to explore right now.
                    </p>
                </div>
            )}

            {/* Stall listing */}
            {!loading && !error && stalls.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                    {stalls.map((stall) => (
                        <article
                            key={stall._id}
                            className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-purple-500/50"
                        >
                            {/* Stall image */}
                            {stall.imageUrl ? (
                                <img
                                    src={stall.imageUrl}
                                    alt={stall.name}
                                    className="h-52 w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-52 items-center justify-center bg-white/5 text-sm text-gray-500">
                                    No image available
                                </div>
                            )}

                            {/* Stall information */}
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-xl font-semibold">
                                        {stall.name}
                                    </h2>

                                    {stall.category && (
                                        <span className="shrink-0 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                                            {stall.category}
                                        </span>
                                    )}
                                </div>

                                {stall.location && (
                                    <p className="mt-2 text-sm text-gray-400">
                                        {stall.location}
                                    </p>
                                )}

                                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400">
                                    {stall.description ||
                                        'Explore the available items at this stall.'}
                                </p>

                                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                                    <span className="text-xs text-gray-400">
                                        {Array.isArray(stall.menu)
                                            ? `${stall.menu.length} menu items`
                                            : 'Menu available'}
                                    </span>

                                    <Link
                                        to={`/stall/${stall._id}`}
                                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-700"
                                    >
                                        View Stall
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}

                </div>
            )}
        </main>
    )
}

export default StallsPage