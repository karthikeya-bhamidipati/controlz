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
    Tabs,
    Tab,
    Alert,
    Snackbar,
} from '@mui/material'
import { Edit, Delete, Add, PersonAdd, Group } from '@mui/icons-material'
import axios from 'axios'
import NavBar from './NavBar'

const UserManagement = () => {
    // State management
    const [users, setUsers] = useState([])
    const [groups, setGroups] = useState([])
    const [tabValue, setTabValue] = useState(0)
    const [openUserDialog, setOpenUserDialog] = useState(false)
    const [openGroupDialog, setOpenGroupDialog] = useState(false)
    const [currentUser, setCurrentUser] = useState({
        username: '',
        email: '',
        role: '',
        group: '',
    })
    const [currentGroup, setCurrentGroup] = useState({
        name: '',
        description: '',
    })
    const [isEditing, setIsEditing] = useState(false)
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success',
    })

    // Fetch data on component mount
    useEffect(() => {
        fetchUsers()
        fetchGroups()
    })

    // API calls
    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users')
            setUsers(response.data)
        } catch (error) {
            console.error('Error fetching users:', error)
            showNotification('Error fetching users', 'error')
        }
    }

    const fetchGroups = async () => {
        try {
            const response = await axios.get('/api/groups')
            setGroups(response.data)
        } catch (error) {
            console.error('Error fetching groups:', error)
            showNotification('Error fetching groups', 'error')
        }
    }

    const handleUserSave = async () => {
        try {
            if (isEditing) {
                await axios.put(`/api/users/${currentUser._id}`, currentUser)
                showNotification('User updated successfully', 'success')
            } else {
                await axios.post('/api/users', currentUser)
                showNotification('User added successfully', 'success')
            }
            setOpenUserDialog(false)
            fetchUsers()
        } catch (error) {
            console.error('Error saving user:', error)
            showNotification('Error saving user', 'error')
        }
    }

    const handleGroupSave = async () => {
        try {
            if (isEditing) {
                await axios.put(`/api/groups/${currentGroup._id}`, currentGroup)
                showNotification('Group updated successfully', 'success')
            } else {
                await axios.post('/api/groups', currentGroup)
                showNotification('Group added successfully', 'success')
            }
            setOpenGroupDialog(false)
            fetchGroups()
        } catch (error) {
            console.error('Error saving group:', error)
            showNotification('Error saving group', 'error')
        }
    }

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`/api/users/${userId}`)
            fetchUsers()
            showNotification('User deleted successfully', 'success')
        } catch (error) {
            console.error('Error deleting user:', error)
            showNotification('Error deleting user', 'error')
        }
    }

    const handleDeleteGroup = async (groupId) => {
        try {
            await axios.delete(`/api/groups/${groupId}`)
            fetchGroups()
            showNotification('Group deleted successfully', 'success')
        } catch (error) {
            console.error('Error deleting group:', error)
            showNotification('Error deleting group', 'error')
        }
    }

    // UI handlers
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const handleEditUser = (user) => {
        setCurrentUser(user)
        setIsEditing(true)
        setOpenUserDialog(true)
    }

    const handleEditGroup = (group) => {
        setCurrentGroup(group)
        setIsEditing(true)
        setOpenGroupDialog(true)
    }

    const handleAddUser = () => {
        setCurrentUser({ username: '', email: '', role: '', group: '' })
        setIsEditing(false)
        setOpenUserDialog(true)
    }

    const handleAddGroup = () => {
        setCurrentGroup({ name: '', description: '' })
        setIsEditing(false)
        setOpenGroupDialog(true)
    }

    const handleUserChange = (e) => {
        const { name, value } = e.target
        setCurrentUser((prev) => ({ ...prev, [name]: value }))
    }

    const handleGroupChange = (e) => {
        const { name, value } = e.target
        setCurrentGroup((prev) => ({ ...prev, [name]: value }))
    }

    const showNotification = (message, severity) => {
        setNotification({ open: true, message, severity })
    }

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false })
    }

    return (
        <>
            <NavBar />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    User & Group Management
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab icon={<PersonAdd />} label="Users" />
                        <Tab icon={<Group />} label="Groups" />
                    </Tabs>
                </Box>

                {/* Users Tab */}
                {tabValue === 0 && (
                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                mb: 2,
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddUser}
                            >
                                Add User
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Group</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell>
                                                {user.username}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>
                                                {groups.find(
                                                    (g) => g._id === user.group
                                                )?.name || 'None'}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() =>
                                                        handleEditUser(user)
                                                    }
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user._id
                                                        )
                                                    }
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* Groups Tab */}
                {tabValue === 1 && (
                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                mb: 2,
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddGroup}
                            >
                                Add Group
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Members</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groups.map((group) => (
                                        <TableRow key={group._id}>
                                            <TableCell>{group.name}</TableCell>
                                            <TableCell>
                                                {group.description}
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    users.filter(
                                                        (user) =>
                                                            user.group ===
                                                            group._id
                                                    ).length
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() =>
                                                        handleEditGroup(group)
                                                    }
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() =>
                                                        handleDeleteGroup(
                                                            group._id
                                                        )
                                                    }
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* User Dialog */}
                <Dialog
                    open={openUserDialog}
                    onClose={() => setOpenUserDialog(false)}
                >
                    <DialogTitle>
                        {isEditing ? 'Edit User' : 'Add User'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="username"
                            label="Username"
                            type="text"
                            fullWidth
                            value={currentUser.username}
                            onChange={handleUserChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="email"
                            label="Email"
                            type="email"
                            fullWidth
                            value={currentUser.email}
                            onChange={handleUserChange}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={currentUser.role}
                                label="Role"
                                onChange={handleUserChange}
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="viewer">Viewer</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Group</InputLabel>
                            <Select
                                name="group"
                                value={currentUser.group}
                                label="Group"
                                onChange={handleUserChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {groups.map((group) => (
                                    <MenuItem key={group._id} value={group._id}>
                                        {group.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenUserDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUserSave}>Save</Button>
                    </DialogActions>
                </Dialog>

                {/* Group Dialog */}
                <Dialog
                    open={openGroupDialog}
                    onClose={() => setOpenGroupDialog(false)}
                >
                    <DialogTitle>
                        {isEditing ? 'Edit Group' : 'Add Group'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Group Name"
                            type="text"
                            fullWidth
                            value={currentGroup.name}
                            onChange={handleGroupChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            value={currentGroup.description}
                            onChange={handleGroupChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenGroupDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleGroupSave}>Save</Button>
                    </DialogActions>
                </Dialog>

                {/* Notifications */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Box>
        </>
    )
}

export default UserManagement
