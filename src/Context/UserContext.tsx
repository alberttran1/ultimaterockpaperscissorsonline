import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
  } from "react";
  import { onAuthStateChanged, type User } from "firebase/auth";
  import { auth } from "../firebase";
import { getUserById } from "../Api/userApi";
  
  type UserContextType = {
    user: any| null;
    setUser: (user : any | null) => void;
    firebaseUserData: User | null
    loading: boolean;
  };
  
  const UserContext = createContext<UserContextType | undefined>(undefined);
  
  export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [firebaseUserData, setFirebaseUserData] = useState<User | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        setFirebaseUserData(firebaseUser)
        if(firebaseUser) {
            try {
              const userRes = await getUserById(firebaseUser.uid)
              setUser(userRes.data.user)
            } catch (e : any) {}
        }
        setLoading(false);
      });
      return () => unsub();
    }, []);
  
    return (
      <UserContext.Provider value={{ user, setUser, firebaseUserData, loading }}>
        {children}
      </UserContext.Provider>
    );
  };
  
  export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
      throw new Error("useUser must be used within a UserProvider");
    }
    return context;
  };
  