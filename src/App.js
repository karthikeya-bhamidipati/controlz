import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginRegister from './components/LoginRegister'
import { IconButton } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { ToastContainer } from 'react-toastify'
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext'
import 'react-toastify/dist/ReactToastify.css'

function AppContent() {
    const { darkMode, setDarkMode } = useDarkMode()

    return (
        <>
            <IconButton
                sx={{
                    position: 'absolute',
                    top: 15,
                    right: 15,
                    zIndex: 10,
                }}
                onClick={() => setDarkMode(!darkMode)}
                color="inherit"
                aria-label="Toggle Dark Mode"
            >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <ToastContainer />

            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginRegister />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

function App() {
    return (
        <DarkModeProvider>
            <AppContent />
        </DarkModeProvider>
    )
}

export default App
