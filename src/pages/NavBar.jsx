import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    Tooltip,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Divider,
} from '@mui/material'
import {
    Menu as MenuIcon,
    Devices,
    People,
    Home,
    AccountCircle,
    Logout,
    KeyboardArrowDown,
    DarkMode,
    LightMode,
    Report,
} from '@mui/icons-material'
import ControlCameraIcon from '@mui/icons-material/ControlCamera'
import { useDarkMode } from '../context/DarkModeContext'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const NavBar = () => {
    const theme = useTheme()
    const { darkMode, toggleDarkMode } = useDarkMode()
    const location = useLocation()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [mobileOpen, setMobileOpen] = useState(false)
    const [userMenuAnchor, setUserMenuAnchor] = useState(null)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    if (!token) {
        console.warn('No token found! Redirecting to login...')
        navigate('/login')
    }
    const user = token ? jwtDecode(token) : ''

    const navItems = [
        { text: 'Dashboard', path: '/', icon: <Home /> },
        { text: 'Reports', path: '/reports', icon: <Report /> },
        { text: 'Devices', path: '/devices', icon: <Devices /> },
        ...(user.role === 'ADMIN'
            ? [{ text: 'Users', path: '/users', icon: <People /> }]
            : []),
    ]

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget)
    }

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null)
    }

    const handleLogout = () => {
        // Remove token from localStorage
        localStorage.removeItem('token')

        // Reset Axios Authorization header
        delete axios.defaults.headers.common['Authorization']

        // Optionally redirect to login page
        navigate('/login')

        // Close the menu
        handleUserMenuClose()
    }

    const drawer = (
        <Box sx={{ width: 250 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <ControlCameraIcon
                    sx={{
                        mr: 1,
                        fontSize: '2rem',
                        color: darkMode ? 'orange' : theme.palette.primary.main,
                    }}
                />
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontWeight: 'bold',
                        color: theme.palette.text.primary,
                    }}
                >
                    CONTRLZ
                </Typography>
            </Box>
            <List>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path

                    return (
                        <ListItem
                            key={item.text}
                            component={Link}
                            to={item.path}
                            onClick={handleDrawerToggle}
                            disablePadding
                            sx={{
                                color: isActive
                                    ? theme.palette.primary.main
                                    : theme.palette.text.primary,
                                bgcolor: isActive
                                    ? theme.palette.mode === 'dark'
                                        ? 'rgba(255, 165, 0, 0.1)'
                                        : 'rgba(25, 118, 210, 0.08)'
                                    : 'transparent',
                                '&:hover': {
                                    bgcolor: theme.palette.action.hover,
                                },
                            }}
                        >
                            <ListItemButton>
                                <ListItemIcon
                                    sx={{
                                        color: isActive
                                            ? darkMode
                                                ? 'orange'
                                                : theme.palette.primary.main
                                            : theme.palette.text.primary,
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 400,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </Box>
    )

    return (
        <AppBar
            position="sticky"
            sx={{
                bgcolor: darkMode ? 'background.paper' : 'primary.main',
                boxShadow: theme.shadows[1],
                borderBottom: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Left Section - Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ControlCameraIcon
                        sx={{
                            mr: 1,
                            fontSize: '2rem',
                            color: darkMode ? 'orange' : 'white',
                        }}
                    />
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 'bold',
                            color: darkMode ? 'text.primary' : 'white',
                        }}
                    >
                        CONTRLZ
                    </Typography>
                </Box>

                {/* Desktop Navigation */}
                {!isMobile && (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            ml: 4,
                            flexGrow: 1,
                            justifyContent: 'center',
                        }}
                    >
                        {navItems.slice(0, 4).map((item) => {
                            const isActive = location.pathname === item.path

                            return (
                                <Tooltip
                                    key={item.text}
                                    title={item.text}
                                    placement="bottom"
                                >
                                    <IconButton
                                        component={Link}
                                        to={item.path}
                                        sx={{
                                            color: isActive
                                                ? darkMode
                                                    ? 'orange'
                                                    : 'white'
                                                : darkMode
                                                ? 'text.secondary'
                                                : 'rgba(255,255,255,0.7)',
                                            '&:hover': {
                                                color: darkMode
                                                    ? 'orange'
                                                    : 'white',
                                                bgcolor: darkMode
                                                    ? 'rgba(255, 165, 0, 0.1)'
                                                    : 'rgba(255,255,255,0.1)',
                                            },
                                            transition: 'all 0.3s ease',
                                            borderBottom: isActive
                                                ? darkMode
                                                    ? '2px solid orange'
                                                    : '2px solid white'
                                                : '2px solid transparent',
                                            borderRadius: isActive
                                                ? '0px'
                                                : '4px',
                                            padding: '8px 16px',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {item.icon}
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    mt: 0.5,
                                                    fontWeight: isActive
                                                        ? 600
                                                        : 400,
                                                }}
                                            >
                                                {item.text}
                                            </Typography>
                                        </Box>
                                    </IconButton>
                                </Tooltip>
                            )
                        })}
                    </Box>
                )}

                {/* Right Section - User Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Theme Toggle */}
                    <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                        <IconButton
                            onClick={() => toggleDarkMode(!darkMode)}
                            sx={{
                                color: darkMode ? 'text.primary' : 'white',
                            }}
                        >
                            {darkMode ? <LightMode /> : <DarkMode />}
                        </IconButton>
                    </Tooltip>

                    {/* User Menu */}
                    <Box>
                        <IconButton
                            onClick={handleUserMenuOpen}
                            sx={{
                                color: darkMode ? 'text.primary' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: darkMode ? 'orange' : 'white',
                                    color: darkMode
                                        ? 'white'
                                        : theme.palette.primary.main,
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                {user.sub[0]}
                            </Avatar>
                            {!isMobile && (
                                <>
                                    <Typography
                                        sx={{
                                            ml: 1,
                                            display: {
                                                xs: 'none',
                                                sm: 'block',
                                            },
                                        }}
                                    >
                                        {user.sub}
                                    </Typography>
                                    <KeyboardArrowDown
                                        sx={{ fontSize: '1rem', ml: 0.5 }}
                                    />
                                </>
                            )}
                        </IconButton>
                    </Box>

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <IconButton
                            edge="end"
                            onClick={handleDrawerToggle}
                            sx={{
                                color: darkMode ? 'text.primary' : 'white',
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                </Box>
            </Toolbar>

            {/* User Menu */}
            <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                PaperProps={{
                    sx: { width: 200, mt: 1.5 },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleUserMenuClose}
                >
                    <ListItemIcon>
                        <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </MenuItem>
            </Menu>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    '& .MuiDrawer-paper': {
                        bgcolor: 'background.paper',
                        width: 250,
                    },
                }}
            >
                {drawer}
            </Drawer>
        </AppBar>
    )
}

export default NavBar
