import express from "express";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";
import requestLogger from "./middleware/requestLogger.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import configRoutes from "./routes/configRoutes.js";

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

app.use(notFound);
app.use(errorHandler);

export default app;