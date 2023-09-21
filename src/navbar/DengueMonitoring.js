import React from "react";
import DengueDataGrid from "../datagrid/DengueGrid.js";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DengueForm from "../modal/DengueForm.js";
import { Typography } from "@mui/material";

const DengueNavBar = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="flex flex-col">
        <div className="flex-grow overflow-hidden">
          <div className="bg-black h-24 flex items-center">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2rem", sm: "2rem", md: "2.25rem" },
                fontWeight: "bold",
                color: "white",
                py: { xs: 3, md: 6 },
                pl: 2,
              }}
            >
              Dengue Monitoring
            </Typography>
          </div>

          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="flex items-center justify-center w-full">
              <DengueDataGrid />
            </div>
            <DengueForm />
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default DengueNavBar;
