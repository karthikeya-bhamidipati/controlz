import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { Save, Lock, Person } from "@mui/icons-material";
import axios from "axios";

const UserProfile = () => {
  // State management
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    department: "",
    lastLogin: "",
    joinDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // API calls
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await axios.get("/api/user/profile");
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      showNotification("Error loading profile data", "error");
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      // Replace with your actual API endpoint
      await axios.put("/api/user/profile", profile);
      showNotification("Profile updated successfully", "success");
      setSaving(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Error updating profile", "error");
      setSaving(false);
    }
  };

  const changePassword = async () => {
    // Validate password data
    const validationErrors = {};
    if (!passwordData.currentPassword)
      validationErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword)
      validationErrors.newPassword = "New password is required";
    if (passwordData.newPassword !== passwordData.confirmPassword)
      validationErrors.confirmPassword = "Passwords do not match";
    if (passwordData.newPassword && passwordData.newPassword.length < 8)
      validationErrors.newPassword = "Password must be at least 8 characters";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Replace with your actual API endpoint
      await axios.post("/api/user/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setOpenPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      showNotification("Password changed successfully", "success");
    } catch (error) {
      console.error("Error changing password:", error);

      if (error.response && error.response.status === 401) {
        setErrors({ currentPassword: "Current password is incorrect" });
      } else {
        showNotification("Error changing password", "error");
      }
    }
  };

  // UI handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", margin: "0 auto" }}>
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
                  label="First Name"
                  name="firstName"
                  value={profile.firstName || ""}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profile.lastName || ""}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profile.email || ""}
                  onChange={handleProfileChange}
                  margin="normal"
                  type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={profile.username || ""}
                  onChange={handleProfileChange}
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={profile.phoneNumber || ""}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={profile.department || ""}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={profile.role || ""}
                  margin="normal"
                  disabled
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={updateProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                  Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last changed:{" "}
                  {profile.passwordLastChanged
                    ? formatDate(profile.passwordLastChanged)
                    : "N/A"}
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
        </Grid>

        {/* Right column - Profile summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile.role}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.email}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {formatDate(profile.joinDate)}
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Login
                </Typography>
                <Typography variant="body1">
                  {formatDate(profile.lastLogin)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1">
                  {profile.department || "Not specified"}
                </Typography>
              </Box>
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
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={changePassword}>Change Password</Button>
        </DialogActions>
      </Dialog>

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
  );
};

export default UserProfile;
