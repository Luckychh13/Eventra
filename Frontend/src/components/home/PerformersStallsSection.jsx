import { useEffect, useState } from 'react'
import { getPerformers } from '../../services/api/performerService.js'
import { getStalls } from '../../services/api/stallService.js'

function PerformersStallsSection() {
    const [performers, setPerformers] = useState([])
    const [stalls, setStalls] = useState([])

    const [performersLoading, setPerformersLoading] = useState(true)
    const [stallsLoading, setStallsLoading] = useState(true)

    const [performersError, setPerformersError] = useState('')
    const [stallsError, setStallsError] = useState('')

    useEffect(() => {
        let isActive = true

        const fetchPerformers = async () => {
            try {
                const data = await getPerformers()

                if (isActive) {
                    setPerformers(data)
                }
            } catch (err) {
                if (isActive) {
                    setPerformersError(
                        err.response?.data?.message ||
                        'Failed to fetch performers.'
                    )
                }
            } finally {
                if (isActive) {
                    setPerformersLoading(false)
                }
            }
        }

        const fetchStalls = async () => {
            try {
                const data = await getStalls()

                if (isActive) {
                    setStalls(data)
                }
            } catch (err) {
                if (isActive) {
                    setStallsError(
                        err.response?.data?.message ||
                        'Failed to fetch stalls.'
                    )
                }
            } finally {
                if (isActive) {
                    setStallsLoading(false)
                }
            }
        }

        fetchPerformers()
        fetchStalls()

        return () => {
            isActive = false
        }
    }, [])

    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-7xl space-y-12">

                {/* Performers */}
                <div>
                    <h2 className="mb-6 text-2xl font-bold">
                        Performers
                    </h2>

                    {performersLoading ? (
                        <p>Loading performers...</p>
                    ) : performersError ? (
                        <p role="alert">{performersError}</p>
                    ) : performers.length === 0 ? (
                        <p>No performers are available right now.</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {performers.map((performer) => (
                                <article
                                    key={performer._id}
                                    className="rounded-lg border border-gray-700 p-4"
                                >
                                    {performer.image && (
                                        <img
                                            src={performer.image}
                                            alt={performer.name}
                                            className="mb-4 h-48 w-full rounded-md object-cover"
                                        />
                                    )}

                                    <h3 className="text-lg font-semibold">
                                        {performer.name}
                                    </h3>

                                    <p>{performer.role}</p>
                                    <p>{performer.day}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stalls */}
                <div>
                    <h2 className="mb-6 text-2xl font-bold">
                        Stalls
                    </h2>

                    {stallsLoading ? (
                        <p>Loading stalls...</p>
                    ) : stallsError ? (
                        <p role="alert">{stallsError}</p>
                    ) : stalls.length === 0 ? (
                        <p>No stalls are available right now.</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {stalls.map((stall) => (
                                <article
                                    key={stall._id}
                                    className="rounded-lg border border-gray-700 p-4"
                                >
                                    {stall.imageUrl && (
                                        <img
                                            src={stall.imageUrl}
                                            alt={stall.name}
                                            className="mb-4 h-48 w-full rounded-md object-cover"
                                        />
                                    )}

                                    <h3 className="text-lg font-semibold">
                                        {stall.name}
                                    </h3>

                                    <p>{stall.category}</p>
                                    <p>{stall.location}</p>

                                    {stall.description && (
                                        <p className="mt-2 text-sm text-gray-400">
                                            {stall.description}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </section>
    )
}

export default PerformersStallsSection