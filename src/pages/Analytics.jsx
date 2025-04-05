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

    const [loading, setLoading] = useState(true)
    const [analyticsData, setAnalyticsData] = useState([])

    useEffect(() => {
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

        fetchAnalytics()
    }, [deviceId])

    const chartData = analyticsData.map((entry) => ({
        time: new Date(entry.eventTime).toLocaleTimeString(),
        status: entry.event === 'ON' ? 1 : 0,
    }))
    function calculateUptime(deviceLogs) {
        if (!Array.isArray(deviceLogs) || deviceLogs.length === 0) return '0s'

        // ✅ Sort logs by eventTime (ascending order)
        const sortedLogs = [...deviceLogs].sort(
            (a, b) => new Date(a.eventTime) - new Date(b.eventTime)
        )

        let lastOnTime = null
        let totalUptimeSeconds = 0

        sortedLogs.forEach((log) => {
            const logTime = new Date(log.eventTime)

            if (log.event === 'ON') {
                lastOnTime = logTime
            } else if (log.event === 'OFF' && lastOnTime) {
                totalUptimeSeconds += (logTime - lastOnTime) / 1000 // Convert ms to sec
                lastOnTime = null // Reset after OFF
            }
        })

        // ✅ If the last event was "ON", assume it's still running till now
        if (lastOnTime) {
            totalUptimeSeconds += (new Date() - lastOnTime) / 1000
        }

        return formatUptime(totalUptimeSeconds)
    }

    function formatUptime(seconds) {
        const units = [
            { label: 'month', value: 2592000 }, // 30 days
            { label: 'week', value: 604800 }, // 7 days
            { label: 'day', value: 86400 },
            { label: 'hour', value: 3600 },
            { label: 'minute', value: 60 },
            { label: 'second', value: 1 },
        ]

        let uptimeString = ''
        for (const unit of units) {
            const count = Math.floor(seconds / unit.value)
            if (count > 0) {
                uptimeString += `${count} ${unit.label}${count > 1 ? 's' : ''} `
                seconds %= unit.value
            }
        }

        return uptimeString.trim() || '0 seconds' // Default case if no time recorded
    }

    console.log(analyticsData)
    const totalEvents = analyticsData.length
    const onEvents = analyticsData.filter((e) => e.event === 'ON').length
    const offEvents = totalEvents - onEvents
    const uptimePercentage = calculateUptime(analyticsData)

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
                        {/* Summary Cards */}
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
                                        {uptimePercentage}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Chart */}
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
                                        <LineChart
                                            width={600}
                                            height={300}
                                            data={chartData}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis
                                                domain={[0, 1]}
                                                ticks={[0, 1]}
                                                tickFormatter={(value) =>
                                                    value === 1 ? 'ON' : 'OFF'
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

                        {/* Event History Table */}
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
