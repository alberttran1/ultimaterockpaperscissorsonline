import { motion } from "framer-motion";

const RoundStart = ({ round }: { round: number }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ x: "-50%", y: "-50%" }}
      className="absolute left-1/2 top-1/2 z-[100] text-white font-adrenaline flex flex-col items-center justify-center space-y-4 text-center"
    >
      <div className="text-3xl sm:text-4xl tracking-wide drop-shadow-lg whitespace-nowrap">
        ROUND {round}
      </div>

      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          delay: 0.2,
        }}
        className="text-7xl sm:text-8xl font-bold text-yellow-400 drop-shadow-[0_0_20px_rgba(255,255,0,0.7)] whitespace-nowrap"
      >
        START
      </motion.div>
    </motion.div>
  );
};

export default RoundStart;
