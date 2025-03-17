import React, { useState, useEffect } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import axios from "axios";

const DeviceManagement = () => {
  // Main state
  const [buildings, setBuildings] = useState([]);
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Dialog states
  const [buildingDialog, setBuildingDialog] = useState({
    open: false,
    isEdit: false,
    data: { name: "", location: "" },
  });
  const [roomDialog, setRoomDialog] = useState({
    open: false,
    isEdit: false,
    data: { name: "", floor: "", buildingId: "", assignedUsers: [] },
  });
  const [deviceDialog, setDeviceDialog] = useState({
    open: false,
    isEdit: false,
    data: { name: "", type: "", roomId: "", status: "OFF" },
  });

  // Fetch initial data
  useEffect(() => {
    fetchBuildings();
    fetchUsers();
  }, []);

  // API calls
  const fetchBuildings = async () => {
    try {
      const response = await axios.get("/api/buildings");
      setBuildings(response.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      showNotification("Error fetching buildings", "error");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Error fetching users", "error");
    }
  };

  // Building CRUD operations
  const handleAddBuilding = async () => {
    try {
      if (buildingDialog.isEdit) {
        await axios.put(
          `/api/buildings/${buildingDialog.data._id}`,
          buildingDialog.data
        );
        showNotification("Building updated successfully", "success");
      } else {
        await axios.post("/api/buildings", buildingDialog.data);
        showNotification("Building added successfully", "success");
      }
      setBuildingDialog({ ...buildingDialog, open: false });
      fetchBuildings();
    } catch (error) {
      console.error("Error saving building:", error);
      showNotification("Error saving building", "error");
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    try {
      await axios.delete(`/api/buildings/${buildingId}`);
      fetchBuildings();
      showNotification("Building deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting building:", error);
      showNotification("Error deleting building", "error");
    }
  };

  // Room CRUD operations
  const handleAddRoom = async () => {
    try {
      if (roomDialog.isEdit) {
        await axios.put(`/api/rooms/${roomDialog.data._id}`, roomDialog.data);
        showNotification("Room updated successfully", "success");
      } else {
        await axios.post("/api/rooms", roomDialog.data);
        showNotification("Room added successfully", "success");
      }
      setRoomDialog({ ...roomDialog, open: false });
      fetchBuildings();
    } catch (error) {
      console.error("Error saving room:", error);
      showNotification("Error saving room", "error");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await axios.delete(`/api/rooms/${roomId}`);
      fetchBuildings();
      showNotification("Room deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting room:", error);
      showNotification("Error deleting room", "error");
    }
  };

  // Device CRUD operations
  const handleAddDevice = async () => {
    try {
      if (deviceDialog.isEdit) {
        await axios.put(
          `/api/devices/${deviceDialog.data._id}`,
          deviceDialog.data
        );
        showNotification("Device updated successfully", "success");
      } else {
        await axios.post("/api/devices", deviceDialog.data);
        showNotification("Device added successfully", "success");
      }
      setDeviceDialog({ ...deviceDialog, open: false });
      fetchBuildings();
    } catch (error) {
      console.error("Error saving device:", error);
      showNotification("Error saving device", "error");
    }
  };

  const handleDeviceToggle = async (
    deviceId,
    status,
    buildingIndex,
    roomIndex,
    deviceIndex
  ) => {
    try {
      await axios.patch(`/api/devices/${deviceId}`, { status });

      // Update local state for immediate feedback
      const updatedBuildings = [...buildings];
      updatedBuildings[buildingIndex].rooms[roomIndex].devices[
        deviceIndex
      ].status = status;
      setBuildings(updatedBuildings);
    } catch (error) {
      console.error("Error updating device:", error);
      showNotification("Error updating device status", "error");
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    try {
      await axios.delete(`/api/devices/${deviceId}`);
      fetchBuildings();
      showNotification("Device deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting device:", error);
      showNotification("Error deleting device", "error");
    }
  };

  // Dialog handlers
  const openBuildingDialog = (building = null) => {
    if (building) {
      setBuildingDialog({
        open: true,
        isEdit: true,
        data: { ...building },
      });
    } else {
      setBuildingDialog({
        open: true,
        isEdit: false,
        data: { name: "", location: "" },
      });
    }
  };

  const openRoomDialog = (buildingId, room = null) => {
    if (room) {
      setRoomDialog({
        open: true,
        isEdit: true,
        data: { ...room },
      });
    } else {
      setRoomDialog({
        open: true,
        isEdit: false,
        data: { name: "", floor: "", buildingId, assignedUsers: [] },
      });
    }
  };

  const openDeviceDialog = (roomId, device = null) => {
    if (device) {
      setDeviceDialog({
        open: true,
        isEdit: true,
        data: { ...device },
      });
    } else {
      setDeviceDialog({
        open: true,
        isEdit: false,
        data: { name: "", type: "", roomId, status: "OFF" },
      });
    }
  };

  // Form change handlers
  const handleBuildingChange = (e) => {
    const { name, value } = e.target;
    setBuildingDialog((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
  };

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setRoomDialog((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
  };

  const handleDeviceChange = (e) => {
    const { name, value } = e.target;
    setDeviceDialog((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
  };

  const handleUserAssignment = (event) => {
    setRoomDialog((prev) => ({
      ...prev,
      data: { ...prev.data, assignedUsers: event.target.value },
    }));
  };

  // Notification handler
  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Helper to get user names
  const getUsernames = (userIds) => {
    if (!userIds || userIds.length === 0) return "None";
    return userIds
      .map((id) => {
        const user = users.find((u) => u._id === id);
        return user ? user.username : "Unknown";
      })
      .join(", ");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Device Management
      </Typography>

      {buildings.map((building, buildingIndex) => (
        <Accordion key={building._id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.03)",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.06)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">{building.name}</Typography>
              <Box sx={{ display: "flex", mr: 2 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openBuildingDialog(building);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBuilding(building._id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Location: {building.location}
            </Typography>

            {building.rooms &&
              building.rooms.map((room, roomIndex) => (
                <Accordion key={room._id} sx={{ ml: 3, mb: 2 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ backgroundColor: "rgba(0, 0, 0, 0.01)" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography>{room.name}</Typography>
                        {room.assignedUsers &&
                          room.assignedUsers.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 0.5,
                              }}
                            >
                              <PersonIcon
                                fontSize="small"
                                sx={{
                                  mr: 0.5,
                                  color: "text.secondary",
                                  fontSize: "16px",
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {getUsernames(room.assignedUsers)}
                              </Typography>
                            </Box>
                          )}
                      </Box>
                      <Box sx={{ display: "flex", mr: 2 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRoomDialog(building._id, room);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room._id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Floor: {room.floor || "Not specified"}
                    </Typography>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Devices
                    </Typography>

                    <Grid container spacing={2}>
                      {room.devices &&
                        room.devices.map((device, deviceIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={device._id}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 1,
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 1,
                                justifyContent: "space-between",
                              }}
                            >
                              <Box>
                                <Typography variant="body1">
                                  {device.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {device.type}
                                </Typography>
                              </Box>

                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Switch
                                  size="small"
                                  checked={device.status === "ON"}
                                  onChange={(e) =>
                                    handleDeviceToggle(
                                      device._id,
                                      e.target.checked ? "ON" : "OFF",
                                      buildingIndex,
                                      roomIndex,
                                      deviceIndex
                                    )
                                  }
                                />
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      openDeviceDialog(room._id, device)
                                    }
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDeleteDevice(device._id)
                                    }
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                    </Grid>

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => openDeviceDialog(room._id)}
                    >
                      Add Device
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() => openRoomDialog(building._id)}
            >
              Add Room
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mt: 3 }}
        onClick={() => openBuildingDialog()}
      >
        Add New Building
      </Button>

      {/* Building Dialog */}
      <Dialog
        open={buildingDialog.open}
        onClose={() => setBuildingDialog({ ...buildingDialog, open: false })}
      >
        <DialogTitle>
          {buildingDialog.isEdit ? "Edit Building" : "Add New Building"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Building Name"
            fullWidth
            variant="standard"
            value={buildingDialog.data.name}
            onChange={handleBuildingChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            fullWidth
            variant="standard"
            value={buildingDialog.data.location}
            onChange={handleBuildingChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setBuildingDialog({ ...buildingDialog, open: false })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleAddBuilding}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Room Dialog */}
      <Dialog
        open={roomDialog.open}
        onClose={() => setRoomDialog({ ...roomDialog, open: false })}
      >
        <DialogTitle>
          {roomDialog.isEdit ? "Edit Room" : "Add New Room"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Room Name"
            fullWidth
            variant="standard"
            value={roomDialog.data.name}
            onChange={handleRoomChange}
          />
          <TextField
            margin="dense"
            name="floor"
            label="Floor Number"
            type="number"
            fullWidth
            variant="standard"
            value={roomDialog.data.floor}
            onChange={handleRoomChange}
          />
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel>Assigned Users</InputLabel>
            <Select
              multiple
              value={roomDialog.data.assignedUsers}
              onChange={handleUserAssignment}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((userId) => {
                    const user = users.find((u) => u._id === userId);
                    return (
                      <Chip
                        key={userId}
                        label={user?.username || "Unknown"}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomDialog({ ...roomDialog, open: false })}>
            Cancel
          </Button>
          <Button onClick={handleAddRoom}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Device Dialog */}
      <Dialog
        open={deviceDialog.open}
        onClose={() => setDeviceDialog({ ...deviceDialog, open: false })}
      >
        <DialogTitle>
          {deviceDialog.isEdit ? "Edit Device" : "Add New Device"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Device Name"
            fullWidth
            variant="standard"
            value={deviceDialog.data.name}
            onChange={handleDeviceChange}
          />
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel>Device Type</InputLabel>
            <Select
              name="type"
              value={deviceDialog.data.type}
              onChange={handleDeviceChange}
            >
              <MenuItem value="Light">Light</MenuItem>
              <MenuItem value="Thermostat">Thermostat</MenuItem>
              <MenuItem value="Camera">Security Camera</MenuItem>
              <MenuItem value="Lock">Smart Lock</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel>Initial Status</InputLabel>
            <Select
              name="status"
              value={deviceDialog.data.status}
              onChange={handleDeviceChange}
            >
              <MenuItem value="ON">ON</MenuItem>
              <MenuItem value="OFF">OFF</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeviceDialog({ ...deviceDialog, open: false })}
          >
            Cancel
          </Button>
          <Button onClick={handleAddDevice}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeviceManagement;
