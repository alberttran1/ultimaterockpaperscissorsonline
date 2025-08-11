import mongoose from "mongoose";
const { Schema, model } = mongoose;

const handStatsSchema = new Schema({
  uid: { type: String }, // null for global
  rock: Number,
  paper: Number,
  scissors: Number,
  timestamp: { type: Date, default: Date.now },
  scope: { type: String, enum: ['global', 'hourly', 'daily', 'user'], default: 'user' },
});

export default model("HandStats", handStatsSchema);