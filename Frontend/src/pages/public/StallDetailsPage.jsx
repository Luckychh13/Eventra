import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import useStall from '../../hooks/useStall.js'
import useStallCart from '../../hooks/useStallCart.js'
import { generateStallToken } from '../../services/api/stallService.js'

const formatPrice = (value) => {
    if (value === undefined || value === null || value === '') {
        return 'Price unavailable'
    }

    const amount = Number(value)

    if (!Number.isFinite(amount)) {
        return 'Price unavailable'
    }

    return `₹${amount.toLocaleString('en-IN')}`
}

function StallDetailsPage() {
    const { id } = useParams()

    const { user, loading: authLoading } = useAuth()

    const {
        stall,
        loading: stallLoading,
        error: stallError,
    } = useStall(id)

    const {
        cart,
        loading: cartLoading,
        error: cartError,
        actionError,
        actionLoading,
        addItem,
    } = useStallCart(id)

    const [visitorData, setVisitorData] = useState({
        visitorName: '',
        mobile: '',
        email: '',
    })

    const [tokenLoading, setTokenLoading] = useState(false)
    const [tokenError, setTokenError] = useState('')
    const [generatedToken, setGeneratedToken] = useState(null)

    const handleGenerateToken = async (event) => {
        event.preventDefault()

        setTokenError('')
        setGeneratedToken(null)

        if (!visitorData.visitorName.trim() || !visitorData.mobile.trim()) {
            setTokenError('Visitor name and mobile number are required.')
            return
        }

        setTokenLoading(true)

        try {
            const response = await generateStallToken(id, {
                visitorName: visitorData.visitorName.trim(),
                mobile: visitorData.mobile.trim(),
                email: visitorData.email.trim(),
            })

            if (!response?.success) {
                throw new Error(
                    response?.message || 'Failed to generate token.'
                )
            }

            setGeneratedToken(
                response.tokenNumber ?? response.token?.tokenNumber
            )

            setVisitorData({
                visitorName: '',
                mobile: '',
                email: '',
            })
        } catch (error) {
            setTokenError(
                error.response?.data?.message ||
                error.message ||
                'Unable to generate token. Please try again.'
            )
        } finally {
            setTokenLoading(false)
        }
    }

    if (stallLoading) {
        return (
            <main className="px-4 py-20 text-center text-gray-400">
                Loading stall details...
            </main>
        )
    }

    if (stallError || !stall) {
        return (
            <main className="mx-auto max-w-7xl px-4 py-16 text-center text-white">
                <h1 className="text-2xl font-bold">
                    Unable to load stall
                </h1>

                <p className="mt-3 text-sm text-red-400">
                    {stallError || 'Stall not found.'}
                </p>

                <Link
                    to="/stalls"
                    className="mt-6 inline-block rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium hover:bg-purple-700"
                >
                    Back to Stalls
                </Link>
            </main>
        )
    }

    const menuItems = Array.isArray(stall.menu)
        ? stall.menu
        : []

    return (
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 text-white sm:px-6 lg:px-8">

            <Link
                to="/stalls"
                className="text-sm text-gray-400 transition hover:text-white"
            >
                ← Back to Stalls
            </Link>

            {/* Stall information */}
            <section className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/5">

                {stall.imageUrl && (
                    <img
                        src={stall.imageUrl}
                        alt={stall.name}
                        className="h-64 w-full object-cover sm:h-80"
                    />
                )}

                <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold sm:text-4xl">
                            {stall.name}
                        </h1>

                        {stall.category && (
                            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                                {stall.category}
                            </span>
                        )}
                    </div>

                    {stall.location && (
                        <p className="mt-3 text-sm text-gray-400">
                            Location: {stall.location}
                        </p>
                    )}

                    {stall.description && (
                        <p className="mt-5 max-w-3xl leading-relaxed text-gray-300">
                            {stall.description}
                        </p>
                    )}
                </div>
            </section>

            {/* Queue Token */}
            <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-2xl font-bold">
                    Get Queue Token
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                    Enter your details to receive a queue token for this stall.
                </p>

                {tokenError && (
                    <p
                        role="alert"
                        className="mt-4 text-sm text-red-400"
                    >
                        {tokenError}
                    </p>
                )}

                <form
                    onSubmit={handleGenerateToken}
                    className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                    <div>
                        <label
                            htmlFor="visitorName"
                            className="mb-2 block text-sm text-gray-300"
                        >
                            Your Name
                        </label>

                        <input
                            id="visitorName"
                            type="text"
                            value={visitorData.visitorName}
                            onChange={(event) =>
                                setVisitorData((previous) => ({
                                    ...previous,
                                    visitorName: event.target.value,
                                }))
                            }
                            required
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="visitorMobile"
                            className="mb-2 block text-sm text-gray-300"
                        >
                            Mobile Number
                        </label>

                        <input
                            id="visitorMobile"
                            type="tel"
                            value={visitorData.mobile}
                            onChange={(event) =>
                                setVisitorData((previous) => ({
                                    ...previous,
                                    mobile: event.target.value,
                                }))
                            }
                            required
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
                            placeholder="Enter mobile number"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label
                            htmlFor="visitorEmail"
                            className="mb-2 block text-sm text-gray-300"
                        >
                            Email (Optional)
                        </label>

                        <input
                            id="visitorEmail"
                            type="email"
                            value={visitorData.email}
                            onChange={(event) =>
                                setVisitorData((previous) => ({
                                    ...previous,
                                    email: event.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={tokenLoading}
                            className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                        >
                            {tokenLoading
                                ? 'Generating Token...'
                                : 'Generate Queue Token'}
                        </button>
                    </div>
                </form>

                {generatedToken !== null && (
                    <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 p-5">
                        <p className="text-sm text-green-400">
                            Queue token generated successfully!
                        </p>

                        <p className="mt-2 text-3xl font-bold text-white">
                            Token Number: {generatedToken}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                            Keep this number for your turn at the stall.
                        </p>
                    </div>
                )}
            </section>

            {/* Menu section */}
            <section className="mt-12">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Menu
                        </h2>

                        <p className="mt-2 text-sm text-gray-400">
                            Explore the items available at this stall.
                        </p>
                    </div>

                    {user && (
                        <Link
                            to={`/stall/${id}/cart`}
                            className="rounded-lg border border-purple-500/50 px-4 py-2 text-sm font-medium text-purple-300 transition hover:bg-purple-500/10"
                        >
                            View Cart
                            {cart?.items?.length > 0 &&
                                ` (${cart.items.reduce(
                                    (total, item) => total + Number(item.quantity || 0),
                                    0
                                )})`}
                        </Link>
                    )}
                </div>

                {cartError && user && (
                    <p
                        role="alert"
                        className="mb-4 text-sm text-yellow-400"
                    >
                        Unable to load your cart: {cartError}
                    </p>
                )}

                {actionError && (
                    <p
                        role="alert"
                        className="mb-4 text-sm text-red-400"
                    >
                        {actionError}
                    </p>
                )}

                {menuItems.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-14 text-center">
                        <h3 className="text-lg font-semibold">
                            No menu items available
                        </h3>

                        <p className="mt-2 text-sm text-gray-400">
                            This stall has not added any menu items yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {menuItems.map((item, index) => {
                            const cartItem = cart?.items?.find(
                                (cartItem) =>
                                    String(cartItem.itemId) === String(item._id)
                            )

                            return (
                                <article
                                    key={item._id || `${stall._id}-${index}`}
                                    className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="h-48 w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center bg-white/5 text-sm text-gray-500">
                                            No image available
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-lg font-semibold">
                                                {item.name}
                                            </h3>

                                            <span className="shrink-0 font-semibold text-purple-300">
                                                {formatPrice(item.price)}
                                            </span>
                                        </div>

                                        {item.description && (
                                            <p className="mt-3 text-sm leading-relaxed text-gray-400">
                                                {item.description}
                                            </p>
                                        )}

                                        {cartItem && (
                                            <p className="mt-4 text-sm text-gray-300">
                                                In your cart: {cartItem.quantity}
                                            </p>
                                        )}

                                        <div className="mt-4">
                                            {authLoading ? (
                                                <span className="text-sm text-gray-400">
                                                    Checking account...
                                                </span>
                                            ) : user ? (
                                                <button
                                                    type="button"
                                                    onClick={() => addItem(item._id)}
                                                    disabled={cartLoading || actionLoading}
                                                    className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {actionLoading
                                                        ? 'Adding...'
                                                        : 'Add to Cart'}
                                                </button>
                                            ) : (
                                                <Link
                                                    to="/login"
                                                    className="block w-full rounded-lg border border-purple-500/50 px-4 py-2.5 text-center text-sm font-medium text-purple-300 transition hover:bg-purple-500/10"
                                                >
                                                    Login to Add to Cart
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            )
                        })}

                    </div>
                )}
            </section>
        </main>
    )
}

export default StallDetailsPage
