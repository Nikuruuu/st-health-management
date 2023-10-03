import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axiosInstance from "../config/axios-instance.js";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const MedicineDisposalForm = (props) => {
  const { open = false, onClose, addNewDocument} = props;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: "",
    severity: "success",
  });

  const validationSchema = yup.object().shape({
    itemId: yup.string().required("Item ID is required"),
    batchId: yup.string().required("Batch ID is required"),
    quantity: yup.number().required("Quantity is required"),
    reason: yup.string().required("Reason/s is required"),
    
  });

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };


  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      quantity: 1,
      reason: ""
    },
  });

  const handleCreate = async (data) => {
    try {
      let itemData;
      try {
        itemData = await axiosInstance.get(`medicineInventory/getItem/${data.itemId}`);
      } catch (error) {
        if (error.response || error.response.data || error.response.data.error === "Record not found") {
          showSnackbar("Operation failed: Item ID mismatch", "error");
          return;
        }
      }
      
      const inData = await axiosInstance.get(`medicineInventory/getInBatchId/${data.batchId}`);

      if (!inData.data.batchId) {
        showSnackbar("Operation failed: Batch ID mismatch", "error");
        return;
      }
      
      const disposalData = await axiosInstance.get(`medicineInventory/getDisposalBatchId/${data.batchId}`);
      const adjustmentData = await axiosInstance.get(`medicineInventory/getAdjustmentBatchId/${data.batchId}`);
      
      let updatedOverallQuantity;
      let initialOverallQuantity;
      if (!disposalData.data.disposalTotal) {
        if (!adjustmentData.data.additionTotal && !adjustmentData.data.subtractionTotal) {
          if (data.quantity <= inData.data.quantity) {
            updatedOverallQuantity = Math.abs(data.quantity - itemData.data.overallQuantity);
          } else {
            showSnackbar("Operation Failed1: Disposal quantity is greater than the selected batch's stock"
            + "\n\n Disposal Quantity: " + data.quantity 
            + "\n Remaining Stock: " + inData.data.quantity, "error");
            return;
          }
        } else {
          initialOverallQuantity = Math.abs((inData.data.quantity + adjustmentData.data.additionTotal) - adjustmentData.data.subtractionTotal);
          if (data.quantity <= initialOverallQuantity) {
            updatedOverallQuantity = Math.abs(data.quantity - itemData.data.overallQuantity);
          } else {
            showSnackbar("Operation Failed2: Disposal quantity is greater than the selected batch's stock"
            + "\n\n Disposal Quantity: " + data.quantity 
            + "\n Remaining Stock: " + initialOverallQuantity, "error");
            return;
          }
        }
      } else {
        if (!adjustmentData.data.additionTotal && !adjustmentData.data.subtractionTotal) {
          initialOverallQuantity = Math.abs(inData.data.quantity - disposalData.data.disposalTotal);
          if (data.quantity <= initialOverallQuantity) {
            updatedOverallQuantity = Math.abs(data.quantity - itemData.data.overallQuantity);
          } else {
            showSnackbar("Operation Failed3: Disposal quantity is greater than the selected batch's stock"
            + "\n\n Disposal Quantity: " + data.quantity 
            + "\n Remaining Stock: " + initialOverallQuantity, "error");
            return;
          }
        } else {
          initialOverallQuantity = Math.abs(((inData.data.quantity + adjustmentData.data.additionTotal) - adjustmentData.data.subtractionTotal) - disposalData.data.disposalTotal);
          if (data.quantity <= initialOverallQuantity) {
            updatedOverallQuantity = Math.abs(data.quantity - itemData.data.overallQuantity);
          } else {
            showSnackbar("Operation Failed4: Disposal quantity is greater than the selected batch's stock"
            + "\n\n Disposal Quantity: " + data.quantity 
            + "\n Remaining Stock: " + inData.data.quantity, "error");
            return;
          }
        }
      }

      const response = await axiosInstance.post("medicineInventory/postDisposal", data);
  
      await axiosInstance.put(`medicineInventory/putItem/${data.itemId}`, {
        overallQuantity: updatedOverallQuantity,
      });
  
      if (response.data._id) {
        if (typeof addNewDocument === "function") {
          addNewDocument(response.data);
        }
        showSnackbar("Successfully added", "success");
        handleClose();
      } else {
        showSnackbar("Operation failed", "error");
      }
  
    } catch (error) {
      console.error("An error occurred during adding:", error);
      if (error.response && error.response.data) {
        console.error("Server responded with:", error.response.data);
      }
      showSnackbar("An error occurred during adding", "error");
    }
  };
  
  
  // Function to close the dialog and reset form values
  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top", // Position at the top
          horizontal: "center", // Position at the center horizontally
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarData.severity}>
          {snackbarData.message}
        </Alert>
      </Snackbar>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {"Dispose Medicine"}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleCreate)}>
          <DialogContent>
            <DialogContentText>Enter medicine stock disposal record details:</DialogContentText>
            
            <Controller
              name="itemId"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Item ID"
                  fullWidth
                  margin="normal"
                  {...field}
                  required
                  error={!!errors.itemId}
                  helperText={errors.itemId?.message}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              name="batchId"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Batch ID"
                  fullWidth
                  margin="normal"
                  {...field}
                  required
                  error={!!errors.batchId}
                  helperText={errors.batchId?.message}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Quantity (Medicine)"
                  fullWidth
                  margin="normal"
                  {...field}
                  required
                  type="number"
                  inputProps={{ min: "1", step: "1" }}
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Reason/s"
                  fullWidth
                  required
                  margin="normal"
                  {...field}
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
                  onBlur={field.onBlur}
                />
              )}
            />

          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {"Submit"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default MedicineDisposalForm;
