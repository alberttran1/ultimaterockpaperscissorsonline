import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider, type User } from "firebase/auth";
import UsernameModal from "./UsernameModal";
import { auth } from "../../firebase";
import { useModal } from "../../Context/ModalContext";
import { useUser } from "../../Context/UserContext";
import { getUserById } from "../../Api/userApi";
import { motion } from "framer-motion";
import LoginModal from "./LoginModal";

const HomeScreen = () => {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const { firebaseUserData, user, setUser } = useUser();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (!res.user.email || !res.user.uid)
        throw new Error("Sign in with Gmail user without id or email!");

      try {
        const existingUser = await getUserById(res.user.uid);
        if (existingUser.data.user) {
          setUser(existingUser.data.user);
          closeModal();
        }
        return;
      } catch (e: any) {
        if (e.response.data.error === "User not found") {
          openUsernameModal(res.user);
        } else throw e;
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const openUsernameModal = (user: User) => {
    openModal(
      <UsernameModal
        user={user}
        doAfterConfirm={() => {
          closeModal();
        }}
      />,
    );
  };

  const openLoginModal = () => {
    openModal(
      <LoginModal
        handleGoogleSignIn={handleGoogleSignIn}
        doAfterConfirm={() => {
          closeModal();
        }}
      />,
    );
  };

  return (
    <div className="h-screen w-screen bg-[#2c1a4f]">
      <motion.div
        className="h-screen flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center justify-between h-[90vh] mt-10 px-4 text-center">
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
          >
            <div className="text-[8rem] leading-none font-bulletproof drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
              ULTIMATE
            </div>
            <div className="text-5xl font-adrenaline text-indigo-200 drop-shadow-sm tracking-wide">
              ROCK PAPER SCISSORS
            </div>
            <div className="text-5xl font-bulletproof text-purple-400">
              Online
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="text-3xl font-adrenaline text-white py-4 px-10 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-700 shadow-[0_0_30px_rgba(255,255,255,0.3)] border-4 border-white hover:scale-105 transition-all"
              onClick={
                firebaseUserData
                  ? () => openUsernameModal(firebaseUserData)
                  : openLoginModal
              }
            >
              Sign in to Continue
            </button>
          </motion.div>

          <div className="flex gap-10 text-4xl font-bulletproof mt-6 text-indigo-100">
            {[
              { label: "Leaderboard", path: "/leaderboard" },
              { label: "Statistics", path: "/statistics" },
              { label: "Profile", path: "/profile", requiresAuth: true },
            ].map(({ label, path, requiresAuth }) => (
              <motion.div
                key={label}
                whileHover={{
                  scale: 1.1,
                  opacity: 1,
                  transition: { duration: 0.2 },
                }}
                className="cursor-pointer opacity-80 hover:text-purple-300"
                onClick={() => {
                  if (requiresAuth && !user) openLoginModal();
                  else navigate(path);
                }}
              >
                {label}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
