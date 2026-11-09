import { useEffect, useState } from 'react'
import { getEvents } from '../services/api/eventService.js'

function useEvents() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isActive = true

        const fetchEvents = async () => {
            try {
                setLoading(true)
                setError('')

                const data = await getEvents()

                if (isActive) {
                    setEvents(data)
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        'Failed to fetch events. Please try again.'
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        fetchEvents()

        return () => {
            isActive = false
        }
    }, [])

    return { events, loading, error }
}

export default useEvents