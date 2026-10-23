import AppConfig from "../models/AppConfig.js";

export async function setVotingLive(req, res) {
    try {
        const { isLive } = req.body;

        if (typeof isLive !== "boolean") {
            return res.status(400).json({
                error: "isLive must be true or false",
            });
        }

        const cfg = await AppConfig.findOneAndUpdate(
            { key: "voting" },
            { value: { isLive } },
            { upsert: true, new: true }
        );

        const io = req.app.get("io");

        if (io) {
            io.emit("votingStatus", { isLive });
        }

        return res.json({
            message: `Voting is now ${isLive ? "LIVE ✅" : "STOPPED ⛔"}`,
            config: cfg,
        });
    } catch (error) {
        console.error("Error setting voting status:", error);

        return res.status(500).json({
            error: "Failed to update voting status",
        });
    }
}

export async function getVotingStatus(req, res) {
    try {
        const cfg = await AppConfig.findOne({ key: "voting" });
        const isLive = cfg?.value?.isLive || false;

        return res.json({ isLive });
    } catch (error) {
        console.error("Error fetching voting status:", error);

        return res.status(500).json({
            error: "Failed to fetch voting status",
        });
    }
}