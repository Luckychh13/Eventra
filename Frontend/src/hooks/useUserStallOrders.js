
import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth.js'
import { getUserStallOrders } from '../services/api/stallPaymentService.js'

function useUserStallOrders() {
    const { user, loading: authLoading } = useAuth()
    const uid = user?.uid

    const [ordersData, setOrdersData] = useState({
        uid: null,
        orders: [],
        error: '',
    })

    const [refreshKey, setRefreshKey] = useState(0)
    const [refreshing, setRefreshing] = useState(false)
    const [lastRefreshedAt, setLastRefreshedAt] = useState(null)

    useEffect(() => {
        if (authLoading || !uid) return

        let isActive = true

        const fetchOrders = async () => {
            try {
                const response = await getUserStallOrders(uid)

                if (!response?.success) {
                    throw new Error(
                        response?.error || 'Failed to fetch stall orders.'
                    )
                }

                if (isActive) {
                    setOrdersData({
                        uid,
                        orders: Array.isArray(response.orders)
                            ? response.orders
                            : [],
                        error: '',
                    })
                }
            } catch (error) {
                if (isActive) {
                    if (error.response?.status === 304) {
                        setOrdersData((previousData) => {
                            if (previousData.uid !== uid) {
                                return previousData
                            }

                            return {
                                ...previousData,
                                error: '',
                            }
                        })
                    } else {
                        setOrdersData({
                            uid,
                            orders: [],
                            error:
                                error.response?.data?.error ||
                                error.message ||
                                'Failed to fetch your stall orders.',
                        })
                    }
                }
            } finally {
                if (isActive) {
                    if (refreshKey > 0) {
                        setLastRefreshedAt(new Date())
                    }

                    setRefreshing(false)
                }
            }
        }

        fetchOrders()

        return () => {
            isActive = false
        }
    }, [uid, authLoading, refreshKey])

    const hasCurrentUserOrders =
        Boolean(uid) && ordersData.uid === uid

    const orders = hasCurrentUserOrders
        ? ordersData.orders
        : []

    const loading =
        authLoading ||
        (Boolean(uid) && !hasCurrentUserOrders)

    const error = hasCurrentUserOrders
        ? ordersData.error
        : ''

    const refreshOrders = useCallback(() => {
        if (authLoading || !uid) return

        setRefreshing(true)
        setRefreshKey((previousKey) => previousKey + 1)
    }, [authLoading, uid])

    return {
        orders,
        loading,
        error,
        refreshing,
        lastRefreshedAt,
        refreshOrders,
    }
}

export default useUserStallOrders
