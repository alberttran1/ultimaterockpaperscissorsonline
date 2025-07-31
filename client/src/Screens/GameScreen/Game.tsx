import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { useUser } from '../../Context/UserContext';
import { FaCircle } from 'react-icons/fa';
import rock from '../../assets/rock.png';
import paper from '../../assets/paper.png';
import scissors from '../../assets/scissors.png';
import hand from '../../assets/hand.png';
import { useSocket } from '../../Context/SocketContext';

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  const { user, loading } = useUser();
  const [players, setPlayers] = useState<Partial<FirebaseUser>[]>([]);
  const [room, setRoom] = useState<string | null>(null);
  const [showHandState, setShowHandState] = useState<"ROCK" | "PAPER" | "SCISSORS">("ROCK");
  const [playingHandState, setPlayingHandState] = useState<"ROCK" | "PAPER" | "SCISSORS">();
  const [isHandLockedIn, setIsHandLockedIn] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(true);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [animateKey, setAnimateKey] = useState<number>(0);
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
  const [roundResult, setRoundResult] = useState<"p1" | "p2" | "draw" | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [roundCountdown, setRoundCountdown] = useState<number | null>(null);

  // Create refs to hold latest values
  const roomRef = useRef<string | null>(null);
  const playingHandRef = useRef<"ROCK" | "PAPER" | "SCISSORS" | undefined>(undefined);

  // Keep refs updated on state changes
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    playingHandRef.current = playingHandState;
  }, [playingHandState]);

  const socketHandlers = {
    "start-game": ({ room, players }) => {
      setRoom(room);
      setPlayers(players);
      setRoundNumber(1);
      setScoreMap({});
      setIsStarting(true);
      setTimeout(() => setIsStarting(false), 2000);
    },
    "round-start": () => {
      setIsHandLockedIn(false);
      setPlayingHandState(undefined);
      setShowHandState("ROCK");
      setRoundResult(null);

      let timeLeft = 10;
      setRoundCountdown(timeLeft);

      const interval = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft >= 0) {
          setRoundCountdown(timeLeft);
        }
        if (timeLeft === 0) {
          clearInterval(interval);
          setRoundCountdown(null);
          setIsHandLockedIn(true); // lock input when countdown hits 0
        }
      }, 1000);
    },
    "request-choices": () => {
      console.log("requested");

      console.log(roomRef.current, playingHandRef.current)
      // Use ref values here to get latest
      if (roomRef.current && playingHandRef.current) {
        sendChoice(roomRef.current, playingHandRef.current);
      }
    },
    "round-end": ({ result, choices, scores }) => {
      console.log(result, choices, scores);
      setRoundResult(result);
      setScoreMap(scores);
    },
    "game-over": ({ winner, finalScores }) => {
      setWinner(winner);
      setScoreMap(finalScores);
    },
  }

  const { sendChoice } = useSocket(user, socketHandlers);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // if (roundCountdown === null || roundCountdown === 0 || isHandLockedIn) return;

      const key = e.key.toLowerCase();
      if (key === 'z') {
        setPlayingHandState('ROCK');
        setShowHandState('ROCK');
      } else if (key === 'x') {
        setPlayingHandState('PAPER');
        setShowHandState('PAPER');
      } else if (key === 'c') {
        setPlayingHandState('SCISSORS');
        setShowHandState('SCISSORS');
      } else if (key === 'enter' && playingHandState && room) {
        sendChoice(room, playingHandState);
        setIsHandLockedIn(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playingHandState, isHandLockedIn, roundCountdown, room, sendChoice]);

  useEffect(() => {
    setAnimateKey(prev => prev + 1);
  }, [showHandState]);

  if (loading) return <div>loading</div>;
  if (!user) return null;

  const player1 = players.find((p) => p.uid === user.uid);
  const player2 = players.find((p) => p.uid !== user.uid);
  const handImage = showHandState === "ROCK" ? rock : showHandState === "PAPER" ? paper : scissors;

  return (
    <>
      {isStarting && 
        <div className='w-screen h-screen absolute flex justify-center items-center z-[100] font-adrenaline text-8xl'>
          START
        </div>
      }

      {roundCountdown !== null && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-6xl font-bold z-50">
          Time Left: {roundCountdown}s
        </div>
      )}

      <div className='w-screen h-screen p-4 flex flex-col justify-between'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col items-start gap-4'>
            <div className='flex gap-4 items-center font-adrenaline text-2xl'>
              <img src={player1?.photoURL!} className='rounded-3xl h-12' />
              {player1?.username}
            </div>
            <div className='flex gap-2'>
              {[...Array(scoreMap[player1?.uid || ""] || 0)].map((_, i) => (
                <FaCircle key={i} />
              ))}
            </div>
          </div>

          <div className='absolute left-1/2 -translate-x-1/2 font-bulletproof text-6xl'>
            Round {roundNumber}
          </div>

          <div className='flex flex-col items-end gap-4'>
            <div className='flex gap-4 items-center font-adrenaline text-2xl'>
              {player2?.username}
              <img src={player2?.photoURL!} className='rounded-3xl h-12' />
            </div>
            <div className='flex gap-2'>
              {[...Array(scoreMap[player2?.uid || ""] || 0)].map((_, i) => (
                <FaCircle key={i} />
              ))}
            </div>
          </div>
        </div>

        <div className='flex'> 
          <div className='flex flex-col'>
            <div>You are playing...</div>
            <div className='text-4xl font-bold'>{playingHandState}</div>
          </div>

          {true && (
            <div className='text-center font-bold text-3xl'>
              {roundResult === "draw" ? "It's a draw!" : roundResult === "p1"
                ? `${player1?.username} wins the round!`
                : `${player2?.username} wins the round!`}
            </div>
          )}
        </div>

        {winner && (
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-adrenaline z-50'>
            {winner === user.uid ? "You win!" : "You lose!"}
          </div>
        )}

        <div className='flex absolute bottom-0 w-screen justify-center'>
          <div className='relative'>
            <div className='absolute bottom-0 animate-bob animation-delay-5'>
              <img src={hand} alt="hand shadow" className="w-[25rem] h-auto opacity-50" />
            </div>
            <div className='relative bottom-[5rem] animate-bob animation-delay-0'>
              <img key={animateKey} src={handImage} alt="hand" className="w-[25rem] h-auto animate-jitter" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;
