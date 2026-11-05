function Footer() {
    return (
        <footer className="border-t border-white/10 bg-eventra-black px-6 py-8 text-eventra-muted">
            <div className="mx-auto max-w-7xl text-center">
                <p className="text-sm">
                    © {new Date().getFullYear()} Eventra. All rights reserved.
                </p>
            </div>
        </footer>
    )
}

export default Footer