import User from "../models/User.js";
import Participant from "../models/Participant.js";
import Vote from "../models/Vote.js";
import EventOrder from "../models/EventOrder.js";
import StallOrder from "../models/StallOrder.js";

export const getDashboardSummary = async (req, res) => {
    try {
        const [
            totalUsers,
            totalParticipants,
            totalVotes,
            eventOrders,
            stallOrders,
            participants,
            votes,
        ] = await Promise.all([
            User.countDocuments(),
            Participant.countDocuments(),
            Vote.countDocuments(),
            EventOrder.find()
                .select("paymentStatus amount totalAmount")
                .lean(),
            StallOrder.find()
                .select("paymentStatus amount totalPrice totalAmount")
                .lean(),
            Participant.find({}, "name").lean(),
            Vote.find({}, "participantId").lean(),
        ]);

        const eventEarnings = eventOrders
            .filter((order) => order.paymentStatus === "SUCCESS")
            .reduce(
                (sum, order) =>
                    sum + Number(
                        order.amount ?? order.totalAmount ?? 0
                    ),
                0
            );

        const stallEarnings = stallOrders
            .filter((order) => order.paymentStatus === "SUCCESS")
            .reduce(
                (sum, order) =>
                    sum + Number(
                        order.amount ??
                        order.totalPrice ??
                        order.totalAmount ??
                        0
                    ),
                0
            );

        const voteCountMap = new Map();

        votes.forEach((vote) => {
            const participantId = vote.participantId?.toString();

            if (participantId) {
                voteCountMap.set(
                    participantId,
                    (voteCountMap.get(participantId) || 0) + 1
                );
            }
        });

        const participantVotes = participants.map((participant) => ({
            name: participant.name,
            votes: voteCountMap.get(participant._id.toString()) || 0,
        }));

        participantVotes.sort(
            (a, b) => b.votes - a.votes
        );

        // 7. Return dashboard statistics
        return res.status(200).json({
            totalUsers,
            totalParticipants,
            totalVotes,
            eventOrders: eventOrders.length,
            stallOrders: stallOrders.length,
            eventEarnings,
            stallEarnings,
            participantVotes,
        });
    } catch (error) {
        console.error("Dashboard summary error:", error);

        return res.status(500).json({
            error: "Failed to load dashboard summary.",
        });
    }
};