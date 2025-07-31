import { createContext, useContext, useState, type ReactNode } from "react";
import { type GameInfo } from "./SocketContext";

export type MatchPlayer = {
  uid: string;
  elo: number;
  username: string;
  photoURL: string;
};

type GameInfoContextType = {
  gameInfo: GameInfo | null;
  setGameInfo: React.Dispatch<React.SetStateAction<GameInfo | null>>;
};

const GameInfoContext = createContext<GameInfoContextType | undefined>(
  undefined,
);

export const GameInfoProvider = ({ children }: { children: ReactNode }) => {
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

  return (
    <GameInfoContext.Provider value={{ gameInfo, setGameInfo }}>
      {children}
    </GameInfoContext.Provider>
  );
};

export const useGameInfo = (): GameInfoContextType => {
  const context = useContext(GameInfoContext);
  if (!context) {
    throw new Error("useGameInfo must be used within a GameInfoProvider");
  }
  return context;
};
