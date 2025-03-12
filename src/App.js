import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { IconButton } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { ToastContainer } from 'react-toastify'
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext'
import 'react-toastify/dist/ReactToastify.css'
import UserManagement from './pages/UserManagement'
import Dashboard from './pages/Dashboard'
import DeviceManagement from './pages/DeviceManagement'
import Analytics from './pages/Analytics'
import NavBar from './pages/NavBar'
import Settings from './pages/Settings'
import LoginRegister from './pages/LoginRegister'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
    const { darkMode, setDarkMode } = useDarkMode()

    return (
        <>
            <IconButton
                sx={{
                    position: 'fixed',
                    top: 15,
                    right: 15,
                    zIndex: 11000,
                }}
                onClick={() => setDarkMode(!darkMode)}
                color="inherit"
                aria-label="Toggle Dark Mode"
            >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <ToastContainer />
            {useLocation().pathname !== '/login' && <NavBar />}
            <Routes>
                <Route path="/login" element={<LoginRegister />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/devices" element={<DeviceManagement />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/settings" element={<Settings />} />
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
