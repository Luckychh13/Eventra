
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    getIdTokenResult,
    sendPasswordResetEmail,
    signOut,
} from 'firebase/auth'
import useAuth from '../../hooks/useAuth.js'
import { auth } from '../../services/firebase/firebase.js'

function Navbar() {
    const { user, loading } = useAuth()
    const { pathname } = useLocation()

    const [menuState, setMenuState] = useState({
        pathname,
        isOpen: false,
    })

    const [accountRole, setAccountRole] = useState({
        userId: null,
        role: null,
    })

    const [accountMenuState, setAccountMenuState] = useState({
        pathname,
        isOpen: false,
    })

    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [logoutError, setLogoutError] = useState('')

    const [passwordResetMessage, setPasswordResetMessage] = useState('')
    const [passwordResetError, setPasswordResetError] = useState('')

    const isMenuOpen =
        menuState.pathname === pathname && menuState.isOpen

    const isAccountMenuOpen =
        accountMenuState.pathname === pathname &&
        accountMenuState.isOpen

    const currentRole =
        user && accountRole.userId === user.uid
            ? accountRole.role
            : null

    const isAdmin = currentRole === 'admin'
    const isStallOwner = currentRole === 'stallOwner'

    // Get the signed-in user's role from Firebase custom claims.
    useEffect(() => {
        if (!user) return

        let isActive = true

        const checkAccountRole = async () => {
            try {
                const tokenResult = await getIdTokenResult(user, true)

                if (isActive) {
                    setAccountRole({
                        userId: user.uid,
                        role: tokenResult.claims.role || null,
                    })
                }
            } catch (error) {
                console.error('Failed to verify account role:', error)

                if (isActive) {
                    setAccountRole({
                        userId: user.uid,
                        role: null,
                    })
                }
            }
        }

        checkAccountRole()

        return () => {
            isActive = false
        }
    }, [user])

    const closeMenu = () => {
        setMenuState({
            pathname,
            isOpen: false,
        })

        setAccountMenuState({
            pathname,
            isOpen: false,
        })
    }

    const toggleMenu = () => {
        setMenuState({
            pathname,
            isOpen: !isMenuOpen,
        })

        setAccountMenuState({
            pathname,
            isOpen: false,
        })
    }

    const toggleAccountMenu = () => {
        setAccountMenuState({
            pathname,
            isOpen: !isAccountMenuOpen,
        })
    }

    // Send a password reset email to the signed-in user's email address.
    const handlePasswordReset = async () => {
        setPasswordResetMessage('')
        setPasswordResetError('')

        if (!user?.email) {
            setPasswordResetError(
                'No email address found for this account.'
            )
            return
        }

        try {
            await sendPasswordResetEmail(auth, user.email)

            setPasswordResetMessage(
                `Password reset email sent to ${user.email}. Please check your inbox.`
            )

            closeMenu()
        } catch (error) {
            console.error('Password reset failed:', error)

            setPasswordResetError(
                'Unable to send the password reset email. Please try again.'
            )
        }
    }

    const handleLogout = async () => {
        setLogoutError('')
        setIsLoggingOut(true)

        try {
            await signOut(auth)
            closeMenu()
        } catch (error) {
            console.error('Failed to log out:', error)
            setLogoutError('Unable to log out. Please try again.')
        } finally {
            setIsLoggingOut(false)
        }
    }

    const navItemClass =
        'inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:text-white'

    const mobileNavItemClass =
        'block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-sm font-medium text-white/80 transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white'

    const accountMenuItemClass =
        'block w-full rounded-xl px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white'

    return (
        <header className="eventra-navbar sticky top-0 z-50 border-b border-white/10 bg-eventra-black/80 px-4 py-3 text-white backdrop-blur-xl sm:px-6">
            <nav
                aria-label="Main navigation"
                className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-4"
            >
                {/* Brand */}
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="group flex shrink-0 items-center gap-2.5"
                >
                    <span className="grid size-10 place-items-center rounded-xl bg-eventra-purple text-lg font-bold text-white shadow-lg shadow-eventra-purple/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                        E
                    </span>

                    <span className="font-display text-2xl font-extrabold tracking-tight text-white">
                        Eventra<span className="text-eventra-coral">.</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-2 lg:flex">
                    {loading ? (
                        <span className="px-4 text-sm text-white/60">
                            Checking account...
                        </span>
                    ) : user ? (
                        <>
                            <Link
                                to="/vote"
                                onClick={closeMenu}
                                className={navItemClass}
                            >
                                Vote
                            </Link>

                            <Link
                                to="/leaderboard"
                                onClick={closeMenu}
                                className={navItemClass}
                            >
                                Leaderboard
                            </Link>

                            <Link
                                to="/cart"
                                onClick={closeMenu}
                                className={navItemClass}
                            >
                                Cart
                            </Link>

                            {/* Role-specific dashboard */}
                            {isAdmin ? (
                                <Link
                                    to="/dashboard"
                                    onClick={closeMenu}
                                    className={navItemClass}
                                >
                                    Admin Dashboard
                                </Link>
                            ) : isStallOwner ? (
                                <Link
                                    to="/stall-dashboard"
                                    onClick={closeMenu}
                                    className={navItemClass}
                                >
                                    Stall Owner Dashboard
                                </Link>
                            ) : null}

                            {/* Account Dropdown */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={toggleAccountMenu}
                                    aria-expanded={isAccountMenuOpen}
                                    aria-haspopup="true"
                                    aria-controls="eventra-desktop-account-menu"
                                    className={navItemClass}
                                >
                                    My Account

                                    <span
                                        className={`ml-2 text-xs transition-transform duration-200 ${
                                            isAccountMenuOpen
                                                ? 'rotate-180'
                                                : ''
                                        }`}
                                    >
                                        ▾
                                    </span>
                                </button>

                                {isAccountMenuOpen && (
                                    <div
                                        id="eventra-desktop-account-menu"
                                        className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-56 rounded-2xl border border-white/10 !bg-[#171522] p-2 shadow-2xl"
                                    >
                                        <Link
                                            to="/account"
                                            onClick={closeMenu}
                                            className={accountMenuItemClass}
                                        >
                                            My Account
                                        </Link>

                                        <Link
                                            to="/bookings"
                                            onClick={closeMenu}
                                            className={accountMenuItemClass}
                                        >
                                            My Bookings
                                        </Link>

                                        <Link
                                            to="/stall-orders"
                                            onClick={closeMenu}
                                            className={accountMenuItemClass}
                                        >
                                            My Stall Orders
                                        </Link>

                                        <div className="my-2 border-t border-white/10" />

                                        <button
                                            type="button"
                                            onClick={handlePasswordReset}
                                            className={accountMenuItemClass}
                                        >
                                            Reset Password
                                        </button>

                                        <div className="my-2 border-t border-white/10" />

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className={`${accountMenuItemClass} text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50`}
                                        >
                                            {isLoggingOut
                                                ? 'Logging out...'
                                                : 'Logout'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={navItemClass}
                            >
                                Login
                            </Link>

                            <Link
                                to="/signup"
                                className={navItemClass}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    type="button"
                    onClick={toggleMenu}
                    aria-label={
                        isMenuOpen
                            ? 'Close navigation menu'
                            : 'Open navigation menu'
                    }
                    aria-expanded={isMenuOpen}
                    aria-controls="eventra-mobile-navigation"
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
                >
                    <span className="flex w-5 flex-col gap-1.5">
                        <span
                            className={`h-0.5 w-full rounded-full bg-current transition-transform duration-300 ${
                                isMenuOpen
                                    ? 'translate-y-2 rotate-45'
                                    : ''
                            }`}
                        />

                        <span
                            className={`h-0.5 w-full rounded-full bg-current transition-opacity duration-300 ${
                                isMenuOpen ? 'opacity-0' : 'opacity-100'
                            }`}
                        />

                        <span
                            className={`h-0.5 w-full rounded-full bg-current transition-transform duration-300 ${
                                isMenuOpen
                                    ? '-translate-y-2 -rotate-45'
                                    : ''
                            }`}
                        />
                    </span>
                </button>
            </nav>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div
                    id="eventra-mobile-navigation"
                    className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-eventra-dark p-4 shadow-2xl lg:hidden"
                >
                    <div className="space-y-2">
                        {loading ? (
                            <p className="px-3 py-2 text-sm text-white/60">
                                Checking account...
                            </p>
                        ) : user ? (
                            <>
                                {/* Main User Links */}
                                <Link
                                    to="/vote"
                                    onClick={closeMenu}
                                    className={mobileNavItemClass}
                                >
                                    Vote
                                </Link>

                                <Link
                                    to="/leaderboard"
                                    onClick={closeMenu}
                                    className={mobileNavItemClass}
                                >
                                    Leaderboard
                                </Link>

                                <Link
                                    to="/cart"
                                    onClick={closeMenu}
                                    className={mobileNavItemClass}
                                >
                                    Cart
                                </Link>

                                {/* Role-specific dashboard */}
                                {isAdmin ? (
                                    <Link
                                        to="/dashboard"
                                        onClick={closeMenu}
                                        className={mobileNavItemClass}
                                    >
                                        Admin Dashboard
                                    </Link>
                                ) : isStallOwner ? (
                                    <Link
                                        to="/stall-dashboard"
                                        onClick={closeMenu}
                                        className={mobileNavItemClass}
                                    >
                                        Stall Owner Dashboard
                                    </Link>
                                ) : null}

                                {/* Signed-in User */}
                                <div className="border-t border-white/10 px-3 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-eventra-muted">
                                        Signed in as
                                    </p>

                                    <p className="mt-1 truncate text-sm font-medium text-white">
                                        {user.displayName || user.email}
                                    </p>
                                </div>

                                {/* Mobile Account Dropdown */}
                                <button
                                    type="button"
                                    onClick={toggleAccountMenu}
                                    aria-expanded={isAccountMenuOpen}
                                    aria-haspopup="true"
                                    aria-controls="eventra-mobile-account-menu"
                                    className={`${mobileNavItemClass} flex items-center justify-between`}
                                >
                                    My Account

                                    <span
                                        className={`text-xs transition-transform duration-200 ${
                                            isAccountMenuOpen
                                                ? 'rotate-180'
                                                : ''
                                        }`}
                                    >
                                        ▾
                                    </span>
                                </button>

                                {isAccountMenuOpen && (
                                    <div
                                        id="eventra-mobile-account-menu"
                                        className="space-y-1 rounded-xl border border-white/10 !bg-[#171522] p-2"
                                    >
                                        <Link
                                            to="/account"
                                            onClick={closeMenu}
                                            className={accountMenuItemClass}
                                        >
                                            My Account
                                        </Link>

                                        <Link
                                            to="/bookings"
                                            onClick={closeMenu}
                                            className={accountMenuItemClass}
                                        >
                                            My Bookings
                                        </Link>

                                        <Link
                                            to="/stall-orders"
                                            onClick={closeMenu}
                                            className={accountMenuItemClass}
                                        >
                                            My Stall Orders
                                        </Link>

                                        <div className="my-2 border-t border-white/10" />

                                        <button
                                            type="button"
                                            onClick={handlePasswordReset}
                                            className={accountMenuItemClass}
                                        >
                                            Reset Password
                                        </button>

                                        <div className="my-2 border-t border-white/10" />

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className={`${accountMenuItemClass} text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50`}
                                        >
                                            {isLoggingOut
                                                ? 'Logging out...'
                                                : 'Logout'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={closeMenu}
                                    className={mobileNavItemClass}
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/signup"
                                    onClick={closeMenu}
                                    className={mobileNavItemClass}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Logout Error */}
            {logoutError && (
                <p
                    role="alert"
                    className="mx-auto mt-3 max-w-7xl rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400"
                >
                    {logoutError}
                </p>
            )}

            {/* Password Reset Feedback */}
            {passwordResetMessage && (
                <p
                    role="status"
                    className="mx-auto mt-3 max-w-7xl rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-400"
                >
                    {passwordResetMessage}
                </p>
            )}

            {passwordResetError && (
                <p
                    role="alert"
                    className="mx-auto mt-3 max-w-7xl rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400"
                >
                    {passwordResetError}
                </p>
            )}
        </header>
    )
}

export default Navbar
