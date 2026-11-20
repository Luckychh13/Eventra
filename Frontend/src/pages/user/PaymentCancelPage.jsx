
import { Link, useLocation } from 'react-router-dom'
import './PaymentCancelPage.css'

function PaymentCancelPage() {
    const location = useLocation()

    const {
        message,
        returnTo,
        returnLabel,
    } = location.state ?? {}

    const safeReturnTo =
        typeof returnTo === 'string' &&
            returnTo.startsWith('/') &&
            !returnTo.startsWith('//')
            ? returnTo
            : '/'

    const safeReturnLabel =
        typeof returnLabel === 'string' && returnLabel.trim()
            ? returnLabel
            : 'Return to previous page'

    return (
        <main className="payment-cancel-page">
            <div className="payment-cancel-glow payment-cancel-glow--one" />
            <div className="payment-cancel-glow payment-cancel-glow--two" />

            <section className="payment-cancel-card">
                <div className="payment-cancel-icon">
                    <span>!</span>
                </div>

                <span className="payment-cancel-eyebrow">
                    PAYMENT UPDATE
                </span>

                <h1>Payment Not Completed<span>.</span></h1>

                <p className="payment-cancel-description">
                    {message ||
                        'The payment could not be completed. You can return and try again.'}
                </p>

                <div className="payment-cancel-notice">
                    <span className="payment-cancel-notice-icon">i</span>
                    <p>
                        No successful payment confirmation was received.
                        Check your order status before attempting another payment.
                    </p>
                </div>

                <div className="payment-cancel-actions">
                    <Link
                        to={safeReturnTo}
                        className="payment-cancel-primary-link"
                    >
                        {safeReturnLabel}
                        <span>↗</span>
                    </Link>

                    <Link
                        to="/"
                        className="payment-cancel-home-link"
                    >
                        Go to Home
                    </Link>
                </div>

                <div className="payment-cancel-footer">
                    <span />
                    <p>EVENTRA · EVERY EXPERIENCE MATTERS</p>
                    <span />
                </div>
            </section>
        </main>
    )
}

export default PaymentCancelPage
