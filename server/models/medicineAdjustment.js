const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
  },
  batchId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["Addition", "Subtraction"],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const MedicineAdjustment = mongoose.model("medicine_adjustment", medicineSchema);

module.exports = MedicineAdjustment;
