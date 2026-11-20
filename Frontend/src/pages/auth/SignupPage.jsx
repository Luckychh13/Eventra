
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    signOut,
} from 'firebase/auth'
import { auth } from '../../services/firebase/firebase.js'
import useAuth from '../../hooks/useAuth.js'
import './SignupPage.css'

function SignupPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    })

    const { user, loading } = useAuth()
    const navigate = useNavigate()

    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        setError('')
        setIsSubmitting(true)

        let createdUser = null

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email.trim(),
                formData.password
            )

            createdUser = userCredential.user

            await updateProfile(createdUser, {
                displayName: formData.fullName.trim(),
            })

            await sendEmailVerification(createdUser)

            await signOut(auth)

            navigate('/login', {
                replace: true,
                state: {
                    message: `A verification email has been sent to ${createdUser.email}. Please verify your email before logging in.`,
                },
            })
        } catch (error) {
            console.error('Signup failed:', error)

            if (createdUser) {
                try {
                    await signOut(auth)
                } catch (signOutError) {
                    console.error('Failed to sign out after signup:', signOutError)
                }

                setError(
                    'Your account was created, but we could not complete its setup. Please try again or contact support.'
                )
            } else {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        setError('An account already exists with this email.')
                        break

                    case 'auth/invalid-email':
                        setError('Please enter a valid email address.')
                        break

                    case 'auth/weak-password':
                        setError('Please choose a stronger password.')
                        break

                    case 'auth/network-request-failed':
                        setError('Network error. Please check your connection.')
                        break

                    default:
                        setError('Unable to create your account. Please try again.')
                }
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <main className="signup-page signup-page--loading">
                <div className="signup-loading-card">
                    <span className="signup-spinner" />
                    <p>Checking authentication...</p>
                </div>
            </main>
        )
    }

    if (user && !isSubmitting) {
        return <Navigate to="/" replace />
    }

    return (
        <main className="signup-page">
            <div className="signup-page-glow signup-page-glow--one" />
            <div className="signup-page-glow signup-page-glow--two" />

            <div className="signup-layout">
                <section className="signup-showcase">
                    <Link to="/" className="signup-brand">
                        <span className="signup-brand-mark">E</span>
                        <span>EVENTRA</span>
                    </Link>

                    <div className="signup-showcase-content">
                        <span className="signup-showcase-eyebrow">
                            YOUR NEXT EXPERIENCE STARTS HERE
                        </span>

                        <h1>
                            Find your
                            <br />
                            people.
                            <br />
                            <span>Find your moment.</span>
                        </h1>

                        <p>
                            Join Eventra to discover events, explore new
                            experiences, and create memories worth sharing.
                        </p>

                        <div className="signup-showcase-highlights">
                            <div className="signup-highlight">
                                <span className="signup-highlight-icon">✦</span>
                                <div>
                                    <strong>Discover</strong>
                                    <p>Explore experiences that inspire you.</p>
                                </div>
                            </div>

                            <div className="signup-highlight">
                                <span className="signup-highlight-icon">◇</span>
                                <div>
                                    <strong>Connect</strong>
                                    <p>Be part of moments worth sharing.</p>
                                </div>
                            </div>

                            <div className="signup-highlight">
                                <span className="signup-highlight-icon">↗</span>
                                <div>
                                    <strong>Experience</strong>
                                    <p>Make every event count.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="signup-showcase-footer">
                        <span />
                        <p>MAKE ROOM FOR SOMETHING MEMORABLE.</p>
                    </div>
                </section>

                <section className="signup-form-section">
                    <div className="signup-form-card">
                        <div className="signup-form-heading">
                            <span className="signup-form-eyebrow">
                                BECOME PART OF EVENTRA
                            </span>

                            <h2>Create Account<span>.</span></h2>

                            <p>
                                Set up your account and start exploring.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="signup-form">
                            {error && (
                                <p
                                    role="alert"
                                    className="signup-alert signup-alert--error"
                                >
                                    <span>!</span>
                                    {error}
                                </p>
                            )}

                            <div className="signup-field">
                                <label htmlFor="fullName">
                                    Full Name
                                </label>

                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="signup-field">
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

                            <div className="signup-field">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="signup-password-wrapper">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        className="signup-password-toggle"
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>

                                <p className="signup-password-hint">
                                    Use at least 6 characters.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="signup-submit-button"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="signup-button-spinner" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <span>↗</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="signup-login-prompt">
                            Already have an account?{' '}
                            <Link to="/login">Log in</Link>
                        </p>

                        <div className="signup-verification-note">
                            <span>✉</span>
                            <p>
                                We'll send a verification link to your email
                                before you can log in.
                            </p>
                        </div>

                        <div className="signup-card-footer">
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

export default SignupPage
