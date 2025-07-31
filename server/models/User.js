// models/User.ts
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true, unique: true },
  username: String,
  elo: {type: Number, default: 1000},
  photoURL: String,

  createdAt: { type: Date, default: Date.now },
});

export default model("User", userSchema);
