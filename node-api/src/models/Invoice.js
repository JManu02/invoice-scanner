const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: String,
      default: "Desconocido",
    },
    amount: {
      type: Number,
      default: null,
    },
    tax: {
      type: Number,
      default: null,
    },
    date: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ["Alimentación", "Transporte", "Servicios", "Salud", "Tecnología", "Otros"],
      default: "Otros",
    },
    rawText: {
      type: String,
    },
    fileName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "processed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);