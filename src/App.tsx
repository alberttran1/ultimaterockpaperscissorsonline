import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { createUser } from "./Api/authApi";

const provider = new GoogleAuthProvider();

function App() {
  const [user, setUser] = useState<any>(null);

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const userData = {
        uid: result.user.uid,
        email: result.user.email!,
      };

      await createUser(userData, token);
      setUser(userData);
      alert("Signed in with Google and user saved to MongoDB!");
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Sign In with Google</h2>
      {user ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <button onClick={handleGoogleSignup}>Sign in with Google</button>
      )}
    </div>
  );
}

export default App;
