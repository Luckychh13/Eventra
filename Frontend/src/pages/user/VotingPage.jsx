import { useEffect, useState } from 'react'

import {
    getVotingParticipants,
    getUserVotes,
    getVotingStatus,
    castVote,
} from '../../services/api/votingService.js'

import './VotingPage.css'

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        fallback
    )
}

function VotingPage() {
    const [participants, setParticipants] = useState([])
    const [votedParticipantId, setVotedParticipantId] = useState(null)
    const [isVotingLive, setIsVotingLive] = useState(false)

    const [selectedParticipant, setSelectedParticipant] = useState(null)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        let isActive = true

        const loadVotingData = async () => {
            try {
                const [
                    participantData,
                    voteData,
                    statusData,
                ] = await Promise.all([
                    getVotingParticipants(),
                    getUserVotes(),
                    getVotingStatus(),
                ])

                if (!isActive) return

                setParticipants(
                    Array.isArray(participantData.participants)
                        ? participantData.participants
                        : []
                )

                setVotedParticipantId(
                    Array.isArray(voteData.voted)
                        ? voteData.voted[0] || null
                        : null
                )

                setIsVotingLive(statusData.isLive === true)
            } catch (err) {
                if (isActive) {
                    setError(
                        getErrorMessage(
                            err,
                            'Unable to load voting information.'
                        )
                    )
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        loadVotingData()

        return () => {
            isActive = false
        }
    }, [])

    const handleSelectParticipant = (participant) => {
        if (!isVotingLive || votedParticipantId || submitting) {
            return
        }

        setSelectedParticipant(participant)
        setError('')
        setSuccessMessage('')
    }

    const handleConfirmVote = async () => {
        if (
            !selectedParticipant ||
            !isVotingLive ||
            votedParticipantId ||
            submitting
        ) {
            return
        }

        try {
            setSubmitting(true)
            setError('')
            setSuccessMessage('')

            const data = await castVote(selectedParticipant._id)

            setVotedParticipantId(selectedParticipant._id)
            setSelectedParticipant(null)

            setSuccessMessage(
                data.message || 'Your vote was recorded successfully.'
            )
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    'Unable to submit your vote. Please try again.'
                )
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <main className="voting-page">
                <div className="voting-state">
                    Loading participants...
                </div>
            </main>
        )
    }

    return (
        <main className="voting-page">
            <div className="voting-container">

                <header className="voting-header">
                    <span className="voting-eyebrow">
                        EVENTRA COMPETITION
                    </span>

                    <h1>
                        Cast Your Vote
                    </h1>

                    <p>
                        Support your favourite participant and make
                        your voice count.
                    </p>

                    <span
                        className={`voting-status ${isVotingLive ? 'is-live' : 'is-stopped'
                            }`}
                    >
                        {isVotingLive ? 'Voting is Live' : 'Voting is Closed'}
                    </span>
                </header>

                {(error || successMessage) && (
                    <div
                        className={`voting-alert ${error ? 'is-error' : 'is-success'
                            }`}
                        role={error ? 'alert' : 'status'}
                    >
                        {error || successMessage}
                    </div>
                )}

                {votedParticipantId && (
                    <section className="voting-completed">
                        <h2>Thank you for voting!</h2>
                        <p>
                            Your vote has been recorded. You cannot
                            submit another vote.
                        </p>
                    </section>
                )}

                {!isVotingLive && !votedParticipantId && (
                    <section className="voting-closed">
                        <h2>Voting is not available right now</h2>
                        <p>
                            Please check back when the organizers
                            activate voting.
                        </p>
                    </section>
                )}

                {participants.length === 0 ? (
                    <div className="voting-state">
                        No participants are available.
                    </div>
                ) : (
                    <section className="voting-participant-grid">
                        {participants.map((participant) => (
                            <article
                                key={participant._id}
                                className="voting-participant-card"
                            >
                                <div className="voting-participant-image">
                                    {participant.photoUrl ? (
                                        <img
                                            src={participant.photoUrl}
                                            alt={participant.name}
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    'none'
                                            }}
                                        />
                                    ) : (
                                        <span>
                                            {participant.name
                                                .trim()
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="voting-participant-content">
                                    <span className="voting-tag">
                                        {participant.tagNumber}
                                    </span>

                                    <h2>{participant.name}</h2>

                                    <p>
                                        {participant.details ||
                                            'Support this participant in the competition.'}
                                    </p>

                                    {votedParticipantId === participant._id ? (
                                        <span className="voting-selected">
                                            Your Vote
                                        </span>
                                    ) : votedParticipantId ? (
                                        <span className="voting-disabled">
                                            Voting completed
                                        </span>
                                    ) : isVotingLive ? (
                                        <button
                                            type="button"
                                            className="voting-select-button"
                                            onClick={() =>
                                                handleSelectParticipant(participant)
                                            }
                                            disabled={submitting}
                                        >
                                            Vote for this participant
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="voting-select-button"
                                            disabled
                                        >
                                            Voting Closed
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                {selectedParticipant && (
                    <div className="voting-confirmation">
                        <h2>Confirm your vote</h2>

                        <p>
                            You are about to vote for{' '}
                            <strong>
                                {selectedParticipant.name}
                            </strong>
                            .
                        </p>

                        <p>
                            You can vote only once. This selection
                            cannot be changed after submission.
                        </p>

                        <div className="voting-confirmation-actions">
                            <button
                                type="button"
                                onClick={() => setSelectedParticipant(null)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmVote}
                                disabled={submitting}
                            >
                                {submitting
                                    ? 'Submitting vote...'
                                    : 'Confirm Vote'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    )
}

export default VotingPage