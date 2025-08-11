import mongoose from "mongoose";
const { Schema, model } = mongoose;

const eloHistorySchema = new Schema({
  uid: { type: String, required: true },
  elo: Number,
  change: Number,
  matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
  timestamp: { type: Date, default: Date.now },
});

export default model("EloHistory", eloHistorySchema);
