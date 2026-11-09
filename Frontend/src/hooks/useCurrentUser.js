import { useEffect, useState } from 'react'
import { getCurrentUser } from '../services/api/authService.js'

function useCurrentUser() {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isActive = true

        const fetchCurrentUser = async () => {
            try {
                const user = await getCurrentUser()

                if (isActive) {
                    setCurrentUser(user)
                }
            } catch (requestError) {
                if (isActive) {
                    setError(
                        requestError.response?.data?.error ||
                        'Unable to load account information.'
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        fetchCurrentUser()

        return () => {
            isActive = false
        }
    }, [])

    return { currentUser, loading, error }
}

export default useCurrentUser