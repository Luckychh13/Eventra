import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import useAuth from '../../hooks/useAuth.js'
import { auth } from '../../services/firebase/firebase.js'

function Navbar() {
    const { user, loading } = useAuth()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [logoutError, setLogoutError] = useState('')

    const handleLogout = async () => {
        setLogoutError('')
        setIsLoggingOut(true)

        try {
            await signOut(auth)
        } catch (error) {
            console.error('Failed to log out:', error)
            setLogoutError('Unable to log out. Please try again.')
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <header className="border-b border-white/10 bg-eventra-black px-6 py-5 text-white">
            <nav className="mx-auto flex max-w-7xl items-center justify-between">
                <Link to="/" className="font-display text-2xl font-extrabold">
                    Eventra
                </Link>

                <div className="flex items-center gap-4">
                    {loading ? (
                        <span>Checking account...</span>
                    ) : user ? (
                        <>
                            <span>
                                {user.displayName || user.email}
                            </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="rounded border border-white/20 px-4 py-2 disabled:opacity-50"
                            >
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </>
                    )}
                </div>
            </nav>

            {logoutError && (
                <p role="alert" className="mt-2 text-sm text-red-400">
                    {logoutError}
                </p>
            )}
        </header>
    )
}

export default Navbar