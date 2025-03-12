import React, { useState, useEffect } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Switch,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

const DeviceManagement = () => {
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await axios.get("/api/buildings");
        setBuildings(response.data);
      } catch (error) {
        console.error("Error fetching buildings:", error);
      }
    };
    fetchBuildings();
  }, []);

  const handleDeviceToggle = async (deviceId, status) => {
    try {
      await axios.patch(`/api/devices/${deviceId}`, { status });
      // Update local state
    } catch (error) {
      console.error("Error updating device:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Device Management
      </Typography>

      {buildings.map((building) => (
        <Accordion key={building._id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{building.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {building.rooms.map((room) => (
              <Accordion key={room._id} sx={{ ml: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{room.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {room.devices.map((device) => (
                    <Box
                      key={device._id}
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    >
                      <Switch
                        checked={device.status === "ON"}
                        onChange={(e) =>
                          handleDeviceToggle(
                            device._id,
                            e.target.checked ? "ON" : "OFF"
                          )
                        }
                      />
                      <Typography sx={{ ml: 2 }}>
                        {device.name} ({device.type})
                      </Typography>
                    </Box>
                  ))}
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    Add Device
                  </Button>
                </AccordionDetails>
              </Accordion>
            ))}
            <Button variant="outlined" sx={{ mt: 2 }}>
              Add Room
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
      <Button variant="contained" sx={{ mt: 3 }}>
        Add New Building
      </Button>
    </Box>
  );
};

export default DeviceManagement;
