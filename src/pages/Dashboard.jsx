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
import NavBar from './NavBar'
import { useWebSocket } from '../context/WebSocketContext'

const Dashboard = () => {
    const { darkMode } = useDarkMode()
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalDevices: 0,
        activeDevices: 0,
        recentActivities: [],
    })

    const toastOptions = {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: darkMode ? 'dark' : 'light',
    }

    const fetchInitialData = async () => {
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
    }

    const { isConnected, subscribe } = useWebSocket()

    useEffect(() => {
        fetchInitialData()
        if (!isConnected) return

        const subscription = subscribe('/contrlz/devices', (data) => {
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

        const activity = subscribe('/contrlz/recent-activity', (data) => {
            console.log('Received WebSocket recent activities update:', data)
            setDashboardData((prevData) => {
                return {
                    ...prevData,
                    recentActivities: [...data],
                }
            })
        })

        return () => {
            if (activity) activity.unsubscribe()
            if (subscription) subscription.unsubscribe()
        }
    }, [isConnected])
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
