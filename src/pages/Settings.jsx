import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Switch,
  TextField,
} from "@mui/material";
import { Grid, Typography } from "@mui/material";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    twoFactorAuth: false,
  });

  const handleSettingChange = (setting) => (e) => {
    setSettings({ ...settings, [setting]: e.target.checked });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      <List>
        <ListItem>
          <ListItemText
            primary="Enable Notifications"
            secondary="Receive system notifications"
          />
          <Switch
            checked={settings.notifications}
            onChange={handleSettingChange("notifications")}
          />
        </ListItem>

        <ListItem>
          <ListItemText primary="Dark Mode" secondary="Enable dark theme" />
          <Switch
            checked={settings.darkMode}
            onChange={handleSettingChange("darkMode")}
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Two-Factor Authentication"
            secondary="Enhance account security"
          />
          <Switch
            checked={settings.twoFactorAuth}
            onChange={handleSettingChange("twoFactorAuth")}
          />
        </ListItem>
      </List>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Integration Settings
      </Typography>
      <TextField label="Google Home API Key" fullWidth sx={{ mb: 2 }} />
      <TextField label="Amazon Alexa Token" fullWidth />
    </Box>
  );
};

export default Settings;
