import mongoose from "mongoose";
import Vote from "../models/Vote.js";
import Participant from "../models/Participant.js";
import AppConfig from "../models/AppConfig.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export async function castVote(req, res) {
  try {
    const config = await AppConfig.findOne({ key: "voting" });

    if (!config?.value?.isLive) {
      return res.status(403).json({
        error: "Voting is not live",
      });
    }
    const userId = req.user.uid;
    const { participantId } = req.params;

    if (!mongoose.isValidObjectId(participantId)) {
      return res.status(400).json({
        error: "Invalid participant ID",
      });
    }

    const participant = await Participant.findById(participantId);

    if (!participant) {
      return res.status(404).json({
        error: "Participant not found",
      });
    }

    const existingVote = await Vote.findOne({ userId });

    if (existingVote) {
      return res.status(400).json({
        error: "You have already voted once!",
      });
    }

    const vote = await Vote.create({
      userId,
      participantId,
    });

    const updated = await Participant.findByIdAndUpdate(
      participantId,
      { $inc: { votes: 1 } },
      { new: true }
    );

    if (!updated) {
      await Vote.deleteOne({ _id: vote._id });

      return res.status(404).json({
        error: "Participant not found",
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.emit("voteUpdate", {
        id: participantId,
        votes: updated.votes,
      });

      const topParticipants = await Participant.find()
        .select("name tagNumber photoUrl votes")
        .sort({ votes: -1 })
        .limit(5);

      io.emit("leaderboardUpdate", topParticipants);

      const [totalParticipants, totalVotes] = await Promise.all([
        Participant.countDocuments(),
        Vote.countDocuments(),
      ]);

      io.emit("statsUpdate", {
        totalParticipants,
        totalVotes,
      });
    }

    return res.json({
      message: "Vote recorded successfully",
      participant: updated,
    });
  } catch (error) {
    console.error("Voting Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        error: "You have already voted once!",
      });
    }

    return res.status(error.statusCode || 500).json({
      error:
        error.statusCode
          ? error.message
          : "Failed to record vote",
    });
  }
}

export async function getVotes(req, res) {
  try {
    const participants = await Participant.find()
      .select("name tagNumber photoUrl votes")
      .sort({ votes: -1 });

    return res.json({
      message: "Votes fetched successfully",
      totalParticipants: participants.length,
      participants,
    });
  } catch (error) {
    console.error("Error fetching votes:", error);

    return res.status(500).json({
      error: "Failed to fetch votes",
    });
  }
}


export async function getUserVotes(req, res) {
  try {
    const votes = await Vote.find({ userId: req.user.uid })
      .select("participantId -_id");

    const voted = votes.map((vote) =>
      vote.participantId.toString()
    );

    return res.json({ voted });
  } catch (error) {
    console.error("Error fetching user votes:", error);

    return res.status(500).json({
      error: "Failed to fetch user votes",
    });
  }
}


export async function getVotingStats(req, res) {
  try {
    const [totalParticipants, totalVotes] = await Promise.all([
      Participant.countDocuments(),
      Vote.countDocuments(),
    ]);

    return res.json({
      message: "Stats fetched successfully",
      totalParticipants,
      totalVotes,
    });
  } catch (error) {
    console.error("Error fetching voting stats:", error);

    return res.status(500).json({
      error: "Failed to fetch voting stats",
    });
  }
}