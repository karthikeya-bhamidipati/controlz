import {
    BrowserRouter,
    Routes,
    Route,
} from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { DarkModeProvider } from './context/DarkModeContext'
import 'react-toastify/dist/ReactToastify.css'
import DeviceManagement from './pages/DeviceManagement'
import UserManagement from './pages/UserManagement'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import LoginRegister from './pages/LoginRegister'
import UserProfile from './pages/UserProfile'
import ProtectedRoute from './context/ProtectedRoute'
import axios from 'axios'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

function AppContent() {

    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }

        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token')
                    delete axios.defaults.headers.common['Authorization']
                    toast.error('Session expired. Please log in again.')
                    navigate('/login')
                }
                return Promise.reject(error)
            }
        )
    }, [navigate])

    return (
        <>
            <ToastContainer />
            <Routes>
            <Route path="/login" element={<LoginRegister />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/devices" element={<DeviceManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/profile" element={<UserProfile />} />
            </Route>
        </Routes>
        </>
    )
}

function App() {
    return (
        <BrowserRouter>
            <DarkModeProvider>
                <AppContent />
            </DarkModeProvider>
        </BrowserRouter>
    )
}

export default App
