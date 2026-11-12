import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getIdTokenResult } from 'firebase/auth'
import useAuth from '../../hooks/useAuth.js'

function StallOwnerRoute() {
    const { user, loading } = useAuth()

    const [roleCheck, setRoleCheck] = useState({
        userId: null,
        isStallOwner: false,
        loading: true,
    })

    useEffect(() => {
        if (!user) return

        let isActive = true

        const checkStallOwnerRole = async () => {
            try {
                const tokenResult = await getIdTokenResult(user, true)

                if (isActive) {
                    setRoleCheck({
                        userId: user.uid,
                        isStallOwner:
                            tokenResult.claims.role === 'stallOwner',
                        loading: false,
                    })
                }
            } catch (error) {
                console.error(
                    'Failed to verify stall owner role:',
                    error
                )

                if (isActive) {
                    setRoleCheck({
                        userId: user.uid,
                        isStallOwner: false,
                        loading: false,
                    })
                }
            }
        }

        checkStallOwnerRole()

        return () => {
            isActive = false
        }
    }, [user])

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (roleCheck.loading || roleCheck.userId !== user.uid) {
        return <h1>Verifying stall owner access...</h1>
    }

    if (!roleCheck.isStallOwner) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default StallOwnerRoute