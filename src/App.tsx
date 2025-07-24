// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
import { ModalProvider } from "./Context/ModalContext";
import { UserProvider } from "./Context/UserContext";
import { SocketProvider } from "./Context/SocketContext";
import RouterComponent from "./RouterComponent";
import { GameRoomProvider } from "./Context/GameRoomContext";

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <ModalProvider>
          <GameRoomProvider>
            <RouterComponent/>
          </GameRoomProvider>
        </ModalProvider>
      </SocketProvider>
    </UserProvider>

  );
}

export default App;
