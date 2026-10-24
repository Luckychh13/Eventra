import http from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import validateEnv from "./config/env.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

let server;
let io;
let isShuttingDown = false;

const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown...`);
  io?.disconnectSockets(true);

  const shutdownTimer = setTimeout(() => {
    console.error("Shutdown timed out. Closing remaining HTTP connections.");
    server.closeAllConnections();
  }, 10_000);

  server.close(async (error) => {
    clearTimeout(shutdownTimer);
    if (error) {
      console.error("Error closing HTTP server:", error.message);
      process.exitCode = 1;
    }

    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    } catch (dbError) {
      console.error("Error closing MongoDB:", dbError.message);
      process.exitCode = 1;
    }

    console.log("Graceful shutdown complete.");
  });
};

const startServer = async () => {
  try {
    validateEnv();

    await connectDB();

    server = http.createServer(app);

    const allowedOrigins = [
      "http://localhost:5173",
      process.env.FRONTEND_ORIGIN,
    ].filter(Boolean);

    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
    });

    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`Eventra backend running on port ${PORT}`);
    });

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error(`Failed to start Eventra backend: ${error.message}`);
    process.exitCode = 1;
  }
};

startServer();
