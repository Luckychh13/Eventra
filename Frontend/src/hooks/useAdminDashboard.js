import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth.js'
import { getDashboardSummary } from '../services/api/dashboardService.js'

function useAdminDashboard() {
    const { user, loading: authLoading } = useAuth()
    const uid = user?.uid

    const [dashboardData, setDashboardData] = useState({
        uid: null,
        summary: null,
        error: '',
    })

    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        if (authLoading || !uid) return

        let isActive = true

        const fetchSummary = async () => {
            try {
                const response = await getDashboardSummary()

                if (isActive) {
                    setDashboardData({
                        uid,
                        summary: {
                            totalUsers: Number(response.totalUsers) || 0,
                            totalParticipants: Number(response.totalParticipants) || 0,
                            totalVotes: Number(response.totalVotes) || 0,
                            eventOrders: Number(response.eventOrders) || 0,
                            stallOrders: Number(response.stallOrders) || 0,
                            eventEarnings: Number(response.eventEarnings) || 0,
                            stallEarnings: Number(response.stallEarnings) || 0,
                            participantVotes: Array.isArray(response.participantVotes)
                                ? response.participantVotes
                                : [],
                        },
                        error: '',
                    })
                }
            } catch (error) {
                if (isActive) {
                    setDashboardData({
                        uid,
                        summary: null,
                        error:
                            error.response?.data?.error ||
                            error.message ||
                            'Failed to fetch dashboard summary.',
                    })
                }
            }
        }

        fetchSummary()

        return () => {
            isActive = false
        }
    }, [uid, authLoading, refreshKey])

    const hasCurrentSummary =
        Boolean(uid) && dashboardData.uid === uid

    const summary = hasCurrentSummary
        ? dashboardData.summary
        : null

    const loading =
        authLoading ||
        (Boolean(uid) && !hasCurrentSummary)

    const error = hasCurrentSummary
        ? dashboardData.error
        : ''

    const refreshSummary = useCallback(() => {
        setRefreshKey((previousKey) => previousKey + 1)
    }, [])

    return {
        summary,
        loading,
        error,
        refreshSummary,
    }
}

export default useAdminDashboard