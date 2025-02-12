import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeContextProvider } from "./components/ThemeContext";
import PageLayout from "./components/PageLayout";
import DashBoard from "./components/DashBoard";
import Buildings from "./components/Buildings";
import Rooms from "./components/Rooms";
import Devices from "./components/Devices";
// import Settings from "./components/Settings";
// import Profile from "./components/Profile";
// import Login from "./Login";

function App() {
  return (
    <BrowserRouter>
      <ThemeContextProvider>
        <Routes>
          {/* Main layout route */}
          <Route path="/" element={<PageLayout />}>
            <Route index element={<DashBoard />} /> {/* Default home page */}
            <Route path="buildings" element={<Buildings />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="devices" element={<Devices />} />
            {/* <Route path="settings" element={<Settings />} /> */}
            {/* <Route path="profile" element={<Profile />} /> */}
          </Route>

          {/* Auth routes */}
          {/* <Route path="/login" element={<Login />} /> */}
        </Routes>
      </ThemeContextProvider>
    </BrowserRouter>
  );
}

export default App;
