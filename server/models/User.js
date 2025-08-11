// models/User.ts
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  username: String,
  email: { type: String, required: true, unique: true },
  photoURL: String,
  elo: {type: Number, default: 1000},

  createdAt: { type: Date, default: Date.now },
});

export default model("User", userSchema);
