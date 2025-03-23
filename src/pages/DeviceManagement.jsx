import React, { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Button,
    Switch,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Card,
    CardContent,
    CircularProgress,
} from '@mui/material'
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Lightbulb as LightbulbIcon,
    LightbulbOutlined as LightbulbOffIcon,
    AcUnit as FanIcon,
    AcUnitOutlined as FanOffIcon,
    Devices as DefaultIcon,
} from '@mui/icons-material'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDarkMode } from '../context/DarkModeContext'
import {
    allDeviceRoute,
    addDeviceRoute,
    updateDeviceRoute,
    deleteDeviceRoute,
    toggleDeviceRoute,
} from '../utils/ApiRoutes'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const DeviceManagement = () => {
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    const { darkMode } = useDarkMode()
    const toastOptions = {
        position: 'bottom-left',
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
        theme: darkMode ? 'dark' : 'light',
    }

    const [devices, setDevices] = useState([])
    const [loading, setLoading] = useState(true)
    const [deviceDialog, setDeviceDialog] = useState({
        open: false,
        isEdit: false,
        data: { deviceType: '', deviceLocation: '', status: false },
    })

    const token = localStorage.getItem('token')
    const user = token ? jwtDecode(token) : null
    const isAdmin = user && user.role === 'ADMIN'

    useEffect(() => {
        fetchDevices()
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
                        setDevices((prevDevices) =>
                            prevDevices.map((device) =>
                                device.deviceId === data.deviceId
                                    ? { ...device, status: data.status }
                                    : device
                            )
                        )
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

    const fetchDevices = async () => {
        try {
            const response = await axios.get(allDeviceRoute)
            setDevices(response.data)
        } catch (error) {
            toast.error('Error fetching devices', toastOptions)
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeviceToggle = async (deviceId, newStatus) => {
        console.log(deviceId, newStatus)
        try {
            await axios.patch(`${toggleDeviceRoute}/${deviceId}`, null, {
                params: { status: newStatus, updatedBy: user.sub },
            })
            setDevices((prevDevices) =>
                prevDevices.map((device) =>
                    device.deviceId === deviceId
                        ? { ...device, status: newStatus }
                        : device
                )
            )
        } catch (error) {
            toast.error('Error updating device status', toastOptions)
            console.error(error)
        }
    }

    const handleDeleteDevice = async (deviceId) => {
        console.log(deviceId)
        try {
            await axios.delete(`${deleteDeviceRoute}/${deviceId}`, {
                params: { updatedBy: user.sub },
            })
            fetchDevices()
            toast.success('Device deleted successfully', toastOptions)
        } catch (error) {
            toast.error('Error deleting device', toastOptions)
            console.error(error)
        }
    }

    const openDeviceDialog = (device = null) => {
        setDeviceDialog({
            open: true,
            isEdit: !!device,
            data: device
                ? { ...device }
                : { deviceType: '', deviceLocation: '', status: false },
        })
    }

    const handleDeviceChange = (e) => {
        const { name, value } = e.target
        setDeviceDialog((prev) => ({
            ...prev,
            data: { ...prev.data, [name]: value },
        }))
    }

    const handleDeviceSubmit = async () => {
        if (
            !deviceDialog.data.deviceType ||
            !deviceDialog.data.deviceLocation
        ) {
            toast.error('Please fill all fields', toastOptions)
            return
        }

        try {
            if (deviceDialog.isEdit) {
                console.log(deviceDialog.data)
                await axios.patch(
                    `${updateDeviceRoute}/${deviceDialog.data.deviceId}`,
                    deviceDialog.data // Send the updated data in the request body
                )
                toast.success('Device updated successfully', toastOptions)
            } else {
                await axios.post(addDeviceRoute, deviceDialog.data)
                toast.success('Device added successfully', toastOptions)
            }
            setDeviceDialog({ ...deviceDialog, open: false })
            fetchDevices() // Refresh the device list
        } catch (error) {
            toast.error('Error saving device', toastOptions)
            console.error(error)
        }
    }

    const getDeviceIcon = (deviceType, status) => {
        if (!deviceType) return <DefaultIcon fontSize="large" />
        const type = deviceType.toLowerCase()
        if (type === 'light')
            return status ? (
                <LightbulbIcon fontSize="large" />
            ) : (
                <LightbulbOffIcon fontSize="large" />
            )
        if (type === 'fan')
            return status ? (
                <FanIcon fontSize="large" />
            ) : (
                <FanOffIcon fontSize="large" />
            )
        return <DefaultIcon fontSize="large" />
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Device Management
            </Typography>

            {isAdmin && (
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => openDeviceDialog()}
                    >
                        Add New Device
                    </Button>
                </Box>
            )}

            {loading ? (
                <CircularProgress />
            ) : (
                <Stack direction="row" flexWrap="wrap" gap={2}>
                    {devices.map((device) => (
                        <Card key={device.deviceId} sx={{ width: 300 }}>
                            <CardContent>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    {getDeviceIcon(
                                        device.deviceType,
                                        device.status
                                    )}
                                    <Switch
                                        checked={device.status}
                                        onChange={() =>
                                            handleDeviceToggle(
                                                device.deviceId,
                                                !device.status
                                            )
                                        }
                                    />
                                </Box>
                                <Typography variant="h6">
                                    {device.deviceType}
                                </Typography>
                                <Typography color="textSecondary">
                                    Location: {device.deviceLocation}
                                </Typography>
                                {isAdmin && (
                                    <Box>
                                        <IconButton
                                            onClick={() =>
                                                openDeviceDialog(device)
                                            }
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() =>
                                                handleDeleteDevice(
                                                    device.deviceId
                                                )
                                            }
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            <Dialog
                open={deviceDialog.open}
                onClose={() =>
                    setDeviceDialog({ ...deviceDialog, open: false })
                }
            >
                <DialogTitle>
                    {deviceDialog.isEdit ? 'Edit Device' : 'Add New Device'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        name="deviceType"
                        label="Device Type"
                        fullWidth
                        value={deviceDialog.data.deviceType}
                        onChange={handleDeviceChange}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        name="deviceLocation"
                        label="Device Location"
                        fullWidth
                        value={deviceDialog.data.deviceLocation}
                        onChange={handleDeviceChange}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setDeviceDialog({ ...deviceDialog, open: false })
                        }
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleDeviceSubmit}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default DeviceManagement
