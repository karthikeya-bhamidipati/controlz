import React from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";

function Buildings() {
  const buildings = [
    { name: "Main Office", floors: 5 },
    { name: "Research Center", floors: 3 },
    { name: "Warehouse", floors: 2 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Buildings
      </Typography>
      <Grid container spacing={3}>
        {buildings.map((building, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{building.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Floors: {building.floors}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Buildings;
