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
import Grid from "@mui/material/Grid";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";

const MedicineInForm = (props) => {
  const { open = false, onClose, addNewDocument} = props;
  const [expirationDate, setExpirationDate] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: "",
    severity: "success",
  });

  const validationSchema = yup.object().shape({
    itemId: yup.string().required("Item ID is required"),
    batchId: yup.string().required("Batch ID is required"),
    receiptId: yup.string().required("Receipt ID is required"),
    quantity: yup.number().required("Quantity is required"),
    expirationDate: yup.date().required("Expiration Date is required"),
    note: yup.string().nullable(),
    
  });

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };

  const handleExpirationDateChange = (date) => {
    setExpirationDate(date);
    setValue("expirationDate", date);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      expirationDate: "",
      quantity: 1,
    },
  });

  const handleCreate = async (data) => {
    if (!data.note) {
      data.note = "";
    }
    
    try {
      let medicineItem;
      try {
        medicineItem = await axiosInstance.get(`medicineInventory/getItem/${data.itemId}`);
      } catch (error) {
        if (error.response || error.response.data || error.response.data.error === "Record not found") {
          showSnackbar("Operation failed: Item ID mismatch", "error");
          return;
        }
      }
      
      const medicineIn = await axiosInstance.get(`medicineInventory/getInBatchId/${data.batchId}`);

      if (medicineIn.data.batchId === data.batchId) {
        showSnackbar("Operation failed: Batch ID already exists", "error");
        return;
      } else {
        
      }

      const response = await axiosInstance.post("medicineInventory/postIn", data);

      const updatedOverallQuantity = medicineItem.data.overallQuantity + data.quantity;
  
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
          {"Add Medicine Stock"}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleCreate)}>
          <DialogContent>
            <DialogContentText>Enter medicine stock in record details:</DialogContentText>
            
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
              name="receiptId"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Receipt ID"
                  fullWidth
                  margin="normal"
                  {...field}
                  required
                  error={!!errors.receiptId}
                  helperText={errors.receiptId?.message}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12} sm={6}>
              <FormControl error={!!errors.expirationDate}>
                  <DatePicker
                    label="Expiration Date"
                    value={expirationDate}
                    onChange={handleExpirationDateChange}
                  />
                  <FormHelperText>
                    {errors.expirationDate?.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Note/s"
                  fullWidth
                  margin="normal"
                  {...field}
                  error={!!errors.note}
                  helperText={errors.note?.message}
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

export default MedicineInForm;
