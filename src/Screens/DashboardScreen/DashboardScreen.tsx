import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LeaderboardTable from "./LeaderboardTable";
import { useSocket } from "../../Context/SocketContext";
import StatsGraphs from "./StatsGraphs";
import { useUser } from "../../Context/UserContext";
import { FaCircleUser, FaPerson } from "react-icons/fa6";
import { useGameRoom, type MatchPlayer } from "../../Context/GameRoomContext";

const leaderboardData = [
  { id: "u1", name: "Alice", wins: 25, losses: 5, rating: 1800 },
  { id: "u2", name: "Bob", wins: 22, losses: 8, rating: 1720 },
  { id: "u3", name: "Charlie", wins: 20, losses: 10, rating: 1680 },
  { id: "u4", name: "Dana", wins: 18, losses: 12, rating: 1600 },
  { id: "u5", name: "Eli", wins: 15, losses: 15, rating: 1550 },
  { id: "u6", name: "Fay", wins: 14, losses: 16, rating: 1500 },
  { id: "u7", name: "George", wins: 12, losses: 18, rating: 1450 },
  { id: "u8", name: "Helen", wins: 10, losses: 20, rating: 1400 },
  { id: "u9", name: "Ivy", wins: 8, losses: 22, rating: 1350 },
  { id: "u10", name: "Jack", wins: 5, losses: 25, rating: 1300 },
];


const DashboardScreen = () => {
  const navigate = useNavigate();
  const { joinQueue, registerHandlers, unregisterHandlers } = useSocket();
  const { setPlayers, setRoomId, roomId } = useGameRoom();
  const {user} = useUser()
  const [queueType, setQueueType] = useState<"" | "COMPETITIVE" | "UNRANKED">("")
  const [timeInQueue, setTimeInQueue] = useState<number>(0)
  const queueTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startQueue = (type: "" | "COMPETITIVE" | "UNRANKED") => {
    if (queueType) return; // prevent multiple intervals
    setQueueType(type)
    queueTimerRef.current = setInterval(() => {
      setTimeInQueue(prev => prev + 1);
    }, 1000);
  };

  const stopQueue = () => {
    if (queueTimerRef.current) {
      clearInterval(queueTimerRef.current);
      queueTimerRef.current = null;
    }
    setQueueType("");
  };

  useEffect(() => {
    const handlers = {
      "match-found": (data: { roomId: string; opponents: MatchPlayer[] }) => {
        setRoomId(data.roomId)
        setPlayers(data.opponents)
        navigate("/game")
      }
    };

    registerHandlers(handlers);

    // Cleanup on unmount
    return () => {
      unregisterHandlers(handlers);
    };
  }, [navigate, registerHandlers, unregisterHandlers, setPlayers, setRoomId]);
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#2c1a4f] text-white font-bulletproof overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 w-full fixed top-0 left-0 z-50 bg-[#150c26]/90 backdrop-blur-sm flex items-center justify-between text-lg md:text-xl font-bold text-indigo-100 px-4 md:px-6 shadow-md">
        <div className="flex gap-8">
            <div className="tracking-widest">ULTIMATE RPS</div>
        </div>
        <div 
          className="flex items-center gap-4 hover:text-purple-300 transition cursor-pointer"
          onClick={() => navigate("/profile")}
          >
          <div className="font-adrenaline">
            {user.username}
          </div>
          <FaCircleUser size={30}/>
        </div>
      </header>

      {/* Main Content */}
      <div className="h-fit my-16 pt-20 flex justify-center items-center px-4 w-screen m-4">
        <motion.div
          className="flex flex-wrap gap-6 md:gap-10 justify-center w-full max-w-7xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
        >
          {/* COMPETITIVE */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full sm:w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[30rem] h-[12rem] sm:h-[16rem] lg:h-[30rem] bg-gradient-to-r from-fuchsia-600 to-indigo-700 text-white text-2xl md:text-3xl lg:text-4xl rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] border-4 border-white font-adrenaline transition"
            onClick={() => {
              startQueue("COMPETITIVE")
              joinQueue({
                uid: user.uid,
                elo: user.elo,
                username: user.username,
                photoURL: user.photoURL,
                queueType: "COMPETITIVE",
              });
            }}
          >
            <div className="flex flex-col gap-4 items-center">
              {queueType === "COMPETITIVE" ? "FINDING MATCH" : "COMPETITIVE"}

              <AnimatePresence>
                {queueType === "COMPETITIVE" && (
                  <motion.div
                    key="queue-info"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="text-cyan-400">
                      {Math.floor(timeInQueue / 60)}:{String(timeInQueue % 60).padStart(2, "0")}
                    </div>
                    <div className="text-lg font-sans text-gray-400">
                      Estimated: 1:00
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>

          {/* UNRANKED */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full sm:w-[16rem] md:w-[20rem] lg:w-[20rem] h-[12rem] sm:h-[16rem] lg:h-[30rem] bg-gradient-to-r from-purple-500 to-pink-600 text-white text-2xl md:text-3xl lg:text-4xl rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] border-4 border-white font-adrenaline transition"
            onClick={() => {
              joinQueue({
                uid: user.uid,
                queueType: "UNRANKED",
                username: user.username,
                photoURL: user.photoURL,
              })
            }}
          >
            UNRANKED
          </motion.button>

          {/* CUSTOM + LOADOUT (stacked vertically) */}
          <div className="w-full sm:w-[16rem] md:w-[20rem] lg:w-[20rem] h-auto flex flex-col justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="h-[10rem] sm:h-[15rem] bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-2xl md:text-3xl rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] border-4 border-white font-adrenaline transition"
              onClick={() => navigate("/custom")}
            >
              CUSTOM
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="h-[8rem] sm:h-[12rem] bg-gradient-to-r from-purple-400 to-indigo-600 text-white text-2xl md:text-3xl rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] border-4 border-white font-adrenaline transition"
              onClick={() => navigate("/loadout")}
            >
              LOADOUT
            </motion.button>
          </div>
        </motion.div>
      </div>
      <div className="h-fit flex flex-col gap-10 px-10 w-screen m-4">
        <div className="text-6xl">
          LEADERBOARD
        </div>
        <LeaderboardTable leaderboard={leaderboardData}/>
      </div>

      <div className="h-fit flex flex-col gap-10 px-10 w-screen m-4">
        <div className="text-6xl">
          GLOBAL STATISTICS
        </div>
        <StatsGraphs/>
      </div>
    </div>
  );
};

export default DashboardScreen;
