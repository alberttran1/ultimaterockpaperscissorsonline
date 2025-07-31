import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LeaderboardTable from "./LeaderboardTable";
import { useSocket, type GameInfo } from "../../Context/SocketContext";
import StatsGraphs from "./StatsGraphs";
import { useUser } from "../../Context/UserContext";
import { FaCircleUser, FaCopy } from "react-icons/fa6";
import { useGameInfo } from "../../Context/GameInfoContext";

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
  const {
    registerHandlers,
    unregisterHandlers,
    queueType,
    timeInQueue,
    startQueue,
    stopQueue,
    createCustomGame,
    customGameRoomId,
    setCustomGameRoomId,
  } = useSocket();
  const { setGameInfo } = useGameInfo();
  const { user } = useUser();
  const [customGameUrl, setCustomGameUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handlers = {
      "match-found": (data: GameInfo) => {
        stopQueue();
        setGameInfo(data);
        navigate(`/game/${data.roomId}`, { state: { startGame: true } });
      },
      "room-created": (data: { roomId: string }) => {
        setCustomGameRoomId(data.roomId);
        setCustomGameUrl(
          `${import.meta.env.VITE_APP_URL}/join?roomId=${data.roomId}`,
        );
        // navigate(`${import.meta.env.VITE_APP_URL}/join?roomId=${data.roomId}`)
      },
    };

    registerHandlers(handlers);

    // Cleanup on unmount
    return () => {
      unregisterHandlers(handlers);
    };
  }, [navigate, registerHandlers, unregisterHandlers, setGameInfo]);

  const customButtonOnClick = () => {
    if (!customGameRoomId) {
      createCustomGame();
    }
  };

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
          <div className="font-adrenaline">{user.username}</div>
          <FaCircleUser size={30} />
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
              if (queueType === "COMPETITIVE") {
                stopQueue();
              } else {
                startQueue("COMPETITIVE");
              }
            }}
          >
            <div className="flex flex-col gap-4 items-center text-3xl">
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
                      {Math.floor(timeInQueue / 60)}:
                      {String(timeInQueue % 60).padStart(2, "0")}
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
              if (queueType === "UNRANKED") {
                stopQueue();
              } else {
                startQueue("UNRANKED");
              }
            }}
          >
            <div className="flex flex-col gap-4 items-center text-3xl">
              {queueType === "UNRANKED" ? "FINDING MATCH" : "UNRANKED"}

              <AnimatePresence>
                {queueType === "UNRANKED" && (
                  <motion.div
                    key="queue-info"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="text-cyan-400">
                      {Math.floor(timeInQueue / 60)}:
                      {String(timeInQueue % 60).padStart(2, "0")}
                    </div>
                    <div className="text-lg font-sans text-gray-400">
                      Estimated: 1:00
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>

          {/* CUSTOM + LOADOUT (stacked vertically) */}
          <div className="w-full sm:w-[16rem] md:w-[20rem] lg:w-[20rem] h-auto flex flex-col justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="h-[10rem] sm:h-[15rem] bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-2xl md:text-3xl rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] border-4 border-white font-adrenaline transition p-10 gap-5 flex flex-col justify-center"
              onClick={customButtonOnClick}
            >
              CUSTOM
              {customGameRoomId && (
                <AnimatePresence>
                  <motion.div
                    key="queue-info"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="text-lg font-sans text-white flex items-center gap-2">
                      <span className="break-all">{customGameUrl}</span>
                      <div
                        onClick={() => {
                          navigator.clipboard.writeText(customGameUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="text-white hover:text-blue-400 active:scale-95 transition-transform"
                        title="Copy to clipboard"
                      >
                        <FaCopy />
                      </div>
                    </div>

                    <AnimatePresence>
                      {copied && (
                        <motion.div
                          key="copied-tooltip"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm text-green-400"
                        >
                          Copied!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.button>
            <motion.button
              // whileHover={{ scale: 1.05 }}
              className="h-[8rem] sm:h-[12rem] bg-gradient-to-r from-gray-400 to-gray-600 text-white text-2xl md:text-3xl rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] border-4 border-white font-adrenaline transition"
              // className="h-[8rem] sm:h-[12rem] bg-gradient-to-r from-purple-400 to-indigo-600 text-white text-2xl md:text-3xl rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)] border-4 border-white font-adrenaline transition"
              onClick={createCustomGame}
              disabled={true}
            >
              LOADOUT
            </motion.button>
          </div>
        </motion.div>
      </div>
      <div className="h-fit flex flex-col gap-10 px-10 w-screen m-4">
        <div className="text-6xl">LEADERBOARD</div>
        <LeaderboardTable leaderboard={leaderboardData} />
      </div>

      <div className="h-fit flex flex-col gap-10 px-10 w-screen m-4">
        <div className="text-6xl">GLOBAL STATISTICS</div>
        <StatsGraphs />
      </div>
    </div>
  );
};

export default DashboardScreen;
