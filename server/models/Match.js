import mongoose from "mongoose";
const { Schema, model } = mongoose;

const matchSchema = new Schema({
  player1: { type: String, required: true }, // UID
  player2: { type: String, required: true },
  winner: { type: String }, // UID or 'draw'
  createdAt: { type: Date, default: Date.now },
});

export default model("Match", matchSchema);