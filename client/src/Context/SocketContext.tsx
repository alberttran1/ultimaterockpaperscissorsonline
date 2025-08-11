import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./UserContext";
import type { MatchPlayer } from "./GameInfoContext";

interface UserConnection {
  uid: string;
  username: string;
  photoURL: string;
  queueType: "COMPETITIVE" | "UNRANKED";
  elo?: number;
}

export interface GameInfo {
  roomId: string;
  score: Record<string, number>; //obj with uid -> score
  round: number;
  players: MatchPlayer[];
  roundEndTime: number;
  gameEnded: boolean;
  winner: string;
}

type SocketEvents = {
  "match-found": (data: GameInfo) => void;
  "round-start": (data: { round: number; endsAt: number }) => void;
  "rejoin-success": (data: GameInfo) => void;
  "rejoin-failed": (data: { reason: string }) => void;
  "request-choices": () => void;
  "round-results": (data: {
    round: number;
    choices: Record<string, "ROCK" | "PAPER" | "SCISSORS">;
    winner: string;
    score: Record<string, number>;
  }) => void;
  "round-end": (data: {
    choices: Record<string, "ROCK" | "PAPER" | "SCISSORS">;
    result: "p1" | "p2" | "draw";
    scores: Record<string, number>;
  }) => void;
  "match-end": (data: {
    winner: string;
    finalScore: Record<string, number>;
  }) => void;
};

type EventHandlers = Partial<{
  [K in keyof SocketEvents]: SocketEvents[K];
}>;

interface SocketContextValue {
  socket: Socket | null;
  sendReadyForGame: (roomId: string, playerId: string) => void;
  sendChoice: (
    roomId: string,
    playerId: string,
    choice: "ROCK" | "PAPER" | "SCISSORS",
  ) => void;
  setShownHand:  (
    roomId: string,
    playerId: string,
    hand: "ROCK" | "PAPER" | "SCISSORS",
  ) => void;
  joinQueue: (userConnection: UserConnection) => void;
  rejoinRoom: (roomId: string, playerId: string) => void;
  registerHandlers: (handlers: EventHandlers) => void;
  unregisterHandlers: (handlers: EventHandlers) => void;

  queueType: "COMPETITIVE" | "UNRANKED" | null;
  timeInQueue: number;

  startQueue: (type: "COMPETITIVE" | "UNRANKED") => void;
  stopQueue: () => void;
  createCustomGame: () => void;
  joinCustomGame: (roomId: string) => void;

  customGameRoomId: string;
  setCustomGameRoomId: React.Dispatch<React.SetStateAction<string>>;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<EventHandlers>({});
  const [queueType, setQueueType] = useState<"COMPETITIVE" | "UNRANKED" | null>(
    null,
  );
  const [timeInQueue, setTimeInQueue] = useState<number>(0);
  const [customGameRoomId, setCustomGameRoomId] = useState<string>("");
  const queueTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (!socketRef.current) {
      const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000", { withCredentials: true });
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

  const sendReadyForGame = (roomId: string, playerId: string) => {
    socketRef.current?.emit("game-ready", {
      roomId: roomId,
      playerId: playerId,
    });
  };

  const sendChoice = (
    roomId: string,
    playerId: string,
    choice: "ROCK" | "PAPER" | "SCISSORS",
  ) => {
    socketRef.current?.emit("player-choice", {
      roomId: roomId,
      playerId: playerId,
      choice: choice,
    });
  };

  const setShownHand = (
    roomId: string,
    playerId: string,
    hand: "ROCK" | "PAPER" | "SCISSORS",
  ) => {
    socketRef.current?.emit("change-shown-hand", {
      roomId: roomId,
      playerId: playerId,      
      hand: hand                 
    });
  }

  const joinQueue = (userConnection: UserConnection) => {
    socketRef.current?.emit("join-queue", userConnection);
  };

  const startQueue = (type: "COMPETITIVE" | "UNRANKED") => {
    if (queueType) return; // prevent multiple intervals
    joinQueue({
      uid: user.uid,
      elo: user.elo,
      username: user.username,
      photoURL: user.photoURL,
      queueType: type,
    });
    setQueueType(type);
    queueTimerRef.current = setInterval(() => {
      setTimeInQueue((prev) => prev + 1);
    }, 1000);
  };

  const stopQueue = () => {
    setTimeInQueue(0);
    if (queueTimerRef.current) {
      clearInterval(queueTimerRef.current);
      queueTimerRef.current = null;
    }
    socketRef.current?.emit("leave-queue");
    setQueueType(null);
  };

  const createCustomGame = () => {
    socketRef.current?.emit("create-custom-room", {
      uid: user.uid,
      elo: user.elo,
      username: user.username,
      photoURL: user.photoURL,
    });
  };

  const joinCustomGame = (roomId: string) => {
    socketRef.current?.emit("join-custom-room", {
      roomId: roomId,
      player: {
        uid: user.uid,
        elo: user.elo,
        username: user.username,
        photoURL: user.photoURL,
      },
    });
  };

  const rejoinRoom = (roomId: string, playerId: string) => {
    socketRef.current?.emit("rejoin-room", {
      roomId: roomId,
      playerId: playerId,
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        sendReadyForGame,
        sendChoice,
        setShownHand,
        joinQueue,
        rejoinRoom,
        registerHandlers,
        unregisterHandlers,
        queueType,
        timeInQueue,
        startQueue,
        stopQueue,
        createCustomGame,
        joinCustomGame,
        // deleteCustomGame,
        customGameRoomId,
        setCustomGameRoomId,
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
