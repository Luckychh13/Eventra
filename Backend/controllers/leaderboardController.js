import Participant from "../models/Participant.js";
import AppConfig from "../models/AppConfig.js";

const LEADERBOARD_CONFIG_KEY = "leaderboard";

export const getLeaderboard = async (req, res) => {
    try {
        const config = await AppConfig.findOne({
            key: LEADERBOARD_CONFIG_KEY,
        });

        if (config?.value?.isLive !== true) {
            return res.status(403).json({
                message: "Leaderboard not live yet",
            });
        }

        const [top3, allParticipants] = await Promise.all([
            Participant.find()
                .sort({ votes: -1 })
                .limit(3)
                .select("name photoUrl votes"),

            Participant.find()
                .sort({ votes: -1 })
                .select("name photoUrl votes"),
        ]);

        return res.status(200).json({
            top3,
            allParticipants,
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);

        return res.status(500).json({
            error: "Failed to fetch leaderboard",
        });
    }
};

export const getLeaderboardStatus = async (req, res) => {
    try {
        const config = await AppConfig.findOne({
            key: LEADERBOARD_CONFIG_KEY,
        });

        return res.status(200).json({
            isLeaderboardLive: config?.value?.isLive === true,
            leaderboardRevealTime:
                config?.value?.revealTime ?? null,
        });
    } catch (error) {
        console.error("Error fetching leaderboard status:", error);

        return res.status(500).json({
            error: "Failed to fetch leaderboard status",
        });
    }
};

export const toggleLeaderboard = async (req, res) => {
    try {
        const { isLive } = req.body;

        if (typeof isLive !== "boolean") {
            return res.status(400).json({
                error: "isLive must be true or false",
            });
        }

        let config = await AppConfig.findOne({
            key: LEADERBOARD_CONFIG_KEY,
        });

        if (!config) {
            config = new AppConfig({
                key: LEADERBOARD_CONFIG_KEY,
                value: {},
            });
        }

        config.value = {
            ...(config.value ?? {}),
            isLive,
        };

        await config.save();

        return res.status(200).json({
            success: true,
            message: `Leaderboard ${isLive ? "Activated" : "Deactivated"
                }`,
        });
    } catch (error) {
        console.error("Error toggling leaderboard:", error);

        return res.status(500).json({
            error: "Failed to update leaderboard status",
        });
    }
};

export const scheduleLeaderboard = async (req, res) => {
    try {
        const { revealTime } = req.body;

        if (!revealTime) {
            return res.status(400).json({
                error: "revealTime is required",
            });
        }

        const parsedRevealTime = new Date(revealTime);

        if (Number.isNaN(parsedRevealTime.getTime())) {
            return res.status(400).json({
                error: "Invalid revealTime",
            });
        }

        let config = await AppConfig.findOne({
            key: LEADERBOARD_CONFIG_KEY,
        });

        if (!config) {
            config = new AppConfig({
                key: LEADERBOARD_CONFIG_KEY,
                value: {},
            });
        }

        config.value = {
            ...(config.value ?? {}),
            revealTime: parsedRevealTime,
        };

        await config.save();

        return res.status(200).json({
            message: "Leaderboard reveal scheduled",
            config: {
                isLeaderboardLive:
                    config.value.isLive === true,
                leaderboardRevealTime:
                    config.value.revealTime,
            },
        });
    } catch (error) {
        console.error("Error scheduling leaderboard:", error);

        return res.status(500).json({
            error: "Failed to schedule leaderboard reveal",
        });
    }
};