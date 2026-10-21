
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import validateEnv from "./config/env.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnv();

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Eventra backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start Eventra backend: ${error.message}`);
    process.exit(1);
  }
};

startServer();
