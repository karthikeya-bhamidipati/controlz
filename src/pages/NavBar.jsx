import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import {
  Menu,
  Devices,
  Analytics,
  People,
  Settings,
  Home,
} from "@mui/icons-material";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import { useDarkMode } from "../context/DarkModeContext";

const navItems = [
  { text: "Dashboard", path: "/", icon: <Home /> },
  { text: "Devices", path: "/devices", icon: <Devices /> },
  { text: "Analytics", path: "/analytics", icon: <Analytics /> },
  { text: "Users", path: "/users", icon: <People /> },
  { text: "Settings", path: "/settings", icon: <Settings /> },
];

const NavBar = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              bgcolor:
                location.pathname === item.path
                  ? theme.palette.action.selected
                  : "transparent",
              "&:hover": {
                bgcolor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemButton>
              <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: darkMode ? "background.paper" : "primary.main",
        boxShadow: "none",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left Section - Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ControlCameraIcon
            sx={{
              mr: 1,
              fontSize: "2rem",
              color: darkMode ? "orange" : "white",
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              color: darkMode ? "text.primary" : "white",
            }}
          >
            CONTRLZ
          </Typography>
        </Box>

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              color: darkMode ? "text.primary" : "white",
              ml: "auto",
            }}
          >
            <Menu />
          </IconButton>
        )}

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              ml: 4,
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            {navItems.map((item) => (
              <IconButton
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  color:
                    location.pathname === item.path
                      ? darkMode
                        ? "orange"
                        : "white"
                      : darkMode
                      ? "text.secondary"
                      : "rgba(255,255,255,0.7)",
                  "&:hover": {
                    color: darkMode ? "orange" : "white",
                    bgcolor: "transparent",
                  },
                  transition: "color 0.3s ease",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      mt: 0.5,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              </IconButton>
            ))}
          </Box>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            bgcolor: "background.paper",
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default NavBar;
