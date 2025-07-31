// models/Round.ts
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const roundSchema = new Schema({
  gameId: { type: Types.ObjectId, ref: "Game", required: true },
  roundIndex: { type: Number, required: true },

  player1Move: {
    type: String,
    enum: ["rock", "paper", "scissors", null],
    default: null,
  },
  player2Move: {
    type: String,
    enum: ["rock", "paper", "scissors", null],
    default: null,
  },
  result: {
    type: String,
    enum: ["player1", "player2", "draw", null],
    default: null,
  },

  createdAt: { type: Date, default: Date.now },
});

export default model("Round", roundSchema);
