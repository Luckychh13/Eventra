import { useEffect, useState } from 'react'
import { getAnnouncements } from '../../services/api/announcementService.js'

function AnnouncementsSection() {
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isActive = true

        const fetchAnnouncements = async () => {
            try {
                setLoading(true)
                setError('')

                const data = await getAnnouncements()

                if (isActive) {
                    setAnnouncements(data)
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        'Failed to fetch announcements. Please try again.'
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        fetchAnnouncements()

        return () => {
            isActive = false
        }
    }, [])

    if (loading) {
        return <p>Loading announcements...</p>
    }

    if (error) {
        return <p role="alert">{error}</p>
    }

    if (announcements.length === 0) {
        return <p>No announcements are available right now.</p>
    }

    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-bold">
                    Latest Announcements
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {announcements.map((announcement) => (
                        <article
                            key={announcement._id}
                            className="rounded-lg border border-gray-700 p-4"
                        >
                            <h3 className="text-lg font-semibold">
                                {announcement.title}
                            </h3>

                            <p className="mt-2">
                                {announcement.message}
                            </p>

                            <p className="mt-3 text-sm text-gray-400">
                                Posted by {announcement.createdBy || 'Admin'}
                            </p>

                            {announcement.createdAt && (
                                <p className="mt-1 text-sm text-gray-400">
                                    {new Date(
                                        announcement.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default AnnouncementsSection