import React, { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Stack,
} from '@mui/material'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDarkMode } from '../context/DarkModeContext'
import { allDeviceRoute, getRecentActivitiesRoute } from '../utils/ApiRoutes'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const Dashboard = () => {
    const { darkMode } = useDarkMode()
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalDevices: 0,
        activeDevices: 0,
        recentActivities: [],
    })

    const toastOptions = {
        position: 'bottom-left',
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
        theme: darkMode ? 'dark' : 'light',
    }

    // Function to fetch initial data on page load
    const fetchInitialData = async () => {
        try {
            const [deviceResponse, activityResponse] = await Promise.all([
                axios.get(allDeviceRoute),
                axios.get(getRecentActivitiesRoute),
            ])

            console.log(deviceResponse.data)
            console.log(activityResponse.data)

            const totalDevices = deviceResponse.data.length
            const activeDevices = deviceResponse.data.filter(
                (device) => device.status === true
            ).length
            const recentActivities = activityResponse.data

            setDashboardData({
                totalDevices,
                activeDevices,
                recentActivities,
            })
        } catch (error) {
            toast.error('Error fetching dashboard data', toastOptions)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInitialData()
        const token = localStorage.getItem('token')
        // WebSocket connection
        const socket = new SockJS('http://localhost:8080/ws')
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (msg) => console.log(msg),
            onConnect: () => {
                console.log('Connected to WebSocket')

                // Subscribe to device updates
                stompClient.subscribe(
                    '/contrlz/devices',
                    (message) => {
                        const data = JSON.parse(message.body)
                        console.log('Received WebSocket update:', data)

                        const totalDevices = data.length
                        const activeDevices = data.filter(
                            (device) => device.status === true
                        ).length

                        setDashboardData((prev) => ({
                            ...prev,
                            totalDevices,
                            activeDevices,
                        }))
                    },
                    { Authorization: `Bearer ${token}` } // Send JWT token in headers
                )

                // Subscribe to recent activities updates
                stompClient.subscribe(
                    '/contrlz/recentActivities',
                    (message) => {
                        const recentActivities = JSON.parse(message.body)
                        setDashboardData((prev) => ({
                            ...prev,
                            recentActivities,
                        }))
                    },
                    { Authorization: `Bearer ${token}` } // Send JWT token in headers
                )
            },
            connectHeaders: {
                Authorization: `Bearer ${token}`, // Attach token for authentication
            },
        })

        stompClient.activate()
        // Add error handling to WebSocket connection
        stompClient.onWebSocketError = (error) => {
            console.error('WebSocket Error:', error)
            toast.error('Real-time connection failed', toastOptions)
        }

        stompClient.onStompError = (frame) => {
            console.error('STOMP Error:', frame.headers.message)
            toast.error('Real-time protocol error', toastOptions)
        }

        return () => {
            stompClient.deactivate()
        }
    }, [])

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                p: { xs: 2, sm: 4 },
                transition: 'background 0.5s ease',
            }}
        >
            <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ mb: 4, color: 'text.primary' }}
            >
                Dashboard
            </Typography>

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50vh',
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={3}>
                    {/* Key Metrics */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                        <Card
                            sx={{
                                flex: 1,
                                bgcolor: 'background.paper',
                                boxShadow: darkMode
                                    ? '5px 15px 30px rgba(222,222,222,0.2)'
                                    : '5px 15px 30px rgba(0,0,0,0.2)',
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" color="text.secondary">
                                    Total Devices
                                </Typography>
                                <Typography variant="h3" color="primary">
                                    {dashboardData.totalDevices}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card
                            sx={{
                                flex: 1,
                                bgcolor: 'background.paper',
                                boxShadow: darkMode
                                    ? '5px 15px 30px rgba(222,222,222,0.2)'
                                    : '5px 15px 30px rgba(0,0,0,0.2)',
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" color="text.secondary">
                                    Active Devices
                                </Typography>
                                <Typography variant="h3" color="success.main">
                                    {dashboardData.activeDevices}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Stack>

                    {/* Recent Activities */}
                    <Card
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: darkMode
                                ? '5px 15px 30px rgba(222,222,222,0.2)'
                                : '5px 15px 30px rgba(0,0,0,0.2)',
                        }}
                    >
                        <CardContent>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                mb={2}
                            >
                                Recent Activities
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {dashboardData.recentActivities.length > 0 ? (
                                dashboardData.recentActivities.map(
                                    (activity, index) => (
                                        <Typography
                                            key={index}
                                            variant="body2"
                                            sx={{ mb: 1 }}
                                        >
                                            {activity.device.deviceType} -{' '}
                                            {activity.device.deviceLocation}{' '}
                                            {activity.device.status === true
                                                ? 'turned on'
                                                : 'turned off'}{' '}
                                            at{' '}
                                            {new Date(
                                                activity.device.status === true
                                                    ? activity.startTime
                                                    : activity.endTime
                                            ).toLocaleString()}
                                        </Typography>
                                    )
                                )
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    No recent activities.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Stack>
            )}
        </Box>
    )
}

export default Dashboard
