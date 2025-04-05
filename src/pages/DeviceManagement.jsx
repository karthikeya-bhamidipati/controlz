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
    Select,
    MenuItem,
    CardContent,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Menu,
    useMediaQuery,
} from '@mui/material'
import * as Papa from 'papaparse'
import * as YAML from 'yaml'
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Lightbulb as LightbulbIcon,
    LightbulbOutlined as LightbulbOffIcon,
    AcUnit as FanIcon,
    AcUnitOutlined as FanOffIcon,
    Devices as DefaultIcon,
    BarChart as AnalyticsIcon,
    MoreVert as MoreVertIcon,
    CloudUpload as UploadIcon,
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
    bulkCreateDeviceRoute,
    bulkDeleteDeviceRoute,
} from '../utils/ApiRoutes'
import NavBar from './NavBar'
import { useWebSocket } from '../context/WebSocketContext'
import { useNavigate } from 'react-router-dom'

const DeviceManagement = () => {
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    })

    const { darkMode } = useDarkMode()

    const [devices, setDevices] = useState([])
    const [loading, setLoading] = useState(true)
    const [deviceDialog, setDeviceDialog] = useState({
        open: false,
        isEdit: false,
        data: {
            deviceType: '',
            deviceLocation: '',
            deviceMac: '',
            status: false,
        },
    })
    const [bulkAddDialog, setBulkAddDialog] = useState({
        open: false,
        data: '',
    })
    const [selectedDevices, setSelectedDevices] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedDeviceId, setSelectedDeviceId] = useState(null)

    const token = localStorage.getItem('token')
    const user = token ? jwtDecode(token) : null
    const isAdmin = user && user.role === 'ADMIN'
    const navigate = useNavigate()
    const isLargeScreen = useMediaQuery((theme) => theme.breakpoints.up('md'))

    const { isConnected, subscribe } = useWebSocket()

    useEffect(() => {
        fetchDevices()
        if (!isConnected) return

        const subscription = subscribe('/contrlz/devices', (data) => {
            console.log('Received WebSocket update:', data)
            setDevices([...data])
        })
        return () => {
            if (subscription) subscription.unsubscribe()
        }
    }, [isConnected])

    const fetchDevices = async () => {
        try {
            const response = await axios.get(allDeviceRoute)
            setDevices(response.data)
        } catch (error) {
            toast.error('Error fetching devices')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeviceToggle = async (deviceId, newStatus) => {
        try {
            await axios.patch(`${toggleDeviceRoute}/${deviceId}`, null, {
                params: { status: newStatus, updatedBy: user.sub },
            })
        } catch (error) {
            toast.error('Error updating device status')
            console.error(error)
        }
    }

    const handleDeleteDevice = async (deviceId) => {
        try {
            await axios.delete(`${deleteDeviceRoute}/${deviceId}`)
            setSelectedDevices((prev) => prev.filter((id) => id !== deviceId))
            toast.success('Device deleted successfully')
        } catch (error) {
            toast.error('Error deleting device')
            console.error(error)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedDevices.length === 0) {
            toast.warn('No devices selected for deletion')
            return
        }
        try {
            await axios.post(bulkDeleteDeviceRoute, selectedDevices)
            setSelectedDevices([])
            setSelectAll(false)
            toast.success('Selected devices deleted successfully')
        } catch (error) {
            toast.error(
                'Error deleting devices: ' +
                    (error.response?.data?.message || error.message)
            )
            console.error(error)
        }
    }

    const openDeviceDialog = (device = null) => {
        setDeviceDialog({
            open: true,
            isEdit: !!device,
            data: device
                ? { ...device }
                : {
                      deviceType: '',
                      deviceLocation: '',
                      deviceMac: '',
                      status: false,
                  },
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
        const { deviceType, deviceLocation, deviceMac } = deviceDialog.data
        if (!deviceType || !deviceLocation || !deviceMac) {
            toast.error('Please fill all fields, including Device MAC')
            return
        }
        try {
            if (deviceDialog.isEdit) {
                await axios.patch(
                    `${updateDeviceRoute}/${deviceDialog.data.deviceId}`,
                    deviceDialog.data
                )
                toast.success('Device updated successfully')
            } else {
                await axios.post(addDeviceRoute, deviceDialog.data)
                toast.success('Device added successfully')
            }
            setDeviceDialog({ ...deviceDialog, open: false })
        } catch (error) {
            toast.error('Error saving device')
            console.error(error)
        }
    }
    const parseCSV = (content) => {
        const results = Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim().toLowerCase(),
        })

        if (results.errors.length > 0) {
            throw new Error('CSV parsing error: ' + results.errors[0].message)
        }

        return results.data.map((row) => ({
            deviceType: row.devicetype,
            deviceLocation: row.devicelocation,
            deviceMac: row.devicemac,
        }))
    }

    const parseYAML = (content) => {
        try {
            const parsed = YAML.parse(content)
            if (!Array.isArray(parsed)) {
                throw new Error('YAML must contain an array of devices')
            }
            return parsed
        } catch (error) {
            throw new Error('YAML parsing error: ' + error.message)
        }
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const content = e.target.result
                let parsedData

                if (file.name.endsWith('.csv')) {
                    parsedData = parseCSV(content)
                } else if (
                    file.name.endsWith('.yaml') ||
                    file.name.endsWith('.yml')
                ) {
                    parsedData = parseYAML(content)
                } else if (file.name.endsWith('.json')) {
                    parsedData = JSON.parse(content)
                } else {
                    throw new Error('Unsupported file format')
                }

                if (!Array.isArray(parsedData)) {
                    throw new Error('File must contain an array of devices')
                }

                setBulkAddDialog((prev) => ({
                    ...prev,
                    data: JSON.stringify(parsedData, null, 2),
                }))
            } catch (error) {
                toast.error(`File processing error: ${error.message}`)
            }
        }
        reader.readAsText(file)
    }

    const handleBulkAddSubmit = async () => {
        try {
            const cleanedInput = bulkAddDialog.data.trim()
            let devicesToAdd

            // Try parsing as JSON first
            try {
                devicesToAdd = JSON.parse(cleanedInput)
            } catch (jsonError) {
                // If JSON fails, try parsing as YAML
                try {
                    devicesToAdd = YAML.parse(cleanedInput)
                } catch (yamlError) {
                    throw new Error('Input is neither valid JSON nor YAML')
                }
            }

            if (!Array.isArray(devicesToAdd) || devicesToAdd.length === 0) {
                toast.error(
                    'Invalid input: Please provide a valid array of devices'
                )
                return
            }

            const isValid = devicesToAdd.every(
                (device) =>
                    (device.deviceType === 'FAN' || 'LIGHT') &&
                    device.deviceLocation &&
                    device.deviceMac
            )

            if (!isValid) {
                toast.error(
                    'All devices must have deviceType, deviceLocation, and deviceMac fields'
                )
                return
            }
            // Sanitize user input to only include required fields
            const sanitizedDevices = devicesToAdd.map(
                ({
                    deviceType,
                    deviceLocation,
                    deviceMac,
                    status,
                    lastUpdated,
                }) => ({
                    deviceType,
                    deviceLocation,
                    deviceMac,
                    status,
                    lastUpdated,
                })
            )

            await axios.post(bulkCreateDeviceRoute, sanitizedDevices)
            setBulkAddDialog({ open: false, data: '' })
            toast.success('Devices added successfully')
        } catch (error) {
            toast.error('Error adding devices: ' + error.message)
            console.error(error)
        }
    }

    const handleSelectAll = (event) => {
        const checked = event.target.checked
        setSelectAll(checked)
        setSelectedDevices(checked ? devices.map((d) => d.deviceId) : [])
    }

    const handleSelectDevice = (deviceId) => {
        setSelectedDevices((prev) =>
            prev.includes(deviceId)
                ? prev.filter((id) => id !== deviceId)
                : [...prev, deviceId]
        )
        setSelectAll(
            devices.every(
                (d) =>
                    selectedDevices.includes(d.deviceId) ||
                    d.deviceId === deviceId
            )
        )
    }

    const handleAnalyticsClick = (deviceId) => {
        navigate(`/analytics/${deviceId}`)
    }

    const handleOpenMenu = (event, deviceId) => {
        setAnchorEl(event.currentTarget)
        setSelectedDeviceId(deviceId)
    }

    const handleCloseMenu = () => {
        setAnchorEl(null)
        setSelectedDeviceId(null)
    }

    const getDeviceIcon = (deviceType, status) => {
        if (!deviceType) return <DefaultIcon fontSize="large" />
        const type = deviceType.toLowerCase()
        if (type === 'light')
            return status ? (
                <LightbulbIcon fontSize="large" color="primary" />
            ) : (
                <LightbulbOffIcon fontSize="large" />
            )
        if (type === 'fan')
            return status ? (
                <FanIcon fontSize="large" color="primary" />
            ) : (
                <FanOffIcon fontSize="large" />
            )
        return <DefaultIcon fontSize="large" />
    }

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
            >
                <CircularProgress />
            </Box>
        )
    }

    return (
        <>
            <NavBar />
            <Box
                sx={{
                    p: { xs: 2, sm: 3 },
                    bgcolor: darkMode ? '#121212' : '#f5f7fa',
                    minHeight: '80vh', // Ensure it takes up full height
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mb: 4, color: 'text.primary' }}
                >
                    Device Management
                </Typography>

                {isAdmin && (
                    <Box
                        sx={{
                            mb: 2,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => openDeviceDialog()}
                            >
                                Add Device
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() =>
                                    setBulkAddDialog({ open: true, data: '' })
                                }
                            >
                                Bulk Add devices
                            </Button>
                        </Box>
                        {selectedDevices.length > 0 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleBulkDelete}
                                    disabled={selectedDevices.length === 0}
                                >
                                    Delete Selected ({selectedDevices.length})
                                </Button>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                    }
                                    label="Select All"
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {devices.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '60vh', // Takes up available space
                            textAlign: 'center',
                            bgcolor: darkMode ? '#1a1a1a' : '#e8ecef',
                            borderRadius: 2,
                            p: 4,
                            width: '100%',
                        }}
                    >
                        <DefaultIcon
                            sx={{
                                fontSize: 80,
                                color: darkMode ? '#666' : '#999',
                                mb: 2,
                                animation: 'pulse 2s infinite',
                            }}
                        />
                        <Typography
                            variant="h5"
                            sx={{
                                color: darkMode ? '#fff' : '#333',
                                fontWeight: 'bold',
                                mb: 1,
                            }}
                        >
                            No Devices Present
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: darkMode ? '#aaa' : '#666',
                                maxWidth: 400,
                            }}
                        >
                            It looks like a ghost town here! Add some devices to
                            bring this space to life.
                        </Typography>
                        {/* Optional: Add some subtle animation with CSS */}
                        <style>
                            {`
                                @keyframes pulse {
                                    0% { transform: scale(1); }
                                    50% { transform: scale(1.1); }
                                    100% { transform: scale(1); }
                                }
                            `}
                        </style>
                    </Box>
                ) : (
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        flexWrap="wrap"
                        gap={2}
                    >
                        {devices.map((device) => (
                            <Card
                                key={device.deviceId}
                                sx={{
                                    width: { xs: '100%', sm: 300 },
                                    maxWidth: '100%',
                                }}
                            >
                                <CardContent>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={2}
                                    >
                                        {getDeviceIcon(
                                            device.deviceType,
                                            device.status
                                        )}
                                        <Switch
                                            checked={device.status}
                                            onChange={(e) => {
                                                e.stopPropagation()
                                                handleDeviceToggle(
                                                    device.deviceId,
                                                    !device.status
                                                )
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="h6" noWrap>
                                        {device.deviceType}
                                    </Typography>
                                    <Typography color="textSecondary" noWrap>
                                        Location: {device.deviceLocation}
                                    </Typography>
                                    <Typography color="textSecondary" noWrap>
                                        Updated:{' '}
                                        {new Date(
                                            device.lastUpdated
                                        ).toLocaleString()}
                                    </Typography>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mt={2}
                                        flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                                        gap={1}
                                    >
                                        {isAdmin && (
                                            <Checkbox
                                                checked={selectedDevices.includes(
                                                    device.deviceId
                                                )}
                                                onChange={(e) => {
                                                    e.stopPropagation()
                                                    handleSelectDevice(
                                                        device.deviceId
                                                    )
                                                }}
                                            />
                                        )}
                                        <Box flexGrow={1} />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AnalyticsIcon />}
                                            onClick={() =>
                                                handleAnalyticsClick(
                                                    device.deviceId
                                                )
                                            }
                                        >
                                            Analytics
                                        </Button>
                                        {isAdmin && isLargeScreen ? (
                                            <Box>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openDeviceDialog(device)
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteDevice(
                                                            device.deviceId
                                                        )
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        ) : isAdmin ? (
                                            <IconButton
                                                onClick={(event) =>
                                                    handleOpenMenu(
                                                        event,
                                                        device.deviceId
                                                    )
                                                }
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        ) : null}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                {/* Actions Menu for Small Screens (Admin Only) */}
                {isAdmin && (
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseMenu}
                    >
                        <MenuItem
                            onClick={() => {
                                openDeviceDialog(
                                    devices.find(
                                        (d) => d.deviceId === selectedDeviceId
                                    )
                                )
                                handleCloseMenu()
                            }}
                        >
                            Edit
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleDeleteDevice(selectedDeviceId)
                                handleCloseMenu()
                            }}
                        >
                            Delete
                        </MenuItem>
                    </Menu>
                )}

                {/* Single Device Dialog */}
                <Dialog
                    open={deviceDialog.open}
                    onClose={() =>
                        setDeviceDialog({ ...deviceDialog, open: false })
                    }
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>
                        {deviceDialog.isEdit ? 'Edit Device' : 'Add New Device'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3, pb: 2 }}>
                        <Box
                            component="form"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Select
                                name="deviceType"
                                fullWidth
                                value={deviceDialog.data.deviceType}
                                onChange={handleDeviceChange}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    Select Device Type
                                </MenuItem>
                                <MenuItem value="FAN">FAN</MenuItem>
                                <MenuItem value="LIGHT">LIGHT</MenuItem>
                            </Select>
                            <TextField
                                name="deviceLocation"
                                label="Device Location"
                                fullWidth
                                value={deviceDialog.data.deviceLocation}
                                onChange={handleDeviceChange}
                            />
                            <TextField
                                name="deviceMac"
                                label="Device MAC (Required)"
                                fullWidth
                                value={deviceDialog.data.deviceMac}
                                onChange={handleDeviceChange}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() =>
                                setDeviceDialog({
                                    ...deviceDialog,
                                    open: false,
                                })
                            }
                            sx={{ minWidth: 100 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleDeviceSubmit}
                            sx={{ minWidth: 100 }}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Bulk Add Dialog */}
                <Dialog
                    open={bulkAddDialog.open}
                    onClose={() => setBulkAddDialog({ open: false, data: '' })}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Bulk Add Devices</DialogTitle>
                    <DialogContent sx={{ pt: 3, pb: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                            }}
                        >
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<UploadIcon />}
                                sx={{ alignSelf: 'flex-start' }}
                            >
                                Upload File
                                <input
                                    type="file"
                                    hidden
                                    accept=".json,.csv,.yaml,.yml"
                                    onChange={handleFileUpload}
                                />
                            </Button>
                            <TextField
                                label="Enter Devices (JSON/YAML) or upload file"
                                multiline
                                rows={8}
                                fullWidth
                                value={bulkAddDialog.data}
                                onChange={(e) =>
                                    setBulkAddDialog({
                                        ...bulkAddDialog,
                                        data: e.target.value,
                                    })
                                }
                                placeholder={
                                    'JSON format:\n' +
                                    '[{"deviceType": "LIGHT", "deviceLocation": "Room1", "deviceMac": "00:1A:2B:3C:4D:5E"}]\n\n' +
                                    'YAML format:\n' +
                                    '- deviceType: LIGHT\n' +
                                    '  deviceLocation: Room1\n' +
                                    '  deviceMac: "00:1A:2B:3C:4D:5E"\n\n' +
                                    'CSV format (upload file):\n' +
                                    'deviceType,deviceLocation,deviceMac\n' +
                                    'LIGHT,Room1,00:1A:2B:3C:4D:5E'
                                }
                            />
                            <Typography variant="caption" color="textSecondary">
                                Supported formats: JSON, YAML, CSV (via file
                                upload)
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() =>
                                setBulkAddDialog({ open: false, data: '' })
                            }
                            sx={{ minWidth: 100 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleBulkAddSubmit}
                            sx={{ minWidth: 100 }}
                        >
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    )
}

export default DeviceManagement
