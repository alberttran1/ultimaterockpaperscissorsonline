
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import GlobalModal from './Components/GlobalModal'
import HomeScreen from './Screens/HomeScreen/HomeScreen'
import DashboardScreen from './Screens/DashboardScreen/DashboardScreen'
import GameScreen from './Screens/GameScreen/GameScreen'
import { useUser } from './Context/UserContext'
import LoadingScreen from './Screens/LoadingScreen'

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
                path="/game"
                element={<GameScreen/>}
                />
                <Route path="*" element={<p>404 - Page Not Found</p>} />
            </Routes>
        </Router>
    )
}

export default RouterComponent