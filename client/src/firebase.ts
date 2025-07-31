// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpyVyWvFc18JXtJMg5zRshxZZl7TD6Jb0",
  authDomain: "rockpaperscissorsonline-40dcd.firebaseapp.com",
  projectId: "rockpaperscissorsonline-40dcd",
  storageBucket: "rockpaperscissorsonline-40dcd.firebasestorage.app",
  messagingSenderId: "1077109038100",
  appId: "1:1077109038100:web:0896f66de4ff8a6c15db01",
  measurementId: "G-2K3VYSS670",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
