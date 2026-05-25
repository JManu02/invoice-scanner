const axios = require("axios");
const FormData = require("form-data");
const Invoice = require("../models/Invoice");

exports.processInvoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se proporcionó ningún archivo" });
    }

    // Envía el archivo al microservicio Python
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const pythonResponse = await axios.post(
      `${process.env.PYTHON_SERVICE_URL}/api/invoices/process`,
      form,
      { headers: form.getHeaders() }
    );

    const { data } = pythonResponse.data;

    // Guarda en MongoDB
    const invoice = await Invoice.create({
      user: req.user._id,
      vendor: data.vendor,
      amount: data.amount,
      tax: data.tax,
      date: data.date,
      category: data.category,
      rawText: data.raw_text,
      fileName: req.file.originalname,
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    console.error("Error procesando factura:", err.message);
    res.status(500).json({ message: "Error procesando la factura", error: err.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (category) filter.category = category;

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    res.json({ invoices, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Error obteniendo facturas", error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalSpent = stats.reduce((acc, s) => acc + (s.total || 0), 0);

    res.json({ byCategory: stats, totalSpent });
  } catch (err) {
    res.status(500).json({ message: "Error obteniendo estadísticas", error: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }

    res.json({ message: "Factura eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error eliminando factura", error: err.message });
  }
};