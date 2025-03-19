import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Mock data - would come from API in real implementation
  const [energyData, setEnergyData] = useState([
    { date: "Mon", usage: 65, cost: 7.8, temp: 22 },
    { date: "Tue", usage: 59, cost: 7.1, temp: 21 },
    { date: "Wed", usage: 80, cost: 9.6, temp: 23 },
    { date: "Thu", usage: 81, cost: 9.7, temp: 24 },
    { date: "Fri", usage: 56, cost: 6.7, temp: 21 },
    { date: "Sat", usage: 55, cost: 6.6, temp: 20 },
    { date: "Sun", usage: 40, cost: 4.8, temp: 19 },
  ]);

  const [deviceData] = useState([
    { name: "Lighting", value: 30, color: "#FFB900" },
    { name: "HVAC", value: 45, color: "#0078D7" },
    { name: "Kitchen", value: 15, color: "#E81123" },
    { name: "Other", value: 10, color: "#00CC6A" },
  ]);

  const [temperatureData, setTemperatureData] = useState([
    { time: "00:00", indoor: 21, outdoor: 18 },
    { time: "04:00", indoor: 20, outdoor: 16 },
    { time: "08:00", indoor: 21, outdoor: 19 },
    { time: "12:00", indoor: 23, outdoor: 24 },
    { time: "16:00", indoor: 24, outdoor: 26 },
    { time: "20:00", indoor: 22, outdoor: 22 },
  ]);

  const [waterData] = useState([
    { date: "Mon", usage: 120 },
    { date: "Tue", usage: 132 },
    { date: "Wed", usage: 101 },
    { date: "Thu", usage: 134 },
    { date: "Fri", usage: 90 },
    { date: "Sat", usage: 230 },
    { date: "Sun", usage: 210 },
  ]);

  // Usage statistics
  const [stats] = useState({
    energy: {
      current: 390,
      previous: 420,
      unit: "kWh",
      change: -7.14,
      cost: 46.8,
    },
    water: {
      current: 1017,
      previous: 980,
      unit: "L",
      change: 3.78,
      cost: 12.2,
    },
    temperature: {
      current: 21.5,
      optimal: 21,
      unit: "°C",
      change: 0.5,
    },
    devices: {
      total: 24,
      active: 16,
      alert: 2,
    },
  });

  // Simulate loading new data
  const refreshData = () => {
    setLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // Random data refresh
      const newEnergyData = energyData.map((item) => ({
        ...item,
        usage: item.usage * (0.9 + Math.random() * 0.2),
        cost: item.usage * 0.12 * (0.9 + Math.random() * 0.2),
        temp: item.temp * (0.95 + Math.random() * 0.1),
      }));

      const newTempData = temperatureData.map((item) => ({
        ...item,
        indoor: item.indoor * (0.95 + Math.random() * 0.1),
        outdoor: item.outdoor * (0.9 + Math.random() * 0.2),
      }));

      setEnergyData(newEnergyData);
      setTemperatureData(newTempData);
      setLoading(false);
    }, 800);
  };

  // Effect to simulate initial data loading
  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">IoT Analytics Dashboard</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ minWidth: 120 }}
            size="small"
          >
            <MenuItem value="day">Last 24h</MenuItem>
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
          <Tooltip title="Refresh data">
            <IconButton onClick={refreshData} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download report">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Energy" />
        <Tab label="Temperature" />
        <Tab label="Water" />
        <Tab label="Devices" />
      </Tabs>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "#0078D7" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Energy Consumption
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.energy.current} {stats.energy.unit}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={stats.energy.change < 0 ? "green" : "error"}
                  >
                    {stats.energy.change}% vs previous
                  </Typography>
                </Box>
                <ElectricBoltIcon
                  sx={{ fontSize: 40, color: "#0078D7", opacity: 0.8 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "#00CC6A" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Water Usage
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.water.current} {stats.water.unit}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={stats.water.change < 0 ? "green" : "error"}
                  >
                    {stats.water.change}% vs previous
                  </Typography>
                </Box>
                <WaterDropIcon
                  sx={{ fontSize: 40, color: "#00CC6A", opacity: 0.8 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "#E81123" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Indoor Temperature
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.temperature.current} {stats.temperature.unit}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={
                      Math.abs(stats.temperature.change) <= 1
                        ? "green"
                        : "error"
                    }
                  >
                    {stats.temperature.change > 0 ? "+" : ""}
                    {stats.temperature.change} from optimal
                  </Typography>
                </Box>
                <ThermostatIcon
                  sx={{ fontSize: 40, color: "#E81123", opacity: 0.8 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: "#FFB900" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Connected Devices
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.devices.active}/{stats.devices.total}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={stats.devices.alert > 0 ? "error" : "green"}
                  >
                    {stats.devices.alert}{" "}
                    {stats.devices.alert === 1 ? "device" : "devices"} need
                    attention
                  </Typography>
                </Box>
                <LightbulbIcon
                  sx={{ fontSize: 40, color: "#FFB900", opacity: 0.8 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Energy Consumption Over Time
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {timeRange === "day"
                  ? "Hourly"
                  : timeRange === "week"
                  ? "Daily"
                  : "Weekly"}{" "}
                power usage ({stats.energy.unit})
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={energyData}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0078D7" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#0078D7"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="#0078D7"
                    fillOpacity={1}
                    fill="url(#colorUsage)"
                    name="Energy (kWh)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Energy Distribution by Device Type
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Consumption percentage by category
              </Typography>
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Temperature Monitoring
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Indoor vs outdoor temperature (°C)
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="indoor"
                    stroke="#E81123"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Indoor"
                  />
                  <Line
                    type="monotone"
                    dataKey="outdoor"
                    stroke="#00CC6A"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Outdoor"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Water Consumption
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Daily water usage (liters)
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={waterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="usage" fill="#00CC6A" name="Water (L)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional insights section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Energy Saving Insights
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  HVAC Optimization
                </Typography>
                <Typography variant="body2">
                  The HVAC system is consuming 12% more energy than optimal.
                  Consider servicing or adjusting temperature settings.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Water Usage Anomaly
                </Typography>
                <Typography variant="body2">
                  Detected unusual water consumption on Saturday and Sunday.
                  Possible leak or unattended device.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Potential Savings
                </Typography>
                <Typography variant="body2">
                  Switching to smart lighting control could save approximately
                  15% on your lighting-related energy costs.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Button variant="contained" color="primary">
              View Detailed Analysis
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analytics;
