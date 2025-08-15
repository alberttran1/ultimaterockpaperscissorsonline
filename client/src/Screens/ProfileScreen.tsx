import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../Context/UserContext";

const ProfileScreen = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-white font-bulletproof">
        Loading profile...
      </div>
    );
  }

  const renderAvatar = () => {
    if (user.photoURL) {
      return (
        <img
          src={user.photoURL}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-md"
        />
      );
    } else {
      const initial = user.username?.charAt(0).toUpperCase() || "?";
      return (
        <div className="w-32 h-32 rounded-full bg-purple-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-purple-500 shadow-md font-adrenaline">
          {initial}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#2c1a4f] text-white font-bulletproof overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 w-full fixed top-0 left-0 z-50 bg-[#150c26]/90 backdrop-blur-sm flex items-center justify-between text-lg md:text-xl font-bold text-indigo-100 px-4 md:px-6 shadow-md">
        <div
          className="flex gap-8 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          ← <span className="tracking-widest">DASHBOARD</span>
        </div>
        <div className="tracking-widest text-purple-200">PROFILE</div>
      </header>

      {/* Main Content */}
      <div className="pt-24 px-4 md:px-10 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
          className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start"
        >
          {/* Avatar */}
          {renderAvatar()}

          {/* Info */}
          <div className="flex-1 gap-2 flex-col flex">
            <h1 className="text-4xl font-adrenaline text-purple-300 mb-2">
              {user.username || "Unnamed"}
            </h1>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-2 rounded-full font-semibold text-xl w-fit shadow">
              ELO: {user.elo}
            </div>
          </div>
        </motion.div>

        {/* Future Graphs / Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="min-h-[200px] rounded-2xl bg-[#1f1233] border border-white/10 shadow-inner flex items-center justify-center text-gray-400"
          >
            Match History Graph (coming soon)
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="min-h-[200px] rounded-2xl bg-[#1f1233] border border-white/10 shadow-inner flex items-center justify-center text-gray-400"
          >
            ELO Over Time (coming soon)
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
