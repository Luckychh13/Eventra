import { useState } from 'react'
import {
    Link,
    Navigate,
    useLocation,
    useNavigate,
} from 'react-router-dom'
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    reload,
    signOut,
    sendEmailVerification,
} from 'firebase/auth'
import { auth } from '../../services/firebase/firebase.js'
import useAuth from '../../hooks/useAuth.js'


function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const successMessage = location.state?.message ?? ''

    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [showPassword, setShowPassword] = useState(false)

    const [needsVerification, setNeedsVerification] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        setNeedsVerification(false)
        setStatusMessage('')
        setError('')
        setIsSubmitting(true)

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email.trim(),
                formData.password
            )

            const signedInUser = userCredential.user

            await reload(signedInUser)

            if (!signedInUser.emailVerified) {
                await signOut(auth)

                setNeedsVerification(true)
                setStatusMessage('Please verify your email address before logging in. Check your inbox for the verification link.')

                return
            }

            navigate('/', { replace: true })

        } catch (error) {
            console.error('Login failed:', error)

            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setError('Invalid email or password.')
                    break

                case 'auth/user-disabled':
                    setError('This account has been disabled.')
                    break

                case 'auth/too-many-requests':
                    setError('Too many attempts. Please try again later.')
                    break

                case 'auth/network-request-failed':
                    setError('Network error. Please check your connection.')
                    break

                default:
                    setError('Unable to log in. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError('')
        setIsSubmitting(true)

        try {
            const provider = new GoogleAuthProvider()

            await signInWithPopup(auth, provider)
            navigate('/', { replace: true })

        } catch (error) {
            console.error('Google sign-in failed:', error)

            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    setError('Google sign-in was cancelled.')
                    break

                case 'auth/popup-blocked':
                    setError('Your browser blocked the Google sign-in popup.')
                    break

                case 'auth/operation-not-allowed':
                    setError('Google sign-in is not enabled for this application.')
                    break

                case 'auth/network-request-failed':
                    setError('Network error. Please check your connection.')
                    break

                case 'auth/account-exists-with-different-credential':
                    setError('An account already exists with this email using another sign-in method.')
                    break

                default:
                    setError('Google sign-in failed. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleResendVerification = async () => {
        setError('')
        setStatusMessage('')
        setIsResending(true)

        let resendUser = null

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email.trim(),
                formData.password
            )

            resendUser = userCredential.user

            await reload(resendUser)

            if (resendUser.emailVerified) {
                setNeedsVerification(false)
                setStatusMessage('Your email is already verified. You can log in now.')
                return
            }

            await sendEmailVerification(resendUser)

            setStatusMessage(
                `A new verification email has been sent to ${resendUser.email}.`
            )

        } catch (error) {
            console.error('Resending verification email failed:', error)

            switch (error.code) {
                case 'auth/invalid-credential':
                    setError('Invalid email or password. Please try again.')
                    break

                case 'auth/too-many-requests':
                    setError('Too many attempts. Please try again later.')
                    break

                case 'auth/network-request-failed':
                    setError('Network error. Please check your connection.')
                    break

                default:
                    setError('Unable to resend verification email. Please try again.')
            }
        } finally {
            if (resendUser && auth.currentUser?.uid === resendUser.uid) {
                try {
                    await signOut(auth)
                } catch (signOutError) {
                    console.error('Failed to sign out after resending:', signOutError)
                }
            }

            setIsResending(false)
        }
    }

    if (loading) {
        return <h1>Checking authentication...</h1>
    }

    if (user?.emailVerified && !isSubmitting && !isResending) {
        return <Navigate to="/" replace />
    }

    return (
        <main className="flex min-h-[80vh] items-center justify-center bg-eventra-black px-4 py-12 text-white">
            <section className="w-full max-w-md rounded-2xl border border-white/10 bg-eventra-dark p-7 shadow-2xl sm:p-10">

                {/* Heading */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-eventra-purple to-eventra-coral">
                        <span className="font-display text-xl font-extrabold">E</span>
                    </div>

                    <h1 className="font-display text-3xl font-extrabold">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-sm text-white/60">
                        Log in to continue your Eventra journey.
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {successMessage && (
                        <p
                            role="status"
                            className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
                        >
                            {successMessage}
                        </p>
                    )}

                    {statusMessage && (
                        <p
                            role="status"
                            className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
                        >
                            {statusMessage}
                        </p>
                    )}

                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                        >
                            {error}
                        </p>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                            className="w-full rounded-lg border border-white/10 bg-eventra-black px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-eventra-purple focus:ring-2 focus:ring-eventra-purple/30"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-semibold"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                className="w-full rounded-lg border border-white/10 bg-eventra-black px-4 py-3 pr-16 text-white placeholder:text-white/40 outline-none transition focus:border-eventra-purple focus:ring-2 focus:ring-eventra-purple/30"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((previous) => !previous)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-eventra-lavender hover:text-white"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isResending}
                        className="w-full rounded-full bg-gradient-to-r from-eventra-purple to-eventra-coral py-3 font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Logging in...' : 'Log In'}
                    </button>

                    {needsVerification && (
                        <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={
                                isResending ||
                                isSubmitting ||
                                !formData.email.trim() ||
                                !formData.password
                            }
                            className="w-full rounded-full border border-eventra-purple py-3 font-semibold text-eventra-lavender transition hover:bg-eventra-purple/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isResending ? 'Sending verification email...' : 'Resend Verification Email'}
                        </button>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs text-white/50">OR</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* Google Login */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 py-3 font-medium transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="font-bold text-lg">G</span>

                        {isSubmitting ? 'Connecting...' : 'Continue with Google'}
                    </button>

                </form>

                {/* Signup Link */}
                <p className="mt-7 text-center text-sm text-white/60">
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className="font-semibold text-eventra-lavender hover:text-white hover:underline"
                    >
                        Sign up
                    </Link>
                </p>

            </section>
        </main>
    )
}

export default LoginPage