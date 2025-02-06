import { createContext, useState, useMemo, useContext } from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'

// Create Dark Mode Context
const DarkModeContext = createContext()

export const DarkModeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false)

    // Define MUI theme with dark mode support
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    primary: { main: darkMode ? '#FFA500' : '#FF8C00' }, // Orange theme
                    secondary: { main: darkMode ? '#29B6F6' : '#48CAE4' }, // Aqua Blue
                    background: { default: darkMode ? '#121212' : '#FAFAFA' },
                    text: { primary: darkMode ? '#ffffff' : '#1E293B' },
                },
            }),
        [darkMode]
    )

    return (
        <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </DarkModeContext.Provider>
    )
}

// Custom Hook for Dark Mode
export const useDarkMode = () => useContext(DarkModeContext)
