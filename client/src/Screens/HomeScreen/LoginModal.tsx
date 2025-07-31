import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase";
import UsernameModal from "./UsernameModal";
import { useModal } from "../../Context/ModalContext";

interface LoginModalProps {
  doAfterConfirm: () => void;
  handleGoogleSignIn: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  doAfterConfirm,
  handleGoogleSignIn,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { openModal, closeModal } = useModal();

  const handleFirebaseError = (error: any) => {
    const code = error.code;
    switch (code) {
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/invalid-credential":
        return "Invalid email address and password combination.";
      case "auth/user-disabled":
        return "This user has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method. Try signing in with Google instead.";
      case "auth/credential-already-in-use":
        return "This credential is already associated with a different user account.";
      case "auth/popup-closed-by-user":
        return "The popup was closed before completing sign in.";
      case "auth/popup-blocked":
        return "The sign-in popup was blocked by the browser.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  return (
    <div className="p-6 text-center bg-[#1f1233] text-white rounded-xl shadow-2xl max-w-sm mx-auto border border-white/20">
      <h2 className="text-3xl font-bold mb-6 text-purple-300">
        Sign In / Sign Up
      </h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 px-4 py-2 rounded-md bg-[#2c1a4f] text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-md bg-[#2c1a4f] text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {errorMsg && (
        <div className="text-red-400 text-sm mb-4 max-w-sm">{errorMsg}</div>
      )}

      <div className="flex flex-col gap-3 mb-4">
        <button
          onClick={async () => {
            setErrorMsg(null);
            try {
              await signInWithEmailAndPassword(auth, email, password);
              doAfterConfirm();
            } catch (error: any) {
              console.error("Email/password login error:", error);
              setErrorMsg(handleFirebaseError(error));
            }
          }}
          className="bg-gradient-to-r from-fuchsia-600 to-indigo-700 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition-all"
        >
          Sign In
        </button>

        <button
          onClick={async () => {
            setErrorMsg(null);
            try {
              const user = await createUserWithEmailAndPassword(
                auth,
                email,
                password
              );
              openModal(
                <UsernameModal
                  user={user.user}
                  doAfterConfirm={() => {
                    closeModal();
                  }}
                />
              );
            } catch (error: any) {
              console.error("Sign up error:", error);
              setErrorMsg(handleFirebaseError(error));
            }
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition-all"
        >
          Sign Up
        </button>
      </div>

      <div className="text-gray-400 mb-3">or</div>

      <button
        onClick={async () => {
          setErrorMsg(null);
          try {
            await handleGoogleSignIn();
          } catch (error: any) {
            console.error("Google sign-in error:", error);
            setErrorMsg(handleFirebaseError(error));
          }
        }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition-all w-full"
      >
        Continue with Google
      </button>
    </div>
  );
};

export default LoginModal;
