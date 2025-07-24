import React, { createContext, useContext, useState, type ReactNode } from "react";

export type MatchPlayer = {
  uid: string;
  elo: number
  username: string;
  photoURL: string;
};

type GameRoomContextType = {
  roomId: string | null;
  players: MatchPlayer[];
  setRoomId: (id: string) => void;
  setPlayers: (players: MatchPlayer[]) => void;
};

const GameRoomContext = createContext<GameRoomContextType | undefined>(undefined);

export const GameRoomProvider = ({ children }: { children: ReactNode }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<MatchPlayer[]>([]);

  return (
    <GameRoomContext.Provider value={{ roomId, players, setRoomId, setPlayers }}>
      {children}
    </GameRoomContext.Provider>
  );
};

export const useGameRoom = (): GameRoomContextType => {
  const context = useContext(GameRoomContext);
  if (!context) {
    throw new Error("useGameRoom must be used within a GameRoomProvider");
  }
  return context;
};
