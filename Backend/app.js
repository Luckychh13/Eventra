import express from "express";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";
import requestLogger from "./middleware/requestLogger.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import eventPaymentRoutes from "./routes/eventPaymentRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import stallRoutes from "./routes/stallRoutes.js";
import stallCartRoutes from "./routes/stallCartRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Eventra backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Eventra API",
    status: "healthy",
  });
});


app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/config", configRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/razorpay/events", eventPaymentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/stallCart", stallCartRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;