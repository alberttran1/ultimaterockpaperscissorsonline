import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import userRoutes from "./routes/userRoutes.js";
import { setupSocket } from "./socket.js"; // 👈 Socket.IO logic

dotenv.config();

const app = express();
app.use(express.json());

const server = http.createServer(app);

// Allow only trusted origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://ultimaterockpaperscissorsonline.netlify.app',
];

app.use(cors({
  origin: (origin, callback) => {
    console.log("🔍 CORS request from origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // only if you're using cookies or sessions
}));

// API Routes
app.use("/api/users", userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Setup Socket.IO
setupSocket(server); // 👈 This starts your matchmaking + RPS socket logic

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
