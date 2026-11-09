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
        return <h1>Checking authentication...</h1>
    }

    if (user && !isSubmitting) {
        return <Navigate to="/" replace />
    }

    return (
        <main className="flex min-h-[80vh] items-center justify-center bg-eventra-black px-4 py-12 text-white">
            <section className="w-full max-w-md rounded-2xl border border-white/10 bg-eventra-dark p-7 shadow-2xl sm:p-10">

                <div className="mb-8 text-center">
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-eventra-purple to-eventra-coral">
                        <span className="font-display text-xl font-extrabold">E</span>
                    </div>

                    <h1 className="font-display text-3xl font-extrabold">
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-white/60">
                        Join Eventra and discover amazing experiences.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

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
                            htmlFor="fullName"
                            className="mb-2 block text-sm font-semibold"
                        >
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
                            className="w-full rounded-lg border border-white/10 bg-eventra-black px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-eventra-purple focus:ring-2 focus:ring-eventra-purple/30"
                        />
                    </div>

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
                                placeholder="Create a password"
                                autoComplete="new-password"
                                minLength={6}
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
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-gradient-to-r from-eventra-purple to-eventra-coral py-3 font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Creating account...' : 'Create Account'}
                    </button>

                </form>

                <p className="mt-7 text-center text-sm text-white/60">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-semibold text-eventra-lavender hover:text-white hover:underline"
                    >
                        Log in
                    </Link>
                </p>

            </section>
        </main>
    )
}

export default SignupPage
