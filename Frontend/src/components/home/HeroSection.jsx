function HeroSection() {
    return (
        <section className="bg-eventra-black px-6 py-16 text-white">
            <div className="mx-auto max-w-7xl">

                <div className="grid items-center gap-12 lg:grid-cols-2">

                    {/* Hero Content */}
                    <div>
                        <p className="mb-6 text-xs font-semibold tracking-[0.2em]">
                            <span className="mr-2 text-eventra-coral">●</span>
                            LESS SCROLLING. MORE LIVING.
                        </p>

                        <h1 className="max-w-xl font-display text-5xl font-bold leading-tight">
                            Your next
                            <span className="block text-eventra-purple">
                                unforgettable
                            </span>
                            experience starts here.
                        </h1>

                        <p className="mt-6 max-w-sm font-body text-eventra-muted">
                            Discover events and experiences worth stepping out for.
                        </p>

                        <p className="mt-8 text-xs tracking-widest text-eventra-muted">
                            ━━━ GOOD PLANS START HERE.
                        </p>
                    </div>

                    {/* Featured Event Visual Placeholder */}
                    <div className="relative flex min-h-[360px] items-end rounded-2xl bg-gradient-to-br from-eventra-spotlight via-eventra-dark to-eventra-black p-6">

                        <span className="absolute left-6 top-6 rounded-md bg-black/70 px-4 py-2 text-xs tracking-widest">
                            IN THE SPOTLIGHT
                        </span>

                        <div className="w-full rounded-xl border border-white/10 bg-eventra-dark/95 p-5">
                            <p className="font-display text-lg font-semibold">
                                Featured Event
                            </p>
                            <p className="mt-2 text-sm text-eventra-muted">
                                Your next unforgettable experience awaits.
                            </p>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    )
}

export default HeroSection