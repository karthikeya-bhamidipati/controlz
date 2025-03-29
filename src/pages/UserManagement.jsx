import React, { useState, useEffect, useRef } from "react";
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
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  ListItem,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  PersonAdd,
  Group,
  Upload,
  Download,
  Description,
  Code,
  PictureAsPdf,
} from "@mui/icons-material";
import axios from "axios";
import NavBar from "./NavBar";
import * as YAML from "js-yaml";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const UserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    username: "",
    email: "",
    role: "",
    group: "",
  });
  const [currentGroup, setCurrentGroup] = useState({
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // File upload and download state
  const [uploadAnchorEl, setUploadAnchorEl] = useState(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
  const fileInputRef = useRef(null);

  // Menu state
  const uploadMenuOpen = Boolean(uploadAnchorEl);
  const downloadMenuOpen = Boolean(downloadAnchorEl);

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  // API calls
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Error fetching users", "error");
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get("/api/groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      showNotification("Error fetching groups", "error");
    }
  };

  const handleUserSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`/api/users/${currentUser._id}`, currentUser);
        showNotification("User updated successfully", "success");
      } else {
        await axios.post("/api/users", currentUser);
        showNotification("User added successfully", "success");
      }
      setOpenUserDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      showNotification("Error saving user", "error");
    }
  };

  const handleGroupSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`/api/groups/${currentGroup._id}`, currentGroup);
        showNotification("Group updated successfully", "success");
      } else {
        await axios.post("/api/groups", currentGroup);
        showNotification("Group added successfully", "success");
      }
      setOpenGroupDialog(false);
      fetchGroups();
    } catch (error) {
      console.error("Error saving group:", error);
      showNotification("Error saving group", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
      showNotification("User deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Error deleting user", "error");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`/api/groups/${groupId}`);
      fetchGroups();
      showNotification("Group deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting group:", error);
      showNotification("Error deleting group", "error");
    }
  };

  // UI handlers
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsEditing(true);
    setOpenUserDialog(true);
  };

  const handleEditGroup = (group) => {
    setCurrentGroup(group);
    setIsEditing(true);
    setOpenGroupDialog(true);
  };

  const handleAddUser = () => {
    setCurrentUser({ username: "", email: "", role: "", group: "" });
    setIsEditing(false);
    setOpenUserDialog(true);
  };

  const handleAddGroup = () => {
    setCurrentGroup({ name: "", description: "" });
    setIsEditing(false);
    setOpenGroupDialog(true);
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setCurrentGroup((prev) => ({ ...prev, [name]: value }));
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // File Upload Handlers
  const handleUploadClick = (event) => {
    setUploadAnchorEl(event.currentTarget);
  };

  const handleUploadClose = () => {
    setUploadAnchorEl(null);
  };

  const handleFileTypeSelect = (fileType) => {
    // Set accepted file types based on selection
    const acceptTypes = {
      yaml: ".yaml,.yml",
      txt: ".txt",
      csv: ".csv",
      pdf: ".pdf",
    };

    fileInputRef.current.accept = acceptTypes[fileType];
    fileInputRef.current.click();
    handleUploadClose();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileType = file.name.split(".").pop().toLowerCase();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target.result;
        let parsedData;

        try {
          // Parse file based on type
          switch (fileType) {
            case "yaml":
            case "yml":
              parsedData = YAML.load(content);
              break;
            case "txt":
              // Simple parsing assuming format: key: value
              parsedData = parseSimpleTxt(content);
              break;
            case "csv":
              parsedData = Papa.parse(content, { header: true }).data;
              break;
            case "pdf":
              showNotification(
                "PDF processing in progress - this may take a moment",
                "info"
              );
              // PDF processing would require a backend service or additional library
              // This is a placeholder for PDF parsing
              try {
                // Assuming PDF content is sent to an API endpoint that extracts text
                const formData = new FormData();
                formData.append("file", file);
                const response = await axios.post("/api/parse-pdf", formData, {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                });
                parsedData = response.data;
              } catch (error) {
                throw new Error(
                  "PDF parsing is not fully implemented on the backend"
                );
              }
              break;
            default:
              throw new Error(`Unsupported file type: ${fileType}`);
          }

          // Process parsed data
          if (tabValue === 0) {
            // Users tab
            await processUserData(parsedData);
          } else {
            // Groups tab
            await processGroupData(parsedData);
          }

          showNotification(
            `Successfully imported data from ${file.name}`,
            "success"
          );
          // Refresh data
          fetchUsers();
          fetchGroups();
        } catch (error) {
          console.error("Error processing file:", error);
          showNotification(`Error processing file: ${error.message}`, "error");
        }
      };

      if (fileType === "pdf") {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      console.error("Error reading file:", error);
      showNotification("Error reading file", "error");
    }

    // Reset the file input
    event.target.value = null;
  };

  // Parse simple text file with format: key: value
  const parseSimpleTxt = (content) => {
    const lines = content.split("\n");
    const result = [];
    let currentObject = {};

    for (const line of lines) {
      if (line.trim() === "") {
        // Empty line indicates a new object
        if (Object.keys(currentObject).length > 0) {
          result.push(currentObject);
          currentObject = {};
        }
        continue;
      }

      const match = line.match(/(.+?):\s*(.+)/);
      if (match) {
        const [, key, value] = match;
        currentObject[key.trim()] = value.trim();
      }
    }

    // Add the last object if not empty
    if (Object.keys(currentObject).length > 0) {
      result.push(currentObject);
    }

    return result;
  };

  // Process user data from imported file
  const processUserData = async (data) => {
    if (!Array.isArray(data)) {
      data = [data];
    }

    // Map fields to expected format
    const mappedData = data.map((item) => {
      const user = {};

      // Map common variations of field names
      user.username = item.username || item.name || item.user || "";
      user.email = item.email || item["e-mail"] || item.mail || "";
      user.role = item.role || item.type || item.access || "user";
      user.group = item.group || item.team || item.department || "";

      // Find group ID by name if string is provided
      if (
        user.group &&
        typeof user.group === "string" &&
        !user.group.match(/^[0-9a-fA-F]{24}$/)
      ) {
        const foundGroup = groups.find(
          (g) => g.name.toLowerCase() === user.group.toLowerCase()
        );
        user.group = foundGroup ? foundGroup._id : "";
      }

      return user;
    });

    // Save each user
    for (const user of mappedData) {
      if (user.username) {
        try {
          await axios.post("/api/users", user);
        } catch (error) {
          console.error(`Error importing user ${user.username}:`, error);
        }
      }
    }

    return mappedData.length;
  };

  // Process group data from imported file
  const processGroupData = async (data) => {
    if (!Array.isArray(data)) {
      data = [data];
    }

    // Map fields to expected format
    const mappedData = data.map((item) => {
      const group = {};

      // Map common variations of field names
      group.name = item.name || item.groupName || item.group || "";
      group.description = item.description || item.desc || item.details || "";

      return group;
    });

    // Save each group
    for (const group of mappedData) {
      if (group.name) {
        try {
          await axios.post("/api/groups", group);
        } catch (error) {
          console.error(`Error importing group ${group.name}:`, error);
        }
      }
    }

    return mappedData.length;
  };

  // Download Handlers
  const handleDownloadClick = (event) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setDownloadAnchorEl(null);
  };

  const handleDownload = (format) => {
    handleDownloadClose();

    const data = tabValue === 0 ? users : groups;
    const fileName = tabValue === 0 ? "users" : "groups";

    // Prepare data for groups tab - include user count information
    let processedData = data;
    if (tabValue === 1) {
      processedData = data.map((group) => {
        const memberCount = users.filter(
          (user) => user.group === group._id
        ).length;
        return { ...group, memberCount };
      });
    }

    // Generate data in selected format
    let content;
    let mimeType;
    let fileExtension;

    switch (format) {
      case "yaml":
        content = YAML.dump(processedData);
        mimeType = "application/yaml";
        fileExtension = "yaml";
        break;
      case "json":
        content = JSON.stringify(processedData, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
        break;
      case "csv":
        content = convertToCSV(processedData);
        mimeType = "text/csv";
        fileExtension = "csv";
        break;
      case "txt":
        content = convertToTxt(processedData);
        mimeType = "text/plain";
        fileExtension = "txt";
        break;
      default:
        showNotification(`Unsupported format: ${format}`, "error");
        return;
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, `${fileName}.${fileExtension}`);
    showNotification(`Downloaded ${fileName}.${fileExtension}`, "success");
  };

  // Convert data to CSV format
  const convertToCSV = (data) => {
    return Papa.unparse(data);
  };

  // Convert data to simple TXT format
  const convertToTxt = (data) => {
    let result = "";

    data.forEach((item) => {
      Object.entries(item).forEach(([key, value]) => {
        // Skip internal MongoDB fields
        if (key === "_id" || key === "__v") return;

        result += `${key}: ${value}\n`;
      });
      result += "\n"; // Add empty line between items
    });

    return result;
  };

  return (
    <>
      <NavBar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          User & Group Management
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
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
                display: "flex",
                justifyContent: "flex-end",
                mb: 2,
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={handleUploadClick}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadClick}
              >
                Export
              </Button>
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
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {groups.find((g) => g._id === user.group)?.name ||
                          "None"}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditUser(user)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteUser(user._id)}>
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
                display: "flex",
                justifyContent: "flex-end",
                mb: 2,
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={handleUploadClick}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadClick}
              >
                Export
              </Button>
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
                      <TableCell>{group.description}</TableCell>
                      <TableCell>
                        {
                          users.filter((user) => user.group === group._id)
                            .length
                        }
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditGroup(group)}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteGroup(group._id)}
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
        <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
          <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
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
            <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
            <Button onClick={handleUserSave}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Group Dialog */}
        <Dialog
          open={openGroupDialog}
          onClose={() => setOpenGroupDialog(false)}
        >
          <DialogTitle>{isEditing ? "Edit Group" : "Add Group"}</DialogTitle>
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
            <Button onClick={() => setOpenGroupDialog(false)}>Cancel</Button>
            <Button onClick={handleGroupSave}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {/* Upload File Type Menu */}
        <Menu
          anchorEl={uploadAnchorEl}
          open={uploadMenuOpen}
          onClose={handleUploadClose}
        >
          <MenuItem onClick={() => handleFileTypeSelect("yaml")}>
            <ListItemIcon>
              <Code fontSize="small" />
            </ListItemIcon>
            <ListItemText>YAML File</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleFileTypeSelect("txt")}>
            <ListItemIcon>
              <Description fontSize="small" />
            </ListItemIcon>
            <ListItemText>Text File</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleFileTypeSelect("csv")}>
            <ListItemIcon>
              <Description fontSize="small" />
            </ListItemIcon>
            <ListItemText>CSV File</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleFileTypeSelect("pdf")}>
            <ListItemIcon>
              <PictureAsPdf fontSize="small" />
            </ListItemIcon>
            <ListItemText>PDF File</ListItemText>
          </MenuItem>
        </Menu>

        {/* Download Format Menu */}
        <Menu
          anchorEl={downloadAnchorEl}
          open={downloadMenuOpen}
          onClose={handleDownloadClose}
        >
          <MenuItem onClick={() => handleDownload("yaml")}>
            <ListItemIcon>
              <Code fontSize="small" />
            </ListItemIcon>
            <ListItemText>YAML Format</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDownload("json")}>
            <ListItemIcon>
              <Code fontSize="small" />
            </ListItemIcon>
            <ListItemText>JSON Format</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDownload("csv")}>
            <ListItemIcon>
              <Description fontSize="small" />
            </ListItemIcon>
            <ListItemText>CSV Format</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDownload("txt")}>
            <ListItemIcon>
              <Description fontSize="small" />
            </ListItemIcon>
            <ListItemText>Text Format</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
  );
};

export default UserManagement;
