
import { Link } from 'react-router-dom'
import './NotFoundPage.css'

function NotFoundPage() {
    return (
        <main className="not-found-page">
            <div className="not-found-glow not-found-glow--one" />
            <div className="not-found-glow not-found-glow--two" />

            <section className="not-found-content">
                <div className="not-found-number">
                    <span>4</span>
                    <span className="not-found-zero">0</span>
                    <span>4</span>
                </div>

                <span className="not-found-label">
                    LOST IN THE EVENTRA UNIVERSE
                </span>

                <h1>Looks like you're off the map.</h1>

                <p>
                    The page you're looking for doesn't exist or may have
                    been moved. Let's get you back to the action.
                </p>

                <Link to="/" className="not-found-home-link">
                    Back to Home
                    <span aria-hidden="true">↗</span>
                </Link>

                <div className="not-found-decoration">
                    <span />
                    <span />
                    <span />
                </div>
            </section>
        </main>
    )
}

export default NotFoundPage
