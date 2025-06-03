import mongoose from "mongoose";

const url = new mongoose.Schema({
  shortUrlCode: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true }
})

export const UrlSchema = mongoose.model("urls", url)