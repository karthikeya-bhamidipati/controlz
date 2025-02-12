import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import { DarkModeProvider, useDarkMode } from "./context/DarkModeContext";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import Buildings from "./pages/Buildings";
import Rooms from "./pages/Rooms";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import LoginRegister from "./pages/LoginRegister";
import DashboardLayout from "./components/DashboardLayout";

function AppContent() {
  const { darkMode, setDarkMode } = useDarkMode();

  return (
    <>
      <IconButton
        sx={{
          position: "absolute",
          top: 15,
          right: 15,
          zIndex: 10,
        }}
        onClick={() => setDarkMode(!darkMode)}
        color="inherit"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>

      <ToastContainer />

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Buildings />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="/rooms"
              element={
                <DashboardLayout>
                  <Rooms />
                </DashboardLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}

export default App;
