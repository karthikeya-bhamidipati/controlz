// src/components/Sidebar.js
import React from "react";
import { List, ListItem, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <List>
      <ListItem button component={Link} to="/rooms">
        <ListItemText primary="Rooms" />
      </ListItem>
      <ListItem button component={Link} to="/analytics">
        <ListItemText primary="Analytics" />
      </ListItem>
      <ListItem button component={Link} to="/settings">
        <ListItemText primary="Settings" />
      </ListItem>
    </List>
  );
};

export default Sidebar;
