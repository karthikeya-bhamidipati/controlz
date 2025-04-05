import React, { useState, useEffect, act } from 'react'
import Papa from 'papaparse'
import yaml from 'js-yaml'
import dayjs from 'dayjs'
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'

import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Avatar,
} from '@mui/material'
import { Save, Lock, Upload } from '@mui/icons-material'
import axios from 'axios'
import NavBar from './NavBar'
import {
    getUserRoute,
    changePasswordRoute,
    getAllUsersRoute,
    getRecentActivitiesRoute,
    allDeviceRoute,
    addDeviceLogsRoute,
} from '../utils/ApiRoutes'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const UserProfile = () => {
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })
    // State management
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        role: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState({})
    const [activitiesInput, setActivitiesInput] = useState('')
    const [fileUploadKey, setFileUploadKey] = useState(Date.now())
    const [isSubmittingActivities, setIsSubmittingActivities] = useState(false)

    // Extract username from token
    const token = localStorage.getItem('token')
    let username = ''
    if (token) {
        username = jwtDecode(token).sub
    }

    // Fetch user profile data on component mount
    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${getUserRoute}${username}`)
            setProfile(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching user profile:', error)
            toast.error('Error loading profile data')
            setLoading(false)
        }
    }

    const updateProfile = async () => {
        try {
            setSaving(true)
            const response = await axios.put(
                `${getUserRoute}update/${username}`,
                {
                    newUsername: profile.username,
                    email: profile.email,
                }
            )
            console.log(response)
            localStorage.setItem('token', response.data)
            username = jwtDecode(response.data).sub
            setProfile((prev) => ({ ...prev, username }))
            toast.success('Profile updated successfully')
            setSaving(false)
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Error updating profile')
            setSaving(false)
        }
    }

    const changePassword = async () => {
        // Validate password data
        const validationErrors = {}
        if (!passwordData.currentPassword)
            validationErrors.currentPassword = 'Current password is required'
        if (!passwordData.newPassword)
            validationErrors.newPassword = 'New password is required'
        if (passwordData.newPassword !== passwordData.confirmPassword)
            validationErrors.confirmPassword = 'Passwords do not match'
        if (passwordData.newPassword && passwordData.newPassword.length < 8)
            validationErrors.newPassword =
                'Password must be at least 8 characters'

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        try {
            const newToken = await axios.post(changePasswordRoute, {
                username: username,
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            })
            setOpenPasswordDialog(false)
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
            setErrors({})
            toast.success('Password changed successfully')
            localStorage.setItem('token', newToken.data.token)
        } catch (error) {
            console.error('Error changing password:', error)
            if (error.response && error.response.status === 401) {
                setErrors({ currentPassword: 'Current password is incorrect' })
            } else {
                toast.error(
                    error.response.data.message || 'Error changing password'
                )
            }
        }
    }

    const parseActivities = (content, fileType) => {
        try {
            let parsedData
            if (fileType === 'csv') {
                parsedData = Papa.parse(content, { header: true }).data
            } else if (fileType === 'yaml' || fileType === 'yml') {
                parsedData = yaml.load(content)
            } else if (fileType === 'json') {
                parsedData = JSON.parse(content)
            } else {
                throw new Error('Unsupported file format')
            }

            if (!Array.isArray(parsedData)) {
                throw new Error('File must contain an array of activities')
            }

            return parsedData
        } catch (error) {
            throw new Error(`Error parsing ${fileType}: ${error.message}`)
        }
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const content = e.target.result
                let fileType = 'json'

                if (file.name.endsWith('.csv')) {
                    fileType = 'csv'
                } else if (
                    file.name.endsWith('.yaml') ||
                    file.name.endsWith('.yml')
                ) {
                    fileType = 'yaml'
                } else if (file.name.endsWith('.json')) {
                    fileType = 'json'
                } else {
                    throw new Error('Unsupported file format')
                }

                const parsedData = parseActivities(content, fileType)
                setActivitiesInput(JSON.stringify(parsedData, null, 2))
            } catch (error) {
                toast.error(`File processing error: ${error.message}`)
            }
        }
        reader.readAsText(file)
        setFileUploadKey(Date.now()) // Reset file input
    }

    const handleSubmitActivities = async () => {
        if (!activitiesInput.trim()) {
            toast.error('Please enter activities data or upload a file')
            return
        }

        try {
            setIsSubmittingActivities(true)
            let activitiesToSubmit

            // Try parsing as JSON first
            try {
                activitiesToSubmit = JSON.parse(activitiesInput)
            } catch (jsonError) {
                // If JSON fails, try parsing as YAML
                try {
                    activitiesToSubmit = yaml.load(activitiesInput)
                } catch (yamlError) {
                    throw new Error('Input is neither valid JSON nor YAML')
                }
            }

            if (
                !Array.isArray(activitiesToSubmit) ||
                activitiesToSubmit.length === 0
            ) {
                throw new Error('Please provide a valid array of activities')
            }

            // Validate activities structure
            const isValid = activitiesToSubmit.every(
                (activity) =>
                    activity.event &&
                    activity.eventBy &&
                    activity.eventTime &&
                    activity.device
            )

            if (!isValid) {
                throw new Error(
                    'All activities must have description, type, and timestamp'
                )
            }
            await axios.post(addDeviceLogsRoute, activitiesToSubmit)
            toast.success('Activities submitted successfully')
            setActivitiesInput('')
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsSubmittingActivities(false)
        }
    }

    const [userFormat, setUserFormat] = useState('json')
    const [activityFormat, setActivityFormat] = useState('json')
    const [deviceFormat, setDeviceFormat] = useState('json')

    const handleDownload = async (type, format) => {
        let apiUrl
        let fileLabel

        switch (type) {
            case 'users':
                apiUrl = getAllUsersRoute
                fileLabel = 'users'
                break
            case 'activities':
                apiUrl = getRecentActivitiesRoute
                fileLabel = 'activities'
                break
            case 'devices':
                apiUrl = allDeviceRoute
                fileLabel = 'devices'
                break
            default:
                return
        }

        try {
            const res = await axios.get(apiUrl)
            const data = res.data

            const downloadFormat = format
            let output, fileType, fileExtension

            switch (downloadFormat) {
                case 'csv':
                    output = Papa.unparse(data)
                    fileType = 'text/csv'
                    fileExtension = 'csv'
                    break
                case 'yaml':
                    output = yaml.dump(data)
                    fileType = 'text/yaml'
                    fileExtension = 'yaml'
                    break
                default:
                    output = JSON.stringify(data, null, 2)
                    fileType = 'application/json'
                    fileExtension = 'json'
            }

            const blob = new Blob([output], { type: fileType })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${fileLabel}_${dayjs().format(
                'YYYYMMDD_HHmmss'
            )}.${fileExtension}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error(`Error downloading ${type}:`, error)
            toast.error(`Failed to download ${type}`)
        }
    }

    // UI handlers
    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfile((prev) => ({ ...prev, [name]: value }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <>
            <NavBar />
            <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                    User Profile
                </Typography>
                <Grid container spacing={4}>
                    {/* Left column - User info */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Personal Information
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        value={profile.username || ''}
                                        onChange={handleProfileChange}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Role"
                                        value={profile.role || ''}
                                        margin="normal"
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        value={profile.email || ''}
                                        onChange={handleProfileChange}
                                        margin="normal"
                                        type="email"
                                    />
                                </Grid>
                            </Grid>
                            <Box
                                sx={{
                                    mt: 3,
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save />}
                                    onClick={updateProfile}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Paper>

                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Security
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: 'medium' }}
                                    >
                                        Password
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<Lock />}
                                    onClick={() => setOpenPasswordDialog(true)}
                                >
                                    Change Password
                                </Button>
                            </Box>
                        </Paper>
                        <Card sx={{ mt: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Submit Activities
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    placeholder="Enter activities in JSON or YAML format"
                                    value={activitiesInput}
                                    onChange={(e) =>
                                        setActivitiesInput(e.target.value)
                                    }
                                    sx={{ mb: 2 }}
                                />
                                <input
                                    key={fileUploadKey}
                                    accept=".json,.yaml,.yml,.csv"
                                    style={{ display: 'none' }}
                                    id="activities-upload"
                                    type="file"
                                    onChange={handleFileUpload}
                                />
                                <label htmlFor="activities-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<Upload />}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    >
                                        Upload File
                                    </Button>
                                </label>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleSubmitActivities}
                                    disabled={
                                        isSubmittingActivities ||
                                        !activitiesInput.trim()
                                    }
                                >
                                    {isSubmittingActivities
                                        ? 'Submitting...'
                                        : 'Submit Activities'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right column - Profile summary */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent
                                sx={{
                                    textAlign: 'center',
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: 'orange',
                                        color: 'white',
                                        width: 56,
                                        height: 56,
                                    }}
                                >
                                    {username[0]}
                                </Avatar>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    {profile.role}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {profile.email}
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Download Your Data
                                </Typography>

                                {/* Users */}
                                <FormControl fullWidth sx={{ mb: 1 }}>
                                    <InputLabel>Users Format</InputLabel>
                                    <Select
                                        value={userFormat}
                                        label="Users Format"
                                        onChange={(e) =>
                                            setUserFormat(e.target.value)
                                        }
                                    >
                                        <MenuItem value="json">JSON</MenuItem>
                                        <MenuItem value="csv">CSV</MenuItem>
                                        <MenuItem value="yaml">YAML</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                    onClick={() =>
                                        handleDownload('users', userFormat)
                                    }
                                >
                                    Download All Users
                                </Button>

                                {/* Activities */}
                                <FormControl fullWidth sx={{ mb: 1 }}>
                                    <InputLabel>Activities Format</InputLabel>
                                    <Select
                                        value={activityFormat}
                                        label="Activities Format"
                                        onChange={(e) =>
                                            setActivityFormat(e.target.value)
                                        }
                                    >
                                        <MenuItem value="json">JSON</MenuItem>
                                        <MenuItem value="csv">CSV</MenuItem>
                                        <MenuItem value="yaml">YAML</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                    onClick={() =>
                                        handleDownload(
                                            'activities',
                                            activityFormat
                                        )
                                    }
                                >
                                    Download Recent Activities
                                </Button>

                                {/* Devices */}
                                <FormControl fullWidth sx={{ mb: 1 }}>
                                    <InputLabel>Devices Format</InputLabel>
                                    <Select
                                        value={deviceFormat}
                                        label="Devices Format"
                                        onChange={(e) =>
                                            setDeviceFormat(e.target.value)
                                        }
                                    >
                                        <MenuItem value="json">JSON</MenuItem>
                                        <MenuItem value="csv">CSV</MenuItem>
                                        <MenuItem value="yaml">YAML</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() =>
                                        handleDownload('devices', deviceFormat)
                                    }
                                >
                                    Download Devices List
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Password Change Dialog */}
                <Dialog
                    open={openPasswordDialog}
                    onClose={() => setOpenPasswordDialog(false)}
                >
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            name="currentPassword"
                            label="Current Password"
                            type="password"
                            fullWidth
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            error={!!errors.currentPassword}
                            helperText={errors.currentPassword}
                            sx={{ mb: 2, mt: 1 }}
                        />
                        <TextField
                            margin="dense"
                            name="newPassword"
                            label="New Password"
                            type="password"
                            fullWidth
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            error={!!errors.newPassword}
                            helperText={errors.newPassword}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="confirmPassword"
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenPasswordDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={changePassword}>
                            Change Password
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    )
}

export default UserProfile
