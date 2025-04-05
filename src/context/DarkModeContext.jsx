import { createContext, useMemo, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleDarkMode } from "../redux/darkModeSlice"; 
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const darkMode = useSelector((state) => state.darkMode.darkMode);
  const dispatch = useDispatch();

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
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode: () => dispatch(toggleDarkMode()) }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);
