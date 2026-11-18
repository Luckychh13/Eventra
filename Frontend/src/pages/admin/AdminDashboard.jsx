
import { Link } from 'react-router-dom'
import useAdminDashboard from '../../hooks/useAdminDashboard.js'
import './AdminDashboard.css'

const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(Number(value) || 0)
}

function AdminDashboard() {
    const {
        summary,
        loading,
        refreshing,
        error,
        refreshSummary,
    } = useAdminDashboard()

    if (loading) {
        return (
            <div className="admin-dashboard-state">
                <div className="admin-loading-spinner" />
                <p>Loading your dashboard...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="admin-dashboard-state admin-error-state">
                <div className="admin-state-icon">!</div>
                <h2>Unable to load dashboard</h2>
                <p>{error}</p>
                <button
                    type="button"
                    onClick={refreshSummary}
                    className="admin-primary-button"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (!summary) {
        return (
            <div className="admin-dashboard-state">
                <p>Dashboard data is currently unavailable.</p>
            </div>
        )
    }

    const totalRevenue =
        summary.eventEarnings + summary.stallEarnings

    const statistics = [
        {
            label: 'Total Users',
            value: summary.totalUsers.toLocaleString('en-IN'),
            abbreviation: 'US',
            category: 'Community',
        },
        {
            label: 'Total Participants',
            value: summary.totalParticipants.toLocaleString('en-IN'),
            abbreviation: 'PA',
            category: 'Community',
        },
        {
            label: 'Total Votes',
            value: summary.totalVotes.toLocaleString('en-IN'),
            abbreviation: 'VT',
            category: 'Engagement',
        },
        {
            label: 'Event Orders',
            value: summary.eventOrders.toLocaleString('en-IN'),
            abbreviation: 'EO',
            category: 'Orders',
        },
        {
            label: 'Stall Orders',
            value: summary.stallOrders.toLocaleString('en-IN'),
            abbreviation: 'SO',
            category: 'Orders',
        },
        {
            label: 'Successful Event Revenue',
            value: formatPrice(summary.eventEarnings),
            abbreviation: 'ER',
            category: 'Revenue',
        },
        {
            label: 'Successful Stall Revenue',
            value: formatPrice(summary.stallEarnings),
            abbreviation: 'SR',
            category: 'Revenue',
        },
        {
            label: 'Total Successful Revenue',
            value: formatPrice(totalRevenue),
            abbreviation: 'TR',
            category: 'Revenue',
            featured: true,
        },
    ]

    const quickLinks = [
        {
            label: 'Manage Events',
            description: 'Create and manage festival events.',
            path: '/dashboard/events',
            abbreviation: 'EV',
        },
        {
            label: 'Manage Stalls',
            description: 'Create, edit, and manage stalls.',
            path: '/dashboard/stalls',
            abbreviation: 'ST',
        },
        {
            label: 'Manage Users',
            description: 'View registered users.',
            path: '/dashboard/users',
            abbreviation: 'US',
        },
        {
            label: 'Event Orders',
            description: 'Review event ticket orders.',
            path: '/dashboard/eventOrder',
            abbreviation: 'EO',
        },
        {
            label: 'Stall Orders',
            description: 'Review stall purchases.',
            path: '/dashboard/stallsOrder',
            abbreviation: 'SO',
        },
        {
            label: 'Pricing Management',
            description: 'Manage event ticket pricing.',
            path: '/dashboard/pricingSet',
            abbreviation: 'PR',
        },
    ]

    return (
        <div className="admin-dashboard">
            <section className="admin-dashboard-heading">
                <div>
                    <span className="admin-eyebrow">OVERVIEW</span>
                    <h1>Dashboard</h1>
                    <p>
                        Here's what's happening across your Eventra platform.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refreshSummary}
                    disabled={refreshing}
                    className="admin-refresh-button"
                >
                    <span aria-hidden="true" className={refreshing ? 'is-refreshing' : ''}>
                        ↻
                    </span>
                    {refreshing ? 'Refreshing...' : 'Refresh data'}
                </button>
            </section>

            <section className="admin-dashboard-section">
                <div className="admin-section-heading">
                    <div>
                        <h2>Platform overview</h2>
                        <p>Key numbers from across your platform.</p>
                    </div>
                    <span className="admin-section-caption">
                        ALL-TIME SUMMARY
                    </span>
                </div>

                <div className="admin-stat-grid">
                    {statistics.map((statistic) => (
                        <article
                            key={statistic.label}
                            className={`admin-stat-card ${statistic.featured ? 'featured' : ''
                                }`}
                        >
                            <div className="admin-stat-card-top">
                                <span className="admin-stat-category">
                                    {statistic.category}
                                </span>
                                <span className="admin-stat-icon">
                                    {statistic.abbreviation}
                                </span>
                            </div>

                            <p className="admin-stat-label">
                                {statistic.label}
                            </p>

                            <h3 className="admin-stat-value">
                                {statistic.value}
                            </h3>
                        </article>
                    ))}
                </div>

                <p className="admin-dashboard-note">
                    Order counts include all payment statuses. Revenue
                    includes only successfully paid orders.
                </p>
            </section>

            <section className="admin-dashboard-section">
                <div className="admin-section-heading">
                    <div>
                        <h2>Participant leaderboard</h2>
                        <p>
                            Participants ranked by their recorded vote counts.
                        </p>
                    </div>

                    <Link
                        to="/dashboard/leaderboard"
                        className="admin-text-link"
                    >
                        Full leaderboard <span aria-hidden="true">→</span>
                    </Link>
                </div>

                {summary.participantVotes.length === 0 ? (
                    <div className="admin-empty-state">
                        <div className="admin-empty-icon">LB</div>
                        <h3>No voting data yet</h3>
                        <p>
                            Participant rankings will appear here once votes
                            have been recorded.
                        </p>
                    </div>
                ) : (
                    <div className="admin-leaderboard-card">
                        <div className="admin-table-wrapper">
                            <table className="admin-leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Participant</th>
                                        <th className="admin-votes-column">
                                            Votes
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {summary.participantVotes
                                        .slice(0, 10)
                                        .map((participant, index) => (
                                            <tr
                                                key={`${participant.name}-${index}`}
                                            >
                                                <td>
                                                    <span
                                                        className={`admin-rank ${index < 3
                                                            ? `rank-${index + 1}`
                                                            : ''
                                                            }`}
                                                    >
                                                        {String(index + 1).padStart(
                                                            2,
                                                            '0'
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="admin-participant-name">
                                                    {participant.name}
                                                </td>
                                                <td className="admin-votes-column">
                                                    <span className="admin-vote-count">
                                                        {participant.votes.toLocaleString(
                                                            'en-IN'
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            <section className="admin-dashboard-section">
                <div className="admin-section-heading">
                    <div>
                        <h2>Quick management</h2>
                        <p>Jump straight into the areas you manage most.</p>
                    </div>
                </div>

                <div className="admin-quick-links-grid">
                    {quickLinks.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="admin-quick-link-card"
                        >
                            <div className="admin-quick-link-top">
                                <span className="admin-quick-link-icon">
                                    {item.abbreviation}
                                </span>
                                <span className="admin-quick-link-arrow">
                                    ↗
                                </span>
                            </div>

                            <h3>{item.label}</h3>
                            <p>{item.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default AdminDashboard
