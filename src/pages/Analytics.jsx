import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { Grid } from "@mui/material";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  // Add other Recharts components as needed
} from "recharts";

import { BarChart, Bar, CartesianGrid, Tooltip, Legend } from "recharts";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [energyData] = useState([
    { date: "Mon", usage: 65 },
    { date: "Tue", usage: 59 },
    // ... more data
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Energy Analytics</Typography>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="day">Last 24h</MenuItem>
          <MenuItem value="week">Last Week</MenuItem>
          <MenuItem value="month">Last Month</MenuItem>
        </Select>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Energy Consumption
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Add more charts */}
      </Grid>
    </Box>
  );
};

export default Analytics;
