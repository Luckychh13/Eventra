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
        setRefreshKey((previousKey) => previousKey + 1)
    }, [])

    return {
        orders,
        loading,
        error,
        refreshOrders,
    }
}

export default useUserStallOrders