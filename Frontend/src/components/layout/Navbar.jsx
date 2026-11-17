
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import useAuth from '../../hooks/useAuth.js'
import { auth } from '../../services/firebase/firebase.js'

function Navbar() {
    const { user, loading } = useAuth()
    const { pathname } = useLocation()

    // A menu opened on a previous route is automatically considered closed.
    const [menuState, setMenuState] = useState({
        pathname,
        isOpen: false,
    })

    const isMenuOpen =
        menuState.pathname === pathname && menuState.isOpen

    const closeMenu = () => {
        setMenuState({
            pathname,
            isOpen: false,
        })
    }

    const toggleMenu = () => {
        setMenuState({
            pathname,
            isOpen: !isMenuOpen,
        })
    }

    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [logoutError, setLogoutError] = useState('')

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

    const navLinkClass =
        'rounded-full px-4 py-2 text-sm font-medium text-white/75 transition-all duration-300 hover:bg-white/10 hover:text-white'

    const actionButtonClass =
        'inline-flex items-center justify-center rounded-full bg-eventra-purple px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110'

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

                {/* Desktop navigation */}
                <div className="hidden items-center gap-2 md:flex">
                    {loading ? (
                        <span className="px-4 text-sm text-white/60">
                            Checking account...
                        </span>
                    ) : user ? (
                        <>
                            <Link to="/bookings" className={navLinkClass}>
                                My Bookings
                            </Link>

                            <Link to="/stall-orders" className={navLinkClass}>
                                My Stall Orders
                            </Link>

                            <span
                                className="ml-2 max-w-40 truncate border-l border-white/15 pl-4 text-sm text-white/70"
                                title={user.displayName || user.email}
                            >
                                {user.displayName || user.email}
                            </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="ml-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-eventra-coral hover:bg-eventra-coral/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={navLinkClass}>
                                Login
                            </Link>

                            <Link to="/signup" className={actionButtonClass}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <button
                    type="button"
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isMenuOpen}
                    aria-controls="eventra-mobile-navigation"
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
                >
                    <span className="flex w-5 flex-col gap-1.5">
                        <span
                            className={`h-0.5 w-full rounded-full bg-current transition-transform duration-300 ${isMenuOpen ? 'translate-y-2 rotate-45' : ''
                                }`}
                        />
                        <span
                            className={`h-0.5 w-full rounded-full bg-current transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'
                                }`}
                        />
                        <span
                            className={`h-0.5 w-full rounded-full bg-current transition-transform duration-300 ${isMenuOpen ? '-translate-y-2 -rotate-45' : ''
                                }`}
                        />
                    </span>
                </button>
            </nav>

            {/* Mobile navigation panel */}
            {isMenuOpen && (
                <div
                    id="eventra-mobile-navigation"
                    className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-eventra-dark p-4 shadow-2xl md:hidden"
                >
                    {loading ? (
                        <p className="py-3 text-sm text-white/60">
                            Checking account...
                        </p>
                    ) : user ? (
                        <div className="space-y-3">
                            <div className="border-b border-white/10 px-3 pb-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-eventra-muted">
                                    Signed in as
                                </p>
                                <p className="mt-1 truncate text-sm font-medium text-white">
                                    {user.displayName || user.email}
                                </p>
                            </div>

                            <Link
                                to="/bookings"
                                onClick={closeMenu}
                                className="block rounded-xl px-3 py-3 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                My Bookings
                            </Link>

                            <Link
                                to="/stall-orders"
                                onClick={closeMenu}
                                className="block rounded-xl px-3 py-3 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                My Stall Orders
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full rounded-xl border border-white/15 px-3 py-3 text-left text-sm font-semibold text-white transition-colors hover:border-eventra-coral hover:bg-eventra-coral/10 disabled:opacity-50"
                            >
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Link
                                to="/login"
                                onClick={closeMenu}
                                className="block rounded-xl px-3 py-3 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                Login
                            </Link>

                            <Link
                                to="/signup"
                                onClick={closeMenu}
                                className="block rounded-xl bg-eventra-purple px-3 py-3 text-center text-sm font-semibold text-white transition-colors hover:brightness-110"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {logoutError && (
                <p
                    role="alert"
                    className="mx-auto mt-3 max-w-7xl rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400"
                >
                    {logoutError}
                </p>
            )}
        </header>
    )
}

export default Navbar
