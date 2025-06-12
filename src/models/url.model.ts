import mongoose from "mongoose";

const UrlSchema = new mongoose.Schema({
  createdAt: { type: Date, required: true },
  shortUrlCode: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  clicks: { type: Number, required: true, default: 0 },
  lastAccessedAt: { type: Date, default: null },
});

export const UrlModel = mongoose.model("url", UrlSchema);
