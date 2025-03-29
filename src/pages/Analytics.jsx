import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Button,
  Badge,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDarkMode } from "../context/DarkModeContext";
import { allDeviceRoute, getRecentActivitiesRoute } from "../utils/ApiRoutes";
import NavBar from "./NavBar";
import { useWebSocket } from "../context/WebSocketContext";
import { motion } from "framer-motion";
import RefreshIcon from "@mui/icons-material/Refresh";
import DevicesIcon from "@mui/icons-material/Devices";
import PowerIcon from "@mui/icons-material/Power";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import FilterListIcon from "@mui/icons-material/FilterList";

const Dashboard = () => {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalDevices: 0,
    activeDevices: 0,
    inactiveDevices: 0,
    recentActivities: [],
    deviceCategories: [],
    lastRefreshed: null,
  });
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [filter, setFilter] = useState("all");

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: darkMode ? "dark" : "light",
  };

  // Calculate device categories for the distribution chart
  const processDeviceData = (devices) => {
    const categories = {};
    devices.forEach((device) => {
      const type = device.deviceType || "Unknown";
      if (!categories[type]) {
        categories[type] = { total: 0, active: 0 };
      }
      categories[type].total += 1;
      if (device.status === true) {
        categories[type].active += 1;
      }
    });

    return Object.entries(categories).map(([name, data]) => ({
      name,
      total: data.total,
      active: data.active,
      percentage: Math.round((data.active / data.total) * 100),
    }));
  };

  const fetchInitialData = async () => {
    try {
      setRefreshing(true);
      const [deviceResponse, activityResponse] = await Promise.all([
        axios.get(allDeviceRoute),
        axios.get(getRecentActivitiesRoute),
      ]);

      const devices = deviceResponse.data;
      const totalDevices = devices.length;
      const activeDevices = devices.filter(
        (device) => device.status === true
      ).length;
      const inactiveDevices = totalDevices - activeDevices;
      const recentActivities = activityResponse.data;
      const deviceCategories = processDeviceData(devices);

      setDashboardData({
        totalDevices,
        activeDevices,
        inactiveDevices,
        recentActivities,
        deviceCategories,
        lastRefreshed: new Date(),
      });

      toast.success("Dashboard data refreshed successfully", toastOptions);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(
        `Error fetching dashboard data: ${error.message || "Unknown error"}`,
        toastOptions
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const { isConnected, subscribe } = useWebSocket();

  useEffect(() => {
    fetchInitialData();

    if (!isConnected) return;

    const subscription = subscribe("/contrlz/devices", (data) => {
      console.log("Received WebSocket device update:", data);

      const totalDevices = data.length;
      const activeDevices = data.filter(
        (device) => device.status === true
      ).length;
      const deviceCategories = processDeviceData(data);

      setDashboardData((prevData) => ({
        ...prevData,
        totalDevices,
        activeDevices,
        inactiveDevices: totalDevices - activeDevices,
        deviceCategories,
        lastRefreshed: new Date(),
      }));
    });

    const activity = subscribe("/contrlz/recent-activity", (data) => {
      console.log("Received WebSocket recent activities update:", data);
      setDashboardData((prevData) => ({
        ...prevData,
        recentActivities: [...data],
        lastRefreshed: new Date(),
      }));
    });

    return () => {
      if (activity) activity.unsubscribe();
      if (subscription) subscription.unsubscribe();
    };
  }, [isConnected]);

  // Filter activities based on selected filter
  const filteredActivities = useMemo(() => {
    if (filter === "all") return dashboardData.recentActivities;
    if (filter === "on")
      return dashboardData.recentActivities.filter(
        (activity) => !activity.turnedOffBy
      );
    if (filter === "off")
      return dashboardData.recentActivities.filter(
        (activity) => activity.turnedOffBy
      );
    return dashboardData.recentActivities;
  }, [dashboardData.recentActivities, filter]);

  // Calculate statistics for activity summary
  const activityStats = useMemo(() => {
    const stats = {
      total: dashboardData.recentActivities.length,
      turnedOn: 0,
      turnedOff: 0,
      today: 0,
    };

    const today = new Date().setHours(0, 0, 0, 0);

    dashboardData.recentActivities.forEach((activity) => {
      if (activity.turnedOffBy) stats.turnedOff++;
      else stats.turnedOn++;

      const activityDate = new Date(activity.startTime).setHours(0, 0, 0, 0);
      if (activityDate === today) stats.today++;
    });

    return stats;
  }, [dashboardData.recentActivities]);

  const handleRefresh = () => {
    fetchInitialData();
  };

  const getDeviceTypeColor = (type) => {
    const colorMap = {
      Light: "#FFB900",
      Thermostat: "#E81123",
      Fan: "#0078D7",
      TV: "#00CC6A",
      Speaker: "#8764B8",
      Lock: "#C239B3",
      Outlet: "#00B7C3",
      Sensor: "#FF8C00",
    };

    return colorMap[type] || "#777777";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // If less than a day, show relative time
    if (diff < 24 * 60 * 60 * 1000) {
      if (diff < 60 * 1000) return "just now";
      if (diff < 60 * 60 * 1000)
        return `${Math.floor(diff / (60 * 1000))}m ago`;
      return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    }

    // Otherwise show date and time
    return date.toLocaleString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <NavBar />
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          minHeight: "100vh",
          bgcolor: darkMode ? "#121212" : "#f5f7fa",
          p: { xs: 2, sm: 4 },
          transition: "background 0.5s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "text.primary" }}
          >
            Smart Home Dashboard
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {dashboardData.lastRefreshed && (
              <Typography variant="body2" color="text.secondary">
                Last updated: {formatTimestamp(dashboardData.lastRefreshed)}
              </Typography>
            )}
            <Tooltip title="Refresh dashboard">
              <IconButton
                onClick={handleRefresh}
                disabled={loading || refreshing}
                color="primary"
              >
                {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
              gap: 2,
            }}
          >
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary">
              Loading dashboard data...
            </Typography>
          </Box>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                component={motion.div}
                variants={itemVariants}
              >
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    boxShadow: darkMode
                      ? "0 8px 16px rgba(0,0,0,0.4)"
                      : "0 8px 16px rgba(0,0,0,0.1)",
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: 15,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "stretch",
                    }}
                  />
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          mr: 2,
                        }}
                      >
                        <DevicesIcon />
                      </Avatar>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                      >
                        Total Devices
                      </Typography>
                    </Box>
                    <Typography variant="h3" color="primary" fontWeight="bold">
                      {dashboardData.totalDevices}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Chip
                        icon={<PowerIcon />}
                        label={`${dashboardData.activeDevices} Active`}
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${dashboardData.inactiveDevices} Inactive`}
                        color="default"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                component={motion.div}
                variants={itemVariants}
              >
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    boxShadow: darkMode
                      ? "0 8px 16px rgba(0,0,0,0.4)"
                      : "0 8px 16px rgba(0,0,0,0.1)",
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: 15,
                      bgcolor: "success.main",
                      display: "flex",
                      alignItems: "stretch",
                    }}
                  />
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "success.main",
                          color: "white",
                          mr: 2,
                        }}
                      >
                        <PowerIcon />
                      </Avatar>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                      >
                        Active Devices
                      </Typography>
                    </Box>
                    <Typography
                      variant="h3"
                      color="success.main"
                      fontWeight="bold"
                    >
                      {dashboardData.activeDevices}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {dashboardData.totalDevices > 0
                          ? `${Math.round(
                              (dashboardData.activeDevices /
                                dashboardData.totalDevices) *
                                100
                            )}% of all devices`
                          : "No devices available"}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={
                          dashboardData.totalDevices > 0
                            ? (dashboardData.activeDevices /
                                dashboardData.totalDevices) *
                              100
                            : 0
                        }
                        color="success"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                component={motion.div}
                variants={itemVariants}
              >
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    boxShadow: darkMode
                      ? "0 8px 16px rgba(0,0,0,0.4)"
                      : "0 8px 16px rgba(0,0,0,0.1)",
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: 15,
                      bgcolor: "info.main",
                      display: "flex",
                      alignItems: "stretch",
                    }}
                  />
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "info.main",
                          color: "white",
                          mr: 2,
                        }}
                      >
                        <HistoryIcon />
                      </Avatar>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                      >
                        Activity Summary
                      </Typography>
                    </Box>
                    <Typography
                      variant="h3"
                      color="info.main"
                      fontWeight="bold"
                    >
                      {activityStats.total}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Chip
                        label={`${activityStats.turnedOn} On Events`}
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${activityStats.turnedOff} Off Events`}
                        color="error"
                        size="small"
                      />
                      <Chip
                        label={`${activityStats.today} Today`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Device Categories */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} component={motion.div} variants={itemVariants}>
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    boxShadow: darkMode
                      ? "0 8px 16px rgba(0,0,0,0.4)"
                      : "0 8px 16px rgba(0,0,0,0.1)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                    >
                      Device Categories
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2}>
                      {dashboardData.deviceCategories.map((category, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                              p: 2,
                              bgcolor: darkMode
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.02)",
                              borderRadius: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: getDeviceTypeColor(category.name),
                                color: "white",
                                mr: 2,
                                width: 40,
                                height: 40,
                              }}
                            >
                              {category.name.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="medium"
                                >
                                  {category.name}
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {category.active}/{category.total}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={category.percentage}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: darkMode
                                    ? "rgba(255,255,255,0.1)"
                                    : "rgba(0,0,0,0.1)",
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor: getDeviceTypeColor(category.name),
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Activities */}
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: darkMode
                    ? "0 8px 16px rgba(0,0,0,0.4)"
                    : "0 8px 16px rgba(0,0,0,0.1)",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Badge
                        badgeContent={filteredActivities.length}
                        color="primary"
                        sx={{ mr: 2 }}
                      >
                        <AccessTimeIcon color="action" fontSize="large" />
                      </Badge>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        Recent Activities
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Filter activities">
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setFilter(
                                filter === "all"
                                  ? "on"
                                  : filter === "on"
                                  ? "off"
                                  : "all"
                              )
                            }
                          >
                            <FilterListIcon />
                          </IconButton>
                          <Chip
                            label={
                              filter === "all"
                                ? "All"
                                : filter === "on"
                                ? "On Events"
                                : "Off Events"
                            }
                            size="small"
                            color={
                              filter === "all"
                                ? "default"
                                : filter === "on"
                                ? "success"
                                : "error"
                            }
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {filteredActivities.length > 0 ? (
                    <>
                      {(showAllActivities
                        ? filteredActivities
                        : filteredActivities.slice(0, 5)
                      ).map((activity, index) => (
                        <Box
                          key={index}
                          component={motion.div}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              mb: 2,
                              bgcolor: darkMode
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.02)",
                              borderRadius: 2,
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 4,
                                bgcolor: activity.turnedOffBy
                                  ? "error.main"
                                  : "success.main",
                              }}
                            />

                            {/* Entry for Turned Off (only if both turnedOffBy & endTime exist) */}
                            {activity.turnedOffBy && activity.endTime && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: activity.startTime ? 2 : 0,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: "error.main",
                                    width: 36,
                                    height: 36,
                                    mr: 2,
                                  }}
                                >
                                  OFF
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                  >
                                    {activity.device.deviceType} turned OFF in{" "}
                                    {activity.device.deviceLocation}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      mt: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mr: 1 }}
                                    >
                                      by {activity.turnedOffBy}
                                    </Typography>
                                    <Chip
                                      label={formatTimestamp(activity.endTime)}
                                      size="small"
                                      variant="outlined"
                                      color="default"
                                    />
                                  </Box>
                                </Box>
                              </Box>
                            )}

                            {/* Entry for Turned On */}
                            {activity.startTime && (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: "success.main",
                                    width: 36,
                                    height: 36,
                                    mr: 2,
                                  }}
                                >
                                  ON
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                  >
                                    {activity.device.deviceType} turned ON in{" "}
                                    {activity.device.deviceLocation}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      mt: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mr: 1 }}
                                    >
                                      by {activity.turnedOnBy}
                                    </Typography>
                                    <Chip
                                      label={formatTimestamp(
                                        activity.startTime
                                      )}
                                      size="small"
                                      variant="outlined"
                                      color="default"
                                    />
                                  </Box>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ))}

                      {filteredActivities.length > 5 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 2,
                          }}
                        >
                          <Button
                            variant="outlined"
                            onClick={() =>
                              setShowAllActivities(!showAllActivities)
                            }
                          >
                            {showAllActivities
                              ? "Show Less"
                              : `Show All (${filteredActivities.length})`}
                          </Button>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 4,
                      }}
                    >
                      <NotificationsActiveIcon
                        sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                      />
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        align="center"
                      >
                        No recent activities to display.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </Box>
    </>
  );
};

export default Dashboard;
