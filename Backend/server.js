
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Eventra backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Eventra backend.");
    process.exit(1);
  }
};

startServer();
