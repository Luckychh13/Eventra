import AppConfig from '../models/AppConfig.js'

const LEADERBOARD_CONFIG_KEY = 'leaderboard'

const MAX_TIMER_DELAY = 2_147_000_000
const RETRY_DELAY = 30_000

let revealTimer = null
let activeRevealTime = null

export const clearLeaderboardRevealTimer = () => {
    if (revealTimer) {
        clearTimeout(revealTimer)
    }

    revealTimer = null
    activeRevealTime = null
}

const runScheduledReveal = async (expectedRevealTime) => {
    if (
        !activeRevealTime ||
        activeRevealTime.getTime() !== expectedRevealTime.getTime()
    ) {
        return
    }

    const remainingTime = expectedRevealTime.getTime() - Date.now()
    if (remainingTime > 0) {
        armLeaderboardReveal(expectedRevealTime)
        return
    }

    try {
        const result = await AppConfig.updateOne(
            {
                key: LEADERBOARD_CONFIG_KEY,
                'value.revealScheduled': true,
                'value.revealTime': expectedRevealTime,
            },
            {
                $set: {
                    'value.isLive': true,
                    'value.revealScheduled': false,
                },
            }
        )

        if (result.modifiedCount > 0) {
            console.log('Scheduled leaderboard reveal activated.')
        } else {
            console.log(
                'Scheduled leaderboard reveal was cancelled or replaced.'
            )
        }
        if (
            activeRevealTime?.getTime() === expectedRevealTime.getTime()
        ) {
            clearLeaderboardRevealTimer()
        }
    } catch (error) {
        console.error(
            'Failed to activate scheduled leaderboard. Retrying:',
            error.message
        )

        if (
            activeRevealTime?.getTime() === expectedRevealTime.getTime()
        ) {
            revealTimer = setTimeout(
                () => runScheduledReveal(expectedRevealTime),
                RETRY_DELAY
            )
        }
    }
}

function armLeaderboardReveal(revealTime) {
    if (revealTimer) {
        clearTimeout(revealTimer)
    }

    activeRevealTime = revealTime

    const remainingTime = Math.max(
        revealTime.getTime() - Date.now(),
        0
    )

    revealTimer = setTimeout(
        () => runScheduledReveal(revealTime),
        Math.min(remainingTime, MAX_TIMER_DELAY)
    )
}

export const scheduleLeaderboardReveal = (revealTime) => {
    const parsedRevealTime = new Date(revealTime)

    if (Number.isNaN(parsedRevealTime.getTime())) {
        throw new Error('Cannot schedule an invalid leaderboard reveal time.')
    }

    clearLeaderboardRevealTimer()
    armLeaderboardReveal(parsedRevealTime)
}

export const initializeLeaderboardScheduler = async () => {
    const config = await AppConfig.findOne({
        key: LEADERBOARD_CONFIG_KEY,
    })

    const revealTime = config?.value?.revealTime

    if (
        config?.value?.revealScheduled !== true ||
        !revealTime
    ) {
        console.log('No pending leaderboard reveal schedule.')
        return
    }

    const parsedRevealTime = new Date(revealTime)

    if (Number.isNaN(parsedRevealTime.getTime())) {
        console.error('Stored leaderboard reveal time is invalid.')
        return
    }

    console.log(
        'Restoring leaderboard reveal schedule:',
        parsedRevealTime.toISOString()
    )

    scheduleLeaderboardReveal(parsedRevealTime)
}