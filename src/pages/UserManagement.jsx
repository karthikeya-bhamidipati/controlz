import React, { useState, useEffect } from 'react'
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Checkbox,
    Tooltip,
    CircularProgress,
    Menu,
    useMediaQuery,
} from '@mui/material'
import {
    Add,
    LockReset,
    AdminPanelSettings,
    Delete,
    MoreVert,
    PersonOff,
} from '@mui/icons-material'
import axios from 'axios'
import NavBar from './NavBar'
import {
    getAllUsersRoute,
    updateUserRoleRoute,
    bulkUpdateRoleRoute,
    resetPasswordRoute,
    bulkResetPasswordRoute,
    createUserRoute,
    bulkCreateUserRoute,
    deleteUserRoute,
    bulkDeleteUserRoute,
} from '../utils/ApiRoutes'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDarkMode } from '../context/DarkModeContext'
import { useWebSocket } from '../context/WebSocketContext'

const UserManagement = () => {
    // Axios interceptor for token authentication
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    const { darkMode } = useDarkMode()
    const { isConnected, subscribe } = useWebSocket()
    const isLargeScreen = useMediaQuery((theme) => theme.breakpoints.up('md'))

    // State declarations
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUsers, setSelectedUsers] = useState([])
    const [bulkRole, setBulkRole] = useState('USER')
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
    const [newUserDialogOpen, setNewUserDialogOpen] = useState(false)
    const [newUserData, setNewUserData] = useState({
        username: '',
        role: 'USER',
    })
    const [bulkAddDialogOpen, setBulkAddDialogOpen] = useState(false)
    const [bulkUsersData, setBulkUsersData] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [bulkResetDialogOpen, setBulkResetDialogOpen] = useState(false)

    // Fetch initial user list
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(getAllUsersRoute)
                setUsers(response.data)
                setLoading(false)
            } catch (error) {
                toast.error('Error fetching users')
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    // Subscribe to WebSocket updates
    useEffect(() => {
        if (!isConnected) return
        const subscription = subscribe('/contrlz/users', (updatedUsers) => {
            setUsers([...updatedUsers])
        })
        return () => {
            if (subscription) subscription.unsubscribe()
        }
    }, [isConnected, subscribe])

    // Checkbox handlers
    const handleSelectAll = (event) => {
        setSelectedUsers(event.target.checked ? users.map((u) => u.id) : [])
    }

    const handleSelectUser = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        )
    }

    // Role change handlers
    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.post(updateUserRoleRoute, { id: userId, role: newRole })
            setUsers(
                users.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            )
            toast.success('Role updated successfully')
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error updating role'
            toast.error(message)
        }
    }

    const handleBulkRoleChange = async () => {
        try {
            await axios.post(bulkUpdateRoleRoute, {
                userIds: selectedUsers,
                role: bulkRole,
            })
            setUsers(
                users.map((user) =>
                    selectedUsers.includes(user.id)
                        ? { ...user, role: bulkRole }
                        : user
                )
            )
            setSelectedUsers([])
            setBulkDialogOpen(false)
            toast.success('Roles updated successfully')
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error updating roles'
            toast.error(message)
        }
    }

    // Password reset handlers
    const handleResetPassword = async (userId) => {
        try {
            await axios.post(resetPasswordRoute, { userId })
            toast.success('Password reset successfully')
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error resetting password'
            toast.error(message)
        }
    }

    const handleBulkPasswordReset = async () => {
        try {
            await axios.post(bulkResetPasswordRoute, { userIds: selectedUsers })
            setSelectedUsers([])
            setBulkResetDialogOpen(false)
            toast.success('Passwords reset successfully')
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error resetting passwords'
            toast.error(message)
        }
    }

    // User creation handlers
    const handleCreateUser = async () => {
        try {
            await axios.post(createUserRoute, newUserData)
            const response = await axios.get(getAllUsersRoute)
            setUsers(response.data)
            setNewUserDialogOpen(false)
            setNewUserData({ username: '', role: 'USER' })
            toast.success('User created successfully')
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error creating user'
            toast.error(message)
        }
    }

    const getLoggedInUsername = () => {
        const token = localStorage.getItem('token')
        if (!token) return null

        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            return payload.sub || payload.email // Adjust based on your token
        } catch (error) {
            console.error('Error decoding JWT:', error)
            return null
        }
    }

    const loggedInUsername = getLoggedInUsername()

    const handleBulkAddUsers = async () => {
        try {
            let parsedData
            try {
                parsedData = JSON.parse(bulkUsersData)
                if (!Array.isArray(parsedData))
                    throw new Error('Input must be an array')
            } catch (e) {
                toast.error(
                    'Invalid JSON format. Please provide a valid array.'
                )
                return
            }

            await axios.post(bulkCreateUserRoute, parsedData)

            const response = await axios.get(getAllUsersRoute)
            setUsers(response.data)
            setBulkAddDialogOpen(false)
            setBulkUsersData('')
            toast.success('Bulk users created successfully')
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error bulk creating users'
            toast.error(message)
        }
    }

    // Delete handlers
    const handleDeleteUser = (userId) => {
        setUserToDelete(userId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        try {
            await axios.post(deleteUserRoute, { userId: userToDelete })
            setDeleteDialogOpen(false)
            toast.success('User deleted successfully')
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error deleting user'
            toast.error(message)
        }
    }

    const handleConfirmBulkDelete = async () => {
        try {
            await axios.post(bulkDeleteUserRoute, { userIds: selectedUsers })
            setSelectedUsers([])
            setBulkDeleteDialogOpen(false)
            toast.success('Users deleted successfully')
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error deleting users'
            toast.error(message)
        }
    }

    // Menu handlers for small screens
    const handleOpenMenu = (event, userId) => {
        setAnchorEl(event.currentTarget)
        setSelectedUserId(userId)
    }

    const handleCloseMenu = () => {
        setAnchorEl(null)
        setSelectedUserId(null)
    }

    // Loading state
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
    const filteredUsers = users.filter(
        (user) => user.username !== loggedInUsername
    )

    return (
        <>
            <NavBar />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    User Management
                </Typography>
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setNewUserDialogOpen(true)}
                        >
                            Add User
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setBulkAddDialogOpen(true)}
                        >
                            Bulk Add Users
                        </Button>
                    </Box>
                    {selectedUsers.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<AdminPanelSettings />}
                                onClick={() => setBulkDialogOpen(true)}
                            >
                                Change Role ({selectedUsers.length})
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<LockReset />}
                                onClick={() => setBulkResetDialogOpen(true)}
                            >
                                Reset Passwords ({selectedUsers.length})
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => setBulkDeleteDialogOpen(true)}
                            >
                                Delete Users ({selectedUsers.length})
                            </Button>
                        </Box>
                    )}
                </Box>
                {filteredUsers.length > 0 ? (
                    <TableContainer
                        component={Paper}
                        sx={{ maxWidth: '100%', overflowX: 'auto' }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={
                                                selectedUsers.length > 0 &&
                                                selectedUsers.length <
                                                    filteredUsers.length
                                            }
                                            checked={
                                                filteredUsers.length > 0 &&
                                                selectedUsers.length ===
                                                    filteredUsers.map(
                                                        (u) => u.id
                                                    ).length
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers(
                                                        filteredUsers.map(
                                                            (user) => user.id
                                                        )
                                                    ) // Select all users
                                                } else {
                                                    setSelectedUsers([]) // Deselect all users
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedUsers.includes(
                                                    user.id
                                                )}
                                                onChange={() =>
                                                    handleSelectUser(user.id)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        user.id,
                                                        e.target.value
                                                    )
                                                }
                                                size="small"
                                            >
                                                <MenuItem value="ADMIN">
                                                    Admin
                                                </MenuItem>
                                                <MenuItem value="USER">
                                                    User
                                                </MenuItem>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            {isLargeScreen ? (
                                                <>
                                                    <Tooltip title="Reset Password">
                                                        <IconButton
                                                            onClick={() =>
                                                                handleResetPassword(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            <LockReset />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete User">
                                                        <IconButton
                                                            onClick={() =>
                                                                handleDeleteUser(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <IconButton
                                                    onClick={(event) =>
                                                        handleOpenMenu(
                                                            event,
                                                            user.id
                                                        )
                                                    }
                                                >
                                                    <MoreVert />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '60vh', // Takes up available space
                            textAlign: 'center',
                            bgcolor: darkMode ? '#1a1a1a' : '#e8ecef', // Consistent background
                            borderRadius: 2, // Rounded corners for polish
                            p: 4, // Padding for breathing room
                            width: '100%', // Full width
                        }}
                    >
                        <PersonOff
                            sx={{
                                fontSize: 80, // Slightly larger for impact
                                color: darkMode ? '#666' : '#999', // Subtle color matching dark/light mode
                                mb: 2, // Margin below icon
                                animation: 'fadeInOut 3s infinite', // Creative animation
                            }}
                        />
                        <Typography
                            variant="h5"
                            sx={{
                                color: darkMode ? '#fff' : '#333', // Bold text color
                                fontWeight: 'bold', // Emphasize the message
                                mb: 1, // Spacing below
                            }}
                        >
                            No Other Users Found
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: darkMode ? '#aaa' : '#666', // Softer secondary text
                                maxWidth: 400, // Constrain width for readability
                            }}
                        >
                            It’s lonely at the top! Invite some users to join
                            the party and manage them here.
                        </Typography>
                        {/* Subtle animation with CSS */}
                        <style>
                            {`
            @keyframes fadeInOut {
                0% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
                100% { opacity: 0.6; transform: scale(1); }
            }
        `}
                        </style>
                    </Box>
                )}
                {/* Actions Menu for Small Screens */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                >
                    <MenuItem
                        onClick={() => {
                            handleResetPassword(selectedUserId)
                            handleCloseMenu()
                        }}
                    >
                        Reset Password
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleDeleteUser(selectedUserId)
                            handleCloseMenu()
                        }}
                    >
                        Delete User
                    </MenuItem>
                </Menu>
                {/* Single Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this user?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleConfirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Bulk Delete Confirmation Dialog */}
                <Dialog
                    open={bulkDeleteDialogOpen}
                    onClose={() => setBulkDeleteDialogOpen(false)}
                >
                    <DialogTitle>Confirm Bulk Delete</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete{' '}
                            {selectedUsers.length} users?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setBulkDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleConfirmBulkDelete}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Bulk Password Reset Confirmation Dialog */}
                <Dialog
                    open={bulkResetDialogOpen}
                    onClose={() => setBulkResetDialogOpen(false)}
                >
                    <DialogTitle>Confirm Bulk Password Reset</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to reset passwords for{' '}
                            {selectedUsers.length} users?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setBulkResetDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleBulkPasswordReset}
                        >
                            Reset
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Bulk Role Change Dialog */}
                <Dialog
                    open={bulkDialogOpen}
                    onClose={() => setBulkDialogOpen(false)}
                >
                    <DialogTitle>
                        Change Role for {selectedUsers.length} Users
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <FormControl
                            fullWidth
                            variant="outlined"
                            sx={{ marginTop: 1 }}
                        >
                            <InputLabel>New Role</InputLabel>
                            <Select
                                value={bulkRole}
                                onChange={(e) => setBulkRole(e.target.value)}
                                label="New Role"
                            >
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="USER">User</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setBulkDialogOpen(false)}
                            sx={{ minWidth: 100 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleBulkRoleChange}
                            sx={{ minWidth: 100 }}
                        >
                            Apply
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Add New User Dialog */}
                <Dialog
                    open={newUserDialogOpen}
                    onClose={() => setNewUserDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogContent sx={{ pt: 3, pb: 2 }}>
                        <Box
                            component="form"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <TextField
                                autoFocus
                                required
                                fullWidth
                                label="Username"
                                variant="outlined"
                                value={newUserData.username}
                                onChange={(e) =>
                                    setNewUserData({
                                        ...newUserData,
                                        username: e.target.value,
                                    })
                                }
                                sx={{ marginTop: 1 }}
                            />
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={newUserData.role}
                                    onChange={(e) =>
                                        setNewUserData({
                                            ...newUserData,
                                            role: e.target.value,
                                        })
                                    }
                                    label="Role"
                                >
                                    <MenuItem value="ADMIN">Admin</MenuItem>
                                    <MenuItem value="USER">User</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setNewUserDialogOpen(false)}
                            sx={{ minWidth: 100 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateUser}
                            sx={{ minWidth: 100 }}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Bulk Add Users Dialog */}
                <Dialog
                    open={bulkAddDialogOpen}
                    onClose={() => setBulkAddDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Bulk Add Users</DialogTitle>
                    <DialogContent sx={{ pt: 3, pb: 2 }}>
                        <Box
                            component="form"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                            }}
                        >
                            <TextField
                                label="Paste JSON data here"
                                multiline
                                rows={8}
                                value={bulkUsersData}
                                onChange={(e) =>
                                    setBulkUsersData(e.target.value)
                                }
                                fullWidth
                                variant="outlined"
                            />
                            <Typography variant="caption" color="textSecondary">
                                Please provide a JSON array of objects, e.g.: [
                                {'{'} "username": "user1", "role": "USER" {'}'},{' '}
                                {'{'} "username": "user2", "role": "ADMIN" {'}'}
                                ]
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setBulkAddDialogOpen(false)}
                            sx={{ minWidth: 100 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleBulkAddUsers}
                            sx={{ minWidth: 100 }}
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    )
}

export default UserManagement
