import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./UserContext";
import type { MatchPlayer } from "./GameRoomContext";

interface UserConnection{
  uid: string;
  username: string,
  photoURL: string,
  queueType: "COMPETITIVE" | "UNRANKED";
  elo?: number;
};

type SocketEvents = {
  "match-found": (data: { roomId: string; opponents: MatchPlayer[] }) => void;
  "round-start": () => void;
  "request-choices": () => void;
  "round-end": (data: {
    choices: Record<string, "ROCK" | "PAPER" | "SCISSORS">;
    result: "p1" | "p2" | "draw";
    scores: Record<string, number>;
  }) => void;
  "game-over": (data: {
    winner: string;
    finalScores: Record<string, number>;
  }) => void;
};

type EventHandlers = Partial<{
  [K in keyof SocketEvents]: SocketEvents[K];
}>;

interface SocketContextValue {
  socket: Socket | null;
  sendChoice: (room: string, choice: "ROCK" | "PAPER" | "SCISSORS") => void;
  joinQueue: (userConnection : UserConnection) => void;
  registerHandlers: (handlers: EventHandlers) => void;
  unregisterHandlers: (handlers: EventHandlers) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<EventHandlers>({});

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (!socketRef.current) {
      const socket = io("http://localhost:4000", { withCredentials: true });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("register", user.uid);
      });
    }
  }, [user]);

  // Fix: Cast handler to generic function to satisfy TS on .on()
  const registerHandlers = (handlers: EventHandlers) => {
    if (!socketRef.current) return;
    for (const eventName in handlers) {
      const key = eventName as keyof SocketEvents;
      const handler = handlers[key];
      if (handler) {
        socketRef.current.on(key, handler as (...args: any[]) => void);
        handlersRef.current[key] = handler as (...args: any[]) => void;
      }
    }
  };

  // Same fix for .off()
  const unregisterHandlers = (handlers: EventHandlers) => {
    if (!socketRef.current) return;
    for (const eventName in handlers) {
      const key = eventName as keyof SocketEvents;
      const handler = handlers[key];
      if (handler) {
        socketRef.current.off(key, handler as (...args: any[]) => void);
        delete handlersRef.current[key];
      }
    }
  };

  const sendChoice = (room: string, choice: "ROCK" | "PAPER" | "SCISSORS") => {
    socketRef.current?.emit("player-choice", { room, choice });
  };

  const joinQueue = (userConnection : UserConnection) => {
    socketRef.current?.emit("join-queue",userConnection);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        sendChoice,
        joinQueue,
        registerHandlers,
        unregisterHandlers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
