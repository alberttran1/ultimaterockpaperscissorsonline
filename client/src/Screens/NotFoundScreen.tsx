import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFoundScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#2c1a4f] flex flex-col items-center justify-center text-white font-bulletproof px-4">
      {/* Animated 404 Heading */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="text-7xl md:text-9xl mb-10 font-adrenaline text-center text-fuchsia-400 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
      >
        404
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl md:text-2xl text-gray-300 mt-4 mb-8 text-center"
      >
        Oops! This page doesn't exist.
      </motion.p>

      {/* Go Home Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="bg-gradient-to-r from-fuchsia-600 to-indigo-700 text-white font-adrenaline text-xl px-8 py-4 rounded-2xl border-4 border-white shadow-[0_0_25px_rgba(255,255,255,0.2)] transition"
      >
        Return to Dashboard
      </motion.button>
    </div>
  );
};

export default NotFoundScreen;
