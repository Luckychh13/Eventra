
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getIdTokenResult, signOut } from 'firebase/auth'
import useAuth from '../../hooks/useAuth.js'
import { auth } from '../../services/firebase/firebase.js'

function Navbar() {
    const { user, loading } = useAuth()
    const { pathname } = useLocation()

    const [menuState, setMenuState] = useState({
        pathname,
        isOpen: false,
    })

    const [adminRole, setAdminRole] = useState({
        userId: null,
        isAdmin: false,
    })

    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [logoutError, setLogoutError] = useState('')

    const isMenuOpen =
        menuState.pathname === pathname && menuState.isOpen

    const isAdmin = Boolean(
        user &&
        adminRole.userId === user.uid &&
        adminRole.isAdmin
    )

    useEffect(() => {
        if (!user) return

        let isActive = true

        const checkAdminRole = async () => {
            try {
                const tokenResult = await getIdTokenResult(user, true)

                if (isActive) {
                    setAdminRole({
                        userId: user.uid,
                        isAdmin: tokenResult.claims.role === 'admin',
                    })
                }
            } catch (error) {
                console.error('Failed to verify admin role:', error)

                if (isActive) {
                    setAdminRole({
                        userId: user.uid,
                        isAdmin: false,
                    })
                }
            }
        }

        checkAdminRole()

        return () => {
            isActive = false
        }
    }, [user])

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

    return (
        <header className="eventra-navbar sticky top-0 z-50 border-b border-white/10 bg-eventra-black/80 px-4 py-3 text-white backdrop-blur-xl sm:px-6">
            <nav
                aria-label="Main navigation"
                className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-4"
            >
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

                <div className="hidden items-center gap-2 md:flex">
                    <Link
                        to="/leaderboard"
                        className={navItemClass}
                    >
                        Leaderboard
                    </Link>

                    {loading ? (
                        <span className="px-4 text-sm text-white/60">
                            Checking account...
                        </span>
                    ) : user ? (
                        <>
                            <Link
                                to="/bookings"
                                className={navItemClass}
                            >
                                My Bookings
                            </Link>

                            <Link
                                to="/stall-orders"
                                className={navItemClass}
                            >
                                My Stall Orders
                            </Link>

                            {isAdmin && (
                                <Link
                                    to="/dashboard"
                                    className={navItemClass}
                                >
                                    Admin Dashboard
                                </Link>
                            )}

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
                                className={`${navItemClass} ml-2 disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
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

            {isMenuOpen && (
                <div
                    id="eventra-mobile-navigation"
                    className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-eventra-dark p-4 shadow-2xl md:hidden"
                >
                    <div className="space-y-2">
                        <Link
                            to="/leaderboard"
                            onClick={closeMenu}
                            className={mobileNavItemClass}
                        >
                            Leaderboard
                        </Link>

                        {loading ? (
                            <p className="px-3 py-2 text-sm text-white/60">
                                Checking account...
                            </p>
                        ) : user ? (
                            <>
                                <div className="border-b border-white/10 px-3 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-eventra-muted">
                                        Signed in as
                                    </p>

                                    <p className="mt-1 truncate text-sm font-medium text-white">
                                        {user.displayName || user.email}
                                    </p>
                                </div>

                                {isAdmin && (
                                    <Link
                                        to="/dashboard"
                                        onClick={closeMenu}
                                        className={mobileNavItemClass}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}

                                <Link
                                    to="/bookings"
                                    onClick={closeMenu}
                                    className={mobileNavItemClass}
                                >
                                    My Bookings
                                </Link>

                                <Link
                                    to="/stall-orders"
                                    onClick={closeMenu}
                                    className={mobileNavItemClass}
                                >
                                    My Stall Orders
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className={`${mobileNavItemClass} disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </button>
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
