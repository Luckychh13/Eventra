import { Link } from 'react-router-dom'
import useAdminDashboard from '../../hooks/useAdminDashboard.js'

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
        error,
        refreshSummary,
    } = useAdminDashboard()

    if (loading) {
        return (
            <div className="py-20 text-center text-gray-400">
                Loading admin dashboard...
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-16 text-center">
                <h1 className="text-2xl font-bold">
                    Unable to load dashboard
                </h1>

                <p className="mt-3 text-sm text-red-400">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={refreshSummary}
                    className="mt-5 rounded-lg bg-purple-600 px-5 py-2.5 text-sm hover:bg-purple-700"
                >
                    Try Again
                </button>
            </div>
        )
    }

    const totalRevenue =
        summary.eventEarnings + summary.stallEarnings

    const statistics = [
        {
            label: 'Total Users',
            value: summary.totalUsers,
        },
        {
            label: 'Total Participants',
            value: summary.totalParticipants,
        },
        {
            label: 'Total Votes',
            value: summary.totalVotes,
        },
        {
            label: 'Event Orders',
            value: summary.eventOrders,
        },
        {
            label: 'Stall Orders',
            value: summary.stallOrders,
        },
        {
            label: 'Successful Event Revenue',
            value: formatPrice(summary.eventEarnings),
        },
        {
            label: 'Successful Stall Revenue',
            value: formatPrice(summary.stallEarnings),
        },
        {
            label: 'Total Successful Revenue',
            value: formatPrice(totalRevenue),
        },
    ]

    const quickLinks = [
        {
            label: 'Manage Events',
            description: 'Create and manage festival events.',
            path: '/dashboard/events',
        },
        {
            label: 'Manage Stalls',
            description: 'Create, edit, and manage stalls.',
            path: '/dashboard/stalls',
        },
        {
            label: 'Manage Users',
            description: 'View registered users.',
            path: '/dashboard/users',
        },
        {
            label: 'Event Orders',
            description: 'Review event ticket orders.',
            path: '/dashboard/eventOrder',
        },
        {
            label: 'Stall Orders',
            description: 'Review stall purchases.',
            path: '/dashboard/stallsOrder',
        },
        {
            label: 'Pricing Management',
            description: 'Manage event ticket pricing.',
            path: '/dashboard/pricingSet',
        },
    ]

    return (
        <div className="space-y-10">

            {/* Dashboard heading */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-gray-400">
                        Overview of Eventra activities and performance.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refreshSummary}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white/5"
                >
                    Refresh Dashboard
                </button>
            </div>

            {/* Statistics */}
            <section>
                <h2 className="mb-5 text-xl font-semibold">
                    Platform Overview
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statistics.map((statistic) => (
                        <article
                            key={statistic.label}
                            className="rounded-xl border border-white/10 bg-white/5 p-5"
                        >
                            <p className="text-sm text-gray-400">
                                {statistic.label}
                            </p>

                            <p className="mt-3 text-2xl font-bold">
                                {statistic.value}
                            </p>
                        </article>
                    ))}
                </div>

                <p className="mt-3 text-xs text-gray-500">
                    Order counts include all payment statuses.
                    Revenue includes only successfully paid orders.
                </p>
            </section>

            {/* Participant leaderboard */}
            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Participant Voting Leaderboard
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                        Participants ranked by their recorded vote counts.
                    </p>
                </div>

                {summary.participantVotes.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                        <p className="text-gray-400">
                            No participant voting data available.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full min-w-[400px] text-left">
                            <thead className="bg-white/5 text-sm text-gray-400">
                                <tr>
                                    <th className="px-5 py-4">Rank</th>
                                    <th className="px-5 py-4">Participant</th>
                                    <th className="px-5 py-4 text-right">
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
                                            className="border-t border-white/10"
                                        >
                                            <td className="px-5 py-4 font-medium">
                                                #{index + 1}
                                            </td>

                                            <td className="px-5 py-4">
                                                {participant.name}
                                            </td>

                                            <td className="px-5 py-4 text-right font-semibold text-purple-300">
                                                {participant.votes}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Link
                    to="/dashboard/leaderboard"
                    className="mt-4 inline-block text-sm text-purple-300 transition hover:text-purple-200"
                >
                    View Full Leaderboard →
                </Link>
            </section>

            {/* Quick navigation */}
            <section>
                <h2 className="mb-5 text-xl font-semibold">
                    Quick Management Access
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {quickLinks.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-purple-500/50 hover:bg-white/[0.07]"
                        >
                            <h3 className="font-semibold">
                                {item.label}
                            </h3>

                            <p className="mt-2 text-sm text-gray-400">
                                {item.description}
                            </p>

                            <span className="mt-4 inline-block text-sm text-purple-300">
                                Open →
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
    )
}

export default AdminDashboard
