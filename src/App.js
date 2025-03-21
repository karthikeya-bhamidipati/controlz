import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { DarkModeProvider } from "./context/DarkModeContext";
import "react-toastify/dist/ReactToastify.css";
import DeviceManagement from "./pages/DeviceManagement";
import UserManagement from "./pages/UserManagement";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import NavBar from "./pages/NavBar";
import LoginRegister from "./pages/LoginRegister";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./context/ProtectedRoute";

function AppContent() {
  return (
    <>
      <ToastContainer />
      {/* 
            <Routes>
                <Route path="/login" element={<LoginRegister />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/devices" element={<DeviceManagement />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes> */}
      {useLocation().pathname !== "/login" && <NavBar />}
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<DeviceManagement />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <AppContent />
      </DarkModeProvider>
    </BrowserRouter>
  );
}

export default App;
