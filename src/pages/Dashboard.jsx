import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDarkMode } from "../context/DarkModeContext"; // Assuming this exists

const Dashboard = () => {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalDevices: 0,
    activeDevices: 0,
    recentActivities: [],
  });

  const toastOptions = {
    position: "bottom-left",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: darkMode ? "dark" : "light",
  };

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("/api/dashboard", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Assuming JWT
        });
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error("Failed to load dashboard data", toastOptions);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, sm: 4 },
        transition: "background 0.5s ease",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 4, color: "text.primary" }}
      >
        Dashboard
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                bgcolor: "background.paper",
                boxShadow: darkMode
                  ? "5px 15px 30px rgba(222,222,222,0.2)"
                  : "5px 15px 30px rgba(0,0,0,0.2)",
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Total Devices
                </Typography>
                <Typography variant="h3" color="primary">
                  {dashboardData.totalDevices}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                bgcolor: "background.paper",
                boxShadow: darkMode
                  ? "5px 15px 30px rgba(222,222,222,0.2)"
                  : "5px 15px 30px rgba(0,0,0,0.2)",
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Active Devices
                </Typography>
                <Typography variant="h3" color="success.main">
                  {dashboardData.activeDevices}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: "background.paper",
                boxShadow: darkMode
                  ? "5px 15px 30px rgba(222,222,222,0.2)"
                  : "5px 15px 30px rgba(0,0,0,0.2)",
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary" mb={2}>
                  Recent Activities
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                      {activity.message} -{" "}
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent activities.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
