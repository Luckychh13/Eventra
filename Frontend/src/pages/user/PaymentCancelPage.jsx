import { Link, useLocation } from 'react-router-dom';

function PaymentCancelPage() {
    const location = useLocation();

    const {
        message,
        returnTo,
        returnLabel,
    } = location.state ?? {};

    const safeReturnTo =
        typeof returnTo === 'string' &&
            returnTo.startsWith('/') &&
            !returnTo.startsWith('//')
            ? returnTo
            : '/';

    const safeReturnLabel =
        typeof returnLabel === 'string' && returnLabel.trim()
            ? returnLabel
            : 'Return to previous page';

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4 text-white">
            <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="mb-5 text-5xl text-red-400">
                    !
                </div>

                <h1 className="mb-3 text-3xl font-bold">
                    Payment Not Completed
                </h1>

                <p className="mb-6 text-gray-400">
                    {message ||
                        'The payment could not be completed. You can return and try again.'}
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        to={safeReturnTo}
                        className="rounded-lg bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700"
                    >
                        {safeReturnLabel}
                    </Link>

                    <Link
                        to="/"
                        className="rounded-lg border border-white/20 px-5 py-3 text-gray-300 hover:bg-white/10"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PaymentCancelPage;