import api from './api.js'

export const getVotingStatus = async () => {
    const response = await api.get('/api/config/status')
    return response.data
}

export const toggleVoting = async (isLive) => {
    const response = await api.post('/api/config/toggle/live', {
        isLive,
    })

    return response.data
}

export const getVotingParticipants = async () => {
    const response = await api.get('/api/participants/voting')
    return response.data
}

export const getUserVotes = async () => {
    const response = await api.get('/api/votes/user')
    return response.data
}

export const castVote = async (participantId) => {
    const response = await api.post(
        `/api/votes/${participantId}`
    )

    return response.data
}