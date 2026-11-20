
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import useStall from '../../hooks/useStall.js'
import useStallCart from '../../hooks/useStallCart.js'
import { generateStallToken } from '../../services/api/stallService.js'
import './StallDetailsPage.css'

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
            <main className="stall-details-page">
                <div className="stall-details-state">
                    <span className="stall-details-loader" />
                    <p>Loading stall details...</p>
                </div>
            </main>
        )
    }

    if (stallError || !stall) {
        return (
            <main className="stall-details-page">
                <div className="stall-details-state" role="alert">
                    <span className="stall-details-state__icon">!</span>
                    <h1>Unable to load stall</h1>
                    <p>{stallError || 'Stall not found.'}</p>
                    <Link to="/stalls" className="stall-details-back-button">
                        Back to Stalls
                    </Link>
                </div>
            </main>
        )
    }

    const menuItems = Array.isArray(stall.menu)
        ? stall.menu
        : []

    return (
        <main className="stall-details-page">
            <div className="stall-details-container">
                <Link to="/stalls" className="stall-details-back">
                    <span aria-hidden="true">←</span>
                    Back to all stalls
                </Link>

                <section className="stall-details-hero">
                    {stall.imageUrl ? (
                        <img
                            src={stall.imageUrl}
                            alt={stall.name}
                            className="stall-details-hero__image"
                        />
                    ) : (
                        <div className="stall-details-hero__placeholder">
                            <span>✦</span>
                            <p>Welcome to our stall</p>
                        </div>
                    )}

                    <div className="stall-details-hero__overlay" />

                    <div className="stall-details-hero__content">
                        {stall.category && (
                            <span className="stall-details-category">
                                {stall.category}
                            </span>
                        )}

                        <h1>{stall.name}</h1>

                        {stall.location && (
                            <p className="stall-details-location">
                                <span aria-hidden="true">⌖</span>
                                {stall.location}
                            </p>
                        )}
                    </div>
                </section>

                {stall.description && (
                    <section className="stall-details-description">
                        <span className="stall-details-eyebrow">
                            ABOUT THIS STALL
                        </span>
                        <p>{stall.description}</p>
                    </section>
                )}

                <section className="stall-token-section">
                    <div className="stall-token-heading">
                        <div className="stall-token-icon">#</div>
                        <div>
                            <span className="stall-details-eyebrow">
                                SKIP THE WAIT
                            </span>
                            <h2>Get your queue token</h2>
                            <p>
                                Enter your details to receive a queue token for
                                this stall.
                            </p>
                        </div>
                    </div>

                    {tokenError && (
                        <p className="stall-form-error" role="alert">
                            {tokenError}
                        </p>
                    )}

                    <form
                        onSubmit={handleGenerateToken}
                        className="stall-token-form"
                    >
                        <div className="stall-form-field">
                            <label htmlFor="visitorName">Your Name</label>
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
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="stall-form-field">
                            <label htmlFor="visitorMobile">Mobile Number</label>
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
                                placeholder="Enter mobile number"
                            />
                        </div>

                        <div className="stall-form-field stall-form-field--full">
                            <label htmlFor="visitorEmail">Email (Optional)</label>
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
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="stall-form-field stall-form-field--full">
                            <button
                                type="submit"
                                disabled={tokenLoading}
                                className="stall-token-submit"
                            >
                                {tokenLoading
                                    ? 'Generating Token...'
                                    : 'Generate Queue Token'}
                                <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </form>

                    {generatedToken !== null && (
                        <div className="stall-token-success">
                            <span className="stall-token-success__label">
                                QUEUE TOKEN GENERATED
                            </span>
                            <p>Token Number</p>
                            <strong>{generatedToken}</strong>
                            <span>
                                Keep this number for your turn at the stall.
                            </span>
                        </div>
                    )}
                </section>

                <section className="stall-menu-section">
                    <div className="stall-menu-heading">
                        <div>
                            <span className="stall-details-eyebrow">
                                WHAT'S AVAILABLE
                            </span>
                            <h2>Explore the menu</h2>
                            <p>
                                Discover the items available at this stall.
                            </p>
                        </div>

                        {user && (
                            <Link
                                to={`/stall/${id}/cart`}
                                className="stall-view-cart"
                            >
                                <span aria-hidden="true">🛒</span>
                                View Cart
                                {cart?.items?.length > 0 &&
                                    ` (${cart.items.reduce(
                                        (total, item) =>
                                            total + Number(item.quantity || 0),
                                        0
                                    )})`}
                            </Link>
                        )}
                    </div>

                    {cartError && user && (
                        <p className="stall-inline-warning" role="alert">
                            Unable to load your cart: {cartError}
                        </p>
                    )}

                    {actionError && (
                        <p className="stall-inline-error" role="alert">
                            {actionError}
                        </p>
                    )}

                    {menuItems.length === 0 ? (
                        <div className="stall-menu-empty">
                            <span>✦</span>
                            <h3>No menu items available</h3>
                            <p>
                                This stall has not added any menu items yet.
                            </p>
                        </div>
                    ) : (
                        <div className="stall-menu-grid">
                            {menuItems.map((item, index) => {
                                const cartItem = cart?.items?.find(
                                    (cartItem) =>
                                        String(cartItem.itemId) ===
                                        String(item._id)
                                )

                                return (
                                    <article
                                        key={item._id || `${stall._id}-${index}`}
                                        className="stall-menu-card"
                                        style={{ '--menu-index': index }}
                                    >
                                        <div className="stall-menu-card__image-wrap">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="stall-menu-card__image"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="stall-menu-card__placeholder">
                                                    <span>✦</span>
                                                    <p>Image coming soon</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="stall-menu-card__body">
                                            <div className="stall-menu-card__title-row">
                                                <h3>{item.name}</h3>
                                                <span className="stall-menu-card__price">
                                                    {formatPrice(item.price)}
                                                </span>
                                            </div>

                                            {item.description && (
                                                <p className="stall-menu-card__description">
                                                    {item.description}
                                                </p>
                                            )}

                                            {cartItem && (
                                                <p className="stall-menu-card__quantity">
                                                    In your cart: {cartItem.quantity}
                                                </p>
                                            )}

                                            <div className="stall-menu-card__action">
                                                {authLoading ? (
                                                    <span className="stall-auth-checking">
                                                        Checking account...
                                                    </span>
                                                ) : user ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => addItem(item._id)}
                                                        disabled={cartLoading || actionLoading}
                                                        className="stall-add-button"
                                                    >
                                                        {actionLoading
                                                            ? 'Adding...'
                                                            : 'Add to Cart'}
                                                        <span aria-hidden="true">+</span>
                                                    </button>
                                                ) : (
                                                    <Link
                                                        to="/login"
                                                        className="stall-login-button"
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
            </div>
        </main>
    )
}

export default StallDetailsPage
