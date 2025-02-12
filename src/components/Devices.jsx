import React from "react";
import { Box, Typography, Card, CardContent, Grid, Chip } from "@mui/material";

function Devices() {
  const devices = [
    { name: "Smart Thermostat", status: "Online" },
    { name: "Security Camera", status: "Offline" },
    { name: "Lighting System", status: "Online" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Devices
      </Typography>
      <Grid container spacing={3}>
        {devices.map((device, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{device.name}</Typography>
                <Chip
                  label={device.status}
                  color={device.status === "Online" ? "success" : "error"}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Devices;
