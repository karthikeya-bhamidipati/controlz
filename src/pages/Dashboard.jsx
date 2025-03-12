import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    onlineDevices: 0,
    energyUsage: 0,
    activeAutomations: 0,
  });

  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          axios.get("/api/dashboard/stats"),
          axios.get("/api/dashboard/activity"),
        ]);
        setStats(statsRes.data);
        setActivityData(activityRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Online Devices</Typography>
              <Typography variant="h3">{stats.onlineDevices}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Add other stat cards similarly */}
      </Grid>

      <Card sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Energy Consumption
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityData}>
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Line type="monotone" dataKey="consumption" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Alerts
            </Typography>
            {/* Map through recent alerts */}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Device Health
            </Typography>
            <LinearProgress
              variant="determinate"
              value={75}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
