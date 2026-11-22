
import { Link } from 'react-router-dom'

function Footer() {
    return (
        <footer className="w-full border-t border-white/15 bg-[#0d2a38] px-6 py-10 text-white/85">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">

                {/* Footer Navigation */}
                <nav
                    aria-label="Footer navigation"
                    className="flex items-center gap-8"
                >
                    <Link
                        to="/about"
                        className="text-sm font-medium text-white/90 transition-colors duration-200 hover:text-eventra-coral"
                    >
                        About
                    </Link>

                    <Link
                        to="/contact"
                        className="text-sm font-medium text-white/90 transition-colors duration-200 hover:text-eventra-coral"
                    >
                        Contact
                    </Link>
                </nav>

                {/* Copyright */}
                <p className="text-center text-sm text-white/65">
                    &copy; {new Date().getFullYear()} Eventra. All rights reserved.
                </p>

            </div>
        </footer>
    )
}

export default Footer