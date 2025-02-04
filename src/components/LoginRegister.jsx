import React, { useState, useMemo } from 'react'
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Slide,
    IconButton,
    ThemeProvider,
    createTheme,
    CssBaseline,
} from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'

// Auth Component
const LoginRegister = () => {
    const [activeForm, setActiveForm] = useState('login')
    const [darkMode, setDarkMode] = useState(false)

    // Theme Configuration
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    primary: { main: darkMode ? '#90caf9' : '#1976d2' },
                    secondary: { main: darkMode ? '#f48fb1' : '#d81b60' },
                    background: { default: darkMode ? '#121212' : '#f5f5f5' },
                    text: { primary: darkMode ? '#ffffff' : '#000000' },
                },
            }),
        [darkMode]
    )

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'background.default',
                    padding: { xs: 3, sm: 5 },
                    transition: 'background 0.5s ease',
                    position: 'relative',
                }}
            >
                {/* Dark Mode Toggle at Top-Right */}
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 15,
                        right: 15,
                        zIndex: 10,
                    }}
                    onClick={() => setDarkMode(!darkMode)}
                    color="inherit"
                >
                    {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '90%',
                        maxWidth: '1000px',
                        gap: { xs: 3, md: 8 },
                    }}
                >
                    {/* Left Side: Name */}
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            sx={{
                                color: 'text.primary',
                                fontSize: { xs: '2rem', md: '3rem' },
                            }}
                        >
                            CONTRLZ
                        </Typography>
                    </Box>

                    {/* Right Side: Forms */}
                    <Box
                        sx={{
                            flex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        {/* Switcher Buttons */}
                        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                            <Button
                                variant={
                                    activeForm === 'login'
                                        ? 'contained'
                                        : 'outlined'
                                }
                                color="primary"
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    borderRadius: '20px',
                                }}
                                onClick={() => setActiveForm('login')}
                            >
                                Login
                            </Button>
                            <Button
                                variant={
                                    activeForm === 'signup'
                                        ? 'contained'
                                        : 'outlined'
                                }
                                color="secondary"
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    borderRadius: '20px',
                                }}
                                onClick={() => setActiveForm('signup')}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        {/* Form Container - Adjusted Height and Visibility */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: 400,
                                minHeight: 320, // Ensures form height is enough to fit all fields
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Login Form */}
                            <Slide
                                direction="right"
                                in={activeForm === 'login'}
                                mountOnEnter
                                unmountOnExit
                            >
                                <Paper
                                    elevation={8}
                                    sx={{
                                        position: 'absolute',
                                        width: '100%',
                                        p: 4,
                                        borderRadius: '10px',
                                        bgcolor: 'background.paper',
                                        boxShadow:
                                            '0px 10px 30px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        mb={2}
                                        fontWeight="bold"
                                    >
                                        Welcome Back!
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        margin="normal"
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            mt: 2,
                                            py: 1.2,
                                            fontSize: '1rem',
                                        }}
                                    >
                                        Login
                                    </Button>
                                </Paper>
                            </Slide>

                            {/* Signup Form */}
                            <Slide
                                direction="left"
                                in={activeForm === 'signup'}
                                mountOnEnter
                                unmountOnExit
                            >
                                <Paper
                                    elevation={8}
                                    sx={{
                                        position: 'absolute',
                                        width: '100%',
                                        p: 4,
                                        borderRadius: '10px',
                                        bgcolor: 'background.paper',
                                        boxShadow:
                                            '0px 10px 30px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        mb={2}
                                        fontWeight="bold"
                                    >
                                        Create an Account
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        type="text"
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        margin="normal"
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="secondary"
                                        sx={{
                                            mt: 2,
                                            py: 1.2,
                                            fontSize: '1rem',
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </Paper>
                            </Slide>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    )
}

export default LoginRegister
