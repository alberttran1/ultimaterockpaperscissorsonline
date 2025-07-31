import { useCallback, useEffect, useRef, useState } from "react";
import { useGameInfo, } from "../../Context/GameInfoContext";
import { FaHandPaper, FaHandRock } from "react-icons/fa";
import { FaHandScissors } from "react-icons/fa6";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import rock from '../../assets/rock.png';
import paper from '../../assets/paper.png';
import scissors from '../../assets/scissors.png';
import hand from '../../assets/hand.png'
import { useSocket, type GameInfo } from "../../Context/SocketContext";
import { useParams } from "react-router-dom";
import { useUser } from "../../Context/UserContext";
import LoadingScreen from "../LoadingScreen";
import { useLocation } from "react-router-dom";
import RoundStart from "./RoundStart";



const GameScreen = () => {
  const { state } = useLocation();
  const { gameInfo, setGameInfo } = useGameInfo();
  const { user } = useUser();
  const { roomId : routerRoomId } = useParams<{ roomId: string }>();
  const { joinQueue, sendReadyForGame, sendChoice, rejoinRoom, registerHandlers, unregisterHandlers } = useSocket();
  const [showHandState, setShowHandState] = useState<"ROCK" | "PAPER" | "SCISSORS">("ROCK");
  const [showOpponentHandState, setOpponentHandState] = useState<"ROCK" | "PAPER" | "SCISSORS">("ROCK");
  const [playingHandState, setPlayingHandState] = useState<"ROCK" | "PAPER" | "SCISSORS" | "RANDOM">("RANDOM");
  const [isHandLockedIn, setIsHandLockedIn] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [timer, setTimer] = useState<number>();
  const [isReadySent, setIsReadySent] = useState<boolean>(false);
  const [showRoundStart, setShowRoundStart] = useState<boolean>(false);
  const [roundResult, setRoundResult] = useState<"WIN" | "LOSE" | "DRAW" | "">();
  const [matchEndData, setMatchEndData] = useState<{
    showModal: boolean;
    winner: string;
    matchResult: "WIN" | "LOSE"
  } | null>(null);


  const [disabled, setDisabled] = useState<boolean>(false);
  const [showHands, setShowHands] = useState<boolean>(true);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  
  const jitterControls = useAnimation();
  const handControls = useAnimation();

  console.log(gameInfo?.score)



  const handImage = showHandState === "ROCK" ? rock : showHandState === "PAPER" ? paper : scissors;

  const displayRoundStart = () => {
    setShowRoundStart(true);
    setTimeout(() => setShowRoundStart(false), 2000)
  }

  const displayRoundResults = (data: {
    round: number;
    choices: Record<string, "ROCK" | "PAPER" | "SCISSORS">;
    winner: string;
    score: Record<string,number>
  }) => {

    let roundRes : "WIN" | "LOSE" | "DRAW"
    if(data.winner === user.uid) {
      roundRes = "WIN"
    } else if (data.winner === "draw") {
      roundRes = "DRAW"
    } else {
      roundRes = "LOSE"
    }

    const otherUid = Object.keys(data.choices).find(uid => uid !== user.uid)!;

    setDisabled(true);
    setIsHandLockedIn(false);
    setShowHands(false);
    setTimer(undefined)
    if(countdownRef.current) clearInterval(countdownRef.current);
    setTimeout(() => {
      setShowHandState(data.choices[user.uid])
      setOpponentHandState(data.choices[otherUid])
      setShowHands(true)
      setGameInfo(prev => {
        if (!prev) throw new Error("gameInfo should not be null here");
        return ({
          ...prev,
          score: data.score,
        })
      })

      setTimeout(() => {
        setRoundResult(roundRes);
        setTimeout(() => {
          setRoundResult("")
          setMatchEndData(prev => (prev ? {...prev,showModal: true} : null))
        }
        ,2000)
      })
    }, 1000);
  }

  const startCountdown = (endsAt: number) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  
    const updateCountdown = () => {
      const remainingMs = endsAt - Date.now();
      setTimer(Math.max(0, Math.ceil(remainingMs / 1000)));
      if (Date.now() >= endsAt && countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  
    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 250);
  };

  const setHand = useCallback((hand : "ROCK" | "PAPER" | "SCISSORS") => {
    console.log(isHandLockedIn)
    if(!isHandLockedIn) setPlayingHandState(hand);
    setShowHandState(hand);
    jitterControls.start({
      x: [30,-30,30,-30,0],
      transition: { duration: 0.1 },
    });
  },[isHandLockedIn,jitterControls])


  const submitHand = useCallback(() => {
    if(!gameInfo?.roomId) return;
    setIsHandLockedIn(true)
    if(playingHandState === "RANDOM") {
      const randomHand = ["ROCK", "PAPER", "SCISSORS"][Math.floor(Math.random() * 3)] as "ROCK" | "PAPER" | "SCISSORS"
      sendChoice(gameInfo?.roomId!, user.uid, randomHand)
    } else {
      sendChoice(gameInfo?.roomId!, user.uid, playingHandState);
    }
  },[gameInfo,playingHandState,user,sendChoice])

  useEffect(() => {
    if (state?.startGame && gameInfo?.roomId && user.uid && !isReadySent) {
      setIsReadySent(true)
      sendReadyForGame(gameInfo?.roomId!,user.uid)
    }
  }, [state,gameInfo,user,isReadySent]);


  useEffect(() => {
    if(!routerRoomId || !user) return;
    setLoading(true);
    rejoinRoom(routerRoomId,user.uid);
  },[user,routerRoomId])

  useEffect(() => {
    const handlers = {
      "rejoin-success": ( data: GameInfo) => {
        setGameInfo(data)
        setLoading(false)
        if(data.gameEnded) {
          setMatchEndData({showModal: true, winner: data.winner, matchResult: data.winner === user.uid ? "WIN" : "LOSE"})
          setDisabled(true);
          setTimer(undefined)
        } else {
          startCountdown(data.roundEndTime)
        }
      },
      "rejoin-failed": (data: {reason: string}) => {
        setLoading(false)
      },
      "round-start": (data: { round : number, endsAt: number }) => {
        setGameInfo(prev => {
          if (!prev) throw new Error("gameInfo should not be null here");
          return ({
            ...prev,
            round: data.round,
          })
        })
        startCountdown(data.endsAt)
        setDisabled(false)
        displayRoundStart()
        setShowHandState("ROCK")
        setPlayingHandState("RANDOM")
      },
      "request-hands": () => {
        console.log("SUBMITTING THROUGH REQUEST")
        submitHand()
      },
      "round-results": (data: {
        round: number;
        choices: Record<string, "ROCK" | "PAPER" | "SCISSORS">;
        winner: string;
        score: Record<string,number>
      }) => {
        console.log("MATCH RESULTS", data)
        displayRoundResults(data)
      },
      "match-end": (data: {
        winner: string;
        finalScore: Record<string, number>;
      }) => {
        // setGameInfo(prev => {
        //   if (!prev) throw new Error("gameInfo should not be null here");
        //   return ({
        //     ...prev,
        //     score: data.finalScore,
        //   })
        // })
        const matchRes = data.winner === user.uid ? "WIN" : "LOSE"
        setMatchEndData(prev => ({showModal: prev?.showModal || false, winner: data.winner, matchResult: matchRes}))
      }
    };

    registerHandlers(handlers);

    // Cleanup on unmount
    return () => {
      unregisterHandlers(handlers);
    };
  }, [setGameInfo,startCountdown,displayRoundStart,submitHand,displayRoundResults,registerHandlers,unregisterHandlers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(disabled) return;

      const key = e.key.toLowerCase();
      if (key === 'z') {
        setHand("ROCK")
      } else if (key === 'x') {
        setHand("PAPER")
      } else if (key === 'c') {
        setHand("SCISSORS")
      } else if (key === 'enter' && playingHandState && gameInfo?.roomId) {
        submitHand()
        console.log("SUBMITTING THROUGH KEYPRESS")
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ disabled, setHand, submitHand]);

  if(loading) return <LoadingScreen/>

  if(!gameInfo) return <div></div>

  let currentUserIndex = gameInfo.players.findIndex(p =>  p.uid === user.uid);
  if(currentUserIndex === -1) currentUserIndex = 0;
  const otherUserIndex = 1 - currentUserIndex;

  return(
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="w-[25rem] min-w-[25rem] h-screen ml-20 bg-[#3b2566] shadow-xl flex flex-col items-center justify-between p-4">
        <div className="flex items-center text-white font-bulletproof text-7xl p-4">
          ROUND {gameInfo.round}
        </div>
        <div>
          <div className="flex flex-col items-center text-white font-bulletproof text-3xl p-4">
            YOU ARE PLAYING:
            <div className="text-6xl">
              {playingHandState || "--"}
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            >
            <div className="w-fit h-fit bottom-[10%] bg-[#472d7c] shadow-lg rounded-lg flex flex-col gap-4 p-10">
              <div className="flex w-full justify-between gap-6">
                {["ROCK", "PAPER", "SCISSORS"].map((hand) => {
                  const Icon = () => {
                    if (hand === "ROCK") return <FaHandRock size={40} />;
                    if (hand === "PAPER") return <FaHandPaper size={40} />;
                    if (hand === "SCISSORS") return <FaHandScissors size={40} />;
                    return null;
                  };

                  const color = disabled ? "gray-600" : (hand === "ROCK") ? "blue-600" : (hand === "PAPER") ? "fuchsia-600" :"indigo-600";

                  return (
                    <motion.div
                      key={hand}
                      whileHover={!disabled ? { scale: 1.15, opacity: 1 } : {}}
                      initial={{ opacity: 0.9 }}
                      className={`h-20 w-20 border flex justify-center items-center bg-${color} text-white text-sm rounded-2xl border-4 border-white font-adrenaline ${!disabled && "cursor-pointer"} transition-colors`}
                      onClick={() => {
                        if(!disabled) setHand(hand as "ROCK" | "PAPER" | "SCISSORS")
                      }}
                    >
                      <Icon />
                    </motion.div>
                  );
                })}
              </div>
              <motion.div
                whileHover={(playingHandState !== "RANDOM" && !disabled) ? { scale: 1.1, opacity: 1 } : {}}
                initial={{ opacity: 0.9 }}
                className={`h-14 w-full border flex justify-center items-center ${playingHandState != "RANDOM" && !disabled ? "bg-gradient-to-r from-fuchsia-600 via-blue-600 to-indigo-600 cursor-pointer" : "bg-gray-600"} text-white text-xl rounded-2xl border-4 border-white font-adrenaline transition-colors`}
                onClick={!disabled && playingHandState !== "RANDOM" ? submitHand: undefined}
              >
                LOCK IN
              </motion.div>
            </div>
          </motion.div>
        </div>

      </div>
      <div className=" flex-1 min-w-[40rem] h-screen relative pt-10 px-10">
        <div className="w-full h-fit flex justify-between items-center">
          <div className="flex flex-col gap-4 items-start">
            <div className="flex gap-4 items-center">
                <img src={gameInfo.players[currentUserIndex].photoURL} className="h-14 rounded-full"/>
                <div className="font-adrenaline text-white text-2xl">
                  {gameInfo.players[currentUserIndex].username}
                </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < gameInfo.score[gameInfo.players[currentUserIndex].uid] ? "bg-green-400" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-4xl text-white font-bulletproof">
           {timer}
          </div>

          <div className="flex flex-col gap-4 items-end">
            <div className="flex gap-4 items-center">
                <div className="font-adrenaline text-white text-2xl">
                  {gameInfo.players[otherUserIndex].username}
                </div>
                <img src={gameInfo.players[otherUserIndex].photoURL} className="h-14 rounded-full"/>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i >= 4 - gameInfo.score[gameInfo.players[otherUserIndex].uid]! ? "bg-green-400" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showRoundStart &&
            <RoundStart round={gameInfo.round}/>
          }
        </AnimatePresence>

        <AnimatePresence>
          {roundResult &&
            <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ x: "-50%", y: "-50%" }}
            className="absolute left-1/2 top-1/2 z-[100] text-white font-adrenaline flex flex-col items-center justify-center space-y-4 text-center"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0.2,
              }}
              className={`text-7xl sm:text-8xl font-bold drop-shadow-[0_0_20px_rgba(255,255,0,0.7)] whitespace-nowrap ${
                roundResult === "WIN"
                  ? "text-green-400 drop-shadow-[0_0_20px_rgba(0,255,0,0.7)]"
                  : roundResult === "LOSE"
                  ? "text-red-400 drop-shadow-[0_0_20px_rgba(255,0,0,0.7)]"
                  : "text-gray-400 drop-shadow-[0_0_20px_rgba(169,169,169,0.7)]"
              }`}
            >
              {roundResult === "WIN" ? "WIN" : roundResult === "LOSE" ? "LOSE" : "DRAW"}
            </motion.div>
          </motion.div>          
          }
        </AnimatePresence>

        <AnimatePresence>
          {matchEndData?.showModal && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ x: "-50%", y: "-50%" }}
              className="absolute left-1/2 top-1/2 z-[200] text-white font-adrenaline flex flex-col items-center justify-center gap-10 w-[35rem] bg-[#3b2566] shadow-2xl rounded-2xl p-10 text-center"
            >
              <div className="text-3xl sm:text-4xl tracking-wide drop-shadow-lg whitespace-nowrap">
                MATCH OVER
              </div>

              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                className={`text-5xl sm:text-6xl font-bold whitespace-nowrap p-4 ${
                  matchEndData.winner === "draw"
                    ? "text-yellow-400 drop-shadow-[0_0_20px_rgba(255,255,0,0.7)]"
                    : matchEndData.winner === user.uid
                    ? "text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                    : "text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]"
                }`}
              >
                {matchEndData.winner === user.uid
                  ? "VICTORY!"
                  : matchEndData.winner === "draw"
                  ? "IT'S A DRAW!"
                  : "DEFEAT"}
              </motion.div>

              <div className="flex justify-between w-full text-lg">
                <div className="text-left">
                  <div className="text-white/80">
                    {gameInfo.players[currentUserIndex].username}
                  </div>
                  <div className="text-green-400 font-bold text-2xl drop-shadow-md">
                    {gameInfo.score[gameInfo.players[currentUserIndex].uid]}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/80">
                    {gameInfo.players[otherUserIndex].username}
                  </div>
                  <div className="text-green-400 font-bold text-2xl drop-shadow-md">
                    {gameInfo.score[gameInfo.players[otherUserIndex].uid]}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{scale: 1.2}}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 rounded-xl text-white shadow-lg border-2 border-white"
                  onClick={() => {
                    console.log("Rematch requested");
                  }}
                >
                  Rematch
                </motion.button>
                <motion.button
                  whileHover={{scale: 1.2}}          
                  className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-xl text-white shadow-lg border-2 border-white"
                  onClick={() => {
                    console.log("Queue new match");
                  }}
                >
                  Queue Again
                </motion.button>
                <motion.button
                  whileHover={{scale: 1.2}}          
                  className="bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-xl text-white shadow-lg border-2 border-white"
                  onClick={() => {
                    joinQueue({
                      uid: user.uid,
                      elo: user.elo,
                      username: user.username,
                      photoURL: user.photoURL,
                      queueType: "COMPETITIVE",
                    });
                  }}
                >
                  Home
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

              
        <AnimatePresence>
          {showHands && 
            <motion.div animate={handControls} exit={{opacity: 0}}>
              <motion.div
                className='absolute bottom-[-2rem] left-1/2'
                style={{translateX: "-50%"}}
                initial={{y: 200}}
                animate={{y: 0}}
                >
                <div className="animate-bob animation-delay-5">
                  <img src={hand} alt="hand shadow" className="w-[25rem] h-auto opacity-50" />
                </div>
              </motion.div>
              <motion.div
                className='absolute bottom-[6rem] left-1/2'
                style={{translateX: "-50%"}}
                initial={{y: -100}}
                animate={{y: 0}}
                >            <div className="animate-bob animation-delay-0">
                  <motion.img 
                    src={handImage}
                    alt="hand" 
                    animate={jitterControls}
                    className="w-[25rem] h-auto" 
                  />
                </div>
              </motion.div>
            </motion.div>
          } 
        </AnimatePresence>


      </div>
    </div>
  )
}

export default GameScreen;