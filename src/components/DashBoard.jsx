import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";
import PageLayout from "./PageLayout";

function DashBoard() {
  return (
    <PageLayout>
      <Grid container spacing={3}>
        {/* Connected Devices Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", minHeight: 150, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connected Devices
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Chip label="245" color="primary" size="medium" />
                <Typography variant="body2" color="text.secondary">
                  (+12% from last month)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Energy Consumption Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", minHeight: 150, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Energy Consumption
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Chip label="15.2 kW" color="secondary" />
              </Box>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={60}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  60% of monthly target
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

export default DashBoard;
