
import mongoose from "mongoose";

const tokenHistorySchema = new mongoose.Schema({
  tokenNumber: Number,
  visitorName: String,
  mobile: String,
  email: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: Number,
  description: String,
  imageUrl: {
    type: String,
    default: "",
  },
});

const stallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: String,
  description: String,

  ownerName: String,
  ownerUID: String,
  ownerEmail: String,
  contact: String,

  location: String,
  imageUrl: {
    type: String,
    default: "",
  },
  qrCodeDataUrl: String,

  currentToken: {
    type: Number,
    default: 0,
  },
  tokens: [tokenHistorySchema],
  menu: [menuItemSchema],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Stall = mongoose.model("Stall", stallSchema);

export default Stall;
