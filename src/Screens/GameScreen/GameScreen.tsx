import { useEffect } from "react";
import { useGameRoom } from "../../Context/GameRoomContext";
import { FaHandPaper, FaHandRock } from "react-icons/fa";
import { FaHandScissors } from "react-icons/fa6";
import { motion } from "framer-motion";


const GameScreen = () => {
  const { roomId ,players } = useGameRoom();


  useEffect(() => {
    console.log(roomId,players)

  },[roomId, players])



  return(
    <div className="w-screen h-screen flex">
      <div className="w-[25rem] min-w-[25rem] h-screen ml-20 bg-[#472d7c] shadow-xl">
      </div>
      <div className=" flex-1 min-w-[40rem] h-screen relative pt-10 px-10">
        <div className="w-full h-fit flex justify-between">
          <div className="flex flex-col gap-4 items-start">
            <div className="flex gap-4 items-center">
                <img src={players[0].photoURL} className="h-14 rounded-full"/>
                <div className="font-adrenaline text-white text-2xl">
                  {players[0].username}
                </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < 2 ? "bg-green-400" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 items-end">
            <div className="flex gap-4 items-center">
                <div className="font-adrenaline text-white text-2xl">
                  {players[1].username}
                </div>
                <img src={players[1].photoURL} className="h-14 rounded-full"/>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i >= 4 - 2 ? "bg-green-400" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute w-fit h-fit -translate-x-1/2 left-1/2 bottom-[10%] bg-[#472d7c] shadow-lg rounded-lg flex flex-col gap-4 p-10">
          <div className="flex w-full justify-between gap-6">
            {["rock", "paper", "scissors"].map((hand) => {
              const Icon = () => {
                if (hand === "rock") return <FaHandRock size={40} />;
                if (hand === "paper") return <FaHandPaper size={40} />;
                if (hand === "scissors") return <FaHandScissors size={40} />;
                return null;
              };

              const color = () => {
                if (hand === "rock") return "fuchsia-600";
                if (hand === "paper") return "blue-600";
                if (hand === "scissors") return "indigo-600";
              }

              return (
                <motion.div
                  key={hand}
                  whileHover={{ scale: 1.15, opacity: 1 }}
                  initial={{ opacity: 0.9 }}
                  className={`h-20 w-20 border flex justify-center items-center bg-${color()} text-white text-sm rounded-2xl border-4 border-white font-adrenaline cursor-pointer`}
                >
                  <Icon />
                </motion.div>
              );
            })}
          </div>
              <motion.div
                whileHover={{ scale: 1.1, opacity: 1 }}
                initial={{ opacity: 0.9 }}
                className={`h-14 w-full border flex justify-center items-center bg-gradient-to-r from-fuchsia-600 via-blue-600 to-indigo-600 text-white text-xl rounded-2xl border-4 border-white font-adrenaline cursor-pointer`}
              >
                LOCK IN
              </motion.div>
          </div>

      </div>
    </div>
  )



  // const [room, setRoom] = useState<string | null>(null);
  // const [players, setPlayers] = useState<Partial<User>[]>()
  // const [status, setStatus] = useState("Idle");
  // const [selected, setSelected] = useState<string | null>(null);
  // const [result, setResult] = useState<null | {
  //   choices: Record<string, string>;
  //   result: Result;
  // }>(null);

  // const {user} = useUser();

  // useEffect(() => {
  //   if(!user) return;

  //   socket.emit("register", user.uid);

  //   socket.on("start-game", ({ room, players }) => {
  //     setRoom(room);
  //     setPlayers(players)
  //     setStatus("Match found! Choose your move.");
  //     setSelected(null);
  //     setResult(null);
  //   });

  //   socket.on("game-result", (data) => {
  //     setResult(data);
  //     setStatus("Game complete. Play again?");
  //   });

  //   return () => {
  //     socket.off("start-game");
  //     socket.off("game-result");
  //   };
  // }, [user]);

  // const joinQueue = () => {
  //   socket.emit("join-queue");
  //   setStatus("Waiting for match...");
  // };

  // const makeChoice = (choice: string) => {
  //   if (!room || selected) return;
  //   setSelected(choice);
  //   socket.emit("player-choice", { room, choice });
  //   setStatus("Waiting for opponent's move...");
  // };

  // if(players) return (
  //   <Game players={players}/>
  // )

  // return (
  //   <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
  //     <h1 className="text-3xl font-bold mb-4">Rock Paper Scissors Online</h1>

  //     <p className="mb-6">{status}</p>

  //     {!room ? (
  //       <button
  //         onClick={joinQueue}
  //         className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
  //       >
  //         Join Queue
  //       </button>
  //     ) : (
  //       <div className="flex gap-4 mb-6">
  //         {["rock", "paper", "scissors"].map((choice) => (
  //           <button
  //             key={choice}
  //             onClick={() => makeChoice(choice)}
  //             className={`border px-4 py-2 rounded text-lg capitalize transition-all duration-200 ${
  //               selected === choice
  //                 ? "bg-blue-600 text-white"
  //                 : "bg-gray-100 hover:bg-gray-200"
  //             }`}
  //           >
  //             {choice}
  //           </button>
  //         ))}
  //       </div>
  //     )}

  //     {result && (
  //       <div className="text-center">
  //         <h2 className="text-xl font-semibold">Results</h2>
  //         <pre className="mt-2 bg-gray-100 p-2 rounded text-sm">
  //           {JSON.stringify(result, null, 2)}
  //         </pre>
  //       </div>
  //     )}
  //   </div>
}

export default GameScreen;