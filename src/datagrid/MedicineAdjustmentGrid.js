import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MedicineAdjustmentForm from "../modal/MedicineAdjustmentForm.js";
import axiosInstance from "../config/axios-instance.js";

const MedicineAdjustmentGrid = () => {
  const [searchValue, setSearchValue] = useState("");
  const [document, setDocument] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Function to handle search input changes
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Function to format date string to YYYY-MM-DD
  const yyyymmddDateFormat = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed
    return `${month}/${day}/${year}`;
  };

  // Fetch medicines when the component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const disposalData = await axiosInstance.get("medicineInventory/getAdjustment");
        const modifiedRow = await Promise.all(disposalData.data.map(async (document) => {
          try {
            const itemData = await axiosInstance.get(`medicineInventory/getItem/${document.itemId}`);
            const inData = await axiosInstance.get(`medicineInventory/getInBatchId/${document.batchId}`);
            return { ...document, 
              product: itemData.data.product,
              expirationDate: inData.data.expirationDate, 
              receiptId: inData.data.receiptId };
          } catch (error) {
            console.error("Error fetching Product, Expiration Date, and Receipt ID information:", error);
            return { ...document }; // Default message if product fetch fails
          }
        }));
        setDocument(modifiedRow);
      } catch (error) {
        console.error("An error occurred while fetching medicines:", error);
      }
    };
    fetchDocuments();
  }, []);

  // Function to update state after a medicine item is updated
  const onDocumentUpdated = (updatedDocument) => {
    const updatedDocuments = document.map((document) =>
      document._id === updatedDocument._id ? updatedDocument : document
    );
    setDocument(updatedDocuments);
  };

   // Function to add a new medicine item
   const addNewDocument = (newDocument) => {
    modifiedRow(newDocument)
      .then((updatedDocument) => {
        setDocument([...document, updatedDocument]);
      })
      .catch((error) => console.error("Error updating Product, and Receipt ID information:", error));
  };
  
  const modifiedRow = async (document) => {
    try {
      const inData = await axiosInstance.get(`medicineInventory/getIn/${document.batchId}`);
      const itemData = await axiosInstance.get(`medicineInventory/getInBatchId/${document.itemId}`);
      return { ...document, 
        product: itemData.data.product,
        receiptId: inData.data.receiptId };
    } catch (error) {
      console.error("Error updating Product, and Receipt ID information:", error);
      return { ...document}; // Default message if product fetch fails
    }
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 250 },
    { field: "itemId", headerName: "Item ID", width: 250 },
    { field: "product", headerName: "Product", width: 200 },
    { field: "batchId", headerName: "Batch ID", width: 250 },
    { field: "quantity", headerName: "Quantity", width: 150 },
    { field: "type",
      headerName: "Type",
      width: 150,
      renderCell: (params) => {
        const assessment = params.value;
        let color = "";

        switch (assessment.toLowerCase()) {
          case "addition":
            color = "green";
            break;
          case "subtraction":
            color = "red";
            break;
          default:
            color = "black";
        }
        return <span style={{ color }}>{assessment}</span>;
      },
    },
    { field: "reason", headerName: "Reason/s", width: 300 },
    {
      field: "createdAt",
      headerName: "Created",
      width: 150,
      valueGetter: (params) => yyyymmddDateFormat(params.row.createdAt),
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 150,
      valueGetter: (params) => yyyymmddDateFormat(params.row.updatedAt),
    },
  ];

  const handleModalClose = () => {
    setFormOpen(false);
  };

  const handleModalOpen = () => {
    setFormOpen(true);
  };

  const filteredDocuments = document.filter((document) => {
    const lowerSearchValue = searchValue.toLowerCase();

    // Explicitly convert numeric or date fields to string before using `toLowerCase()`.
    return (
      (document._id?.toLowerCase() || "").includes(lowerSearchValue) ||
      (document.itemId?.toLowerCase() || "").includes(lowerSearchValue) ||
      (document.product?.toLowerCase() || "").includes(lowerSearchValue) ||
      (document.quantity?.toString() || "").includes(searchValue) || // convert to string
      (document.type?.toLowerCase() || "").includes(lowerSearchValue) ||
      (document.reason?.toLowerCase() || "").includes(lowerSearchValue) ||
      (new Date(document.createdAt).toLocaleDateString()?.toLowerCase() || "")
        .includes(lowerSearchValue) || // Convert date to a string
      (new Date(document.updatedAt).toLocaleDateString()?.toLowerCase() || "")
      .includes(lowerSearchValue) // Convert date to a string
    );
  });

  return (
    <div className="flex flex-col h-full">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="mb-4 flex justify-end items-center">
          <Button variant="contained" color="primary" onClick={handleModalOpen}>
            Adjust Medicine Stock
          </Button>
          <div className="ml-2">
            <TextField
              label="Search"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <DataGrid
          getRowId={(row) => row._id}
          rows={filteredDocuments}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          checkboxSelection
          disableRowSelectionOnClick
        />
        <MedicineAdjustmentForm
          open={formOpen}
          addNewDocument={addNewDocument}
          onDocumentUpdated={onDocumentUpdated}
          selectedDocument={selectedDocument}
          onClose={() => {
            setSelectedDocument(null);
            handleModalClose();
          }}
          onCancel={() => {
            setSelectedDocument(null);
            handleModalClose();
          }}
        />
      </div>
    </div>
  );
};

export default MedicineAdjustmentGrid;
