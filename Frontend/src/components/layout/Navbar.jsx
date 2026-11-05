import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <header className="border-b border-white/10 bg-eventra-black px-6 py-5 text-white">
            <nav className="mx-auto flex max-w-7xl items-center justify-between">
                <Link to="/" className="font-display text-2xl font-extrabold">
                   Eventra
                </Link>
            </nav>
        </header>
    )
}

export default Navbar