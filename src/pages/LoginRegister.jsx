import React, { useState } from 'react'
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    CircularProgress,
} from '@mui/material'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ControlCameraIcon from '@mui/icons-material/ControlCamera'
import { motion } from 'framer-motion'
import { useDarkMode } from '../context/DarkModeContext'
import { loginRoute, registerRoute } from '../utils/ApiRoutes'
import { useNavigate } from 'react-router-dom'

const LoginRegister = () => {
    const [activeForm, setActiveForm] = useState('login')

    const { darkMode } = useDarkMode()

    const [loginData, setLoginData] = useState({ username: '', password: '' })

    const [signupData, setSignupData] = useState({
        username: '',
        email: '',
        password: '',
    })

    const [loading, setLoading] = useState(false)

    const toastOptions = {
        position: 'bottom-left',
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
        theme: darkMode ? 'dark' : 'light',
    }

    const handleChange = (e, form) => {
        const { name, value } = e.target
        if (form === 'login') {
            setLoginData({ ...loginData, [name]: value })
        } else {
            setSignupData({ ...signupData, [name]: value })
        }
    }
    const navigate = useNavigate()
    const validateLogin = async () => {
        setLoading(true)

        try {
            const response = await axios.post(loginRoute, loginData)
            const { token } = response.data
            if (token) {
                localStorage.setItem('token', token)
                axios.defaults.headers.common[
                    'Authorization'
                ] = `Bearer ${token}`
                toast.success('Login successful!', toastOptions)
                navigate('/')
            }
        } catch (error) {
            toast.error('Invalid login credentials', toastOptions)
        } finally {
            setLoading(false)
        }
    }

    const validateSignup = async () => {
        setLoading(true)

        try {
            const response = await axios.post(registerRoute, signupData)
            console.log(response.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error('Failed to create an account', toastOptions)
        }
    }

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default',
                padding: { xs: 3, sm: 5 },
                position: 'relative',
                transition: 'background 0.5s ease',
            }}
        >
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
                <Box
                    sx={{
                        flex: 1,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ControlCameraIcon
                        sx={{
                            fontSize: '10rem',
                            color: 'orange',
                        }}
                    />
                    <Typography
                        variant="h2"
                        fontWeight="bold"
                        sx={{
                            color: 'text.primary',
                            fontSize: { xs: '0rem', md: '3rem' },
                            display: { xs: 'none', md: 'block' },
                        }}
                    >
                        CONTRLZ
                    </Typography>
                </Box>

                <Box
                    sx={{
                        flex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        position: 'relative',
                    }}
                >
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
                                minWidth: '120px',
                            }}
                            onClick={() => setActiveForm('login')}
                            aria-pressed={activeForm === 'login'}
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
                                minWidth: '120px',
                            }}
                            onClick={() => setActiveForm('signup')}
                            aria-pressed={activeForm === 'signup'}
                        >
                            Sign Up
                        </Button>
                    </Box>

                    <Box
                        component={motion.div}
                        key={activeForm}
                        initial={{
                            opacity: 0,
                            x: activeForm === 'login' ? -20 : 20,
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{
                            opacity: 0,
                            x: activeForm === 'login' ? 20 : -20,
                        }}
                        transition={{ duration: 0.5 }}
                        sx={{ width: '100%', maxWidth: 400 }}
                    >
                        <Paper
                            elevation={8}
                            sx={{
                                p: 4,
                                borderRadius: '10px',
                                bgcolor: 'background.paper',
                                boxShadow: darkMode
                                    ? '5px 15px 30px rgb(222,222,222,0.2)'
                                    : '5px 15px 30px rgb(0,0,0,0.2)',
                                width: '100%',
                                minWidth: { xs: '90%', sm: '400px' },
                            }}
                        >
                            <Typography variant="h6" mb={2} fontWeight="bold">
                                {activeForm === 'login'
                                    ? 'Welcome Back!'
                                    : 'Create an Account'}
                            </Typography>

                            {activeForm === 'login' ? (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        type="text"
                                        margin="normal"
                                        name="username"
                                        value={loginData.username}
                                        onChange={(e) =>
                                            handleChange(e, 'login')
                                        }
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        margin="normal"
                                        name="password"
                                        value={loginData.password}
                                        onChange={(e) =>
                                            handleChange(e, 'login')
                                        }
                                        sx={{ mb: 2 }}
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            mt: 2,
                                            py: 1.2,
                                            fontSize: '1rem',
                                            borderRadius: '20px',
                                        }}
                                        onClick={validateLogin}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <CircularProgress
                                                size={24}
                                                color="inherit"
                                            />
                                        ) : (
                                            'Login'
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        type="text"
                                        margin="normal"
                                        name="username"
                                        value={signupData.username}
                                        onChange={(e) =>
                                            handleChange(e, 'signup')
                                        }
                                        sx={{
                                            mb: 2,
                                            '& label.Mui-focused': {
                                                color: 'secondary.main',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {
                                                    borderColor:
                                                        'secondary.main',
                                                },
                                            },
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        margin="normal"
                                        name="email"
                                        value={signupData.email}
                                        onChange={(e) =>
                                            handleChange(e, 'signup')
                                        }
                                        sx={{
                                            mb: 2,
                                            '& label.Mui-focused': {
                                                color: 'secondary.main',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {
                                                    borderColor:
                                                        'secondary.main',
                                                },
                                            },
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        margin="normal"
                                        name="password"
                                        value={signupData.password}
                                        onChange={(e) =>
                                            handleChange(e, 'signup')
                                        }
                                        sx={{
                                            mb: 2,
                                            '& label.Mui-focused': {
                                                color: 'secondary.main',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '&.Mui-focused fieldset': {
                                                    borderColor:
                                                        'secondary.main',
                                                },
                                            },
                                        }}
                                    />

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="secondary"
                                        sx={{
                                            mt: 2,
                                            py: 1.2,
                                            fontSize: '1rem',
                                            borderRadius: '20px',
                                        }}
                                        onClick={validateSignup}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <CircularProgress
                                                size={24}
                                                color="inherit"
                                            />
                                        ) : (
                                            'Sign Up'
                                        )}
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default LoginRegister
