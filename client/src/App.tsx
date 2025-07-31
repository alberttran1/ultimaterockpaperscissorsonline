// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
import { ModalProvider } from "./Context/ModalContext";
import { UserProvider } from "./Context/UserContext";
import { SocketProvider } from "./Context/SocketContext";
import RouterComponent from "./RouterComponent";
import { GameInfoProvider } from "./Context/GameInfoContext";

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <ModalProvider>
          <GameInfoProvider>
            <RouterComponent />
          </GameInfoProvider>
        </ModalProvider>
      </SocketProvider>
    </UserProvider>
  );
}

export default App;
