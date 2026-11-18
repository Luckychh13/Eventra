import { useEffect, useState } from 'react'
import { getLeaderboard } from '../../services/api/leaderboardService.js'
import './LeaderboardPage.css'

const getInitials = (name = '') => {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || '?'
}

function ParticipantAvatar({ participant, large = false }) {
    return (
        <div className={`leaderboard-avatar ${large ? 'leaderboard-avatar-large' : ''}`}>
            <span>{getInitials(participant.name)}</span>

            {participant.photoUrl && (
                <img
                    src={participant.photoUrl}
                    alt=""
                    onError={(event) => {
                        event.currentTarget.style.display = 'none'
                    }}
                />
            )}
        </div>
    )
}

function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState({
        top3: [],
        allParticipants: [],
    })

    const [loading, setLoading] = useState(true)
    const [unavailable, setUnavailable] = useState(false)
    const [error, setError] = useState('')
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        let isActive = true

        const loadLeaderboard = async () => {
            try {
                const response = await getLeaderboard()

                if (!isActive) return

                setLeaderboard({
                    top3: Array.isArray(response.top3)
                        ? response.top3
                        : [],
                    allParticipants: Array.isArray(response.allParticipants)
                        ? response.allParticipants
                        : [],
                })

                setUnavailable(false)
                setError('')
            } catch (err) {
                if (!isActive) return

                if (err.response?.status === 403) {
                    setUnavailable(true)
                    setLeaderboard({
                        top3: [],
                        allParticipants: [],
                    })
                    setError('')
                } else {
                    setUnavailable(false)
                    setError(
                        err.response?.data?.message ||
                        err.response?.data?.error ||
                        'Unable to load the leaderboard. Please try again.'
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        loadLeaderboard()

        return () => {
            isActive = false
        }
    }, [refreshKey])

    const handleRefresh = () => {
        setLoading(true)
        setRefreshKey((current) => current + 1)
    }

    const { top3, allParticipants } = leaderboard

    const podium = [
        { participant: top3[1], rank: 2 },
        { participant: top3[0], rank: 1 },
        { participant: top3[2], rank: 3 },
    ].filter((entry) => entry.participant)

    return (
        <main className="leaderboard-page">
            <div className="leaderboard-container">

                {/* Page heading */}
                <header className="leaderboard-header">
                    <div>
                        <span className="leaderboard-eyebrow">
                            EVENTRA COMPETITION
                        </span>

                        <h1>
                            The <span>Leaderboard</span>
                        </h1>

                        <p>
                            See who's leading the competition and celebrate
                            the participants making their mark.
                        </p>
                    </div>

                    {!loading && !unavailable && !error && (
                        <div className="leaderboard-live-badge">
                            <span />
                            LEADERBOARD LIVE
                        </div>
                    )}
                </header>

                {loading ? (
                    <section className="leaderboard-state">
                        <span className="leaderboard-spinner" />
                        <h2>Loading leaderboard</h2>
                        <p>Fetching the latest participant rankings...</p>
                    </section>
                ) : unavailable ? (
                    <section className="leaderboard-state leaderboard-unavailable">
                        <div className="leaderboard-state-icon">🏆</div>
                        <span className="leaderboard-eyebrow">
                            RESULTS NOT REVEALED
                        </span>
                        <h2>The leaderboard is not live yet</h2>
                        <p>
                            The competition results haven't been revealed.
                            Please check back when the organizers make the
                            leaderboard available.
                        </p>
                        <button
                            type="button"
                            className="leaderboard-refresh-button"
                            onClick={handleRefresh}
                        >
                            Check again
                        </button>
                    </section>
                ) : error ? (
                    <section className="leaderboard-state leaderboard-error">
                        <div className="leaderboard-state-icon">!</div>
                        <h2>Something went wrong</h2>
                        <p>{error}</p>
                        <button
                            type="button"
                            className="leaderboard-refresh-button"
                            onClick={handleRefresh}
                        >
                            Try again
                        </button>
                    </section>
                ) : allParticipants.length === 0 ? (
                    <section className="leaderboard-state">
                        <div className="leaderboard-state-icon">🏆</div>
                        <h2>No participants yet</h2>
                        <p>
                            There are no participant rankings to display
                            right now.
                        </p>
                        <button
                            type="button"
                            className="leaderboard-refresh-button"
                            onClick={handleRefresh}
                        >
                            Refresh
                        </button>
                    </section>
                ) : (
                    <>
                        {/* Top three */}
                        {podium.length > 0 && (
                            <section className="leaderboard-podium-section">
                                <div className="leaderboard-section-heading">
                                    <div>
                                        <span className="leaderboard-eyebrow">
                                            THE FRONT RUNNERS
                                        </span>
                                        <h2>Top participants</h2>
                                    </div>
                                </div>

                                <div className="leaderboard-podium">
                                    {podium.map(({ participant, rank }) => (
                                        <article
                                            key={participant._id}
                                            className={`leaderboard-podium-card leaderboard-rank-${rank}`}
                                        >
                                            <span className="leaderboard-rank-label">
                                                #{rank}
                                            </span>

                                            <ParticipantAvatar
                                                participant={participant}
                                                large
                                            />

                                            <h3>{participant.name}</h3>

                                            <div className="leaderboard-podium-votes">
                                                <strong>
                                                    {Number(participant.votes || 0).toLocaleString('en-IN')}
                                                </strong>
                                                <span>
                                                    {Number(participant.votes) === 1
                                                        ? 'Vote'
                                                        : 'Votes'}
                                                </span>
                                            </div>

                                            {rank === 1 && (
                                                <span className="leaderboard-winner-label">
                                                    TOP POSITION
                                                </span>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Full ranking */}
                        <section className="leaderboard-rankings-section">
                            <div className="leaderboard-section-heading leaderboard-ranking-heading">
                                <div>
                                    <span className="leaderboard-eyebrow">
                                        COMPLETE STANDINGS
                                    </span>
                                    <h2>All participants</h2>
                                    <p>
                                        {allParticipants.length} participants
                                        ranked by votes received.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="leaderboard-refresh-button leaderboard-refresh-secondary"
                                    onClick={handleRefresh}
                                >
                                    ↻ Refresh
                                </button>
                            </div>

                            <div className="leaderboard-table">
                                <div className="leaderboard-table-header">
                                    <span>Rank</span>
                                    <span>Participant</span>
                                    <span>Votes</span>
                                </div>

                                {allParticipants.map((participant, index) => (
                                    <article
                                        className="leaderboard-table-row"
                                        key={participant._id}
                                    >
                                        <span className="leaderboard-table-rank">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>

                                        <div className="leaderboard-table-participant">
                                            <ParticipantAvatar participant={participant} />
                                            <strong>{participant.name}</strong>
                                        </div>

                                        <strong className="leaderboard-table-votes">
                                            {Number(participant.votes || 0).toLocaleString('en-IN')}
                                        </strong>
                                    </article>
                                ))}
                            </div>

                            <p className="leaderboard-disclaimer">
                                Rankings are displayed according to the vote
                                counts provided by the competition system.
                            </p>
                        </section>
                    </>
                )}
            </div>
        </main>
    )
}

export default LeaderboardPage