import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MedicineItemForm from "../modal/MedicineItemForm.js";
import axiosInstance from "../config/axios-instance.js";

const MedicineItemGrid = () => {
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
    return `${year}/${month}/${day}`;
  };

  // Fetch medicines when the component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axiosInstance.get(
          "medicineInventory/getItem"
        );
        setDocument(response.data);
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
    setDocument([...document, newDocument]);
  };

  const columns = [
    { field: "_id", headerName: "Item ID", width: 250 },
    { field: "product", headerName: "Product", width: 200 },
    { field: "overallQuantity", headerName: "Overall Quantity", width: 150 },
    { field: "quantityLevel",
      headerName: "Quantity Level",
      width: 150,
      renderCell: (params) => {
        const assessment = params.value;
        let color = "";

        switch (assessment.toLowerCase()) {
          case "high":
            color = "green";
            break;
          case "moderate":
            color = "orange";
            break;
          case "low":
            color = "red";
            break;
          default:
            color = "black";
        }

        return <span style={{ color }}>{assessment}</span>;
      },
    },
    { field: "description", headerName: "Description", width: 300 },
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
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => {
        return (
          <div>
            <IconButton onClick={() => handleEditDocument(params.row._id)}>
              <EditIcon />
            </IconButton>
          </div>
        );
      },
    },
  ];

  const handleEditDocument = (id) => {
    const documentToEdit = document.find((document) => document._id === id);
    setSelectedDocument(documentToEdit);
    setFormOpen(true); // Assuming this opens the form dialog
  };

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
      (document.product?.toLowerCase() || "").includes(lowerSearchValue) ||
      (document.overallQuantity?.toString() || "").includes(searchValue) || // convert to string
      (document.quantityLevel?.toLowerCase() || "").includes(lowerSearchValue) ||
      (document.description?.toLowerCase() || "").includes(lowerSearchValue) ||
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
            New Medicine Item
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
        <MedicineItemForm
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

export default MedicineItemGrid;
