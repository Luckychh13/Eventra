import { useEffect, useState } from 'react'
import useAuth from './useAuth.js'
import {
    getCart,
    updateCartItem,
    removeCartItem,
} from '../services/api/cartService.js'

function useCart() {
    const { user, loading: authLoading } = useAuth()

    const [cartData, setCartData] = useState({
        uid: null,
        cart: null,
        error: '',
    })

    const [actionError, setActionError] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        if (authLoading || !user) return

        let isActive = true

        const fetchUserCart = async () => {
            try {
                const cartResponse = await getCart(user.uid)

                if (isActive) {
                    setCartData({
                        uid: user.uid,
                        cart: cartResponse,
                        error: '',
                    })
                }
            } catch (requestError) {
                if (isActive) {
                    setCartData({
                        uid: user.uid,
                        cart: null,
                        error:
                            requestError.response?.data?.error ||
                            'Unable to load your cart.',
                    })
                }
            }
        }

        fetchUserCart()

        return () => {
            isActive = false
        }
    }, [user, authLoading])

    const hasCurrentUserCart =
        Boolean(user) && cartData.uid === user.uid

    const cart = hasCurrentUserCart ? cartData.cart : null

    const loading =
        authLoading || (Boolean(user) && !hasCurrentUserCart)

    const error = hasCurrentUserCart ? cartData.error : ''

    const updateQuantity = async (pricingId, action) => {
        if (!user) return

        setActionError('')
        setActionLoading(true)

        try {
            const updatedCart = await updateCartItem({
                uid: user.uid,
                pricingId,
                action,
            })

            setCartData({
                uid: user.uid,
                cart: updatedCart,
                error: '',
            })
        } catch (requestError) {
            setActionError(
                requestError.response?.data?.error ||
                'Unable to update ticket quantity.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const removeItem = async (pricingId) => {
        if (!user) return

        setActionError('')
        setActionLoading(true)

        try {
            const updatedCart = await removeCartItem({
                uid: user.uid,
                pricingId,
            })

            setCartData({
                uid: user.uid,
                cart: updatedCart,
                error: '',
            })
        } catch (requestError) {
            setActionError(
                requestError.response?.data?.error ||
                'Unable to remove this ticket.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const refreshCart = async () => {
        if (!user) return

        try {
            const updatedCart = await getCart(user.uid)

            setCartData({
                uid: user.uid,
                cart: updatedCart,
                error: '',
            })
        } catch (requestError) {
            setActionError(
                requestError.response?.data?.error ||
                'Payment was verified, but the updated cart could not be loaded. Please refresh.'
            )
        }
    }

    return {
        cart,
        loading,
        error,
        actionError,
        actionLoading,
        updateQuantity,
        removeItem,
        refreshCart,
    }
}

export default useCart
