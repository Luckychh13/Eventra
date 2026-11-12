import { useEffect, useState } from 'react'
import { getStalls } from '../services/api/stallService.js'

function useStalls() {
    const [stalls, setStalls] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isActive = true

        const fetchStalls = async () => {
            try {
                setLoading(true)
                setError('')

                const data = await getStalls()

                if (isActive) {
                    setStalls(Array.isArray(data) ? data : [])
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.response?.data?.message ||
                        'Failed to fetch stalls. Please try again.'
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        fetchStalls()

        return () => {
            isActive = false
        }
    }, [])

    return { stalls, loading, error }
}

export default useStalls
