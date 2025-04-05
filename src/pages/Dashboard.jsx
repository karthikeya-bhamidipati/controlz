import React, { useState, useEffect, useMemo } from 'react'
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    Avatar,
    Chip,
    Button,
    Badge,
    ToggleButton,
    ToggleButtonGroup,
    LinearProgress,
} from '@mui/material'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDarkMode } from '../context/DarkModeContext'
import { allDeviceRoute, getRecentActivitiesRoute } from '../utils/ApiRoutes'
import NavBar from './NavBar'
import { useWebSocket } from '../context/WebSocketContext'
import { motion } from 'framer-motion'
import DevicesIcon from '@mui/icons-material/Devices'
import PowerIcon from '@mui/icons-material/Power'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import HistoryIcon from '@mui/icons-material/History'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PowerOffIcon from '@mui/icons-material/PowerOff'

// DeviceMetricCard Component
const DeviceMetricCard = ({
    icon,
    title,
    value,
    color,
    subValue,
    percentage,
    children,
}) => (
    <Card
        sx={{
            bgcolor: 'background.paper',
            boxShadow: 4,
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
        }}
    >
        <Box sx={{ width: 8, bgcolor: `${color}.main` }} />
        <CardContent sx={{ flex: 1, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                    sx={{ bgcolor: `${color}.main`, color: 'white', mr: 2 }}
                >
                    {icon}
                </Avatar>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    fontWeight="medium"
                >
                    {title}
                </Typography>
            </Box>
            <Typography variant="h3" color={`${color}.main`} fontWeight="bold">
                {value}
            </Typography>
            {children || (
                <Box sx={{ mt: 2 }}>
                    {subValue && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                        >
                            {subValue}
                        </Typography>
                    )}
                    {percentage !== undefined && (
                        <LinearProgress
                            variant="determinate"
                            value={percentage}
                            color={color}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    )}
                </Box>
            )}
        </CardContent>
    </Card>
)

// ActivityItem Component
const ActivityItem = ({ activity, darkMode, formatTimestamp }) => (
    <Box
        sx={{
            p: 2,
            mb: 2,
            bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        <Box
            sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor:
                    activity.event === 'OFF' ? 'error.main' : 'success.main',
            }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
                sx={{
                    bgcolor:
                        activity.event === 'OFF'
                            ? 'error.main'
                            : 'success.main',
                    width: 36,
                    height: 36,
                    mr: 2,
                }}
            >
                {activity.event === 'OFF' ? <PowerOffIcon /> : <PowerIcon />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight="medium">
                    {activity.device.deviceType} turned {activity.event} in{' '}
                    {activity.device.deviceLocation}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                    >
                        by {activity.eventBy}
                    </Typography>
                    <Chip
                        label={formatTimestamp(activity.eventTime)}
                        size="small"
                        variant="outlined"
                        color="default"
                    />
                </Box>
            </Box>
        </Box>
    </Box>
)

const Dashboard = () => {
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    })

    const { darkMode } = useDarkMode()
    const { isConnected, subscribe } = useWebSocket()
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalDevices: 0,
        activeDevices: 0,
        inactiveDevices: 0,
        recentActivities: [],
        deviceCategories: [],
    })
    const [showAllActivities, setShowAllActivities] = useState(false)
    const [filter, setFilter] = useState('all')

    const processDeviceData = (devices) => {
        const categories = {}
        devices.forEach((device) => {
            const type = device.deviceType || 'Unknown'
            categories[type] = categories[type] || { total: 0, active: 0 }
            categories[type].total += 1
            if (device.status === true) categories[type].active += 1
        })
        return Object.entries(categories).map(([name, data]) => ({
            name,
            total: data.total,
            active: data.active,
            percentage: Math.round((data.active / data.total) * 100),
        }))
    }

    const fetchInitialData = async () => {
        try {
            const [deviceResponse, activityResponse] = await Promise.all([
                axios.get(allDeviceRoute),
                axios.get(getRecentActivitiesRoute),
            ])
            const devices = deviceResponse.data
            const totalDevices = devices.length
            const activeDevices = devices.filter(
                (d) => d.status === true
            ).length
            const recentActivities = activityResponse.data.sort(
                (a, b) => new Date(b.eventTime) - new Date(a.eventTime)
            ) // Sort descending
            const deviceCategories = processDeviceData(devices)

            setDashboardData({
                totalDevices,
                activeDevices,
                inactiveDevices: totalDevices - activeDevices,
                recentActivities,
                deviceCategories,
            })
        } catch (error) {
            console.error('Error fetching initial data:', error)
            toast.error(`Error: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInitialData()

        if (!isConnected) {
            console.log('WebSocket not connected')
            return
        }

        console.log('Subscribing to WebSocket topics')
        const deviceSubscription = subscribe('/contrlz/devices', (data) => {
            console.log('Device data received:', data)
            const totalDevices = data.length
            const activeDevices = data.filter((d) => d.status === true).length
            const deviceCategories = processDeviceData(data)
            setDashboardData((prev) => ({
                ...prev,
                totalDevices,
                activeDevices,
                inactiveDevices: totalDevices - activeDevices,
                deviceCategories,
            }))
        })

        const activitySubscription = subscribe(
            '/contrlz/recent-activity',
            (data) => {
                console.log('Activity data received:', data)
                const newActivities =
                    typeof data === 'string' ? JSON.parse(data) : data
                setDashboardData((prev) => {
                    // Merge new activities, remove duplicates by id, and sort by eventTime descending
                    const combinedActivities = [
                        ...newActivities,
                        ...prev.recentActivities,
                    ]
                        .filter(
                            (activity, index, self) =>
                                index ===
                                self.findIndex((a) => a.id === activity.id) // Remove duplicates
                        )
                        .sort(
                            (a, b) =>
                                new Date(b.eventTime) - new Date(a.eventTime)
                        ) // Most recent first
                    return {
                        ...prev,
                        recentActivities: combinedActivities,
                    }
                })
            }
        )

        return () => {
            if (deviceSubscription) deviceSubscription.unsubscribe()
            if (activitySubscription) activitySubscription.unsubscribe()
        }
    }, [isConnected])

    const { filteredActivities, activityStats } = useMemo(() => {
        const stats = { total: 0, turnedOn: 0, turnedOff: 0, today: 0 }
        const today = new Date().setHours(0, 0, 0, 0)

        const filtered = dashboardData.recentActivities.filter((activity) => {
            if (!activity.eventTime) return false
            const isOnEvent = activity.event === 'ON'
            const isOffEvent = activity.event === 'OFF'
            const activityDate = new Date(activity.eventTime).setHours(
                0,
                0,
                0,
                0
            )

            stats.total++
            if (isOnEvent) stats.turnedOn++
            if (isOffEvent) stats.turnedOff++
            if (activityDate === today) stats.today++

            return (
                filter === 'all' ||
                (filter === 'on' && isOnEvent) ||
                (filter === 'off' && isOffEvent)
            )
        })

        return { filteredActivities: filtered, activityStats: stats }
    }, [dashboardData.recentActivities, filter])

    const getDeviceTypeColor = (type) => {
        const colorMap = {
            LIGHT: '#FFB900',
            FAN: '#0078D7',
            Default: '#777777',
        }
        return colorMap[type] || colorMap.Default
    }

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A'
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date
        if (diff < 60 * 1000) return 'just now'
        if (diff < 60 * 60 * 1000)
            return `${Math.floor(diff / (60 * 1000))}m ago`
        if (diff < 24 * 60 * 60 * 1000)
            return `${Math.floor(diff / (60 * 60 * 1000))}h ago`
        return date.toLocaleString()
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    }
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    }

    return (
        <>
            <NavBar />
            <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                sx={{
                    minHeight: '100vh',
                    bgcolor: darkMode ? '#121212' : '#f5f7fa',
                    p: { xs: 2, sm: 4 },
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
                        sx={{ color: 'text.primary' }}
                    >
                        Dashboard
                    </Typography>
                </Box>

                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '50vh',
                            gap: 2,
                        }}
                    >
                        <CircularProgress size={48} />
                        <Typography variant="body1" color="text.secondary">
                            Loading dashboard data...
                        </Typography>
                    </Box>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                component={motion.div}
                                variants={itemVariants}
                            >
                                <DeviceMetricCard
                                    icon={<DevicesIcon />}
                                    title="Total Devices"
                                    value={dashboardData.totalDevices}
                                    color="primary"
                                    subValue={`${dashboardData.activeDevices} active / ${dashboardData.inactiveDevices} inactive`}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                component={motion.div}
                                variants={itemVariants}
                            >
                                <DeviceMetricCard
                                    icon={<PowerIcon />}
                                    title="Active Devices"
                                    value={dashboardData.activeDevices}
                                    color="success"
                                    percentage={
                                        dashboardData.totalDevices > 0
                                            ? Math.round(
                                                  (dashboardData.activeDevices /
                                                      dashboardData.totalDevices) *
                                                      100
                                              )
                                            : 0
                                    }
                                    subValue={
                                        dashboardData.totalDevices > 0
                                            ? `${Math.round(
                                                  (dashboardData.activeDevices /
                                                      dashboardData.totalDevices) *
                                                      100
                                              )}% of all devices`
                                            : 'No devices available'
                                    }
                                />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                component={motion.div}
                                variants={itemVariants}
                            >
                                <DeviceMetricCard
                                    icon={<HistoryIcon />}
                                    title="Activity Summary"
                                    value={activityStats.total}
                                    color="info"
                                >
                                    <Box
                                        sx={{
                                            mt: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Chip
                                            label={`${activityStats.turnedOn} On`}
                                            color="success"
                                            size="small"
                                        />
                                        <Chip
                                            label={`${activityStats.turnedOff} Off`}
                                            color="error"
                                            size="small"
                                        />
                                        <Chip
                                            label={`${activityStats.today} Today`}
                                            color="primary"
                                            size="small"
                                        />
                                    </Box>
                                </DeviceMetricCard>
                            </Grid>
                        </Grid>

                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid
                                item
                                xs={12}
                                component={motion.div}
                                variants={itemVariants}
                            >
                                <Card
                                    sx={{
                                        bgcolor: 'background.paper',
                                        boxShadow: 4,
                                        borderRadius: 2,
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="text.primary"
                                            gutterBottom
                                        >
                                            Device Categories
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        <Grid container spacing={2}>
                                            {dashboardData.deviceCategories.map(
                                                (category, index) => (
                                                    <Grid
                                                        item
                                                        xs={12}
                                                        sm={6}
                                                        md={4}
                                                        key={index}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                mb: 1,
                                                                p: 2,
                                                                bgcolor:
                                                                    darkMode
                                                                        ? 'rgba(255,255,255,0.05)'
                                                                        : 'rgba(0,0,0,0.02)',
                                                                borderRadius: 1,
                                                            }}
                                                        >
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor:
                                                                        getDeviceTypeColor(
                                                                            category.name
                                                                        ),
                                                                    color: 'white',
                                                                    mr: 2,
                                                                    width: 40,
                                                                    height: 40,
                                                                }}
                                                            >
                                                                {category.name.charAt(
                                                                    0
                                                                )}
                                                            </Avatar>
                                                            <Box
                                                                sx={{ flex: 1 }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            'flex',
                                                                        justifyContent:
                                                                            'space-between',
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="subtitle1"
                                                                        fontWeight="medium"
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="subtitle1"
                                                                        fontWeight="bold"
                                                                    >
                                                                        {
                                                                            category.active
                                                                        }
                                                                        /
                                                                        {
                                                                            category.total
                                                                        }
                                                                    </Typography>
                                                                </Box>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={
                                                                        category.percentage
                                                                    }
                                                                    sx={{
                                                                        height: 6,
                                                                        borderRadius: 3,
                                                                        bgcolor:
                                                                            darkMode
                                                                                ? 'rgba(255,255,255,0.1)'
                                                                                : 'rgba(0,0,0,0.1)',
                                                                        '& .MuiLinearProgress-bar':
                                                                            {
                                                                                bgcolor:
                                                                                    getDeviceTypeColor(
                                                                                        category.name
                                                                                    ),
                                                                            },
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )
                                            )}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <motion.div variants={itemVariants}>
                            <Card
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 4,
                                    borderRadius: 2,
                                }}
                            >
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Badge
                                                badgeContent={
                                                    filteredActivities.length
                                                }
                                                color="primary"
                                                sx={{ mr: 2 }}
                                            >
                                                <AccessTimeIcon
                                                    color="action"
                                                    fontSize="large"
                                                />
                                            </Badge>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                Recent Activities
                                            </Typography>
                                        </Box>
                                        <ToggleButtonGroup
                                            value={filter}
                                            exclusive
                                            onChange={(e, newFilter) =>
                                                newFilter &&
                                                setFilter(newFilter)
                                            }
                                            size="small"
                                            sx={{ ml: 2 }}
                                        >
                                            <ToggleButton
                                                value="all"
                                                color="primary"
                                            >
                                                All
                                            </ToggleButton>
                                            <ToggleButton
                                                value="on"
                                                color="success"
                                            >
                                                On
                                            </ToggleButton>
                                            <ToggleButton
                                                value="off"
                                                color="error"
                                            >
                                                Off
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    {filteredActivities.length > 0 ? (
                                        <>
                                            {(showAllActivities
                                                ? filteredActivities
                                                : filteredActivities.slice(0, 5)
                                            ).map((activity, index) => (
                                                <Box
                                                    key={activity.id || index}
                                                    component={motion.div}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay: index * 0.05,
                                                    }}
                                                >
                                                    <ActivityItem
                                                        activity={activity}
                                                        darkMode={darkMode}
                                                        formatTimestamp={
                                                            formatTimestamp
                                                        }
                                                    />
                                                </Box>
                                            ))}
                                            {filteredActivities.length > 5 && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'center',
                                                        mt: 2,
                                                    }}
                                                >
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() =>
                                                            setShowAllActivities(
                                                                !showAllActivities
                                                            )
                                                        }
                                                    >
                                                        {showAllActivities
                                                            ? 'Show Less'
                                                            : `Show All (${filteredActivities.length})`}
                                                    </Button>
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                py: 4,
                                            }}
                                        >
                                            <NotificationsActiveIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: 'text.secondary',
                                                    mb: 2,
                                                }}
                                            />
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                align="center"
                                            >
                                                No recent activities to display.
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </Box>
        </>
    )
}

export default Dashboard
