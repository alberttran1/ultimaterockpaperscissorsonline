import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa6";

const LoadingScreen = () => {
  return (
    <div className="h-screen w-screen bg-[#2c1a4f] flex flex-col items-center justify-center text-white">
      <motion.div
        className="text-5xl font-adrenaline text-indigo-200 drop-shadow-sm tracking-wide mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Loading
      </motion.div>

      <motion.div
        className="flex flex-col items-center text-[5rem] font-bulletproof bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg"
        initial={{ opacity: 0.5, scale: 1 }}
        animate={{ opacity: [0.5,1,0.5], scale: [1, 1.1, 1] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 1.4,
          ease: "easeInOut",
        }}
      >
            <div className="text-[8rem] leading-none font-bulletproof drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
              ULTIMATE
            </div>
            <div className="text-5xl font-adrenaline text-indigo-200 drop-shadow-sm tracking-wide">
              ROCK PAPER SCISSORS
            </div>
            <div className="text-5xl font-bulletproof text-purple-400">Online</div>
      </motion.div>

      <motion.div
        className="mt-10 text-3xl text-purple-300 flex items-center gap-3 font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <FaSpinner className="text-purple-400 text-4xl" />
        </motion.div>
        Please wait...
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
