
import useCurrentUser from '../../hooks/useCurrentUser.js'
import './AccountPage.css'

function AccountPage() {
    const { currentUser, loading, error } = useCurrentUser()

    if (loading) {
        return (
            <main className="account-page account-page--state">
                <div className="account-state-card">
                    <span className="account-loading-spinner" />
                    <p>Loading account information...</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="account-page account-page--state">
                <div className="account-state-card account-state-card--error">
                    <span className="account-state-icon">!</span>
                    <h1>Unable to load account</h1>
                    <p>{error}</p>
                </div>
            </main>
        )
    }

    if (!currentUser) {
        return (
            <main className="account-page account-page--state">
                <div className="account-state-card">
                    <span className="account-state-icon">?</span>
                    <h1>Account unavailable</h1>
                    <p>We couldn't find your account information.</p>
                </div>
            </main>
        )
    }

    const accountDetails = [
        {
            label: 'Email Address',
            value: currentUser.email || 'Not available',
            icon: '✉',
        },
        {
            label: 'User ID',
            value: currentUser.uid || 'Not available',
            icon: '⌘',
            breakAll: true,
        },
        {
            label: 'Account Role',
            value: currentUser.role || 'User',
            icon: '◇',
            capitalize: true,
        },
    ]

    return (
        <main className="account-page">
            <div className="account-page__glow account-page__glow--one" />
            <div className="account-page__glow account-page__glow--two" />

            <div className="account-container">
                <header className="account-header">
                    <span className="account-eyebrow">
                        YOUR EVENTRA PROFILE
                    </span>

                    <h1>My Account<span>.</span></h1>

                    <p>
                        Your personal space to view your Eventra account
                        information.
                    </p>
                </header>

                <section className="account-profile-card">
                    <div className="account-profile-top">
                        <div className="account-avatar">
                            {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div className="account-profile-heading">
                            <span className="account-profile-label">
                                ACCOUNT OVERVIEW
                            </span>

                            <h2>{currentUser.email || 'Eventra User'}</h2>

                            <span className="account-status">
                                <span />
                                Account Active
                            </span>
                        </div>

                        <div className="account-profile-decoration">
                            <span>EVENTRA</span>
                            <span>YOUR EXPERIENCE STARTS HERE</span>
                        </div>
                    </div>

                    <div className="account-details">
                        <div className="account-details-heading">
                            <div>
                                <span className="account-section-label">
                                    PROFILE INFORMATION
                                </span>
                                <h3>Account Details</h3>
                            </div>

                            <span className="account-details-count">
                                03 DETAILS
                            </span>
                        </div>

                        <div className="account-details-list">
                            {accountDetails.map((detail) => (
                                <div
                                    className="account-detail-row"
                                    key={detail.label}
                                >
                                    <div className="account-detail-icon">
                                        {detail.icon}
                                    </div>

                                    <div className="account-detail-content">
                                        <span>{detail.label}</span>
                                        <p
                                            className={[
                                                detail.breakAll ? 'account-break-all' : '',
                                                detail.capitalize ? 'account-capitalize' : '',
                                            ].filter(Boolean).join(' ')}
                                        >
                                            {detail.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="account-card-footer">
                        <span>MADE FOR EXPERIENCES THAT MATTER.</span>
                        <span className="account-footer-dot" />
                        <span>EVENTRA</span>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default AccountPage
