import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth.js'
import { getOwnerDashboard } from '../services/api/stallService.js'

function useStallOwnerDashboard() {
    const { user, loading: authLoading } = useAuth()
    const uid = user?.uid

    const [dashboardData, setDashboardData] = useState({
        uid: null,
        dashboard: null,
        error: '',
    })

    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        if (authLoading || !uid) return

        let isActive = true

        const fetchDashboard = async () => {
            try {
                const response = await getOwnerDashboard()

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                        'Failed to fetch stall owner dashboard.'
                    )
                }

                if (isActive) {
                    setDashboardData({
                        uid,
                        dashboard: {
                            stalls: Array.isArray(response.stalls)
                                ? response.stalls
                                : [],
                            orders: Array.isArray(response.orders)
                                ? response.orders
                                : [],
                            totalEarnings: Number(response.totalEarnings) || 0,
                            orderCount: Number(response.orderCount) || 0,
                        },
                        error: '',
                    })
                }
            } catch (error) {
                if (isActive) {
                    setDashboardData({
                        uid,
                        dashboard: null,
                        error:
                            error.response?.data?.message ||
                            error.response?.data?.error ||
                            error.message ||
                            'Failed to fetch stall owner dashboard.',
                    })
                }
            }
        }

        fetchDashboard()

        return () => {
            isActive = false
        }
    }, [uid, authLoading, refreshKey])

    const hasCurrentDashboard =
        Boolean(uid) && dashboardData.uid === uid

    const dashboard = hasCurrentDashboard
        ? dashboardData.dashboard
        : null

    const loading =
        authLoading ||
        (Boolean(uid) && !hasCurrentDashboard)

    const error = hasCurrentDashboard
        ? dashboardData.error
        : ''

    const refreshDashboard = useCallback(() => {
        setRefreshKey((previousKey) => previousKey + 1)
    }, [])

    return {
        dashboard,
        loading,
        error,
        refreshDashboard,
    }
}

export default useStallOwnerDashboard