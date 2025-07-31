// models/Game.ts
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const gameSchema = new Schema({
  player1Id: { type: Types.ObjectId, ref: "User", required: true },
  player2Id: { type: Types.ObjectId, ref: "User", required: true },
  roundsToWin: { type: Number, default: 2 },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },

  result: {
    winnerId: { type: Types.ObjectId, ref: "User", default: null },
    player1Wins: { type: Number, default: 0 },
    player2Wins: { type: Number, default: 0 },
    totalRounds: { type: Number, default: 0 },
  },
});

export default model("Game", gameSchema);
