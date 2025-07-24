import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import React, { useState } from 'react'
import { auth } from '../../firebase';
import UsernameModal from './UsernameModal';
import { useModal } from '../../Context/ModalContext';

interface LoginModalProps {
    doAfterConfirm : () => void;
    handleGoogleSignIn : () => void;
}
const LoginModal:React.FC<LoginModalProps> = ({doAfterConfirm, handleGoogleSignIn}) => {
    const [email,setEmail] = useState<string>("")
    const [password,setPassword] = useState<string>("")
    const {openModal,closeModal} = useModal()

  return (
<div className="p-6 text-center bg-[#1f1233] text-white rounded-xl shadow-2xl max-w-sm mx-auto border border-white/20">
        <h2 className="text-3xl font-bold mb-6 text-purple-300"> In / Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => (setEmail(e.target.value))}
          className="w-full mb-3 px-4 py-2 rounded-md bg-[#2c1a4f] text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => (setPassword(e.target.value))}
          className="w-full mb-6 px-4 py-2 rounded-md bg-[#2c1a4f] text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex flex-col gap-3 mb-4">
          <button
            onClick={async () => {
              try {
                await signInWithEmailAndPassword(auth, email, password);
                doAfterConfirm();
              } catch (error) {
                console.error("Email/password login error:", error);
              }
            }}
            className="bg-gradient-to-r from-fuchsia-600 to-indigo-700 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition-all"
          >
            Sign In
          </button>

          <button
            onClick={async () => {
              try {
                const user = await createUserWithEmailAndPassword(auth, email, password);
                openModal(
                  <UsernameModal
                    user={user.user}
                    doAfterConfirm={() => {
                      closeModal();
                    }}
                  />
                );
              } catch (error) {
                console.error("Sign up error:", error);
              }
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition-all"
          >
            Sign Up
          </button>
        </div>

        <div className="text-gray-400 mb-3">or</div>

        <button
          onClick={handleGoogleSignIn}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition-all w-full"
        >
          Continue with Google
        </button>
      </div>
  )
}

export default LoginModal