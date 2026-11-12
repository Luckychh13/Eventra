import { useEffect, useState } from 'react'
import { getStallById } from '../services/api/stallService.js'

function useStall(stallId) {
    const [stallData, setStallData] = useState({
        stallId: null,
        stall: null,
        error: '',
    })

    useEffect(() => {
        if (!stallId) return

        let isActive = true

        const fetchStall = async () => {
            try {
                const data = await getStallById(stallId)

                if (!data || !data._id) {
                    throw new Error('Stall not found.')
                }

                if (isActive) {
                    setStallData({
                        stallId,
                        stall: data,
                        error: '',
                    })
                }
            } catch (err) {
                if (isActive) {
                    setStallData({
                        stallId,
                        stall: null,
                        error:
                            err.response?.data?.message ||
                            err.message ||
                            'Failed to fetch stall details.',
                    })
                }
            }
        }

        fetchStall()

        return () => {
            isActive = false
        }
    }, [stallId])

    const hasCurrentStall = Boolean(stallId) &&
        stallData.stallId === stallId

    return {
        stall: hasCurrentStall ? stallData.stall : null,
        loading: Boolean(stallId) && !hasCurrentStall,
        error: !stallId
            ? 'Invalid stall ID.'
            : hasCurrentStall
                ? stallData.error
                : '',
    }
}

export default useStall