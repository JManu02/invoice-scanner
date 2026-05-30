const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");
const {
  processInvoice,
  getInvoices,
  getStats,
  deleteInvoice,
} = require("../controllers/invoiceController");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post("/", upload.single("file"), processInvoice);
router.get("/", getInvoices);
router.get("/stats", getStats);
router.delete("/all", async (req, res) => {
  try {
    await require("../models/Invoice").deleteMany({ user: req.user._id });
    res.json({ message: "Todas las facturas eliminadas" });
  } catch (err) {
    res.status(500).json({ message: "Error eliminando facturas", error: err.message });
  }
});
router.delete("/:id", deleteInvoice);

module.exports = router;