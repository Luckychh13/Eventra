import mongoose from "mongoose";

const AppConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
});

export default mongoose.model("AppConfig", AppConfigSchema);
