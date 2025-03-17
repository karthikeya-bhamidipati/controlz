import { createContext, useState, useMemo, useContext } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: darkMode ? "#FFA500" : "#FF8C00" },
          secondary: { main: darkMode ? "#29B6F6" : "#48CAE4" },
          background: { default: darkMode ? "#121212" : "#FAFAFA" },
          text: { primary: darkMode ? "#ffffff" : "#1E293B" },
        },
      }),
    [darkMode]
  );

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);

// // theme.js
// import { createTheme } from '@mui/material/styles';

// export const lightTheme = createTheme({
//   palette: {
//     mode: 'light',
//     primary: { main: '#FF8C00' },
//     secondary: { main: '#48CAE4' },
//     background: { default: '#FAFAFA' },
//     text: { primary: '#1E293B' },
//   },
// });

// export const darkTheme = createTheme({
//   palette: {
//     mode: 'dark',
//     primary: { main: '#FFA500' },
//     secondary: { main: '#29B6F6' },
//     background: { default: '#121212' },
//     text: { primary: '#ffffff' },
//   },
// });
