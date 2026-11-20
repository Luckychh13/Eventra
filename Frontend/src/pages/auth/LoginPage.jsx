
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
import './LoginPage.css'

function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
                setStatusMessage(
                    'Please verify your email address before logging in. Check your inbox for the verification link.'
                )

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
                    setError(
                        'An account already exists with this email using another sign-in method.'
                    )
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
                setStatusMessage(
                    'Your email is already verified. You can log in now.'
                )
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
                    setError(
                        'Unable to resend verification email. Please try again.'
                    )
            }
        } finally {
            if (resendUser && auth.currentUser?.uid === resendUser.uid) {
                try {
                    await signOut(auth)
                } catch (signOutError) {
                    console.error(
                        'Failed to sign out after resending:',
                        signOutError
                    )
                }
            }

            setIsResending(false)
        }
    }

    if (loading) {
        return (
            <main className="login-page login-page--loading">
                <div className="login-loading-card">
                    <span className="login-spinner" />
                    <p>Checking authentication...</p>
                </div>
            </main>
        )
    }

    if (user?.emailVerified && !isSubmitting && !isResending) {
        return <Navigate to="/" replace />
    }

    return (
        <main className="login-page">
            <div className="login-page-glow login-page-glow--one" />
            <div className="login-page-glow login-page-glow--two" />

            <div className="login-layout">
                <section className="login-showcase">
                    <Link to="/" className="login-brand">
                        <span className="login-brand-mark">E</span>
                        <span>EVENTRA</span>
                    </Link>

                    <div className="login-showcase-content">
                        <span className="login-showcase-eyebrow">
                            WELCOME TO A WORLD OF EXPERIENCES
                        </span>

                        <h1>
                            Every event.
                            <br />
                            Every moment.
                            <br />
                            <span>One place.</span>
                        </h1>

                        <p>
                            Discover experiences, explore events, and make
                            memories worth coming back for.
                        </p>

                        <div className="login-showcase-decoration">
                            <div className="login-showcase-orbit login-showcase-orbit--outer">
                                <div className="login-showcase-orbit login-showcase-orbit--inner">
                                    <div className="login-showcase-center">E</div>
                                </div>
                            </div>

                            <span className="login-orbit-dot login-orbit-dot--one" />
                            <span className="login-orbit-dot login-orbit-dot--two" />
                            <span className="login-orbit-dot login-orbit-dot--three" />
                        </div>
                    </div>

                    <div className="login-showcase-footer">
                        <span />
                        <p>MAKE ROOM FOR SOMETHING MEMORABLE.</p>
                    </div>
                </section>

                <section className="login-form-section">
                    <div className="login-form-card">
                        <div className="login-form-heading">
                            <span className="login-form-eyebrow">
                                YOUR EVENTRA ACCOUNT
                            </span>

                            <h2>Welcome Back<span>.</span></h2>

                            <p>
                                Log in to continue your Eventra journey.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            {successMessage && (
                                <p
                                    role="status"
                                    className="login-alert login-alert--success"
                                >
                                    <span>✓</span>
                                    {successMessage}
                                </p>
                            )}

                            {statusMessage && (
                                <p
                                    role="status"
                                    className="login-alert login-alert--success"
                                >
                                    <span>✓</span>
                                    {statusMessage}
                                </p>
                            )}

                            {error && (
                                <p
                                    role="alert"
                                    className="login-alert login-alert--error"
                                >
                                    <span>!</span>
                                    {error}
                                </p>
                            )}

                            <div className="login-field">
                                <label htmlFor="email">
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
                                />
                            </div>

                            <div className="login-field">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="login-password-wrapper">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        className="login-password-toggle"
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || isResending}
                                className="login-submit-button"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="login-button-spinner" />
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        Log In
                                        <span>↗</span>
                                    </>
                                )}
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
                                    className="login-verification-button"
                                >
                                    {isResending
                                        ? 'Sending verification email...'
                                        : 'Resend Verification Email'}
                                </button>
                            )}

                            <div className="login-divider">
                                <span />
                                <p>OR</p>
                                <span />
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isSubmitting}
                                className="login-google-button"
                            >
                                <span className="login-google-mark">G</span>

                                {isSubmitting
                                    ? 'Connecting...'
                                    : 'Continue with Google'}
                            </button>
                        </form>

                        <p className="login-signup-prompt">
                            Don't have an account?{' '}
                            <Link to="/signup">Sign up</Link>
                        </p>

                        <div className="login-card-footer">
                            <span />
                            <p>EVERY EXPERIENCE MATTERS</p>
                            <span />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default LoginPage
