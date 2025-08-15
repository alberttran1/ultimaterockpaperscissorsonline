// models/Round.ts
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const roundSchema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  roundNumber: { type: Number, required: true },
  player1Hand: { type: String, enum: ['ROCK', 'PAPER', 'SCISSORS'], required: true },
  player2Hand: { type: String, enum: ['ROCK', 'PAPER', 'SCISSORS'], required: true },
  winner: { type: String, enum: ['player1', 'player2', 'draw'], required: true },
  timestamp: { type: Date, default: Date.now },
});

export default model("Round", roundSchema);
