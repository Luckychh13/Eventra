import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Vote", VoteSchema);