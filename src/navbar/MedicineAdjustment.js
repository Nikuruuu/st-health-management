import React from "react";
import MedicineAdjustmentGrid from "../datagrid/MedicineAdjustmentGrid.js";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MedicineAdjustmentForm from "../modal/MedicineAdjustmentForm.js";
import { Typography } from "@mui/material";

const MedicineAdjustmentNavBar = () => {
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
              Medicine Inventory: Stock Adjustment
            </Typography>
          </div>

          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="flex items-center justify-center w-full">
              <MedicineAdjustmentGrid />
            </div>
            <MedicineAdjustmentForm />
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default MedicineAdjustmentNavBar;
