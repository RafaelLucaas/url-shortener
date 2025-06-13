import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  token: { type: String, required: true },
  urls: [{ type: mongoose.Schema.Types.ObjectId, ref: "url" }],
});

export const UserModel = mongoose.model("user", UserSchema);
