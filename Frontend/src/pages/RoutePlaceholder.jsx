function RoutePlaceholder({ title }) {
    return (
        <main className="flex min-h-[60vh] items-center justify-center bg-eventra-black px-6 text-white">
            <div className="text-center">
                <h1 className="font-display text-3xl font-bold">
                    {title}
                </h1>

                <p className="mt-3 text-eventra-muted">
                    This page will be implemented from the original Eventra reference.
                </p>
            </div>
        </main>
    )
}

export default RoutePlaceholder