import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useGameInfo } from "../Context/GameInfoContext";
import { useSocket } from "../Context/SocketContext";
import { useUser } from "../Context/UserContext";

const JoinRoomScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerHandlers, unregisterHandlers, joinCustomGame } = useSocket();
  const { setGameInfo } = useGameInfo();
  const { user } = useUser();

  const [status, setStatus] = useState<"joining" | "error" | "success">(
    "joining",
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Extract roomId from URL
  const roomId = new URLSearchParams(location.search).get("roomId");

  useEffect(() => {
    if (!roomId || !user) return;

    joinCustomGame(roomId);

    const handlers = {
      "match-found": (data: any) => {
        setGameInfo(data);
        setStatus("success");
        navigate(`/game/${data.roomId}`, { state: { startGame: true } });
      },
      "join-room-failed": (data: { reason: string }) => {
        setStatus("error");
        setErrorMessage(data.reason || "Room is full or does not exist.");
      },
    };

    registerHandlers(handlers);
    return () => unregisterHandlers(handlers);
  }, [roomId, user]);

  return (
    <div className="min-h-screen w-full bg-[#2c1a4f] text-white font-bulletproof flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-xl bg-gradient-to-br from-purple-800 to-indigo-900 border-4 border-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
      >
        {status === "joining" && (
          <>
            <div className="text-4xl font-adrenaline tracking-wider">
              JOINING ROOM
            </div>
            <div className="text-lg text-gray-300">
              Room ID:{" "}
              <span className="font-mono text-yellow-300">{roomId}</span>
            </div>
            <div className="mt-4 text-lg text-cyan-400 animate-pulse">
              Looking for your opponent...
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-4xl font-adrenaline text-red-400">
              FAILED TO JOIN
            </div>
            <div className="text-lg text-gray-300">{errorMessage}</div>
            <button
              className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition"
              onClick={() => navigate("/")}
            >
              Back to Dashboard
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default JoinRoomScreen;
