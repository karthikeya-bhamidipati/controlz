// ThemeToggle.js
import React from "react";
import { IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useDarkMode } from "../context/DarkModeContext";

function ThemeToggle() {
  const { darkMode, setDarkMode } = useDarkMode();

  return (
    <IconButton
      onClick={() => setDarkMode(!darkMode)}
      color="inherit"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}

export default ThemeToggle;
