// Navbar.js
import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

function Navbar() {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          IoT Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
