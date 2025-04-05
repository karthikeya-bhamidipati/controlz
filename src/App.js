import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext'
import 'react-toastify/dist/ReactToastify.css'
import DeviceManagement from './pages/DeviceManagement'
import UserManagement from './pages/UserManagement'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import LoginRegister from './pages/LoginRegister'
import UserProfile from './pages/UserProfile'
import ProtectedRoute from './context/ProtectedRoute'
import { WebSocketProvider } from './context/WebSocketContext'
import { ToastContainer } from 'react-toastify'
import React, { useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import Reports from './pages/Reports'

function AppContent() {
    const { darkMode } = useDarkMode()
    // Function to check if JWT token is expired
    const isTokenExpired = () => {
        const token = localStorage.getItem('token')
        if (!token) return true // If no token, treat it as expired

        try {
            const { exp } = jwtDecode(token) // Decode token to get expiry time
            return Date.now() >= exp * 1000 // Compare with current time
        } catch (error) {
            return true // If decoding fails, assume token is invalid
        }
    }
    const navigate = useNavigate()

    useEffect(() => {
        const checkToken = () => {
            if (isTokenExpired()) {
                localStorage.removeItem('token') // Remove expired token
                navigate('/login') // Redirect to login
            }
        }

        // Run check immediately on mount
        checkToken()

        // Set interval to check token every 1 minute
        const interval = setInterval(checkToken, 60000)

        return () => clearInterval(interval) // Cleanup interval on unmount
    }, [])
    return (
        <>
            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                pauseOnHover={true}
                draggable={true}
                theme={darkMode ? 'dark' : 'light'}
            />
            <Routes>
                <Route path="/login" element={<LoginRegister />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/devices" element={<DeviceManagement />} />
                    <Route
                        path="/analytics/:deviceId"
                        element={<Analytics />}
                    />
                    <Route path="/reports" element={<Reports/>} />
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
            <WebSocketProvider>
                <DarkModeProvider>
                    <AppContent />
                </DarkModeProvider>
            </WebSocketProvider>
        </BrowserRouter>
    )
}

export default App
