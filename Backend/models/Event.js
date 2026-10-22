import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    day: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    ticketsAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    ticketsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

eventSchema.index(
  { title: 1, date: 1, time: 1, location: 1 },
  { unique: true, name: "unique_event_details" }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;