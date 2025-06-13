import mongoose from "mongoose";

const UrlSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now() },
  shortCode: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  clicks: { type: Number, required: true, default: 0 },
  lastAccessedAt: { type: Date, default: null },
  customAlias: { type: String, default: null },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },
});

export const UrlModel = mongoose.model("url", UrlSchema);
