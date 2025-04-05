import React, { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Button,
    Grid,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material'
import { useWebSocket } from '../context/WebSocketContext'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDarkMode } from '../context/DarkModeContext'
import NavBar from './NavBar'
import {
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { getRecentActivitiesRoute } from '../utils/ApiRoutes'

const Analytics = () => {
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    const { deviceId } = useParams()
    const navigate = useNavigate()
    const { darkMode } = useDarkMode()
    const { isConnected, subscribe } = useWebSocket()

    const [loading, setLoading] = useState(true)
    const [analyticsData, setAnalyticsData] = useState([])
    const [uptime, setUptime] = useState('Calculating...')

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(
                `${getRecentActivitiesRoute}/${deviceId}`
            )
            setAnalyticsData(response.data)
        } catch (error) {
            toast.error('Error fetching analytics data')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchAnalytics()

        if (!isConnected) {
            console.log('WebSocket not connected')
            return
        }

        console.log('Subscribing to WebSocket topics')

        const activitySubscription = subscribe(
            '/contrlz/recent-activity',
            (data) => {
                console.log('Activity data received:', data)
                const newActivities =
                    typeof data === 'string' ? JSON.parse(data) : data
                setAnalyticsData([...newActivities])
            }
        )

        return () => {
            if (activitySubscription) activitySubscription.unsubscribe()
        }
    }, [isConnected])

    useEffect(() => {
        const interval = setInterval(() => {
            setUptime(formatUptime(calculateUptimeSeconds(analyticsData)))
        }, 1000)

        return () => clearInterval(interval)
    }, [analyticsData])

    const calculateUptimeSeconds = (logs) => {
        if (!Array.isArray(logs) || logs.length === 0) return 0

        const sortedLogs = [...logs].sort(
            (a, b) => new Date(a.eventTime) - new Date(b.eventTime)
        )
        let totalUptimeSeconds = 0
        let lastOnTime = null

        sortedLogs.forEach((log) => {
            const time = new Date(log.eventTime)
            if (log.event === 'ON') {
                lastOnTime = time
            } else if (log.event === 'OFF' && lastOnTime) {
                totalUptimeSeconds += (time - lastOnTime) / 1000
                lastOnTime = null
            }
        })

        if (lastOnTime) {
            totalUptimeSeconds += (new Date() - lastOnTime) / 1000
        }

        return totalUptimeSeconds
    }

    const formatUptime = (seconds) => {
        const units = [
            { label: 'month', value: 2592000 },
            { label: 'week', value: 604800 },
            { label: 'day', value: 86400 },
            { label: 'hour', value: 3600 },
            { label: 'minute', value: 60 },
            { label: 'second', value: 1 },
        ]

        let str = ''
        for (const unit of units) {
            const count = Math.floor(seconds / unit.value)
            if (count > 0) {
                str += `${count} ${unit.label}${count > 1 ? 's' : ''} `
                seconds %= unit.value
            }
        }

        return str.trim() || '0 seconds'
    }

    const chartData = analyticsData.map((entry) => ({
        time: new Date(entry.eventTime).toLocaleTimeString(),
        status: entry.event === 'ON' ? 1 : 0,
    }))

    const totalEvents = analyticsData.length
    const onEvents = analyticsData.filter((e) => e.event === 'ON').length
    const offEvents = totalEvents - onEvents
    const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString()
    const deviceInfo = analyticsData[0]?.device

    return (
        <>
            <NavBar />
            <Box
                sx={{
                    p: 3,
                    bgcolor: darkMode ? '#121212' : '#f5f7fa',
                    minHeight: '100vh',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4,
                    }}
                >
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="text.primary"
                    >
                        Device Analytics of{' '}
                        {deviceInfo
                            ? `${deviceInfo.deviceType} (${deviceInfo.deviceLocation})`
                            : ''}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/devices')}
                    >
                        Back to Devices
                    </Button>
                </Box>

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
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 3,
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        color="text.secondary"
                                    >
                                        Total Events
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        color="primary.main"
                                    >
                                        {totalEvents}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 3,
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        color="text.secondary"
                                    >
                                        Times Turned On
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        color="success.main"
                                    >
                                        {onEvents}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 3,
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        color="text.secondary"
                                    >
                                        Times Turned Off
                                    </Typography>
                                    <Typography variant="h4" color="error.main">
                                        {offEvents}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 3,
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        color="text.secondary"
                                    >
                                        Uptime
                                    </Typography>
                                    <Typography variant="h4" color="info.main">
                                        {uptime}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 3,
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        color="text.primary"
                                        gutterBottom
                                    >
                                        Status Over Time
                                    </Typography>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis
                                                domain={[0, 1]}
                                                ticks={[0, 1]}
                                                tickFormatter={(val) =>
                                                    val === 1 ? 'ON' : 'OFF'
                                                }
                                            />
                                            <Tooltip />
                                            <Line
                                                type="stepAfter"
                                                dataKey="status"
                                                stroke="#8884d8"
                                                strokeWidth={3}
                                                dot={{ r: 5 }}
                                                name="Device Status"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 3,
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        color="text.primary"
                                        gutterBottom
                                    >
                                        Event History
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Event</TableCell>
                                                    <TableCell>
                                                        Timestamp
                                                    </TableCell>
                                                    <TableCell>
                                                        Triggered By
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {analyticsData.map(
                                                    (entry, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                {entry.event}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatTimestamp(
                                                                    entry.eventTime
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {entry.eventBy ||
                                                                    'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </>
    )
}

export default Analytics
