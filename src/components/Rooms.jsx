import React from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";

function Rooms() {
  const rooms = [
    { name: "Conference Room A", capacity: 12 },
    { name: "Lab 101", capacity: 8 },
    { name: "Server Room", capacity: 2 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Rooms
      </Typography>
      <Grid container spacing={3}>
        {rooms.map((room, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{room.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Capacity: {room.capacity} people
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Rooms;
