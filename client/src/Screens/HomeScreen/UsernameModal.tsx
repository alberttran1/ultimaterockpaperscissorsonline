import type { User } from "firebase/auth";
import React, { useState } from "react";
import { createUser } from "../../Api/userApi";
import { useUser } from "../../Context/UserContext";

interface UsernameModalProps {
  user: User;
  doAfterConfirm: () => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({
  user,
  doAfterConfirm,
}) => {
  const [usernameText, setUsernameText] = useState("");
  const { setUser } = useUser();

  const onConfirm = async () => {
    if (!usernameText.trim()) return;
    const userRes = await createUser({
      uid: user.uid,
      email: user.email!,
      photoURL: user.photoURL,
      username: usernameText,
    });
    setUser(userRes.data.user);
    doAfterConfirm();
  };

  return (
    <div className="p-6 text-center bg-[#1f1233] text-white rounded-xl shadow-2xl max-w-sm mx-auto border border-white/20">
      <h2 className="text-3xl font-bold mb-6 text-purple-300">
        Choose a Username
      </h2>

      <input
        type="text"
        placeholder="Username"
        value={usernameText}
        onChange={(e) => setUsernameText(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-md bg-[#2c1a4f] text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <button
        onClick={onConfirm}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition-all w-full"
      >
        Confirm
      </button>
    </div>
  );
};

export default UsernameModal;
