
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import GlobalModal from './Components/GlobalModal'
import HomeScreen from './Screens/HomeScreen/HomeScreen'
import DashboardScreen from './Screens/DashboardScreen/DashboardScreen'
import GameScreen from './Screens/GameScreen/GameScreen'
import { useUser } from './Context/UserContext'
import LoadingScreen from './Screens/LoadingScreen'
import JoinRoomScreen from './Screens/JoinRoomScreen'
import NotFoundScreen from './Screens/NotFoundScreen'
import ProfileScreen from './Screens/ProfileScreen'

const RouterComponent = () => {
    const { user, loading } = useUser()

    if(loading) return <LoadingScreen/>
    
    return (
        <Router>
            <GlobalModal/>
            <Routes>
                <Route 
                path="/" 
                element={!user?.username ? <HomeScreen /> : <Navigate to="/dashboard"/>} 
                />
                <Route
                path="/dashboard"
                element={user ? <DashboardScreen/> : <Navigate to="/"/>}
                />
                <Route
                path="/game/:roomId"
                element={<GameScreen/>}
                />
                <Route
                path="/join"
                element={user ? <JoinRoomScreen /> : <Navigate to="/" />}
                />
                <Route
                path="/profile"
                element={user ? <ProfileScreen /> : <Navigate to="/" />}
                />
                <Route path="*" element={<NotFoundScreen/>} />
            </Routes>
        </Router>
    )
}

export default RouterComponent