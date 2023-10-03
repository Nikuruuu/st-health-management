import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  DashboardOutlined,
  ManageAccountsOutlined,
  SupervisorAccountOutlined,
  AssignmentIndOutlined,
  MedicalServicesOutlined,
  EventOutlined,
  Person2Outlined,
  AutoGraphOutlined,
  ReceiptLongOutlined,
  SettingsOutlined,
  ExpandLess,
  ExpandMore,
  ExitToAppOutlined,
} from "@mui/icons-material";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

import schoolLogo from "./Data/DonjuanTransparent.png";

const Sidebar = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem("authToken");

    // Redirect to the login page after logout
    navigate("/"); // Replace '/login' with your login route
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const SidebarLink = ({ to, primary, icon, isActive, onClick }) => (
    <ListItem
      component={Link}
      to={to}
      onClick={onClick}
      sx={{
        backgroundColor: isActive ? "#343541" : "transparent",
        color: isActive ? "#FEFEFE" : "gray-300",
        "&:hover": {
          backgroundColor: "#2A2B32",
          borderRadius: "0.5rem",
          color: "#FEFEFE",
          justifyContent: "center",
          minWidth: "2rem",
        },
        borderRadius: isActive ? "0.5rem" : "0",
        height: isSidebarCollapsed ? "2.5rem" : "auto", // Set a fixed height for collapsed items
        justifyContent: "center", // Center icon vertically
        alignItems: "center", // Center icon horizontally
        flexDirection: isSidebarCollapsed ? "column" : "row", // Adjust layout based on collapse state
      }}
    >
      <ListItemIcon
        style={{
          color: isActive || isSidebarCollapsed ? "white" : "#E0E0E0",
          minWidth: isSidebarCollapsed ? "1rem" : "2rem",
        }}
      >
        {icon}
      </ListItemIcon>
      {!isSidebarCollapsed && <ListItemText primary={primary} />}
    </ListItem>
  );

  const SidebarSubmenu = ({ primary, icon, submenuLinks }) => {
    const [open, setOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);

    const handleSubmenuClick = (event) => {
      if (isSidebarCollapsed) {
        setMenuAnchor(event.currentTarget);
        setOpen(!open);
      } else {
        setOpen(!open);
      }
    };

    const handleMenuClose = () => {
      setOpen(false);
      setMenuAnchor(null); // Clear menu anchor on menu close
    };

    return (
      <>
        <ListItem
          onClick={handleSubmenuClick}
          sx={{
            color: isActive ? "#FEFEFE" : "gray-300",
            justifyContent: isSidebarCollapsed ? "center" : undefined, // Center icon horizontally when collapsed
            alignItems: isSidebarCollapsed ? "center" : undefined,
            "&:hover": {
              backgroundColor: "#2A2B32",
              borderRadius: "0.5rem",
              color: "#FEFEFE",
              justifyContent: "center",
              minWidth: "2rem",
            },
            // Center icon vertically when collapsed
          }}
        >
          <ListItemIcon
            style={{
              minWidth: isSidebarCollapsed ? "1rem" : "2rem",
              color: "#E0E0E0",
              justifyContent: isSidebarCollapsed ? "center" : undefined,
              marginLeft: isSidebarCollapsed ? "1rem" : undefined,
            }}
          >
            {icon}
          </ListItemIcon>
          {!isSidebarCollapsed && <ListItemText primary={primary} />}
          {open ? (
            <ExpandLess
              sx={{ fontSize: isSidebarCollapsed ? "1rem" : "2rem" }}
            />
          ) : (
            <ExpandMore
              sx={{ fontSize: isSidebarCollapsed ? "1rem" : "2rem" }}
            />
          )}
        </ListItem>
        {isSidebarCollapsed ? (
          <Menu
            anchorEl={menuAnchor}
            open={open}
            onClose={handleMenuClose}
            className="ml-5"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            {submenuLinks.map((link) => (
              <MenuItem
                key={link.to}
                component={Link}
                to={link.to}
                onClick={handleMenuClose} // Close menu when a menu item is clicked
              >
                {link.primary}
              </MenuItem>
            ))}
          </Menu>
        ) : (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {submenuLinks.map((link) => (
                <SidebarLink
                  key={link.to}
                  to={link.to}
                  primary={link.primary}
                  icon={null}
                  isActive={isActive(link.to)}
                />
              ))}
            </List>
          </Collapse>
        )}
      </>
    );
  };

  return (
    <div
      className={`bg-black text-gray-300 flex flex-col p-4 ${
        isSidebarCollapsed ? "collapsed" : ""
      }`}
      style={{
        width: isSidebarCollapsed ? "4rem" : "16rem",
        minHeight: "100vh",
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <button onClick={toggleSidebar}>
          <MenuOutlinedIcon />
        </button>
      </div>
      {!isSidebarCollapsed && (
        <>
          <div className="flex justify-center mb-2">
            <img
              src={schoolLogo}
              alt="School Logo"
              style={{ width: "100px", height: "100px" }}
            />
          </div>
          <div className="text-center mb-6 text-white">
            <h5 className="text-sm font-semibold">
              Don Juan Dela Cruz Central Elementary School
            </h5>
          </div>
        </>
      )}

      <List>
        <SidebarLink
          to="/dashboard"
          primary="Dashboard"
          isActive={isActive("/dashboard")}
          icon={<DashboardOutlined />}
        />
        <SidebarSubmenu
          primary="Users"
          icon={<ManageAccountsOutlined />}
          submenuName="users"
          isActive={isActive}
          submenuLinks={[
            { to: "/user-approval", primary: "User Approval" },
            { to: "/manage-users", primary: "Manage User" },
          ]}
        />
        <SidebarSubmenu
          primary="Profiles"
          icon={<SupervisorAccountOutlined />}
          submenuName="profile"
          isActive={isActive}
          submenuLinks={[
            { to: "/student-profile", primary: "Student Profile" },
            { to: "/faculty-profile", primary: "Faculty Profile" },
            { to: "/class-profile", primary: "Class Profile" },
          ]}
        />

        <SidebarSubmenu
          primary="Clinic Programs"
          icon={<SpaOutlinedIcon />}
          submenuName="clinicProgram"
          isActive={isActive}
          submenuLinks={[
            { to: "/dengue-monitoring", primary: "Dengue Monitoring" },
            { to: "/immunization", primary: "Immunization" },
            { to: "/medical-checkup", primary: "Medical Checkup" },
            { to: "/faculty-checkup", primary: "Faculty Checkup" },
            { to: "/deworming-monitoring", primary: "Deworming Monitoring" },
            { to: "/feeding-program", primary: "Feeding Program" },

            { to: "/nutritional-status", primary: "Nutritional Status" },

          ]}
        />
        <SidebarLink
          to="/clinic-records"
          primary="Clinic Records"
          isActive={isActive("/clinic-records")}
          icon={<AssignmentIndOutlined />}
        />
        <SidebarSubmenu
          primary="Medicine Inventory"
          icon={<MedicalServicesOutlined />}
          submenuName="medicineInventory"
          isActive={isActive}
          submenuLinks={[
            { to: "/medicine-item", primary: "Stock Item" },
            { to: "/medicine-in", primary: "Stock In" },
            { to: "/medicine-disposal", primary: "Stock Disposal" },
            { to: "/medicine-adjustment", primary: "Stock Adjustment" },
          ]}
        />
        <SidebarLink
          to="/events"
          primary="Events"
          isActive={isActive("/events")}
          icon={<EventOutlined />}
        />
        <SidebarLink
          to="/analytics"
          primary="Analytics"
          isActive={isActive("/analytics")}
          icon={<AutoGraphOutlined />}
        />
        <SidebarLink
          to="/logs"
          primary="Logs"
          isActive={isActive("/logs")}
          icon={<ReceiptLongOutlined />}
        />
        <SidebarLink
          to="/settings"
          primary="Settings"
          isActive={isActive("/settings")}
          icon={<SettingsOutlined />}
        />
        <SidebarLink
          to="/"
          primary="Logout"
          isActive={isActive(false)}
          icon={<ExitToAppOutlined />}
          onClick={handleLogout}
        />
      </List>
    </div>
  );
};

export default Sidebar;
