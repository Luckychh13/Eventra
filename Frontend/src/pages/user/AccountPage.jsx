import useCurrentUser from '../../hooks/useCurrentUser.js'

function AccountPage() {
    const { currentUser, loading, error } = useCurrentUser()

    if (loading) {
        return (
            <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
                <p>Loading account information...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
                <h1 className="text-2xl font-bold">
                    Unable to load account
                </h1>

                <p className="mt-3 text-red-400">
                    {error}
                </p>
            </main>
        )
    }

    if (!currentUser) {
        return (
            <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
                <p>Account information is unavailable.</p>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-eventra-black px-6 py-12 text-white">
            <div className="mx-auto max-w-4xl">

                <h1 className="font-display text-3xl font-bold">
                    My Account
                </h1>

                <p className="mt-2 text-eventra-muted">
                    View your Eventra account information.
                </p>

                <section className="mt-8 rounded-xl border border-white/10 p-6">

                    <h2 className="text-xl font-semibold">
                        Account Details
                    </h2>

                    <div className="mt-6 space-y-5">

                        <div>
                            <p className="text-sm text-eventra-muted">
                                Email Address
                            </p>

                            <p className="mt-1">
                                {currentUser.email || 'Not available'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-eventra-muted">
                                User ID
                            </p>

                            <p className="mt-1 break-all">
                                {currentUser.uid}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-eventra-muted">
                                Account Role
                            </p>

                            <p className="mt-1 capitalize">
                                {currentUser.role || 'User'}
                            </p>
                        </div>

                    </div>
                </section>
            </div>
        </main>
    )
}

export default AccountPage