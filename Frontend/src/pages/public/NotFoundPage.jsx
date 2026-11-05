import { Link } from 'react-router-dom'

function NotFoundPage() {
    return (
        <main className="flex min-h-[60vh] items-center justify-center bg-eventra-black px-6 text-white">
            <div className="text-center">
                <p className="font-display text-6xl font-extrabold text-eventra-purple">
                    404
                </p>

                <h1 className="mt-4 font-display text-3xl font-bold">
                    Page not found
                </h1>

                <p className="mt-3 text-eventra-muted">
                    The page you're looking for doesn't exist.
                </p>

                <Link
                    to="/"
                    className="mt-8 inline-block rounded-xl bg-eventra-purple px-6 py-3 font-semibold text-white hover:opacity-90"
                >
                    Back to Home
                </Link>
            </div>
        </main>
    )
}

export default NotFoundPage