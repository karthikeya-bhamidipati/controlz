import React, { useState, useEffect, useRef, useCallback } from 'react'
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
import NavBar from './NavBar'

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
    const stompClientRef = useRef(null) // Store WebSocket instance

    const fetchInitialData = useCallback(async () => {
        try {
            const [deviceResponse, activityResponse] = await Promise.all([
                axios.get(allDeviceRoute),
                axios.get(getRecentActivitiesRoute),
            ])

            console.log('Fetched Initial Devices:', deviceResponse.data)
            console.log('Fetched Initial Activities:', activityResponse.data)

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
    }, [])

    useEffect(() => {
        fetchInitialData() // Fetch data on mount

        const token = localStorage.getItem('token')

        // Prevent duplicate connections
        if (stompClientRef.current) {
            console.log('WebSocket already connected')
            return
        }

        const socket = new SockJS('http://localhost:8080/ws')
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (msg) => console.log('[WebSocket Debug]:', msg),
            connectHeaders: {
                Authorization: `Bearer ${token}`, // Attach JWT token at connection time
            },
            onConnect: () => {
                console.log('Connected to WebSocket')

                // Subscribe to device updates
                stompClient.subscribe('/contrlz/devices', (message) => {
                    const data = JSON.parse(message.body)
                    console.log('Received WebSocket device update:', data)

                    setDashboardData((prevData) => {
                        return {
                            ...prevData,
                            totalDevices: data.length,
                            activeDevices: data.filter(
                                (device) => device.status === true
                            ).length,
                        }
                    })
                })

                // Subscribe to recent activities updates
                stompClient.subscribe('/contrlz/recent-activity', (message) => {
                    const data = JSON.parse(message.body)
                    console.log(
                        'Received WebSocket recent activities update:',
                        data
                    )
                    setDashboardData((prevData) => {
                        return {
                            ...prevData,
                            recentActivities: [...data],
                        }
                    })
                })
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame.headers.message)
                toast.error('Real-time protocol error', toastOptions)
            },
            onWebSocketError: (error) => {
                console.error('WebSocket Error:', error)
                toast.error('Real-time connection failed', toastOptions)
            },
        })

        stompClientRef.current = stompClient
        stompClient.activate()

        return () => {
            if (stompClientRef.current) {
                console.log('Disconnecting WebSocket...')
                stompClientRef.current.deactivate()
                stompClientRef.current = null
            }
        }
    }, [fetchInitialData])
    return (
        <>
            <NavBar />
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
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={3}
                        >
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
                                    <Typography
                                        variant="h6"
                                        color="text.secondary"
                                    >
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
                                    <Typography
                                        variant="h6"
                                        color="text.secondary"
                                    >
                                        Active Devices
                                    </Typography>
                                    <Typography
                                        variant="h3"
                                        color="success.main"
                                    >
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
                                    fontWeight="bold"
                                    color="text.primary"
                                    mb={2}
                                >
                                    Recent Activities
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                {dashboardData.recentActivities.length > 0 ? (
                                    dashboardData.recentActivities.map(
                                        (activity, index) => (
                                            <Box key={index}>
                                                {/* Entry for Turned Off (only if both turnedOffBy & endTime exist) */}
                                                {activity.turnedOffBy &&
                                                    activity.endTime && (
                                                        <>
                                                            <Typography
                                                                variant="body1"
                                                                sx={{ mb: 1 }}
                                                            >
                                                                {
                                                                    activity
                                                                        .device
                                                                        .deviceType
                                                                }{' '}
                                                                TURNED OFF{' '}
                                                                {
                                                                    activity
                                                                        .device
                                                                        .deviceLocation
                                                                }{' '}
                                                                {new Date(
                                                                    activity.endTime
                                                                ).toLocaleString()}{' '}
                                                                by{' '}
                                                                {
                                                                    activity.turnedOffBy
                                                                }
                                                            </Typography>
                                                            <Divider
                                                                sx={{ mb: 1 }}
                                                            />
                                                        </>
                                                    )}
                                                {/* Entry for Turned On */}
                                                <Typography
                                                    variant="body1"
                                                    sx={{ mb: 1 }}
                                                >
                                                    {activity.device.deviceType}{' '}
                                                    TURNED ON{' '}
                                                    {
                                                        activity.device
                                                            .deviceLocation
                                                    }{' '}
                                                    {new Date(
                                                        activity.startTime
                                                    ).toLocaleString()}{' '}
                                                    by {activity.turnedOnBy}
                                                </Typography>
                                                <Divider sx={{ mb: 1 }} />
                                            </Box>
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
        </>
    )
}

export default Dashboard
