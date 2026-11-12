import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth.js'
import {
    getStallCart,
    addStallItemToCart,
    updateStallCartItem,
    deleteStallCartItem,
    clearStallCart as clearStallCartApi,
} from '../services/api/stallCartService.js'

function useStallCart(stallId) {
    const { user, loading: authLoading } = useAuth()
    const uid = user?.uid

    const [cartData, setCartData] = useState({
        uid: null,
        stallId: null,
        cart: null,
        error: '',
    })

    const [actionError, setActionError] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        if (authLoading || !uid || !stallId) return

        let isActive = true

        const fetchCart = async () => {
            try {
                const cart = await getStallCart({ uid, stallId })

                if (isActive) {
                    setCartData({
                        uid,
                        stallId,
                        cart,
                        error: '',
                    })
                }
            } catch (error) {
                if (isActive) {
                    setCartData({
                        uid,
                        stallId,
                        cart: {
                            items: [],
                            totalPrice: 0,
                        },
                        error:
                            error.response?.data?.message ||
                            'Failed to fetch stall cart.',
                    })
                }
            }
        }

        fetchCart()

        return () => {
            isActive = false
        }
    }, [uid, stallId, authLoading, refreshKey])

    const hasCurrentCart =
        Boolean(uid && stallId) &&
        cartData.uid === uid &&
        cartData.stallId === stallId

    const cart = hasCurrentCart
        ? cartData.cart
        : null

    const loading =
        authLoading ||
        (Boolean(uid && stallId) && !hasCurrentCart)

    const error = hasCurrentCart
        ? cartData.error
        : ''

    const addItem = useCallback(async (itemId) => {
        if (!uid || !stallId) {
            setActionError('Please log in to add items to your cart.')
            return
        }

        setActionError('')
        setActionLoading(true)

        try {
            const updatedCart = await addStallItemToCart({
                stallId,
                itemId,
            })

            setCartData({
                uid,
                stallId,
                cart: updatedCart,
                error: '',
            })

            return updatedCart
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                'Failed to add item to cart.'
            )
        } finally {
            setActionLoading(false)
        }
    }, [uid, stallId])

    const updateQuantity = useCallback(async (itemId, quantity) => {
        if (!uid || !stallId) return

        setActionError('')
        setActionLoading(true)

        try {
            const updatedCart = await updateStallCartItem({
                stallId,
                itemId,
                quantity,
            })

            setCartData({
                uid,
                stallId,
                cart: updatedCart,
                error: '',
            })

            return updatedCart
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                'Failed to update cart item.'
            )
        } finally {
            setActionLoading(false)
        }
    }, [uid, stallId])

    const removeItem = useCallback(async (itemId) => {
        if (!uid || !stallId) return

        setActionError('')
        setActionLoading(true)

        try {
            const updatedCart = await deleteStallCartItem({
                stallId,
                itemId,
            })

            setCartData({
                uid,
                stallId,
                cart: updatedCart,
                error: '',
            })

            return updatedCart
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                'Failed to remove cart item.'
            )
        } finally {
            setActionLoading(false)
        }
    }, [uid, stallId])

    const clearCart = useCallback(async () => {
        if (!uid || !stallId) return

        setActionError('')
        setActionLoading(true)

        try {
            await clearStallCartApi(stallId)

            setCartData({
                uid,
                stallId,
                cart: {
                    items: [],
                    totalPrice: 0,
                },
                error: '',
            })
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                'Failed to clear stall cart.'
            )
        } finally {
            setActionLoading(false)
        }
    }, [uid, stallId])

    const refreshCart = useCallback(() => {
        setRefreshKey((previousKey) => previousKey + 1)
    }, [])

    return {
        cart,
        loading,
        error,
        actionError,
        actionLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
    }
}

export default useStallCart