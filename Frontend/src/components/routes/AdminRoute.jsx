
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getIdTokenResult } from 'firebase/auth'
import useAuth from '../../hooks/useAuth.js'

function AdminRoute() {
    const { user, loading } = useAuth()

    const [roleCheck, setRoleCheck] = useState({
        userId: null,
        isAdmin: false,
        loading: true,
    })

    useEffect(() => {
        if (!user) return

        let isActive = true

        const checkAdminRole = async () => {
            try {
                const tokenResult = await getIdTokenResult(user, true)

                if (isActive) {
                    setRoleCheck({
                        userId: user.uid,
                        isAdmin: tokenResult.claims.role === 'admin',
                        loading: false,
                    })
                }
            } catch (error) {
                console.error('Failed to verify admin role:', error)

                if (isActive) {
                    setRoleCheck({
                        userId: user.uid,
                        isAdmin: false,
                        loading: false,
                    })
                }
            }
        }

        checkAdminRole()

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
        return <h1>Verifying admin access...</h1>
    }

    if (!roleCheck.isAdmin) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default AdminRoute
